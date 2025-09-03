import express from 'express';
import { 
  getPendingNGOs, 
  getAllNGOs, 
  approveNGO, 
  rejectNGO, 
  getNGODetails,
  updateNGOStatus
} from '../controllers/adminController';
import {
  approveDocument,
  rejectDocument,
  getDocumentStatus
} from '../controllers/documentController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/roleAuth.js';

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

export default router;
