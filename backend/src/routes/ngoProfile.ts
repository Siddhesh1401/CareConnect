import express from 'express';
import {
  getProfileCompletion,
  updateEnhancedProfile,
  updateBasicProfile,
  uploadGalleryPhotos
} from '../controllers/ngoProfileController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadUserAvatar } from '../middleware/upload.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Profile completion routes
router.get('/completion', getProfileCompletion);         // Get profile completion status and suggestions

// Profile update routes
router.put('/basic', updateBasicProfile);               // Update basic NGO profile fields
router.put('/enhanced', updateEnhancedProfile);         // Update enhanced NGO profile fields

// Gallery routes
router.post('/gallery/photos', 
  uploadUserAvatar.array('photos', 10),                 // Allow up to 10 photos at once
  uploadGalleryPhotos
);

export default router;