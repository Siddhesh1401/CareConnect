import { Request, Response, NextFunction } from 'express';
import { APIKey } from '../models/APIKey.js';
import {
  createMissingAPIKeyError,
  createInvalidAPIKeyError,
  createExpiredAPIKeyError,
  createInsufficientPermissionsError,
  createInternalServerError
} from '../utils/problemDetails.js';

export interface APIKeyRequest extends Request {
  apiKey?: any;
}

// Middleware to validate API keys
export const validateAPIKey = async (req: APIKeyRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return next(createMissingAPIKeyError());
    }

    // Find the API key in the database
    const foundKey = await APIKey.findOne({ 
      key: apiKey, 
      status: 'active' 
    }).populate('createdBy', 'name email organization');

    if (!foundKey) {
      return next(createInvalidAPIKeyError());
    }

    // Check if the key has expired
    if (foundKey.expiresAt && foundKey.expiresAt < new Date()) {
      return next(createExpiredAPIKeyError());
    }

    // Update last used timestamp and increment usage count
    foundKey.lastUsed = new Date();
    foundKey.usageCount = (foundKey.usageCount || 0) + 1;
    await foundKey.save();

    // Attach the API key info to the request
    req.apiKey = foundKey;
    next();
  } catch (error) {
    console.error('Error validating API key:', error);
    return next(createInternalServerError('Failed to validate API key'));
  }
};

// Middleware to check specific permissions
export const requirePermission = (permission: string) => {
  return (req: APIKeyRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return next(createMissingAPIKeyError());
    }

    if (!req.apiKey.permissions.includes(permission)) {
      return next(createInsufficientPermissionsError(permission));
    }

    next();
  };
};