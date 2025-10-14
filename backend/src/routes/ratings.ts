import express from 'express';
import {
  submitRating,
  getNGORatings,
  getNGOAverageRating,
  getUserRating,
  deleteRating,
} from '../controllers/ratingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Test route to verify routing is working
router.get('/test', (req, res) => {
  res.json({ message: 'Rating routes are working!' });
});

// Submit or update a rating (authenticated users only)
router.post('/', authenticate, submitRating);

// Get all ratings for an NGO (public)
router.get('/ngo/:ngoId', getNGORatings);

// Get average rating for an NGO (public)
router.get('/ngo/:ngoId/average', getNGOAverageRating);

// Get user's rating for a specific NGO (authenticated)
router.get('/ngo/:ngoId/user', authenticate, getUserRating);

// Delete a rating (authenticated, own rating only)
router.delete('/:ratingId', authenticate, deleteRating);

export default router;
