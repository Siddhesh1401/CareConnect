import express from 'express';
import {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  getUserStories,
  getStoryCategories,
  getAllStoriesAdmin,
  updateStoryStatus
} from '../controllers/storyController';
import { authenticate } from '../middleware/auth';
import { hasRole } from '../middleware/roleAuth';

const router = express.Router();

// Public routes - specific routes first to avoid conflicts
router.get('/', getAllStories);
router.get('/categories', getStoryCategories);
router.get('/:id', getStoryById); // This needs to be public for viewing stories

// Admin routes (before authentication middleware to avoid conflicts)
router.get('/admin/all', authenticate, hasRole('admin'), getAllStoriesAdmin);

// Protected routes (require authentication)
router.use(authenticate);

// User story management
router.get('/user/my-stories', getUserStories);
router.post('/', createStory);
router.put('/:id', updateStory);
router.delete('/:id', deleteStory);
router.put('/:id/status', hasRole('admin'), updateStoryStatus);

export default router;
