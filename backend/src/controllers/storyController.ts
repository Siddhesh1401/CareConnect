import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Story from '../models/Story';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { getStoryImageUrl } from '../middleware/upload';

// Get all stories (public)
export const getAllStories = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdDate',
      sortOrder = 'desc',
      status = 'published'
    } = req.query;

    const query: any = { status };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$text = { $search: search as string };
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const stories = await Story.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author.id', 'name email profilePicture organizationName');

    const total = await Story.countDocuments(query);

    // Transform stories for frontend
    const transformedStories = stories.map(story => ({
      id: story._id.toString(),
      title: story.title,
      excerpt: story.excerpt,
      content: story.content,
      image: story.image,
      author: {
        id: story.author.id._id?.toString() || story.author.id.toString(),
        name: story.author.name,
        email: story.author.email,
        role: story.author.role,
        profilePicture: story.author.avatar,
        organizationName: story.author.organizationName
      },
      category: story.category,
      status: story.status,
      tags: story.tags,
      readTime: story.readTime,
      likes: story.likes,
      comments: story.comments,
      shares: story.shares,
      views: story.views,
      createdDate: story.createdDate,
      updatedDate: story.updatedDate,
      publishedDate: story.publishedDate,
      featured: story.featured
    }));

    res.status(200).json({
      success: true,
      data: {
        stories: transformedStories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stories'
    });
  }
};

// Get single story by ID
export const getStoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle special routes that are not ObjectIds
    if (id === 'preview' || id === 'categories' || id === 'user') {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story ID format'
      });
    }

    const story = await Story.findById(id).populate('author.id', 'name email profilePicture organizationName');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Increment view count
    await Story.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const transformedStory = {
      id: story._id.toString(),
      title: story.title,
      excerpt: story.excerpt,
      content: story.content,
      image: story.image,
      author: {
        id: story.author.id._id?.toString() || story.author.id.toString(),
        name: story.author.name,
        email: story.author.email,
        role: story.author.role,
        profilePicture: story.author.avatar,
        organizationName: story.author.organizationName
      },
      category: story.category,
      status: story.status,
      tags: story.tags,
      readTime: story.readTime,
      likes: story.likes,
      comments: story.comments,
      shares: story.shares,
      views: story.views + 1, // Include the current view
      createdDate: story.createdDate,
      updatedDate: story.updatedDate,
      publishedDate: story.publishedDate,
      featured: story.featured
    };

    res.status(200).json({
      success: true,
      data: transformedStory
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching story'
    });
  }
};

// Create new story
export const createStory = async (req: AuthRequest, res: Response) => {
  try {
    const { title, excerpt, content, category, tags, status } = req.body;
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get author information
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Handle image upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = getStoryImageUrl(req.file.filename);
    }

    // Set status based on role and requested status
    let storyStatus = status || 'draft';
    if (author.role === 'volunteer') {
      // Volunteers can publish directly (no admin approval needed)
      storyStatus = status === 'published' ? 'published' : 'draft';
    } else if (author.role === 'ngo_admin' && status === 'published') {
      // NGOs can publish directly
      storyStatus = 'published';
    }

    const storyData = {
      title,
      excerpt,
      content,
      image: imageUrl,
      author: {
        id: authorId,
        name: author.name,
        email: author.email,
        role: author.role,
        avatar: author.profilePicture || null, // Only set if profilePicture exists, otherwise null
        organizationName: author.organizationName
      },
      category,
      status: storyStatus,
      tags: tags || [],
      publishedDate: storyStatus === 'published' ? new Date() : undefined
    };

    const story = new Story(storyData);
    await story.save();

    res.status(201).json({
      success: true,
      data: {
        id: story._id.toString(),
        ...storyData,
        createdDate: story.createdDate,
        updatedDate: story.updatedDate
      },
      message: storyStatus === 'published'
        ? 'Story published successfully'
        : 'Story saved as draft'
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating story'
    });
  }
};

// Update story
export const updateStory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check ownership
    if (story.author.id.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own stories'
      });
    }

    // Handle image upload
    if (req.file) {
      updates.image = getStoryImageUrl(req.file.filename);
    }

    // Update published date if status changes to published
    if (updates.status === 'published' && story.status !== 'published') {
      updates.publishedDate = new Date();
    }

    const updatedStory = await Story.findByIdAndUpdate(
      id,
      { ...updates, updatedDate: new Date() },
      { new: true }
    ).populate('author.id', 'name email profilePicture organizationName');

    if (!updatedStory) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedStory._id.toString(),
        title: updatedStory.title,
        excerpt: updatedStory.excerpt,
        content: updatedStory.content,
        image: updatedStory.image,
        author: {
          id: updatedStory.author.id._id?.toString() || updatedStory.author.id.toString(),
          name: updatedStory.author.name,
          email: updatedStory.author.email,
          role: updatedStory.author.role,
          profilePicture: updatedStory.author.avatar,
          organizationName: updatedStory.author.organizationName
        },
        category: updatedStory.category,
        status: updatedStory.status,
        tags: updatedStory.tags,
        readTime: updatedStory.readTime,
        likes: updatedStory.likes,
        comments: updatedStory.comments,
        shares: updatedStory.shares,
        views: updatedStory.views,
        createdDate: updatedStory.createdDate,
        updatedDate: updatedStory.updatedDate,
        publishedDate: updatedStory.publishedDate,
        featured: updatedStory.featured
      }
    });
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating story'
    });
  }
};

// Delete story
export const deleteStory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check ownership
    if (story.author.id.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own stories'
      });
    }

    await Story.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting story'
    });
  }
};

// Get user's stories
export const getUserStories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const query: any = { 'author.id': userId };
    if (status) {
      query.status = status;
    }

    const stories = await Story.find(query)
      .sort({ createdDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Story.countDocuments(query);

    const transformedStories = stories.map(story => ({
      id: story._id.toString(),
      title: story.title,
      excerpt: story.excerpt,
      image: story.image,
      category: story.category,
      status: story.status,
      createdDate: story.createdDate,
      updatedDate: story.updatedDate,
      publishedDate: story.publishedDate,
      likes: story.likes,
      views: story.views
    }));

    res.status(200).json({
      success: true,
      data: {
        stories: transformedStories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stories'
    });
  }
};

// Get story categories
export const getStoryCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { value: 'all', label: 'All Stories' },
      { value: 'education', label: 'Education' },
      { value: 'environment', label: 'Environment' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'community', label: 'Community' },
      { value: 'success', label: 'Success Stories' },
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

// Admin: Get all stories for management
export const getAllStoriesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (category && category !== 'all') query.category = category;

    const stories = await Story.find(query)
      .sort({ createdDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('author.id', 'name email profilePicture organizationName');

    const total = await Story.countDocuments(query);

    const transformedStories = stories.map(story => ({
      id: story._id.toString(),
      title: story.title,
      excerpt: story.excerpt,
      image: story.image,
      author: {
        id: story.author.id._id?.toString() || story.author.id.toString(),
        name: story.author.name,
        email: story.author.email,
        role: story.author.role,
        profilePicture: story.author.avatar,
        organizationName: story.author.organizationName
      },
      category: story.category,
      status: story.status,
      createdDate: story.createdDate,
      likes: story.likes,
      views: story.views,
      featured: story.featured
    }));

    res.status(200).json({
      success: true,
      data: {
        stories: transformedStories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin stories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stories'
    });
  }
};

// Admin: Approve/reject story
export const updateStoryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;

    const updateData: any = { status };
    if (featured !== undefined) {
      updateData.featured = featured;
    }

    if (status === 'published') {
      updateData.publishedDate = new Date();
    }

    const story = await Story.findByIdAndUpdate(id, updateData, { new: true });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Story ${status} successfully`,
      data: {
        id: story._id.toString(),
        status: story.status,
        featured: story.featured,
        publishedDate: story.publishedDate
      }
    });
  } catch (error) {
    console.error('Error updating story status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating story status'
    });
  }
};
