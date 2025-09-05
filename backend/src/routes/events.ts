import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  getNGOEvents,
  registerForEvent,
  unregisterFromEvent,
  getVolunteerEvents,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getEventStats,
  getEventAnalytics,
  getEventVolunteers,
  getNGOVolunteers
} from '../controllers/eventController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { uploadEventImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuthenticate, getAllEvents); // Get all published events (with filters, includes user registration status if authenticated)
router.get('/:eventId', optionalAuthenticate, getEventById); // Get specific event details (includes user registration status if authenticated)

// Protected routes
router.use(authenticate); // Apply authentication to all routes below

// Volunteer routes
router.post('/:eventId/register', registerForEvent);     // Register for event
router.delete('/:eventId/register', unregisterFromEvent); // Unregister from event
router.get('/volunteer/my-events', getVolunteerEvents);   // Get volunteer's registered events

// NGO routes
router.post('/create', uploadEventImages.array('images', 3), createEvent);  // Create new event with images (NGO only)
router.get('/ngo/my-events', getNGOEvents);        // Get NGO's events
router.get('/ngo/volunteers', getNGOVolunteers);   // Get all volunteers for NGO
router.put('/:eventId', uploadEventImages.array('images', 3), updateEvent); // Update event with images (NGO only)
router.patch('/:eventId/cancel', cancelEvent);     // Cancel event (NGO only)
router.delete('/:eventId', deleteEvent);           // Delete event (NGO only)
router.get('/ngo/stats', getEventStats);           // Get event statistics (NGO only)
router.get('/ngo/analytics', getEventAnalytics);   // Get detailed analytics (NGO only)
router.get('/:eventId/volunteers', getEventVolunteers); // Get registered volunteers for event (NGO only)

export default router;
