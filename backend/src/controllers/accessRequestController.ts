import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { AccessRequest, IAccessRequest } from '../models/AccessRequest.js';
import { APIKey } from '../models/APIKey.js';
import User from '../models/User.js';
import { Types } from 'mongoose';
import crypto from 'crypto';

// Generate a secure API key
const generateSecureKey = (): string => {
  return 'sk_gov_' + crypto.randomBytes(32).toString('hex');
};

// Submit a new access request (public endpoint for government agencies)
export const submitAccessRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      organization,
      contactPerson,
      email,
      phone,
      purpose,
      dataTypes,
      justification,
      estimatedUsage,
      technicalDetails,
      governmentLevel,
      department,
      authorizedOfficials
    } = req.body;

    // Validate required fields
    if (!organization || !contactPerson || !email || !purpose || !dataTypes || 
        !justification || !estimatedUsage || !technicalDetails || !governmentLevel || 
        !department || !authorizedOfficials) {
      res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
      return;
    }

    // Validate data types
    const validDataTypes = [
      'volunteer_data', 'ngo_data', 'campaign_data', 'event_data', 
      'story_data', 'community_data', 'analytics_data', 'user_statistics', 'performance_metrics'
    ];
    
    if (!Array.isArray(dataTypes) || !dataTypes.every(type => validDataTypes.includes(type))) {
      res.status(400).json({
        success: false,
        message: 'Invalid data types specified'
      });
      return;
    }

    // Check for duplicate requests from the same organization and email
    const existingRequest = await AccessRequest.findOne({
      $or: [
        { organization: organization, email: email },
        { organization: organization, status: { $in: ['pending', 'under_review'] } }
      ]
    });

    if (existingRequest) {
      res.status(409).json({
        success: false,
        message: 'A request from this organization is already pending or under review'
      });
      return;
    }

    // Create new access request
    const accessRequest = new AccessRequest({
      organization,
      contactPerson,
      email,
      phone,
      purpose,
      dataTypes,
      justification,
      estimatedUsage,
      technicalDetails,
      governmentLevel,
      department,
      authorizedOfficials,
      status: 'pending',
      priority: 'medium' // Default priority
    });

    await accessRequest.save();

    res.status(201).json({
      success: true,
      message: 'Access request submitted successfully',
      data: {
        requestId: accessRequest._id,
        organization: accessRequest.organization,
        status: accessRequest.status,
        requestedAt: accessRequest.requestedAt
      }
    });
  } catch (error) {
    console.error('Error submitting access request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all access requests (admin only)
export const getAllAccessRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20, priority, governmentLevel } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (governmentLevel) filter.governmentLevel = governmentLevel;

    const skip = (Number(page) - 1) * Number(limit);
    
    const requests = await AccessRequest.find(filter)
      .sort({ requestedAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .populate('reviewedBy', 'username email')
      .populate('apiKeyGenerated', 'name key status');

    const totalRequests = await AccessRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalRequests / Number(limit));

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalRequests,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching access requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get a specific access request by ID (admin only)
export const getAccessRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
      return;
    }

    const request = await AccessRequest.findById(id)
      .populate('reviewedBy', 'username email')
      .populate('apiKeyGenerated', 'name key status');

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
      return;
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching access request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Approve an access request (admin only)
export const approveAccessRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reviewNotes, generateApiKey = true, keyName, permissions, expiresAt } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
      return;
    }

    const accessRequest = await AccessRequest.findById(id);
    if (!accessRequest) {
      res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
      return;
    }

    if (accessRequest.status !== 'pending' && accessRequest.status !== 'under_review' && accessRequest.status !== 'email_submitted') {
      res.status(400).json({
        success: false,
        message: 'Only pending, under review, or email submitted requests can be approved'
      });
      return;
    }

    // Update request status
    accessRequest.status = 'approved';
    accessRequest.reviewNotes = reviewNotes;
    accessRequest.reviewedBy = req.user!._id as Types.ObjectId;
    accessRequest.reviewedAt = new Date();

    let apiKey = null;

    // Generate API key if requested
    if (generateApiKey) {
      // Map access request data types to valid API permissions
      const mapDataTypeToPermissions = (dataTypes: string[]): string[] => {
        const permissionMap: { [key: string]: string[] } = {
          'volunteer_data': ['read:volunteers'],
          'ngo_data': ['read:ngos'],
          'campaign_data': ['read:campaigns'],
          'event_data': ['read:events'],
          'story_data': ['read:stories'],
          'community_data': ['read:communities'],
          'analytics_data': ['read:reports'], // Map analytics to reports
          'user_statistics': ['read:reports'], // Map user stats to reports
          'performance_metrics': ['read:reports'] // Map performance to reports
        };
        
        const validPermissions = new Set<string>();
        dataTypes.forEach(dataType => {
          const perms = permissionMap[dataType];
          if (perms) {
            perms.forEach(perm => validPermissions.add(perm));
          }
        });
        
        return Array.from(validPermissions);
      };

      const validPermissions = permissions || mapDataTypeToPermissions(accessRequest.dataTypes);

      const apiKeyData = {
        name: keyName || `${accessRequest.organization} - Government Access`,
        key: generateSecureKey(),
        organization: accessRequest.organization,
        permissions: validPermissions,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        createdBy: req.user!._id as Types.ObjectId
      };

      apiKey = new APIKey(apiKeyData);
      await apiKey.save();

      accessRequest.apiKeyGenerated = apiKey._id as Types.ObjectId;
    }

    await accessRequest.save();

    res.json({
      success: true,
      message: 'Access request approved successfully',
      data: {
        request: accessRequest,
        apiKey: apiKey ? {
          id: apiKey._id,
          name: apiKey.name,
          key: apiKey.key,
          permissions: apiKey.permissions,
          expiresAt: apiKey.expiresAt
        } : null
      }
    });
  } catch (error) {
    console.error('Error approving access request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reject an access request (admin only)
export const rejectAccessRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
      return;
    }

    if (!reviewNotes || reviewNotes.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Review notes are required for rejection'
      });
      return;
    }

    const accessRequest = await AccessRequest.findById(id);
    if (!accessRequest) {
      res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
      return;
    }

    if (accessRequest.status !== 'pending' && accessRequest.status !== 'under_review') {
      res.status(400).json({
        success: false,
        message: 'Only pending or under review requests can be rejected'
      });
      return;
    }

    // Update request status
    accessRequest.status = 'rejected';
    accessRequest.reviewNotes = reviewNotes;
    accessRequest.reviewedBy = req.user!._id as Types.ObjectId;
    accessRequest.reviewedAt = new Date();

    await accessRequest.save();

    res.json({
      success: true,
      message: 'Access request rejected successfully',
      data: accessRequest
    });
  } catch (error) {
    console.error('Error rejecting access request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update request priority (admin only)
export const updateRequestPriority = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
      return;
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      res.status(400).json({
        success: false,
        message: 'Invalid priority level'
      });
      return;
    }

    const accessRequest = await AccessRequest.findByIdAndUpdate(
      id,
      { priority },
      { new: true }
    );

    if (!accessRequest) {
      res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Priority updated successfully',
      data: accessRequest
    });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get access request statistics (admin only)
export const getAccessRequestStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [pending, approved, rejected, underReview] = await Promise.all([
      AccessRequest.countDocuments({ status: 'pending' }),
      AccessRequest.countDocuments({ status: 'approved' }),
      AccessRequest.countDocuments({ status: 'rejected' }),
      AccessRequest.countDocuments({ status: 'under_review' })
    ]);

    const total = pending + approved + rejected + underReview;

    // Get recent requests (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRequests = await AccessRequest.countDocuments({
      requestedAt: { $gte: thirtyDaysAgo }
    });

    // Get requests by government level
    const byGovernmentLevel = await AccessRequest.aggregate([
      {
        $group: {
          _id: '$governmentLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        underReview,
        recentRequests,
        byGovernmentLevel: byGovernmentLevel.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0'
      }
    });
  } catch (error) {
    console.error('Error fetching access request stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};