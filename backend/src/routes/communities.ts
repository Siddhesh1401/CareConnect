import express from 'express';
import {
  getAllCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getUserCommunities,
  getNGOCommunities,
  getNGOJoinedCommunities,
  createPost,
  likePost,
  commentOnPost,
  likeComment,
  deleteComment,
  getCommunityPosts
} from '../controllers/communityController.js';
import { authenticate } from '../middleware/auth.js';
import { hasRole } from '../middleware/roleAuth.js';
import { uploadCommunityImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllCommunities); // Get all public communities
router.get('/:communityId', getCommunityById); // Get specific community details

// Protected routes
router.use(authenticate);

// General user routes
router.post('/:communityId/join', joinCommunity); // Join a community
router.delete('/:communityId/leave', leaveCommunity); // Leave a community
router.get('/user/my-communities', getUserCommunities); // Get user's joined communities

// NGO admin routes
router.post('/create', hasRole('ngo_admin'), uploadCommunityImages.single('image'), createCommunity); // Create community
router.put('/:communityId', hasRole('ngo_admin'), uploadCommunityImages.single('image'), updateCommunity); // Update community
router.delete('/:communityId', hasRole('ngo_admin'), deleteCommunity); // Delete community
router.get('/ngo/my-communities', hasRole('ngo_admin'), getNGOCommunities); // Get NGO's owned communities
router.get('/ngo/joined-communities', hasRole('ngo_admin'), getNGOJoinedCommunities); // Get NGO's joined communities

// Post routes (for all authenticated users)
router.post('/:communityId/posts', uploadCommunityImages.single('image'), createPost); // Create post in community
router.post('/:communityId/posts/:postId/like', likePost); // Like a post
router.post('/:communityId/posts/:postId/comment', commentOnPost); // Comment on a post
router.post('/:communityId/posts/:postId/comments/:commentId/like', likeComment); // Like a comment
router.delete('/:communityId/posts/:postId/comments/:commentId', deleteComment); // Delete a comment (moderation)
router.get('/:communityId/posts', getCommunityPosts); // Get posts in community

export default router;