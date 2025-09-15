import { Request, Response } from 'express';
import Event, { IEvent } from '../models/Event.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { getEventImageUrl } from '../middleware/upload.js';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    organizationName?: string;
    name?: string;
  };
  files?: any;
}

// Create new event (NGO only)
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Create event request body:', req.body);
    console.log('Create event files:', req.files);
    
    let {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      location,
      capacity,
      requirements,
      whatToExpect,
      tags
    } = req.body;

    // Parse JSON fields if they are strings (from FormData)
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        console.error('Error parsing location:', e);
        res.status(400).json({
          success: false,
          message: 'Invalid location format'
        });
        return;
      }
    }

    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
        tags = []; // Default to empty array if parsing fails
      }
    }

    // Validate required fields
    if (!title || !description || !category || !date || !startTime || !endTime || !location || !capacity) {
      res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
        missing: {
          title: !title,
          description: !description,
          category: !category,
          date: !date,
          startTime: !startTime,
          endTime: !endTime,
          location: !location,
          capacity: !capacity
        }
      });
      return;
    }

    // Validate location object
    if (!location.address || !location.city || !location.state) {
      res.status(400).json({
        success: false,
        message: 'Location must include address, city, and state'
      });
      return;
    }

    // Check if user is NGO admin
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can create events'
      });
      return;
    }

    // Get NGO details
    const ngo = await User.findById(req.user.id);
    if (!ngo || ngo.verificationStatus !== 'approved') {
      res.status(403).json({
        success: false,
        message: 'Only verified NGOs can create events'
      });
      return;
    }

    // Validate event date (should be in future)
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
      return;
    }

    // Handle uploaded images
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // When using .array('images'), req.files is an array of files
      console.log('Processing uploaded files:', req.files.length);
      imageUrls = req.files.map((file: any) => getEventImageUrl(file.filename));
    } else {
      console.log('No files uploaded');
    }

    // Create new event
    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      category,
      organizerId: req.user.id,
      organizerName: ngo.name,
      organizationName: ngo.organizationName || ngo.name,
      date: eventDate,
      startTime,
      endTime,
      location,
      capacity: parseInt(capacity),
      requirements: requirements?.trim(),
      whatToExpect: whatToExpect?.trim(),
      tags: Array.isArray(tags) ? tags : [],
      images: imageUrls,
      status: 'published' // Auto-publish for verified NGOs
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event: savedEvent
      }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get all published events (public)
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      city, 
      search, 
      startDate,
      endDate 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).user?.id; // Get user ID if authenticated

    // Build filter query
    const filterQuery: any = {
      status: 'published',
      date: { $gte: new Date() } // Only future events
    };

    if (category && category !== 'all') {
      filterQuery.category = category;
    }

    if (city && city !== 'all') {
      filterQuery['location.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate) {
      filterQuery.date.$gte = new Date(startDate as string);
    }

    if (endDate) {
      filterQuery.date.$lte = new Date(endDate as string);
    }

    const events = await Event.find(filterQuery)
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Event.countDocuments(filterQuery);

    // Add virtual fields manually for lean queries
    const eventsWithVirtuals = events.map(event => {
      const confirmedVolunteers = event.registeredVolunteers.filter(v => v.status === 'confirmed').length;
      const availableSpots = event.capacity - confirmedVolunteers;
      
      // Check if current user is registered for this event
      const isUserRegistered = userId ? 
        event.registeredVolunteers.some(v => v.userId && v.userId.toString() === userId && v.status === 'confirmed') : 
        false;

      return {
        ...event,
        _id: event._id.toString(),
        availableSpots,
        image: event.images && event.images.length > 0 ? event.images[0] : '',
        isUserRegistered,
        registrationStatus: (() => {
          if (confirmedVolunteers >= event.capacity) return 'full';
          if (confirmedVolunteers >= event.capacity * 0.8) return 'filling_fast';
          return 'open';
        })()
      };
    });

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: {
        events: eventsWithVirtuals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user?.id; // Get user ID if authenticated

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    const event = await Event.findById(eventId).lean();

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    const confirmedVolunteers = event.registeredVolunteers.filter(v => v.status === 'confirmed').length;
    
    // Check if current user is registered for this event
    const isUserRegistered = userId ? 
      event.registeredVolunteers.some(v => v.userId && v.userId.toString() === userId && v.status === 'confirmed') : 
      false;

    // Add virtual fields
    const eventWithVirtuals = {
      ...event,
      availableSpots: event.capacity - confirmedVolunteers,
      isUserRegistered,
      registrationStatus: (() => {
        if (confirmedVolunteers >= event.capacity) return 'full';
        if (confirmedVolunteers >= event.capacity * 0.8) return 'filling_fast';
        return 'open';
      })()
    };

    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: {
        event: eventWithVirtuals
      }
    });

  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get NGO's events
export const getNGOEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can access this endpoint'
      });
      return;
    }

    const filterQuery: any = {
      organizerId: req.user.id
    };

    if (status && status !== 'all') {
      filterQuery.status = status;
    }

    const events = await Event.find(filterQuery)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Event.countDocuments(filterQuery);

    // Add virtual fields
    const eventsWithVirtuals = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      availableSpots: event.capacity - event.registeredVolunteers.filter(v => v.status === 'confirmed').length,
      image: event.images && event.images.length > 0 ? event.images[0] : '',
      registrationStatus: (() => {
        const confirmedVolunteers = event.registeredVolunteers.filter(v => v.status === 'confirmed').length;
        if (confirmedVolunteers >= event.capacity) return 'full';
        if (confirmedVolunteers >= event.capacity * 0.8) return 'filling_fast';
        return 'open';
      })()
    }));

    res.status(200).json({
      success: true,
      message: 'NGO events retrieved successfully',
      data: {
        events: eventsWithVirtuals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get NGO events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Register volunteer for event
export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    if (req.user?.role !== 'volunteer') {
      res.status(403).json({
        success: false,
        message: 'Only volunteers can register for events'
      });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if event is published and in future
    if (event.status !== 'published') {
      res.status(400).json({
        success: false,
        message: 'Event is not available for registration'
      });
      return;
    }

    if (event.date <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
      return;
    }

    // Check if user already registered
    const isAlreadyRegistered = event.registeredVolunteers.some(
      volunteer => volunteer.userId.toString() === req.user!.id
    );

    if (isAlreadyRegistered) {
      res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
      return;
    }

    // Get volunteer details
    const volunteer = await User.findById(req.user.id);
    if (!volunteer) {
      res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
      return;
    }

    // Check capacity
    const confirmedVolunteers = event.registeredVolunteers.filter(v => v.status === 'confirmed').length;
    const status = confirmedVolunteers >= event.capacity ? 'waitlist' : 'confirmed';

    // Add volunteer to event
    event.registeredVolunteers.push({
      userId: new mongoose.Types.ObjectId(req.user.id),
      userName: volunteer.name,
      userEmail: volunteer.email,
      registrationDate: new Date(),
      status
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: status === 'confirmed' 
        ? 'Successfully registered for the event' 
        : 'Added to waitlist - you will be notified if a spot opens up',
      data: {
        registrationStatus: status,
        eventTitle: event.title,
        eventDate: event.date
      }
    });

  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Unregister volunteer from event
export const unregisterFromEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Find volunteer registration
    const volunteerIndex = event.registeredVolunteers.findIndex(
      volunteer => volunteer.userId.toString() === req.user!.id
    );

    if (volunteerIndex === -1) {
      res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
      return;
    }

    // Remove volunteer from event
    event.registeredVolunteers.splice(volunteerIndex, 1);

    // If there are waitlisted volunteers, move one to confirmed
    const waitlistVolunteer = event.registeredVolunteers.find(v => v.status === 'waitlist');
    if (waitlistVolunteer) {
      waitlistVolunteer.status = 'confirmed';
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from the event'
    });

  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get volunteer's registered events
export const getVolunteerEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'volunteer') {
      res.status(403).json({
        success: false,
        message: 'Only volunteers can access this endpoint'
      });
      return;
    }

    const events = await Event.find({
      'registeredVolunteers.userId': req.user.id
    }).sort({ date: 1 }).lean();

    // Add registration status for each event
    const eventsWithStatus = events.map(event => {
      const registration = event.registeredVolunteers.find(
        v => v.userId.toString() === req.user!.id
      );
      return {
        ...event,
        myRegistrationStatus: registration?.status,
        myRegistrationDate: registration?.registrationDate
      };
    });

    res.status(200).json({
      success: true,
      message: 'Volunteer events retrieved successfully',
      data: {
        events: eventsWithStatus
      }
    });

  } catch (error) {
    console.error('Get volunteer events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update event (NGO only)
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { existingImages, ...updates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can update events'
      });
      return;
    }

    const event = await Event.findOne({
      _id: eventId,
      organizerId: req.user.id
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to update it'
      });
      return;
    }

    // Don't allow updating past events (but be more lenient with validation)
    const eventDate = new Date(event.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    if (eventDay < today) {
      res.status(400).json({
        success: false,
        message: 'Cannot update past events'
      });
      return;
    }

    // Handle image updates
    let imageUrls: string[] = [];
    
    // Parse existing images that weren't removed
    if (existingImages) {
      try {
        imageUrls = JSON.parse(existingImages);
      } catch (e) {
        console.error('Error parsing existing images:', e);
      }
    }

    // Add new uploaded images
    if (req.files && Array.isArray(req.files)) {
      // When using .array('images'), req.files is an array of files
      const newImageUrls = req.files.map((file: any) => getEventImageUrl(file.filename));
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Parse location and tags if they are strings
    if (updates.location && typeof updates.location === 'string') {
      try {
        updates.location = JSON.parse(updates.location);
      } catch (e) {
        console.error('Error parsing location:', e);
        res.status(400).json({
          success: false,
          message: 'Invalid location format'
        });
        return;
      }
    }

    if (updates.tags && typeof updates.tags === 'string') {
      try {
        updates.tags = JSON.parse(updates.tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
        // Don't fail the update for tags parsing error, just set to empty array
        updates.tags = [];
      }
    }

    // Validate location if provided
    if (updates.location) {
      if (!updates.location.address || !updates.location.city || !updates.location.state) {
        console.log('Invalid location data:', updates.location);
        res.status(400).json({
          success: false,
          message: 'Location must include address, city, and state'
        });
        return;
      }
    }

    // Validate capacity if provided
    if (updates.capacity) {
      const capacity = parseInt(updates.capacity);
      if (isNaN(capacity) || capacity <= 0) {
        console.log('Invalid capacity:', updates.capacity);
        res.status(400).json({
          success: false,
          message: 'Capacity must be a positive number'
        });
        return;
      }
    }

    // Update event fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'organizerId' && key !== 'createdAt' && key !== 'existingImages') {
        if (key === 'capacity') {
          (event as any)[key] = parseInt(updates[key]);
        } else {
          (event as any)[key] = updates[key];
        }
      }
    });

    // Update images
    event.images = imageUrls;
    event.updatedAt = new Date();
    
    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent
      }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Delete event (NGO only)
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    console.log('Delete event request:', { eventId, userId: req.user?.id });

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      console.log('Invalid event ID:', eventId);
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    if (req.user?.role !== 'ngo_admin') {
      console.log('Unauthorized delete attempt by:', req.user?.role);
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can delete events'
      });
      return;
    }

    const event = await Event.findOne({
      _id: eventId,
      organizerId: req.user.id
    });

    console.log('Found event:', event ? 'Yes' : 'No');

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to delete it'
      });
      return;
    }

    // Don't allow deleting events with registered volunteers
    if (event.registeredVolunteers.length > 0) {
      console.log('Cannot delete event with volunteers:', event.registeredVolunteers.length);
      res.status(400).json({
        success: false,
        message: `Cannot delete event with ${event.registeredVolunteers.length} registered volunteer(s). Please cancel the event instead or contact volunteers to unregister first.`,
        data: {
          registeredVolunteers: event.registeredVolunteers.length,
          canCancel: true
        }
      });
      return;
    }

    await Event.findByIdAndDelete(eventId);
    console.log('Event deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Cancel event (NGO only)
export const cancelEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    console.log('Cancel event request:', { eventId, userId: req.user?.id });

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can cancel events'
      });
      return;
    }

    const event = await Event.findOne({
      _id: eventId,
      organizerId: req.user.id
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to cancel it'
      });
      return;
    }

    // Don't allow canceling already completed or cancelled events
    if (event.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Event is already cancelled'
      });
      return;
    }

    if (event.status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel completed events'
      });
      return;
    }

    // Update event status to cancelled
    event.status = 'cancelled';
    event.updatedAt = new Date();
    await event.save();

    console.log('Event cancelled successfully');

    res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      data: {
        event: event,
        registeredVolunteers: event.registeredVolunteers.length
      }
    });

  } catch (error) {
    console.error('Cancel event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get event statistics (for NGO dashboard)
export const getEventStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can access event statistics'
      });
      return;
    }

    const [stats] = await Event.aggregate([
      {
        $match: { organizerId: new mongoose.Types.ObjectId(req.user.id) }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          publishedEvents: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          totalVolunteers: {
            $sum: { $size: '$registeredVolunteers' }
          },
          upcomingEvents: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$status', 'published'] },
                    { $gte: ['$date', new Date()] }
                  ]
                }, 
                1, 
                0
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Event statistics retrieved successfully',
      data: {
        stats: stats || {
          totalEvents: 0,
          publishedEvents: 0,
          totalVolunteers: 0,
          upcomingEvents: 0
        }
      }
    });

  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get detailed analytics for NGO events
export const getEventAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can access event analytics'
      });
      return;
    }

    const { range = '6months' } = req.query;
    let dateFilter = {};

    // Set date range filter
    const now = new Date();
    switch (range) {
      case '1month':
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) };
        break;
      case '3months':
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()) };
        break;
      case '6months':
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()) };
        break;
      case '1year':
        dateFilter = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) };
        break;
      default:
        dateFilter = {}; // All time
    }

    const matchStage = {
      organizerId: new mongoose.Types.ObjectId(req.user.id),
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    };

    // Get basic statistics
    const [basicStats] = await Event.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalVolunteers: { $sum: { $size: '$registeredVolunteers' } },
          averageRegistration: { $avg: { $size: '$registeredVolunteers' } },
          completedEvents: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Category distribution
    const categoryStats = await Event.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalEvents = categoryStats.reduce((sum, cat) => sum + cat.count, 0);
    const categoryDistribution = categoryStats.map(cat => ({
      category: cat._id,
      count: cat.count,
      percentage: totalEvents > 0 ? Math.round((cat.count / totalEvents) * 100) : 0
    }));

    // Monthly trends
    const monthlyStats = await Event.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          events: { $sum: 1 },
          volunteers: { $sum: { $size: '$registeredVolunteers' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyEvents = monthlyStats.map(stat => ({
      month: `${monthNames[stat._id.month - 1]} ${stat._id.year}`,
      events: stat.events,
      volunteers: stat.volunteers
    }));

    // Top performing events
    const topEvents = await Event.aggregate([
      { $match: matchStage },
      {
        $project: {
          title: 1,
          status: 1,
          volunteers: { $size: '$registeredVolunteers' }
        }
      },
      { $sort: { volunteers: -1 } },
      { $limit: 10 }
    ]);

    // Location statistics
    const locationStats = await Event.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$location.city',
          events: { $sum: 1 },
          volunteers: { $sum: { $size: '$registeredVolunteers' } }
        }
      },
      { $sort: { events: -1 } },
      { $limit: 10 }
    ]);

    const locationData = locationStats.map(loc => ({
      city: loc._id,
      events: loc.events,
      volunteers: loc.volunteers
    }));

    const analytics = {
      totalEvents: basicStats?.totalEvents || 0,
      totalVolunteers: basicStats?.totalVolunteers || 0,
      averageRegistration: basicStats?.averageRegistration || 0,
      completionRate: basicStats?.totalEvents > 0 
        ? (basicStats.completedEvents / basicStats.totalEvents) * 100 
        : 0,
      categoryDistribution,
      monthlyEvents,
      topEvents,
      locationStats: locationData,
      registrationTrends: [] // Could be implemented based on detailed requirements
    };

    res.status(200).json({
      success: true,
      message: 'Event analytics retrieved successfully',
      data: {
        analytics
      }
    });

  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get registered volunteers for a specific event (NGO only)
export const getEventVolunteers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can access this endpoint'
      });
      return;
    }

    const event = await Event.findOne({
      _id: eventId,
      organizerId: req.user.id
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to access it'
      });
      return;
    }

    // Get detailed volunteer information
    const volunteerIds = event.registeredVolunteers.map(v => v.userId);
    const volunteers = await User.find({
      _id: { $in: volunteerIds }
    }).select('name email phone profilePicture verificationStatus createdAt');

    // Combine volunteer details with registration info
    const volunteersWithRegistration = event.registeredVolunteers.map(registration => {
      const volunteer = volunteers.find(v => (v._id as mongoose.Types.ObjectId).toString() === registration.userId.toString());
      return {
        ...registration,
        volunteer: volunteer ? {
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          profilePicture: volunteer.profilePicture,
          verificationStatus: volunteer.verificationStatus,
          joinedDate: volunteer.joinedDate || new Date()
        } : null
      };
    });

    res.status(200).json({
      success: true,
      message: 'Event volunteers retrieved successfully',
      data: {
        event: {
          _id: event._id,
          title: event.title,
          date: event.date,
          capacity: event.capacity,
          registeredCount: event.registeredVolunteers.filter(v => v.status === 'confirmed').length
        },
        volunteers: volunteersWithRegistration
      }
    });

  } catch (error) {
    console.error('Get event volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get all volunteers for NGO (across all events)
export const getNGOVolunteers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can access this endpoint'
      });
      return;
    }

    // Get all events organized by this NGO
    const events = await Event.find({
      organizerId: req.user.id
    }).select('registeredVolunteers title date');

    if (!events || events.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No events found for this NGO',
        data: {
          volunteers: [],
          stats: {
            totalVolunteers: 0,
            activeVolunteers: 0,
            totalHours: 0,
            avgHoursPerVolunteer: 0
          }
        }
      });
      return;
    }

    // Collect all unique volunteer IDs and their registration data
    const volunteerMap = new Map();

    events.forEach(event => {
      event.registeredVolunteers.forEach(registration => {
        const volunteerId = registration.userId.toString();
        
        if (!volunteerMap.has(volunteerId)) {
          volunteerMap.set(volunteerId, {
            userId: registration.userId,
            registrations: [],
            totalEvents: 0,
            confirmedEvents: 0,
            totalHours: 0 // We'll calculate this based on event duration
          });
        }

        const volunteerData = volunteerMap.get(volunteerId);
        volunteerData.registrations.push({
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.date,
          registrationDate: registration.registrationDate,
          status: registration.status
        });
        
        volunteerData.totalEvents += 1;
        if (registration.status === 'confirmed') {
          volunteerData.confirmedEvents += 1;
          // Estimate hours based on typical event duration (this could be improved)
          volunteerData.totalHours += 4; // Default 4 hours per event
        }
      });
    });

    // Get detailed volunteer information
    const volunteerIds = Array.from(volunteerMap.keys());
    const volunteers = await User.find({
      _id: { $in: volunteerIds },
      role: 'volunteer'
    }).select('name email phone profilePicture skills interests points level createdAt lastActive isActive');

    // Combine data
    const volunteersWithDetails = volunteers.map(volunteer => {
      const volunteerData = volunteerMap.get((volunteer._id as mongoose.Types.ObjectId).toString());
      
      return {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        avatar: volunteer.profilePicture || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        joinedDate: volunteer.joinedDate || new Date(),
        lastActivity: volunteer.lastActive || volunteer.joinedDate || new Date(),
        totalHours: volunteerData.totalHours,
        eventsJoined: volunteerData.confirmedEvents,
        status: volunteer.isActive ? 'active' : 'inactive',
        skills: volunteer.skills || [],
        interests: volunteer.interests || [],
        points: volunteer.points || 0,
        level: volunteer.level || 1,
        registrations: volunteerData.registrations
      };
    });

    // Calculate stats
    const activeVolunteers = volunteersWithDetails.filter(v => v.status === 'active');
    const totalHours = volunteersWithDetails.reduce((sum, v) => sum + v.totalHours, 0);
    const avgHoursPerVolunteer = volunteersWithDetails.length > 0 ? Math.round(totalHours / volunteersWithDetails.length) : 0;

    res.status(200).json({
      success: true,
      message: 'NGO volunteers retrieved successfully',
      data: {
        volunteers: volunteersWithDetails,
        stats: {
          totalVolunteers: volunteersWithDetails.length,
          activeVolunteers: activeVolunteers.length,
          totalHours: totalHours,
          avgHoursPerVolunteer: avgHoursPerVolunteer
        }
      }
    });

  } catch (error) {
    console.error('Get NGO volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
