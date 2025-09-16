import { Request, Response } from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    name?: string;
  };
}

// Get volunteer dashboard data
export const getVolunteerDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'volunteer') {
      res.status(403).json({
        success: false,
        message: 'Only volunteers can access this endpoint'
      });
      return;
    }

    const userId = req.user.id;

    // Get user's registered events
    const userEvents = await Event.find({
      'registeredVolunteers.userId': userId
    }).sort({ date: -1 }).limit(10);

    // Calculate statistics
    const totalEvents = userEvents.length;
    const completedEvents = userEvents.filter(event =>
      event.status === 'completed' && event.date < new Date()
    ).length;

    const upcomingEvents = userEvents.filter(event =>
      event.status === 'published' && event.date >= new Date()
    ).length;

    // Calculate total hours (assuming 4 hours per event)
    const totalHours = totalEvents * 4;

    // Get recent events with registration status
    const recentEvents = userEvents.slice(0, 5).map(event => {
      const registration = event.registeredVolunteers.find(
        v => v.userId.toString() === userId
      );

      // Build complete location string
      const locationParts = [];
      if (event.location.address) locationParts.push(event.location.address);
      if (event.location.area) locationParts.push(event.location.area);
      if (event.location.city) locationParts.push(event.location.city);
      if (event.location.state) locationParts.push(event.location.state);
      if (event.location.pinCode) locationParts.push(event.location.pinCode);

      return {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.startTime,
        location: locationParts.join(', '),
        ngo: event.organizationName,
        status: event.status === 'completed' ? 'completed' : 'upcoming',
        registrationDate: registration?.registrationDate
      };
    });

    // Get upcoming events (next 3)
    const upcomingEventsList = userEvents
      .filter(event => event.status === 'published' && event.date >= new Date())
      .slice(0, 3)
      .map(event => {
        // Build complete location string
        const locationParts = [];
        if (event.location.address) locationParts.push(event.location.address);
        if (event.location.area) locationParts.push(event.location.area);
        if (event.location.city) locationParts.push(event.location.city);
        if (event.location.state) locationParts.push(event.location.state);
        if (event.location.pinCode) locationParts.push(event.location.pinCode);

        return {
          _id: event._id,
          title: event.title,
          ngo: event.organizationName,
          date: event.date,
          location: locationParts.join(', ')
        };
      });

    // Calculate achievements based on participation
    const achievements = [];
    if (totalEvents >= 1) {
      achievements.push({
        id: 'first-steps',
        title: 'First Steps',
        description: 'Completed your first volunteer activity',
        icon: '🏆',
        earnedDate: recentEvents[0]?.registrationDate || new Date(),
        points: 100
      });
    }
    if (totalEvents >= 5) {
      achievements.push({
        id: 'community-builder',
        title: 'Community Builder',
        description: 'Participated in 5 volunteer events',
        icon: '🌟',
        earnedDate: new Date(),
        points: 500
      });
    }
    if (totalEvents >= 10) {
      achievements.push({
        id: 'impact-champion',
        title: 'Impact Champion',
        description: 'Completed 10 volunteer activities',
        icon: '🌱',
        earnedDate: new Date(),
        points: 1000
      });
    }

    // Calculate total points (100 points per event)
    const totalPoints = totalEvents * 100;

    res.status(200).json({
      success: true,
      message: 'Volunteer dashboard data retrieved successfully',
      data: {
        stats: {
          totalHours,
          eventsJoined: totalEvents,
          completedEvents,
          upcomingEvents,
          totalPoints
        },
        recentEvents,
        upcomingEvents: upcomingEventsList,
        achievements
      }
    });

  } catch (error) {
    console.error('Get volunteer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get NGO dashboard data
export const getNGODashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'ngo_admin') {
      res.status(403).json({
        success: false,
        message: 'Only NGO administrators can access this endpoint'
      });
      return;
    }

    const ngoId = req.user.id;

    // Get NGO's events
    const ngoEvents = await Event.find({ organizerId: ngoId }).sort({ date: -1 });

    // Calculate statistics
    const totalEvents = ngoEvents.length;
    const publishedEvents = ngoEvents.filter(event => event.status === 'published').length;
    const completedEvents = ngoEvents.filter(event => event.status === 'completed').length;

    // Calculate total volunteers
    const totalVolunteers = ngoEvents.reduce((total, event) => {
      return total + event.registeredVolunteers.filter(v => v.status === 'confirmed').length;
    }, 0);

    // Calculate upcoming events
    const upcomingEvents = ngoEvents.filter(event =>
      event.status === 'published' && event.date >= new Date()
    ).length;

    // Get recent events (last 5)
    const recentEvents = ngoEvents.slice(0, 5).map(event => {
      // Build complete location string
      const locationParts = [];
      if (event.location.address) locationParts.push(event.location.address);
      if (event.location.area) locationParts.push(event.location.area);
      if (event.location.city) locationParts.push(event.location.city);
      if (event.location.state) locationParts.push(event.location.state);
      if (event.location.pinCode) locationParts.push(event.location.pinCode);

      return {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.startTime,
        location: locationParts.join(', '),
        volunteers: event.registeredVolunteers.filter(v => v.status === 'confirmed').length,
        capacity: event.capacity,
        status: event.status
      };
    });

    // Get recent volunteers (last 5 who registered for NGO's events)
    const recentVolunteers = [];
    for (const event of ngoEvents.slice(0, 3)) {
      for (const volunteer of event.registeredVolunteers.slice(0, 2)) {
        const volunteerDetails = await User.findById(volunteer.userId)
          .select('name profilePicture')
          .lean();

        if (volunteerDetails) {
          recentVolunteers.push({
            _id: volunteer.userId,
            name: volunteerDetails.name,
            avatar: volunteerDetails.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(volunteerDetails.name)}&background=random`,
            joinedDate: volunteer.registrationDate,
            eventsJoined: 1 // This would need more complex calculation
          });
        }

        if (recentVolunteers.length >= 5) break;
      }
      if (recentVolunteers.length >= 5) break;
    }

    // Calculate impact score (simplified calculation)
    const impactScore = Math.min(5.0, (totalVolunteers * 0.01) + (completedEvents * 0.1) + 3.5);

    // Mock donation data (would need a donations model)
    const totalDonations = Math.floor(totalVolunteers * 150); // Mock calculation

    res.status(200).json({
      success: true,
      message: 'NGO dashboard data retrieved successfully',
      data: {
        stats: {
          totalVolunteers,
          activeEvents: publishedEvents,
          totalEvents,
          upcomingEvents,
          totalDonations: `₹${(totalDonations / 100000).toFixed(1)}L`,
          impactScore: impactScore.toFixed(1)
        },
        recentEvents,
        recentVolunteers,
        campaigns: [] // Would need campaigns model
      }
    });

  } catch (error) {
    console.error('Get NGO dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
