import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import User, { IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token) as any;
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || user.accountStatus !== 'active') {
      res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
      return;
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Optional authentication - continues even if no token provided
export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token
      const decoded = verifyToken(token) as any;
      
      // Find user
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.accountStatus === 'active') {
        req.user = user;
      }
      // If user not found or inactive, continue without user (don't throw error)
    } catch (tokenError) {
      // Invalid token, continue without user (don't throw error)
      console.log('Optional auth: Invalid token, continuing without user');
    }

    next();

  } catch (error) {
    // Any other error, continue without user
    next();
  }
};
