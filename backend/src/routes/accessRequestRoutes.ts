import express from 'express';
import {
  submitAccessRequest,
  getAllAccessRequests,
  getAccessRequestById,
  approveAccessRequest,
  rejectAccessRequest,
  updateRequestPriority,
  getAccessRequestStats
} from '../controllers/accessRequestController.js';
import { authenticate } from '../middleware/auth.js';
import { isAPIAdmin } from '../middleware/roleAuth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for public endpoints
const submitRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many access requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public endpoint for government agencies to submit access requests
router.post('/submit', submitRequestLimiter, submitAccessRequest);

// Admin-only endpoints - require authentication and api_admin role
router.use(authenticate, isAPIAdmin);

// Get all access requests with optional filtering and pagination
router.get('/', getAllAccessRequests);

// Get access request statistics
router.get('/stats', getAccessRequestStats);

// Get specific access request by ID
router.get('/:id', getAccessRequestById);

// Approve an access request
router.put('/:id/approve', approveAccessRequest);

// Reject an access request
router.put('/:id/reject', rejectAccessRequest);

// Update request priority
router.put('/:id/priority', updateRequestPriority);

export default router;