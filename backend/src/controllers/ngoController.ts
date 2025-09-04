import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Event from '../models/Event';

// Get all NGOs with filtering and search
export const getNGOs = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      location,
      sortBy = 'rating',
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query: any = {
      role: 'ngo_admin'
      // Removed isActive and accountStatus filters to be less restrictive
    };

    console.log('NGO query:', query);

    // Search filter
    if (search) {
      query.$or = [
        { organizationName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter (organizationType)
    if (category && category !== 'all') {
      query.organizationType = { $regex: category, $options: 'i' };
    }

    // Location filter
    if (location && location !== 'all') {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'rating':
        sort.foundedYear = -1;
        break;
      case 'name':
        sort.organizationName = 1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.foundedYear = 1;
        break;
      default:
        sort.createdAt = -1;
    }

    // Get NGOs with simple query first (to test if the issue is with aggregation)
    // const ngos = await User.aggregate([
    //   { $match: query },
    //   ... rest of aggregation
    // ]);

    // Simple query for testing
    let ngos;
    try {
      ngos = await User.find(query)
        .select('_id name email organizationName organizationType description location foundedYear website isNGOVerified verificationStatus profilePicture joinedDate')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));
      console.log('Database query successful');
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: process.env.NODE_ENV === 'development' ? dbError : undefined
      });
    }

    console.log('Simple query NGOs found:', ngos.length);
    if (ngos.length > 0) {
      console.log('First NGO ID:', ngos[0]._id);
    }

    console.log('NGOs found:', ngos.length);
    if (ngos.length > 0) {
      console.log('First NGO ID:', ngos[0]._id);
      console.log('First NGO data:', ngos[0]);
    }

    // Get total count for pagination
    const totalNGOs = await User.countDocuments(query);
    const totalPages = Math.ceil(totalNGOs / Number(limit));

    console.log('Total NGOs in database:', totalNGOs);

    // Transform data to match frontend expectations
    const transformedNGOs = ngos.map(ngo => {
      console.log('Transforming NGO:', ngo._id, ngo.organizationName || ngo.name);
      const ngoId = ngo._id ? ngo._id.toString() : 'undefined';
      console.log('NGO ID after conversion:', ngoId);
      return {
        id: ngoId,
        name: ngo.organizationName || ngo.name,
        description: ngo.description || 'Making a difference in our community through dedicated service and impactful initiatives.',
        image: ngo.profilePicture || 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
        category: ngo.organizationType?.toLowerCase() || 'community',
        location: ngo.location?.city ? `${ngo.location.city}, ${ngo.location.state || ''}`.trim() : 'Location not specified',
        verified: ngo.isNGOVerified || ngo.verificationStatus === 'approved',
        rating: 4.5, // Placeholder since we don't have this from simple query
        totalVolunteers: 0, // Placeholder since we don't have this from simple query
        totalEvents: 0, // Placeholder since we don't have this from simple query
        totalDonations: 0, // Placeholder since we don't have this from simple query
        founded: ngo.foundedYear?.toString() || '2020',
        impact: generateImpactText(ngo.organizationType, 0, 0),
        website: ngo.website,
        joinedDate: ngo.joinedDate
      };
    });

    console.log('Transformed NGOs:', transformedNGOs.length);
    if (transformedNGOs.length > 0) {
      console.log('First transformed NGO ID:', transformedNGOs[0].id);
    }

    res.status(200).json({
      success: true,
      data: {
        ngos: transformedNGOs,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalNGOs,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get NGOs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get single NGO details
export const getNGODetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('getNGODetails called with ID:', id);

    if (!id || id === 'undefined') {
      console.error('Invalid NGO ID received:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid NGO ID'
      });
    }

    // Validate ObjectId format
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    console.log('ID validation:', id, 'is valid ObjectId:', isValidObjectId);
    
    if (!isValidObjectId) {
      console.error('Invalid ObjectId format:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid NGO ID format'
      });
    }

    const ngo = await User.findById(id)
      .select('-password -emailVerificationCode -passwordResetCode');

    console.log('NGO found in database:', ngo ? 'YES' : 'NO');
    if (ngo) {
      console.log('NGO role:', ngo.role);
      console.log('NGO name:', ngo.name);
      console.log('NGO organizationName:', ngo.organizationName);
    }

    if (!ngo || ngo.role !== 'ngo_admin') {
      console.log('NGO not found or not an NGO admin');
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    // Get NGO's events (simplified for now)
    let ngoEvents = [];
    try {
      ngoEvents = await Event.find({ organizerId: id });
    } catch (eventError) {
      console.log('Event query failed, using empty array:', eventError);
      ngoEvents = [];
    }

    // Calculate total volunteers from all events
    const volunteerCount = ngoEvents.reduce((total: number, event: any) => {
      return total + (event.registeredVolunteers?.filter((rv: any) => rv.status === 'confirmed').length || 0);
    }, 0);

    // Get total donations (you might need to implement this based on your donation model)
    const totalDonations = 0; // Placeholder - implement based on your donation tracking

    // Generate impact text
    const impact = generateImpactText(ngo.organizationType || 'community', ngoEvents.length, volunteerCount);

    // Get location string
    const location = ngo.location ? `${ngo.location.city || ''}, ${ngo.location.state || ''}`.trim().replace(/^,|,$/g, '') : 'Location not specified';

    res.status(200).json({
      success: true,
      data: {
        ngo: {
          id: ngo._id,
          name: ngo.organizationName || ngo.name,
          description: ngo.description || 'No description available',
          image: ngo.profilePicture || 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
          category: ngo.organizationType || 'Community Development',
          location: location,
          verified: ngo.isNGOVerified || false,
          rating: 4.5, // Placeholder - you might want to implement a rating system
          totalVolunteers: volunteerCount,
          totalEvents: ngoEvents.length,
          totalDonations: totalDonations,
          founded: ngo.foundedYear?.toString() || '2020',
          impact: impact,
          website: ngo.website,
          joinedDate: ngo.joinedDate,
          organizationType: ngo.organizationType
        }
      }
    });

  } catch (error) {
    console.error('Get NGO details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Helper function to generate impact text based on NGO type and stats
function generateImpactText(category: string, totalEvents: number, totalVolunteers: number): string {
  const impacts = {
    environment: [
      'Planted trees and organized environmental programs',
      'Cleaned beaches and promoted conservation',
      'Organized environmental awareness programs'
    ],
    education: [
      'Educated children and built schools',
      'Provided education and scholarships',
      'Built schools and educational facilities'
    ],
    healthcare: [
      'Treated patients and conducted medical camps',
      'Provided healthcare services',
      'Conducted medical camps and health programs'
    ],
    community: [
      'Served families and established community centers',
      'Supported community development',
      'Established community centers and programs'
    ],
    animals: [
      'Rescued animals and found homes for pets',
      'Organized animal welfare programs',
      'Provided animal rescue and rehabilitation'
    ],
    women: [
      'Empowered women and started businesses',
      'Trained women in various skills',
      'Started businesses and empowerment programs'
    ],
    disaster: [
      'Provided relief and disaster support',
      'Distributed aid in disaster areas',
      'Supported disaster victims and relief efforts'
    ]
  };

  const categoryImpacts = impacts[category as keyof typeof impacts] || impacts.community;
  return categoryImpacts[0];
}
