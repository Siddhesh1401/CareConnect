import express from 'express';
import { 
  testConnection,
  getVolunteers,
  getNGOs,
  getCampaigns,
  getEvents,
  getDashboardStats
} from '../controllers/governmentController.js';
import { validateAPIKey, requirePermission } from '../middleware/apiKeyAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// All routes require valid API key
router.use(validateAPIKey);

// Test connection endpoint
router.get('/test', asyncHandler(testConnection));

// Dashboard statistics (requires read:reports permission)
router.get('/stats', requirePermission('read:reports'), asyncHandler(getDashboardStats));

// Data endpoints with specific permissions
router.get('/volunteers', requirePermission('read:volunteers'), asyncHandler(getVolunteers));
router.get('/ngos', requirePermission('read:ngos'), asyncHandler(getNGOs));
router.get('/campaigns', requirePermission('read:campaigns'), asyncHandler(getCampaigns));
router.get('/events', requirePermission('read:events'), asyncHandler(getEvents));

export default router;