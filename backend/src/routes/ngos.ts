import express from 'express';
import { getNGOs, getNGODetails } from '../controllers/ngoController.js';

const router = express.Router();

// Get all NGOs with filtering and pagination
router.get('/', getNGOs);

// Get single NGO details
router.get('/:id', getNGODetails);

export default router;
