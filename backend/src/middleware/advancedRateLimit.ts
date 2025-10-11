import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { APIKeyRequest } from './apiKeyAuth.js';
import { createRateLimitExceededError } from '../utils/problemDetails.js';

/**
 * Advanced Rate Limiting System for Government API
 * Provides different tiers, endpoint-specific limits, and proper headers
 */

// Rate limit tiers
export enum RateLimitTier {
  BASIC = 'basic',       // 1000/hour, 100/minute
  STANDARD = 'standard', // 5000/hour, 500/minute
  PREMIUM = 'premium',   // 10000/hour, 1000/minute
  ENTERPRISE = 'enterprise' // 50000/hour, 5000/minute
}

// Rate limit configurations per tier
export const RATE_LIMIT_CONFIGS = {
  [RateLimitTier.BASIC]: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    burstLimit: 100, // 100 requests per minute burst
    message: {
      error: 'Rate limit exceeded',
      message: 'Basic tier allows 1000 requests per hour. Upgrade for higher limits.',
      tier: RateLimitTier.BASIC,
      limits: {
        hourly: 1000,
        burst: 100
      }
    }
  },
  [RateLimitTier.STANDARD]: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5000, // 5000 requests per hour
    burstLimit: 500, // 500 requests per minute burst
    message: {
      error: 'Rate limit exceeded',
      message: 'Standard tier allows 5000 requests per hour.',
      tier: RateLimitTier.STANDARD,
      limits: {
        hourly: 5000,
        burst: 500
      }
    }
  },
  [RateLimitTier.PREMIUM]: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000, // 10000 requests per hour
    burstLimit: 1000, // 1000 requests per minute burst
    message: {
      error: 'Rate limit exceeded',
      message: 'Premium tier allows 10000 requests per hour.',
      tier: RateLimitTier.PREMIUM,
      limits: {
        hourly: 10000,
        burst: 1000
      }
    }
  },
  [RateLimitTier.ENTERPRISE]: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50000, // 50000 requests per hour
    burstLimit: 5000, // 5000 requests per minute burst
    message: {
      error: 'Rate limit exceeded',
      message: 'Enterprise tier allows 50000 requests per hour.',
      tier: RateLimitTier.ENTERPRISE,
      limits: {
        hourly: 50000,
        burst: 5000
      }
    }
  }
};

// Endpoint-specific rate limits (multipliers)
export const ENDPOINT_MULTIPLIERS = {
  // Light endpoints (low processing cost)
  '/test': 0.1,        // Very light, 10% of normal limit
  '/health': 0.1,
  '/ping': 0.1,

  // Medium endpoints
  '/stats': 0.5,       // 50% of normal limit
  '/volunteers': 1.0,  // Normal limit
  '/ngos': 1.0,
  '/events': 1.0,

  // Heavy endpoints (high processing cost)
  '/campaigns': 2.0,   // 200% of normal limit (more expensive)
  '/reports': 2.0,

  // Admin endpoints (restricted)
  '/api-admin': 5.0,   // 500% of normal limit (very restricted)
  '/access-requests': 3.0
};

/**
 * Get rate limit tier for an API key
 * In production, this would check the API key's subscription plan
 */
export const getRateLimitTier = (apiKey: any): RateLimitTier => {
  // For now, determine tier based on organization or key properties
  // In production, this would check a subscription database

  // Government agencies get premium by default
  if (apiKey.createdBy?.organization?.toLowerCase().includes('government')) {
    return RateLimitTier.PREMIUM;
  }

  // Large organizations get standard
  if (apiKey.createdBy?.organization?.length > 20) {
    return RateLimitTier.STANDARD;
  }

  // Default to basic
  return RateLimitTier.BASIC;
};

/**
 * Create endpoint-specific rate limiter
 */
export const createEndpointRateLimiter = (endpoint: string, baseTier: RateLimitTier) => {
  const config = RATE_LIMIT_CONFIGS[baseTier];
  const multiplier = ENDPOINT_MULTIPLIERS[endpoint as keyof typeof ENDPOINT_MULTIPLIERS] || 1.0;

  // Calculate endpoint-specific limits
  const maxRequests = Math.floor(config.max * multiplier);
  const burstLimit = Math.floor(config.burstLimit * multiplier);

  return rateLimit({
    windowMs: config.windowMs,
    max: maxRequests,
    message: {
      ...config.message,
      endpoint,
      effectiveLimits: {
        hourly: maxRequests,
        burst: burstLimit
      }
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req: Request) => {
      // Use API key as identifier for rate limiting
      const apiKey = (req as APIKeyRequest).apiKey;
      return apiKey ? `api_key_${apiKey._id}` : req.ip || 'unknown';
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks and ping
      return req.path.includes('/health') || req.path.includes('/ping');
    }
  });
};

/**
 * Burst rate limiter (per minute limits)
 */
export const createBurstRateLimiter = (tier: RateLimitTier) => {
  const config = RATE_LIMIT_CONFIGS[tier];

  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: config.burstLimit,
    message: {
      error: 'Burst rate limit exceeded',
      message: `Too many requests in a short time. Burst limit: ${config.burstLimit} per minute.`,
      tier,
      limit: config.burstLimit,
      windowMs: 60000
    },
    standardHeaders: true,
    keyGenerator: (req: Request) => {
      const apiKey = (req as APIKeyRequest).apiKey;
      return apiKey ? `burst_api_key_${apiKey._id}` : req.ip || 'unknown';
    }
  });
};

/**
 * Middleware to apply appropriate rate limiting based on API key and endpoint
 */
export const advancedRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = (req as APIKeyRequest).apiKey;

  if (!apiKey) {
    // No API key, use basic IP-based limiting
    return createEndpointRateLimiter(req.path, RateLimitTier.BASIC)(req, res, next);
  }

  // Get tier for this API key
  const tier = getRateLimitTier(apiKey);

  // Apply burst limiting first (stricter, shorter window)
  const burstLimiter = createBurstRateLimiter(tier);

  // Apply endpoint-specific limiting
  const endpointLimiter = createEndpointRateLimiter(req.path, tier);

  // Chain the limiters
  burstLimiter(req, res, (err?: any) => {
    if (err) return next(err);
    endpointLimiter(req, res, next);
  });
};

/**
 * Rate limit info middleware (adds headers with current usage)
 */
export const rateLimitInfo = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = (req as APIKeyRequest).apiKey;

  if (apiKey) {
    const tier = getRateLimitTier(apiKey);
    const config = RATE_LIMIT_CONFIGS[tier];

    // Add custom headers with tier information
    res.set({
      'X-RateLimit-Tier': tier,
      'X-RateLimit-Hourly': config.max.toString(),
      'X-RateLimit-Burst': config.burstLimit.toString(),
      'X-API-Version': 'v1'
    });
  }

  next();
};