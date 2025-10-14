import { Request, Response } from 'express';
import User from '../models/User.js';
import { uploadUserAvatar, getUserAvatarUrl } from '../middleware/upload.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    organizationName?: string;
    name?: string;
  };
  files?: any;
}

// Get NGO profile completion status
export const getProfileCompletion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can access profile completion'
      });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const completionPercentage = user.calculateProfileCompletion();
    
    // Get completion suggestions
    const suggestions = getCompletionSuggestions(user);
    
    res.status(200).json({
      success: true,
      data: {
        completionPercentage,
        suggestions,
        profile: {
          basic: {
            organizationName: user.organizationName,
            organizationType: user.organizationType,
            description: user.description,
            website: user.website,
            foundedYear: user.foundedYear
          },
          enhanced: {
            mission: user.mission,
            goals: user.goals,
            targetAudience: user.targetAudience,
            socialMediaLinks: user.socialMediaLinks,
            contactDetails: user.contactDetails,
            organizationAchievements: user.organizationAchievements,
            donationInfo: user.donationInfo,
            teamInfo: user.teamInfo,
            gallery: user.gallery,
            impactStats: user.impactStats,
            workingAreas: user.workingAreas
          }
        }
      }
    });

  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update NGO enhanced profile
export const updateEnhancedProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can update enhanced profiles'
      });
      return;
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const {
      mission,
      goals,
      targetAudience,
      socialMediaLinks,
      contactDetails,
      organizationAchievements,
      donationInfo,
      teamInfo,
      impactStats,
      workingAreas
    } = req.body;

    // Update fields if provided
    if (mission !== undefined) user.mission = mission;
    if (goals !== undefined) user.goals = goals;
    if (targetAudience !== undefined) user.targetAudience = targetAudience;
    if (socialMediaLinks !== undefined) {
      user.socialMediaLinks = { ...user.socialMediaLinks, ...socialMediaLinks };
    }
    if (contactDetails !== undefined) {
      user.contactDetails = { ...user.contactDetails, ...contactDetails };
    }
    if (organizationAchievements !== undefined) user.organizationAchievements = organizationAchievements;
    if (donationInfo !== undefined) {
      user.donationInfo = { ...user.donationInfo, ...donationInfo };
    }
    if (teamInfo !== undefined) {
      user.teamInfo = { ...user.teamInfo, ...teamInfo };
    }
    if (impactStats !== undefined) {
      user.impactStats = { ...user.impactStats, ...impactStats };
    }
    if (workingAreas !== undefined) user.workingAreas = workingAreas;

    // Save user (this will trigger the pre-save hook to update completion percentage)
    await user.save();

    const newCompletionPercentage = user.calculateProfileCompletion();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        completionPercentage: newCompletionPercentage,
        updatedFields: Object.keys(req.body),
        suggestions: getCompletionSuggestions(user)
      }
    });

  } catch (error) {
    console.error('Update enhanced profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update basic NGO profile (for existing fields)
export const updateBasicProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can update profiles'
      });
      return;
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const {
      organizationName,
      organizationType,
      description,
      website,
      foundedYear,
      registrationNumber
    } = req.body;

    // Update basic fields if provided
    if (organizationName !== undefined) user.organizationName = organizationName;
    if (organizationType !== undefined) user.organizationType = organizationType;
    if (description !== undefined) user.description = description;
    if (website !== undefined) user.website = website;
    if (foundedYear !== undefined) user.foundedYear = foundedYear;
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber;

    await user.save();

    const newCompletionPercentage = user.calculateProfileCompletion();

    res.status(200).json({
      success: true,
      message: 'Basic profile updated successfully',
      data: {
        completionPercentage: newCompletionPercentage,
        updatedFields: Object.keys(req.body)
      }
    });

  } catch (error) {
    console.error('Update basic profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Upload photos to NGO gallery
export const uploadGalleryPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can upload gallery photos'
      });
      return;
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (!req.files || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
      return;
    }

    // Initialize gallery if it doesn't exist
    if (!user.gallery) {
      user.gallery = { photos: [], videos: [] };
    }

    // Add new photo filenames to gallery
    const newPhotos = req.files.map((file: any) => file.filename);
    user.gallery.photos = [...(user.gallery.photos || []), ...newPhotos];

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Photos uploaded successfully',
      data: {
        uploadedPhotos: newPhotos.length,
        totalPhotos: user.gallery.photos.length,
        completionPercentage: user.calculateProfileCompletion()
      }
    });

  } catch (error) {
    console.error('Upload gallery photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get profile completion suggestions
const getCompletionSuggestions = (user: any): string[] => {
  const suggestions: string[] = [];

  // Check basic fields
  if (!user.organizationName) suggestions.push('Add your organization name');
  if (!user.organizationType) suggestions.push('Specify your organization type');
  if (!user.description) suggestions.push('Write a compelling organization description');
  if (!user.website) suggestions.push('Add your organization website');

  // Check enhanced fields
  if (!user.mission) suggestions.push('Define your organization mission and vision');
  if (!user.goals || user.goals.length === 0) suggestions.push('List your key organizational goals');
  if (!user.targetAudience || user.targetAudience.length === 0) suggestions.push('Specify your target audience');
  if (!user.contactDetails?.primaryEmail) suggestions.push('Add primary contact email');
  if (!user.contactDetails?.primaryPhone) suggestions.push('Add primary contact phone number');
  if (!user.contactDetails?.address?.city) suggestions.push('Add your organization address');
  if (!user.workingAreas || user.workingAreas.length === 0) suggestions.push('Add areas of work/focus');
  if (!user.impactStats?.peopleHelped || user.impactStats.peopleHelped === 0) suggestions.push('Add impact statistics (people helped, projects completed)');
  if (!user.socialMediaLinks?.facebook && !user.socialMediaLinks?.instagram && !user.socialMediaLinks?.twitter) {
    suggestions.push('Add social media links to increase visibility');
  }
  if (!user.teamInfo?.coreTeamMembers || user.teamInfo.coreTeamMembers.length === 0) {
    suggestions.push('Add core team member information');
  }
  if (!user.organizationAchievements || user.organizationAchievements.length === 0) {
    suggestions.push('Showcase your organization achievements and milestones');
  }
  if (!user.gallery?.photos || user.gallery.photos.length === 0) {
    suggestions.push('Upload photos to showcase your work and activities');
  }

  return suggestions;
};

export default {
  getProfileCompletion,
  updateEnhancedProfile,
  updateBasicProfile,
  uploadGalleryPhotos
};