import express from 'express';
import {
  getAPIDashboard,
  generateAPIKey,
  getAPIKeys,
  revokeAPIKey,
  getAPIUsageAnalytics,
  sendAPIKey,
  triggerEmailMonitoring
} from '../controllers/apiAdminController.js';
import { authenticate } from '../middleware/auth.js';
import { isAPIAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Apply authentication and API admin role check to all routes
router.use(authenticate);
router.use(isAPIAdmin);

// Dashboard routes
router.get('/dashboard', getAPIDashboard);

// API key management routes
router.post('/keys', generateAPIKey);
router.get('/keys', getAPIKeys);
router.delete('/keys/:keyId', revokeAPIKey);

// Analytics routes
router.get('/analytics', getAPIUsageAnalytics);

// Send API key route
router.post('/send-key', sendAPIKey);

// Email monitoring route
router.post('/email-monitoring', triggerEmailMonitoring);

export default router;