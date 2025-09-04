import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getVolunteerDashboard,
  getNGODashboard
} from '../controllers/dashboardController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Volunteer dashboard
router.get('/volunteer', getVolunteerDashboard);

// NGO dashboard
router.get('/ngo', getNGODashboard);

export default router;
