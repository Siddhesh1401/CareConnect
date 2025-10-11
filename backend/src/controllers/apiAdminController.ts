import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { APIKey, IAPIKey } from '../models/APIKey.js';
import AccessRequest from '../models/AccessRequest.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Generate a secure API key
const generateSecureKey = (): string => {
  return 'sk_live_' + crypto.randomBytes(32).toString('hex');
};

// Get API admin dashboard data
export const getAPIDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;

    if (!user || user.role !== 'api_admin') {
      throw new AppError('Unauthorized access', 403);
    }

    // Get API keys stats
    const activeKeys = await APIKey.countDocuments({ status: 'active' });
    const totalUsage = await APIKey.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);

    // Get recent API keys
    const recentKeys = await APIKey.find({ status: 'active' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name organization usageCount lastUsed createdAt permissions');

    // Get all API keys for the keys tab
    const allApiKeys = await APIKey.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .select('name organization usageCount lastUsed createdAt permissions status key');

    // Get real access requests from the database
    const accessRequests = await AccessRequest.find()
      .sort({ requestedAt: -1 })
      .select('organization contactPerson email purpose dataTypes status requestedAt priority reviewNotes')
      .lean();

    const pendingRequests = accessRequests.filter(r => r.status === 'pending').length;
    const approvedRequests = accessRequests.filter(r => r.status === 'approved').length;

    res.json({
      success: true,
      data: {
        stats: {
          activeKeys,
          pendingRequests,
          totalRequests: totalUsage[0]?.total || 0,
          approvedRequests
        },
        recentKeys: recentKeys.map(key => ({
          id: key._id,
          name: key.name,
          organization: key.organization,
          usageCount: key.usageCount,
          lastUsed: key.lastUsed,
          createdAt: key.createdAt,
          permissions: key.permissions,
          status: key.status
        })),
        apiKeys: allApiKeys.map(key => ({
          id: key._id,
          name: key.name,
          organization: key.organization,
          usageCount: key.usageCount,
          lastUsed: key.lastUsed,
          createdAt: key.createdAt,
          permissions: key.permissions,
          status: key.status,
          key: key.key.substring(0, 20) + '...' // Truncate for security
        })),
        accessRequests: accessRequests.map(request => ({
          _id: request._id,
          organization: request.organization,
          contactPerson: request.contactPerson,
          email: request.email,
          purpose: request.purpose,
          dataTypes: request.dataTypes,
          status: request.status,
          requestedAt: request.requestedAt,
          priority: request.priority,
          reviewNotes: request.reviewNotes
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching API dashboard:', error);
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof AppError ? error.message : 'Failed to fetch dashboard data'
    });
  }
};

// Generate new API key
export const generateAPIKey = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;

    if (!user || user.role !== 'api_admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const { name, organization, permissions, expiresAt } = req.body;

    if (!name || !organization || !permissions || !Array.isArray(permissions)) {
      throw new AppError('Name, organization, and permissions are required', 400);
    }

    // Generate unique key
    let key: string;
    let attempts = 0;
    do {
      key = generateSecureKey();
      attempts++;
      if (attempts > 10) {
        throw new AppError('Failed to generate unique API key', 500);
      }
    } while (await APIKey.findOne({ key }));

    const newKey = new APIKey({
      name,
      key,
      organization,
      permissions,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: user._id
    });

    await newKey.save();

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: {
        id: newKey._id,
        name: newKey.name,
        key: newKey.key,
        organization: newKey.organization,
        permissions: newKey.permissions,
        expiresAt: newKey.expiresAt,
        createdAt: newKey.createdAt
      }
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof AppError ? error.message : 'Failed to generate API key'
    });
  }
};

// Get all API keys
export const getAPIKeys = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;

    if (!user || user.role !== 'api_admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const keys = await APIKey.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await APIKey.countDocuments(query);

    res.json({
      success: true,
      data: {
        keys: keys.map(key => ({
          id: key._id,
          name: key.name,
          key: key.key,
          organization: key.organization,
          status: key.status,
          permissions: key.permissions,
          usageCount: key.usageCount,
          lastUsed: key.lastUsed,
          expiresAt: key.expiresAt,
          createdAt: key.createdAt,
          createdBy: {
            id: key.createdBy._id,
            name: (key.createdBy as any).name,
            email: (key.createdBy as any).email
          }
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof AppError ? error.message : 'Failed to fetch API keys'
    });
  }
};

// Revoke API key
export const revokeAPIKey = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;

    if (!user || user.role !== 'api_admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const { keyId } = req.params;

    const apiKey = await APIKey.findById(keyId);
    if (!apiKey) {
      throw new AppError('API key not found', 404);
    }

    apiKey.status = 'revoked';
    await apiKey.save();

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof AppError ? error.message : 'Failed to revoke API key'
    });
  }
};

// Get API usage analytics
export const getAPIUsageAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;

    if (!user || user.role !== 'api_admin') {
      throw new AppError('Unauthorized access', 403);
    }

    // Get usage statistics
    const totalKeys = await APIKey.countDocuments();
    const activeKeys = await APIKey.countDocuments({ status: 'active' });
    const totalUsage = await APIKey.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);

    // Get top consumers
    const topConsumers = await APIKey.find({ status: 'active' })
      .sort({ usageCount: -1 })
      .limit(10)
      .select('name organization usageCount lastUsed');

    // Get usage by permission
    const usageByPermission = await APIKey.aggregate([
      { $unwind: '$permissions' },
      {
        $group: {
          _id: '$permissions',
          totalUsage: { $sum: '$usageCount' },
          keyCount: { $sum: 1 }
        }
      },
      { $sort: { totalUsage: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalKeys,
          activeKeys,
          totalUsage: totalUsage[0]?.total || 0
        },
        topConsumers: topConsumers.map(key => ({
          id: key._id,
          name: key.name,
          organization: key.organization,
          usageCount: key.usageCount,
          lastUsed: key.lastUsed
        })),
        usageByPermission
      }
    });
  } catch (error) {
    console.error('Error fetching API analytics:', error);
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof AppError ? error.message : 'Failed to fetch analytics'
    });
  }
};

// Send API key via email
export const sendAPIKey = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;

    if (!user || user.role !== 'api_admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const { requestId, apiKey } = req.body;

    if (!requestId || !apiKey) {
      throw new AppError('Request ID and API key are required', 400);
    }

    // Find the access request
    const accessRequest = await AccessRequest.findById(requestId);
    if (!accessRequest) {
      throw new AppError('Access request not found', 404);
    }

    // Find the API key to get its permissions
    const apiKeyDoc = await APIKey.findOne({ key: apiKey });
    if (!apiKeyDoc) {
      throw new AppError('API key not found', 404);
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: accessRequest.email,
      subject: `Your CareConnect Government API Key - ${accessRequest.organization}`,
      html: `
        <h2>Government Data Access API Key</h2>
        <p>Dear ${accessRequest.contactPerson},</p>
        <p>Your request for government data access has been approved. Here are your API details:</p>
        <ul>
          <li><strong>Organization:</strong> ${accessRequest.organization}</li>
          <li><strong>API Key:</strong> <code>${apiKey}</code></li>
          <li><strong>Permissions:</strong> ${apiKeyDoc.permissions.join(', ')}</li>
          <li><strong>Portal:</strong> <a href="http://localhost:8081">Government Portal</a></li>
        </ul>
        <p>Please keep your API key secure and do not share it.</p>
        <p>Best regards,<br>CareConnect API Administration</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Update request status
    accessRequest.status = 'approved';
    await accessRequest.save();

    res.json({
      success: true,
      message: 'API key sent successfully'
    });
  } catch (error) {
    console.error('Error sending API key:', error);
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof AppError ? error.message : 'Failed to send API key'
    });
  }
};

// Trigger email monitoring
export const triggerEmailMonitoring = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;

    if (!user || user.role !== 'api_admin') {
      throw new AppError('Unauthorized access', 403);
    }

    // Import the email monitoring function
    const { monitorEmails } = await import('../scripts/emailMonitor.js');

    // Run email monitoring and capture results
    try {
      const results = await monitorEmails();
      
      res.json({
        success: true,
        message: 'Email monitoring completed successfully',
        data: results
      });
    } catch (error: any) {
      console.error('Error in email monitoring:', error);
      res.status(500).json({
        success: false,
        message: 'Email monitoring failed',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error triggering email monitoring:', error);
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof AppError ? error.message : 'Failed to trigger email monitoring'
    });
  }
};