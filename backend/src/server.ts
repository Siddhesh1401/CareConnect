import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import apiAdminRoutes from './routes/apiAdmin.js';
import accessRequestRoutes from './routes/accessRequestRoutes.js';
import governmentRoutes from './routes/government.js';
import messageRoutes from './routes/messages.js';
import eventRoutes from './routes/events.js';
import dashboardRoutes from './routes/dashboard.js';
import ngoRoutes from './routes/ngos.js';
import campaignRoutes from './routes/campaigns.js';
import storyRoutes from './routes/stories.js';
import communityRoutes from './routes/communities.js';
import reportRoutes from './routes/reports.js';
import { authenticate } from './middleware/auth.js';
import { notFound } from './middleware/notFound.js';
import { apiVersioning, enforceMinimumVersion } from './middleware/apiVersioning.js';
import { advancedRateLimiter, rateLimitInfo } from './middleware/advancedRateLimit.js';
import { cacheMiddleware, getCacheStats } from './middleware/responseCache.js';
import { requestLogger, errorLogger, apiMonitor } from './middleware/apiMonitor.js';
import { getStatusPage, createIncident, updateIncident, getIncidents, statusPage } from './middleware/statusPage.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getNGODashboard } from './controllers/dashboardController.js';
import { swaggerUi, specs } from './swagger.js';
import './scripts/emailMonitor.js'; // Start email monitoring

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION - Ensure critical configs are set
// ============================================================================
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ FATAL ERROR: Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n📋 Please ensure the following are set in your .env file:');
  console.error('   - MONGODB_URI');
  console.error('   - JWT_SECRET');
  console.error('   - EMAIL_USER');
  console.error('   - EMAIL_PASSWORD');
  console.error('\n💡 Tip: Copy .env.example to .env and fill in your values\n');
  process.exit(1);
}

console.log('✅ Environment variables validated successfully');

// Rate limiting - IP-based fallback (for non-API routes)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500'), // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// User-specific rate limiting
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each user to 1000 requests per windowMs (temporarily increased for testing)
  message: 'Too many requests from this user, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        return `user_${decoded.id}`;
      } catch (error) {
        // Token invalid, use IP
        return req.ip || 'unknown';
      }
    }
    // No token, use IP
    return req.ip || 'unknown';
  },
});

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5173", "http://127.0.0.1:5173", "https://ui-avatars.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "blob:", "http://localhost:*", "http://127.0.0.1:*", "chrome-extension://*"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000", "http://127.0.0.1:5000", "https://ui-avatars.com", "https://images.unsplash.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Prevent clickjacking
      upgradeInsecureRequests: [] // Force HTTPS in production
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: { policy: "credentialless" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' }, // X-Frame-Options: DENY
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true, // X-Download-Options: noopen
  noSniff: true, // X-Content-Type-Options: nosniff
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true // X-XSS-Protection
})); // Enhanced security headers

// CORS must be applied BEFORE rate limiting to handle preflight requests
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://localhost:8081',  // Government portal demo
      'https://careconnect.org',
      'https://www.careconnect.org',
      'https://api.careconnect.org'
    ];

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow localhost origins
    if (process.env.NODE_ENV === 'development' && origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      return callback(null, true);
    }

    // Reject the request
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'X-API-Key',
    'If-None-Match',
    'If-Modified-Since'
  ],
  exposedHeaders: [
    'ETag',
    'Last-Modified',
    'Cache-Control',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Cache-Status'
  ],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://localhost:8081',
      'https://careconnect.org',
      'https://www.careconnect.org',
      'https://api.careconnect.org'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV === 'development' && origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'X-API-Key',
    'If-None-Match',
    'If-Modified-Since'
  ],
  optionsSuccessStatus: 200
}));

app.use(limiter); // Apply IP-based rate limiting
app.use('/api', userLimiter); // Apply user-specific rate limiting to API routes
app.use('/api', apiVersioning); // Apply API versioning middleware
app.use('/api/v1/government', advancedRateLimiter); // Apply advanced rate limiting to government API
app.use('/api/v1/government', rateLimitInfo); // Add rate limit info headers
app.use('/api/v1/government', cacheMiddleware(300000)); // Add response caching (5 minutes TTL)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging and monitoring (must be after body parsing)
app.use(requestLogger);

// Add request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    // Only log important requests, not every single one
    if (req.method !== 'GET' || req.path.includes('/api/auth/') || req.path.includes('/api/admin/')) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
  });
}

// Routes - Versioned API endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/api-admin', apiAdminRoutes);
app.use('/api/v1/access-requests', accessRequestRoutes);
app.use('/api/v1/government', governmentRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.get('/api/v1/ngo', authenticate, getNGODashboard);
app.use('/api/v1/ngos', ngoRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/reports', reportRoutes);

// Legacy routes (redirect to v1) - for backward compatibility during transition
app.use('/api/auth', (req, res) => res.redirect(301, `/api/v1/auth${req.path}`));
app.use('/api/admin', (req, res) => res.redirect(301, `/api/v1/admin${req.path}`));
app.use('/api/api-admin', (req, res) => res.redirect(301, `/api/v1/api-admin${req.path}`));
app.use('/api/access-requests', (req, res) => res.redirect(301, `/api/v1/access-requests${req.path}`));
app.use('/api/government', (req, res) => res.redirect(301, `/api/v1/government${req.path}`));
app.use('/api/messages', (req, res) => res.redirect(301, `/api/v1/messages${req.path}`));
app.use('/api/events', (req, res) => res.redirect(301, `/api/v1/events${req.path}`));
app.use('/api/dashboard', (req, res) => res.redirect(301, `/api/v1/dashboard${req.path}`));
app.use('/api/ngos', (req, res) => res.redirect(301, `/api/v1/ngos${req.path}`));
app.use('/api/campaigns', (req, res) => res.redirect(301, `/api/v1/campaigns${req.path}`));
app.use('/api/stories', (req, res) => res.redirect(301, `/api/v1/stories${req.path}`));
app.use('/api/communities', (req, res) => res.redirect(301, `/api/v1/communities${req.path}`));
app.use('/api/reports', (req, res) => res.redirect(301, `/api/v1/reports${req.path}`));

// Serve uploaded files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Enhanced Health check routes (versioned)
app.get('/api/v1/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    const healthStatus = {
      success: true,
      message: 'CareConnect API is running!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'N/A'
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      apiVersion: 'v1'
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      apiVersion: 'v1'
    });
  }
});

// Simple ping endpoint for load balancers (versioned)
app.get('/api/v1/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiVersion: 'v1'
  });
});

// Database health check endpoint (versioned)
app.get('/api/v1/health/db', async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        message: 'Database not connected',
        status: 'unhealthy',
        apiVersion: 'v1'
      });
      return;
    }

    // Try to perform a simple database operation
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    }

    res.status(200).json({
      success: true,
      message: 'Database is healthy',
      status: 'healthy',
      connection: {
        readyState: mongoose.connection.readyState,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      },
      apiVersion: 'v1'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'unhealthy',
      apiVersion: 'v1'
    });
    return;
  }
});

// API Version information endpoint
app.get('/api/versions', (req, res) => {
  const { getVersionInfo } = require('./middleware/apiVersioning.js');
  res.status(200).json(getVersionInfo());
});

// Cache statistics endpoint (versioned)
app.get('/api/v1/cache/stats', (req, res) => {
  try {
    const stats = getCacheStats();
    res.status(200).json({
      success: true,
      message: 'Cache statistics retrieved successfully',
      data: stats,
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  }
});

// Security headers information endpoint (versioned)
app.get('/api/v1/security/headers', (req, res) => {
  const securityHeaders = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'Expect-CT': 'enforce, max-age=86400'
  };

  res.status(200).json({
    success: true,
    message: 'Security headers configuration',
    data: {
      appliedHeaders: securityHeaders,
      corsEnabled: true,
      helmetEnabled: true,
      rateLimitingEnabled: true,
      apiVersioningEnabled: true,
      cachingEnabled: true
    },
    apiVersion: 'v1',
    timestamp: new Date().toISOString()
  });
});

// API monitoring endpoints (versioned)
app.get('/api/v1/monitoring/metrics', (req: Request, res: Response) => {
  try {
    const metrics = apiMonitor.getMetrics();
    res.status(200).json({
      success: true,
      message: 'API performance metrics retrieved successfully',
      data: metrics,
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/v1/monitoring/logs', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const statusCode = req.query.statusCode ? parseInt(req.query.statusCode as string) : undefined;
    const method = req.query.method as string;
    const apiKey = req.query.apiKey as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const logs = apiMonitor.getLogs({
      limit: Math.min(limit, 1000), // Max 1000 logs at once
      offset,
      statusCode,
      method,
      apiKey,
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      message: 'API logs retrieved successfully',
      data: logs,
      pagination: {
        limit: Math.min(limit, 1000),
        offset,
        total: logs.length
      },
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logs',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/v1/monitoring/errors', (req: Request, res: Response) => {
  try {
    const errorSummary = apiMonitor.getErrorSummary();
    res.status(200).json({
      success: true,
      message: 'Error summary retrieved successfully',
      data: errorSummary,
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve error summary',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  }
});

// Status page endpoints (versioned)
app.get('/api/v1/status', getStatusPage);
app.get('/status', (req, res) => res.redirect(301, '/api/v1/status')); // Public status page

// Incident management endpoints (admin only - would need authentication in production)
app.post('/api/v1/incidents', createIncident);
app.put('/api/v1/incidents/:id', updateIncident);
app.get('/api/v1/incidents', getIncidents);

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    syntaxHighlight: {
      activate: true,
      theme: 'arta'
    },
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add API key to all requests in the docs
      if (!req.headers['X-API-Key']) {
        req.headers['X-API-Key'] = 'your-api-key-here';
      }
      return req;
    }
  }
}));

// Legacy health endpoints (redirect to v1)
app.get('/api/health', (req, res) => res.redirect(301, '/api/v1/health'));
app.get('/api/ping', (req, res) => res.redirect(301, '/api/v1/ping'));
app.get('/api/health/db', (req, res) => res.redirect(301, '/api/v1/health/db'));

// Error handling middleware
app.use(errorLogger); // Log errors before handling them
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI}`);
  console.log(`🌐 Server is listening on all network interfaces`);
  console.log(`📍 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/`);
  console.log(`📊 Status page: http://localhost:${PORT}/status`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
});

// Automatic uptime monitoring - check every hour
setInterval(async () => {
  try {
    // Check API health
    const apiResponse = await fetch(`http://localhost:${PORT}/api/v1/health`);
    const apiHealthy = apiResponse.ok;

    // Check database health
    const dbResponse = await fetch(`http://localhost:${PORT}/api/v1/health/db`);
    const dbHealthy = dbResponse.ok;

    // Update status page
    statusPage.updateServiceStatus('api', apiHealthy ? 'operational' : 'outage');
    statusPage.updateServiceStatus('database', dbHealthy ? 'operational' : 'outage');

    // Record uptime
    statusPage.recordUptimeCheck(apiHealthy && dbHealthy);

    // Create incident if service goes down
    if (!apiHealthy || !dbHealthy) {
      const serviceName = !apiHealthy ? 'API Service' : 'Database';
      const existingIncident = statusPage.getIncidents(1).find(
        inc => inc.title.includes(serviceName) && inc.status !== 'resolved'
      );

      if (!existingIncident) {
        statusPage.createIncident(
          `${serviceName} Outage`,
          `${serviceName} is currently experiencing issues. Our team is investigating.`,
          'major'
        );
      }
    }

  } catch (error) {
    console.error('Uptime check failed:', error);
    statusPage.recordUptimeCheck(false);
  }
}, 60 * 60 * 1000); // Check every hour
