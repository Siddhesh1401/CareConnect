import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messages.js';
import eventRoutes from './routes/events.js';
import dashboardRoutes from './routes/dashboard.js';
import ngoRoutes from './routes/ngos.js';
import campaignRoutes from './routes/campaigns.js';
import storyRoutes from './routes/stories.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet()); // Security headers
app.use(limiter); // Apply rate limiting
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/stories', storyRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Enhanced Health check routes
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const mongoose = require('mongoose');
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
      version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Simple ping endpoint for load balancers
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
        status: 'unhealthy'
      });
    }

    // Try to perform a simple database operation
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      success: true,
      message: 'Database is healthy',
      status: 'healthy',
      connection: {
        readyState: mongoose.connection.readyState,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'unhealthy'
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI}`);
  console.log(`🌐 Server is listening on all network interfaces`);
  console.log(`📍 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/`);
});
