import express from 'express';
import {
  getAllCampaigns,
  getCampaignById,
  getCampaignsByNGO,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  addCampaignUpdate,
  getCampaignStats,
  getCampaignCategories,
  donateToCampaign,
  getCampaignDonors
} from '../controllers/campaignController';
import { authenticate } from '../middleware/auth';
import { hasRole } from '../middleware/roleAuth';

const router = express.Router();

// Public routes (for volunteers)
router.get('/', getAllCampaigns);
router.get('/categories', getCampaignCategories);
router.get('/:id', getCampaignById);

// Protected routes (require authentication)
router.use(authenticate);

// Volunteer routes
router.post('/:id/donate', donateToCampaign);

// NGO specific routes
router.get('/ngo/stats', hasRole('ngo_admin'), getCampaignStats);
router.get('/ngo/my-campaigns', hasRole('ngo_admin'), getCampaignsByNGO);
router.post('/', hasRole('ngo_admin'), createCampaign);
router.put('/:id', hasRole('ngo_admin'), updateCampaign);
router.delete('/:id', hasRole('ngo_admin'), deleteCampaign);
router.post('/:id/updates', hasRole('ngo_admin'), addCampaignUpdate);
router.get('/:id/donors', hasRole('ngo_admin'), getCampaignDonors);

export default router;
