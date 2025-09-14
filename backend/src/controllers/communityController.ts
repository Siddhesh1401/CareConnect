import { Request, Response } from 'express';
import Community, { ICommunity, IPost } from '../models/Community.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { getCommunityImageUrl } from '../middleware/upload.js';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    organizationName?: string;
    name?: string;
  };
  files?: any;
}

// Get all public communities
export const getAllCommunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    let query: any = { isPrivate: false };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const communities = await Community.find(query)
      .populate('createdBy', 'name organizationName')
      .populate('members', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Community.countDocuments(query);

    res.status(200).json({
      success: true,
      data: communities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching communities'
    });
  }
};

// Get specific community
export const getCommunityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId)
      .populate('createdBy', 'name organizationName')
      .populate('members', 'name')
      .populate('posts.author', 'name');

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: community
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching community'
    });
  }
};

// Create community (NGO only)
export const createCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO admins can create communities'
      });
      return;
    }

    const { name, description, category, isPrivate = false } = req.body;

    // Handle image upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = getCommunityImageUrl(req.file.filename);
    }

    const community = new Community({
      name,
      description,
      category,
      image: imageUrl,
      createdBy: req.user.id,
      members: [req.user.id], // Creator is automatically a member
      isPrivate: isPrivate === 'true' || isPrivate === true
    });

    await community.save();

    res.status(201).json({
      success: true,
      data: community,
      message: 'Community created successfully'
    });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating community'
    });
  }
};

// Update community (NGO only)
export const updateCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO admins can update communities'
      });
      return;
    }

    const { communityId } = req.params;
    const updates = req.body;

    // Handle image upload
    if (req.file) {
      updates.image = getCommunityImageUrl(req.file.filename);
    }

    const community = await Community.findOneAndUpdate(
      { _id: communityId, createdBy: req.user.id },
      updates,
      { new: true }
    );

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found or you do not have permission to update it'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: community,
      message: 'Community updated successfully'
    });
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating community'
    });
  }
};

// Delete community (NGO only)
export const deleteCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO admins can delete communities'
      });
      return;
    }

    const { communityId } = req.params;

    const community = await Community.findOneAndDelete({
      _id: communityId,
      createdBy: req.user.id
    });

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found or you do not have permission to delete it'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Community deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting community'
    });
  }
};

// Join community
export const joinCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { communityId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    if (community.createdBy.toString() === req.user.id.toString()) {
      res.status(400).json({
        success: false,
        message: 'You are the owner of this community'
      });
      return;
    }

    if (community.members.includes(req.user.id as any)) {
      res.status(400).json({
        success: false,
        message: 'Already a member of this community'
      });
      return;
    }

    community.members.push(req.user.id as any);
    await community.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the community'
    });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining community'
    });
  }
};

// Leave community
export const leaveCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { communityId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    if (community.createdBy.toString() === req.user.id.toString()) {
      res.status(400).json({
        success: false,
        message: 'Community owners cannot leave their own communities'
      });
      return;
    }

    const memberIndex = community.members.indexOf(req.user.id as any);
    if (memberIndex === -1) {
      res.status(400).json({
        success: false,
        message: 'Not a member of this community'
      });
      return;
    }

    community.members.splice(memberIndex, 1);
    await community.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the community'
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving community'
    });
  }
};

// Get user's joined communities
export const getUserCommunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const communities = await Community.find({ members: req.user.id })
      .populate('createdBy', 'name organizationName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: communities
    });
  } catch (error) {
    console.error('Error fetching user communities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user communities'
    });
  }
};

// Get NGO's communities
export const getNGOCommunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO admins can access this'
      });
      return;
    }

    const communities = await Community.find({ createdBy: req.user.id })
      .populate('members', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: communities
    });
  } catch (error) {
    console.error('Error fetching NGO communities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching NGO communities'
    });
  }
};

// Get communities where NGO admin is a member but not the owner
export const getNGOJoinedCommunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO admins can access this'
      });
      return;
    }

    const communities = await Community.find({
      members: req.user.id,
      createdBy: { $ne: req.user.id } // Not created by this user
    })
      .populate('createdBy', 'name organizationName')
      .populate('members', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: communities
    });
  } catch (error) {
    console.error('Error fetching NGO joined communities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching NGO joined communities'
    });
  }
};

// Create post in community
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { communityId } = req.params;
    const { title, content } = req.body;

    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    if (!community.members.includes(req.user.id as any)) {
      res.status(403).json({
        success: false,
        message: 'You must be a member of this community to post'
      });
      return;
    }

    // Handle image upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = getCommunityImageUrl(req.file.filename);
    }

    const newPost: IPost = {
      title,
      content,
      author: req.user.id as any,
      date: new Date(),
      likes: [],
      comments: [],
      image: imageUrl
    };

    community.posts.push(newPost);
    await community.save();

    res.status(201).json({
      success: true,
      data: newPost,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post'
    });
  }
};

// Like a post
export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { communityId, postId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    const post = community.posts.id(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found'
      });
      return;
    }

    const likeIndex = post.likes.indexOf(req.user.id as any);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user.id as any);
    }

    await community.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likes: post.likes.length
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking post'
    });
  }
};

// Comment on a post
export const commentOnPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { communityId, postId } = req.params;
    const { content } = req.body;

    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    const post = community.posts.id(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found'
      });
      return;
    }

    const newComment = {
      id: new mongoose.Types.ObjectId().toString(),
      content,
      author: req.user.id,
      date: new Date()
    };

    post.comments.push(newComment as any);
    await community.save();

    res.status(201).json({
      success: true,
      data: newComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({
      success: false,
      message: 'Error commenting on post'
    });
  }
};

// Get posts in community
export const getCommunityPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const community = await Community.findById(communityId)
      .populate('posts.author', 'name')
      .populate('posts.comments.author', 'name');

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    const posts = community.posts
      .slice()
      .reverse() // Most recent first
      .slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: community.posts.length,
        pages: Math.ceil(community.posts.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching community posts'
    });
  }
};

// Like or unlike a comment
export const likeComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { communityId, postId, commentId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    const post = community.posts.id(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found'
      });
      return;
    }

    const comment = post.comments.find(c => c.id === commentId);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
      return;
    }

    const userId = req.user.id;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const likeIndex = comment.likes.indexOf(userIdObj);

    let isLiked: boolean;

    if (likeIndex > -1) {
      // User already liked, so unlike
      comment.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      // User hasn't liked, so like
      comment.likes.push(userIdObj);
      isLiked = true;
    }

    await community.save();

    res.status(200).json({
      success: true,
      data: {
        commentId,
        isLiked,
        likesCount: comment.likes.length
      },
      message: isLiked ? 'Comment liked' : 'Comment unliked'
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing comment like'
    });
  }
};

// Delete a comment (moderation)
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { communityId, postId, commentId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    const post = community.posts.id(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found'
      });
      return;
    }

    const commentIndex = post.comments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
      return;
    }

    const comment = post.comments[commentIndex];

    // Check if user is admin or the comment author
    const isAdmin = req.user.role === 'admin' || req.user.role === 'ngo_admin';
    const isAuthor = comment.author.toString() === req.user.id;

    if (!isAdmin && !isAuthor) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own comments or you need admin privileges'
      });
      return;
    }

    // Remove the comment
    post.comments.splice(commentIndex, 1);
    await community.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
};