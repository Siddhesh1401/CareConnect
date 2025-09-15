import express from 'express';
import { 
  getPendingNGOs, 
  getAllNGOs, 
  approveNGO, 
  rejectNGO, 
  getNGODetails,
  updateNGOStatus,
  getAllUsers,
  toggleUserStatus,
  updateUserAvatar,
  getDashboardStats,
  getAllMessages,
  respondToMessage,
  updateMessageStatus,
  getAnalyticsData
} from '../controllers/adminController.js';
import {
  approveDocument,
  rejectDocument,
  getDocumentStatus
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';
import { uploadUserAvatar } from '../middleware/upload.js';

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(isAdmin);

// NGO Management Routes
router.get('/ngos/pending', getPendingNGOs);           // Get pending NGO registrations
router.get('/ngos', getAllNGOs);                       // Get all NGOs with filtering
router.get('/ngos/:ngoId', getNGODetails);             // Get specific NGO details
router.patch('/ngos/:ngoId/approve', approveNGO);      // Approve NGO
router.patch('/ngos/:ngoId/reject', rejectNGO);        // Reject NGO
router.patch('/ngos/:ngoId/status', updateNGOStatus);  // Update NGO status

// Document Management Routes
router.patch('/ngos/:ngoId/documents/:documentType/approve', approveDocument);  // Approve specific document
router.patch('/ngos/:ngoId/documents/:documentType/reject', rejectDocument);    // Reject specific document
router.get('/ngos/:ngoId/documents', getDocumentStatus);                        // Get document status

// User Management Routes
router.get('/users', getAllUsers);                          // Get all users with filtering
router.patch('/users/:userId/toggle-status', toggleUserStatus);  // Toggle user active/suspended status
router.put('/users/:userId/avatar', uploadUserAvatar.single('profilePicture'), updateUserAvatar);  // Update user avatar

// Dashboard Routes
router.get('/dashboard/stats', getDashboardStats);          // Get dashboard statistics
router.get('/analytics', getAnalyticsData);                 // Get analytics data for charts

// Message Management Routes
router.get('/messages', getAllMessages);                    // Get all messages with filtering
router.patch('/messages/:messageId/respond', respondToMessage); // Send response to message
router.patch('/messages/:messageId/status', updateMessageStatus); // Update message status

export default router;
