import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Campaign from '../models/Campaign';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { uploadCampaignImages, getCampaignImageUrl, deleteCampaignImage } from '../middleware/upload';

// Get all campaigns (for volunteers)
export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdDate',
      sortOrder = 'desc',
      status = 'active'
    } = req.query;

    const query: any = { status };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ngoName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const campaigns = await Campaign.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('ngoId', 'organizationName profilePicture isNGOVerified');

    const total = await Campaign.countDocuments(query);

    // Transform campaigns to include id field
    const transformedCampaigns = campaigns.map(campaign => ({
      id: (campaign._id as mongoose.Types.ObjectId).toString(),
      title: campaign.title,
      description: campaign.description,
      ngoId: campaign.ngoId,
      ngoName: campaign.ngoName,
      category: campaign.category,
      target: campaign.target,
      raised: campaign.raised,
      donors: campaign.donors,
      daysLeft: campaign.daysLeft,
      image: campaign.images && campaign.images.length > 0 ? campaign.images[0] : '',
      location: campaign.location,
      urgency: campaign.urgency,
      status: campaign.status,
      createdDate: campaign.createdDate,
      updatedDate: campaign.updatedDate,
      endDate: campaign.endDate,
      tags: campaign.tags,
      updates: campaign.updates,
      donations: campaign.donations,
      socialLinks: campaign.socialLinks,
      impactMetrics: campaign.impactMetrics
    }));

    res.status(200).json({
      success: true,
      data: {
        campaigns: transformedCampaigns,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns'
    });
  }
};

// Get single campaign by ID
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id)
      .populate('ngoId', 'organizationName profilePicture isNGOVerified location website');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Transform campaign to include id field
    const transformedCampaign = {
      id: (campaign._id as mongoose.Types.ObjectId).toString(),
      title: campaign.title,
      description: campaign.description,
      fullDescription: campaign.description, // Using description as fullDescription for now
      ngoId: campaign.ngoId,
      ngoName: campaign.ngoName,
      category: campaign.category,
      target: campaign.target,
      raised: campaign.raised,
      donors: campaign.donors,
      daysLeft: campaign.daysLeft,
      image: campaign.images && campaign.images.length > 0 ? campaign.images[0] : '',
      location: campaign.location,
      urgency: campaign.urgency,
      status: campaign.status,
      createdDate: campaign.createdDate,
      updatedDate: campaign.updatedDate,
      endDate: campaign.endDate,
      tags: campaign.tags,
      updates: campaign.updates || [],
      donations: campaign.donations,
      socialLinks: campaign.socialLinks,
      impactMetrics: campaign.impactMetrics
    };

    res.status(200).json({
      success: true,
      data: transformedCampaign
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign'
    });
  }
};

// Get campaigns by NGO (for NGO dashboard)
export const getCampaignsByNGO = async (req: AuthRequest, res: Response) => {
  try {
    const ngoId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { ngoId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const campaigns = await Campaign.find(query)
      .sort({ createdDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Campaign.countDocuments(query);

    // Transform campaigns to include id field
    const transformedCampaigns = campaigns.map(campaign => ({
      id: (campaign._id as mongoose.Types.ObjectId).toString(),
      title: campaign.title,
      description: campaign.description,
      ngoId: campaign.ngoId,
      ngoName: campaign.ngoName,
      category: campaign.category,
      target: campaign.target,
      raised: campaign.raised,
      donors: campaign.donors,
      daysLeft: campaign.daysLeft,
      image: campaign.images && campaign.images.length > 0 ? campaign.images[0] : '',
      location: campaign.location,
      urgency: campaign.urgency,
      status: campaign.status,
      createdDate: campaign.createdDate,
      updatedDate: campaign.updatedDate,
      endDate: campaign.endDate,
      tags: campaign.tags,
      updates: campaign.updates,
      donations: campaign.donations,
      socialLinks: campaign.socialLinks,
      impactMetrics: campaign.impactMetrics
    }));

    res.status(200).json({
      success: true,
      data: {
        campaigns: transformedCampaigns,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching NGO campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns'
    });
  }
};

// Create new campaign (NGO only)
export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const ngoId = req.user?.id;
    const ngo = await User.findById(ngoId);

    if (!ngo || ngo.role !== 'ngo_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only NGO admins can create campaigns'
      });
    }

    // Handle image uploads
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      imageUrls = (req.files as Express.Multer.File[]).map(file => getCampaignImageUrl(file.filename));
    } else if (req.file) {
      // Fallback for single file upload
      imageUrls = [getCampaignImageUrl(req.file.filename)];
    }

    const campaignData = {
      ...req.body,
      images: imageUrls,
      image: imageUrls.length > 0 ? imageUrls[0] : '',
      ngoId,
      ngoName: ngo.organizationName || ngo.name,
      createdDate: new Date(),
      updatedDate: new Date()
    };

    const campaign = new Campaign(campaignData);
    await campaign.save();

    // Transform campaign to include id field
    const transformedCampaign = {
      id: (campaign._id as mongoose.Types.ObjectId).toString(),
      title: campaign.title,
      description: campaign.description,
      ngoId: campaign.ngoId,
      ngoName: campaign.ngoName,
      category: campaign.category,
      target: campaign.target,
      raised: campaign.raised,
      donors: campaign.donors,
      daysLeft: campaign.daysLeft,
      images: campaign.images,
      location: campaign.location,
      urgency: campaign.urgency,
      status: campaign.status,
      createdDate: campaign.createdDate,
      updatedDate: campaign.updatedDate,
      endDate: campaign.endDate,
      tags: campaign.tags,
      updates: campaign.updates,
      donations: campaign.donations,
      socialLinks: campaign.socialLinks,
      impactMetrics: campaign.impactMetrics
    };

    res.status(201).json({
      success: true,
      data: transformedCampaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign'
    });
  }
};

// Update campaign (NGO only)
export const updateCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ngoId = req.user?.id;

    const campaign = await Campaign.findOne({ _id: id, ngoId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission to update it'
      });
    }

    // Handle image upload
    const updateData: any = { ...req.body, updatedDate: new Date() };
    if (req.file) {
      // Delete old image if exists
      if (campaign.image) {
        const oldImageFilename = campaign.image.split('/').pop();
        if (oldImageFilename) {
          deleteCampaignImage(oldImageFilename);
        }
      }
      // Set new image URL
      updateData.image = getCampaignImageUrl(req.file.filename);
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Transform campaign to include id field
    const transformedCampaign = {
      id: (updatedCampaign._id as mongoose.Types.ObjectId).toString(),
      title: updatedCampaign.title,
      description: updatedCampaign.description,
      ngoId: updatedCampaign.ngoId,
      ngoName: updatedCampaign.ngoName,
      category: updatedCampaign.category,
      target: updatedCampaign.target,
      raised: updatedCampaign.raised,
      donors: updatedCampaign.donors,
      daysLeft: updatedCampaign.daysLeft,
      image: updatedCampaign.image,
      location: updatedCampaign.location,
      urgency: updatedCampaign.urgency,
      status: updatedCampaign.status,
      createdDate: updatedCampaign.createdDate,
      updatedDate: updatedCampaign.updatedDate,
      endDate: updatedCampaign.endDate,
      tags: updatedCampaign.tags,
      updates: updatedCampaign.updates,
      donations: updatedCampaign.donations,
      socialLinks: updatedCampaign.socialLinks,
      impactMetrics: updatedCampaign.impactMetrics
    };

    res.status(200).json({
      success: true,
      data: transformedCampaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campaign'
    });
  }
};

// Delete campaign (NGO only)
export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ngoId = req.user?.id;

    const campaign = await Campaign.findOneAndDelete({ _id: id, ngoId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campaign'
    });
  }
};

// Add campaign update (NGO only)
export const addCampaignUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ngoId = req.user?.id;
    const { title, content, images } = req.body;

    const campaign = await Campaign.findOne({ _id: id, ngoId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission to update it'
      });
    }

    const update = {
      id: Date.now().toString(),
      title,
      content,
      images: images || [],
      createdAt: new Date()
    };

    campaign.updates = campaign.updates || [];
    campaign.updates.unshift(update);
    campaign.updatedDate = new Date();

    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign,
      message: 'Campaign update added successfully'
    });
  } catch (error) {
    console.error('Error adding campaign update:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding campaign update'
    });
  }
};

// Get campaign statistics (for NGO dashboard)
export const getCampaignStats = async (req: AuthRequest, res: Response) => {
  try {
    const ngoId = req.user?.id;

    const stats = await Campaign.aggregate([
      { $match: { ngoId: ngoId } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          activeCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalRaised: { $sum: '$raised' },
          totalTarget: { $sum: '$target' },
          totalDonors: { $sum: '$donors' }
        }
      }
    ]);

    const result = stats[0] || {
      totalCampaigns: 0,
      activeCampaigns: 0,
      completedCampaigns: 0,
      totalRaised: 0,
      totalTarget: 0,
      totalDonors: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign statistics'
    });
  }
};

// Get campaign categories
export const getCampaignCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { value: 'education', label: 'Education' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'environment', label: 'Environment' },
      { value: 'poverty', label: 'Poverty Alleviation' },
      { value: 'disaster-relief', label: 'Disaster Relief' },
      { value: 'animal-welfare', label: 'Animal Welfare' },
      { value: 'children', label: 'Children' },
      { value: 'elderly', label: 'Elderly Care' },
      { value: 'disability', label: 'Disability Support' },
      { value: 'other', label: 'Other' }
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

// Donate to campaign (volunteers only)
export const donateToCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, message } = req.body;
    const donorId = (req as any).user?.id;

    if (!donorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not active'
      });
    }

    // Get donor information
    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Create donation record
    const donation = {
      id: new mongoose.Types.ObjectId().toString(),
      donorId,
      donorName: donor.name,
      amount,
      message: message || '',
      createdAt: new Date(),
      isAnonymous: false
    };

    // Update campaign
    campaign.raised += amount;
    campaign.donors += 1;
    campaign.donations = campaign.donations || [];
    campaign.donations.push(donation);
    campaign.updatedDate = new Date();

    await campaign.save();

    // Transform response
    const transformedCampaign = {
      id: (campaign as any)._id.toString(),
      title: campaign.title,
      description: campaign.description,
      ngoId: campaign.ngoId,
      ngoName: campaign.ngoName,
      category: campaign.category,
      target: campaign.target,
      raised: campaign.raised,
      donors: campaign.donors,
      daysLeft: campaign.daysLeft,
      image: campaign.images && campaign.images.length > 0 ? campaign.images[0] : '',
      location: campaign.location,
      urgency: campaign.urgency,
      status: campaign.status,
      createdDate: campaign.createdDate,
      updatedDate: campaign.updatedDate,
      endDate: campaign.endDate,
      tags: campaign.tags,
      updates: campaign.updates,
      donations: campaign.donations,
      socialLinks: campaign.socialLinks,
      impactMetrics: campaign.impactMetrics
    };

    res.status(200).json({
      success: true,
      data: transformedCampaign,
      message: 'Donation successful'
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing donation'
    });
  }
};

// Get campaign donors (NGO only)
export const getCampaignDonors = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ngoId = req.user?.id;

    if (!ngoId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find the campaign and verify ownership
    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if the NGO owns this campaign
    if (campaign.ngoId.toString() !== ngoId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view donors for your own campaigns.'
      });
    }

    // Get donor information from donations array
    const donors = campaign.donations?.map(donation => ({
      id: donation.donorId.toString(),
      name: donation.donorName,
      email: 'N/A', // Remove donorEmail property access
      amount: donation.amount,
      message: donation.message,
      donatedAt: donation.createdAt
    })) || [];

    res.status(200).json({
      success: true,
      data: {
        donors,
        totalDonors: donors.length,
        totalRaised: campaign.raised
      }
    });
  } catch (error) {
    console.error('Error fetching campaign donors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign donors'
    });
  }
};
