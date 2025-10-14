import { Request, Response } from 'express';
import Rating from '../models/Rating.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';

// Submit or update a rating
export const submitRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('=== SUBMIT RATING CALLED ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { ngoId, rating, feedback, isAnonymous } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      console.log('ERROR: User not authenticated');
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    console.log('User ID:', userId);
    console.log('NGO ID:', ngoId);
    console.log('Rating:', rating);

    // Validate NGO exists and is an NGO
    const ngo = await User.findById(ngoId);
    console.log('NGO found:', ngo ? 'YES' : 'NO');
    
    if (!ngo || ngo.role !== 'ngo_admin') {
      console.log('ERROR: NGO not found or not an NGO admin');
      res.status(404).json({ message: 'NGO not found' });
      return;
    }

    // Prevent users from rating themselves
    if (userId.toString() === ngoId) {
      console.log('ERROR: User trying to rate themselves');
      res.status(400).json({ message: 'You cannot rate your own organization' });
      return;
    }

    // Check if user already rated this NGO
    const existingRating = await Rating.findOne({ userId, ngoId });

    let savedRating;
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.feedback = feedback || '';
      existingRating.isAnonymous = isAnonymous || false;
      savedRating = await existingRating.save();
    } else {
      // Create new rating
      const newRating = new Rating({
        userId,
        ngoId,
        rating,
        feedback: feedback || '',
        isAnonymous: isAnonymous || false,
      });
      savedRating = await newRating.save();
    }

    // Recalculate average rating and total reviews for the NGO
    await updateNGORatingStats(ngoId);

    res.status(200).json({
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
      rating: savedRating,
    });
  } catch (error) {
    console.error('=== ERROR SUBMITTING RATING ===');
    console.error('Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({ 
      message: 'Failed to submit rating',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all ratings for an NGO
export const getNGORatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ngoId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ ngoId })
      .populate('userId', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rating.countDocuments({ ngoId });

    // Hide user details for anonymous ratings
    const sanitizedRatings = ratings.map(rating => {
      if (rating.isAnonymous) {
        return {
          ...rating.toObject(),
          userId: {
            _id: rating.userId,
            name: 'Anonymous',
            profilePicture: null,
          },
        };
      }
      return rating;
    });

    res.status(200).json({
      ratings: sanitizedRatings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRatings: total,
    });
  } catch (error) {
    console.error('Error fetching NGO ratings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch ratings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get average rating for an NGO
export const getNGOAverageRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ngoId } = req.params;

    const ngo = await User.findById(ngoId).select('averageRating totalReviews');
    
    if (!ngo) {
      res.status(404).json({ message: 'NGO not found' });
      return;
    }

    res.status(200).json({
      averageRating: ngo.averageRating || 0,
      totalReviews: ngo.totalReviews || 0,
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ 
      message: 'Failed to fetch average rating',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user's rating for a specific NGO
export const getUserRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ngoId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const rating = await Rating.findOne({ userId, ngoId });

    if (!rating) {
      res.status(404).json({ message: 'No rating found' });
      return;
    }

    res.status(200).json({ rating });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ 
      message: 'Failed to fetch rating',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a rating
export const deleteRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ratingId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const rating = await Rating.findById(ratingId);

    if (!rating) {
      res.status(404).json({ message: 'Rating not found' });
      return;
    }

    // Only allow users to delete their own ratings
    if (rating.userId.toString() !== userId.toString()) {
      res.status(403).json({ message: 'You can only delete your own ratings' });
      return;
    }

    const ngoId = rating.ngoId;
    await Rating.findByIdAndDelete(ratingId);

    // Recalculate NGO rating stats
    await updateNGORatingStats(ngoId.toString());

    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ 
      message: 'Failed to delete rating',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to update NGO rating statistics
async function updateNGORatingStats(ngoId: string): Promise<void> {
  try {
    const ratings = await Rating.find({ ngoId });
    
    const totalReviews = ratings.length;
    const averageRating = totalReviews > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    await User.findByIdAndUpdate(ngoId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews,
    });
  } catch (error) {
    console.error('Error updating NGO rating stats:', error);
  }
}
