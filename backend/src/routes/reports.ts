import express from 'express';
import {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  getReportReasons,
  getUserReports
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Public routes
router.get('/reasons/:type', getReportReasons); // Get report reasons for a type

// Protected routes (authenticated users)
router.use(authenticate);
router.post('/', createReport); // Create a report
router.get('/user', getUserReports); // Get user's own reports

// Admin only routes
router.get('/', isAdmin, getAllReports); // Get all reports
router.get('/:reportId', isAdmin, getReportById); // Get specific report
router.put('/:reportId/status', isAdmin, updateReportStatus); // Update report status
router.delete('/:reportId', isAdmin, deleteReport); // Delete report

export default router;