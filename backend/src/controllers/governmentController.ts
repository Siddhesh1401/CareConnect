import { Response } from 'express';
import { APIKeyRequest } from '../middleware/apiKeyAuth.js';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Event from '../models/Event.js';
import Community from '../models/Community.js';
import { AppError } from '../utils/AppError.js';

// Test API key connection
export const testConnection = async (req: APIKeyRequest, res: Response) => {
  try {
    const apiKey = req.apiKey;
    
    res.status(200).json({
      success: true,
      message: 'API key is valid and active',
      keyInfo: {
        name: apiKey.name,
        organization: apiKey.createdBy?.organization || 'Government Agency',
        permissions: apiKey.permissions,
        lastUsed: apiKey.lastUsed,
        usageCount: apiKey.usageCount,
        expiresAt: apiKey.expiresAt
      }
    });
  } catch (error) {
    console.error('Error in test connection:', error);
    throw new AppError('Failed to test connection', 500);
  }
};

// Get volunteers data (requires read:volunteers permission)
export const getVolunteers = async (req: APIKeyRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Look for users with role 'volunteer' (not 'user')
    const volunteers = await User.find({ 
      role: 'volunteer',
      isActive: true
    })
    .select('name email location skills totalVolunteerHours createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({ 
      role: 'volunteer',
      isActive: true
    });

    console.log(`✅ Found ${volunteers.length} volunteers with role 'volunteer'`);

    res.status(200).json({
      success: true,
      data: volunteers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    throw new AppError('Failed to fetch volunteers data', 500);
  }
};

// Get NGOs/Communities data (requires read:ngos permission)
export const getNGOs = async (req: APIKeyRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    // Debug: Check total communities first
    const totalAllCommunities = await Community.countDocuments();
    const totalActiveCommunities = await Community.countDocuments({ isActive: true });
    
    console.log(`🔍 Debug - Total communities: ${totalAllCommunities}, Active communities: ${totalActiveCommunities}`);

    const communities = await Community.find({
      // Temporarily remove isActive filter
    })
    .select('name description location category members totalEvents createdAt isActive')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Community.countDocuments({
      // Temporarily remove isActive filter
    });

    console.log(`🔍 Debug - Found ${communities.length} communities`);
    communities.forEach(c => {
      console.log(`- ${c.name} | isActive: ${c.isActive}`);
    });

    res.status(200).json({
      success: true,
      data: communities,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw new AppError('Failed to fetch communities data', 500);
  }
};

// Get campaigns data (requires read:campaigns permission)
export const getCampaigns = async (req: APIKeyRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const campaigns = await Campaign.find({ 
      status: 'active',
      isActive: true 
    })
    .select('title description goal raised startDate endDate createdBy location category')
    .populate('createdBy', 'name organization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Campaign.countDocuments({ 
      status: 'active',
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw new AppError('Failed to fetch campaigns data', 500);
  }
};

// Get events data (requires read:events permission)
export const getEvents = async (req: APIKeyRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const events = await Event.find({ 
      status: 'upcoming',
      isActive: true,
      date: { $gte: new Date() }
    })
    .select('title description date location maxParticipants currentParticipants createdBy category')
    .populate('createdBy', 'name organization')
    .sort({ date: 1 })
    .skip(skip)
    .limit(limit);

    const total = await Event.countDocuments({ 
      status: 'upcoming',
      isActive: true,
      date: { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new AppError('Failed to fetch events data', 500);
  }
};

// Get dashboard statistics (requires read:reports permission)
export const getDashboardStats = async (req: APIKeyRequest, res: Response) => {
  try {
    const [
      totalVolunteers,
      totalCommunities,
      activeCampaigns,
      upcomingEvents,
      totalDonations
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      Community.countDocuments({ isActive: true }),
      Campaign.countDocuments({ status: 'active', isActive: true }),
      Event.countDocuments({ 
        status: 'upcoming', 
        isActive: true, 
        date: { $gte: new Date() } 
      }),
      Campaign.aggregate([
        { $match: { status: 'active', isActive: true } },
        { $group: { _id: null, total: { $sum: '$raised' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        volunteers: totalVolunteers,
        communities: totalCommunities,
        activeCampaigns,
        upcomingEvents,
        totalDonations: totalDonations[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new AppError('Failed to fetch dashboard statistics', 500);
  }
};