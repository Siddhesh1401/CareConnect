import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

// Middleware to check if user is admin
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user is NGO admin
export const isNGOAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (req.user.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'NGO admin access required'
      });
      return;
    }

    // Check if NGO is approved
    if (req.user.verificationStatus !== 'approved') {
      res.status(403).json({
        success: false,
        message: 'NGO verification required'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user is volunteer
export const isVolunteer = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (req.user.role !== 'volunteer') {
      res.status(403).json({
        success: false,
        message: 'Volunteer access required'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check multiple roles
export const hasRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
