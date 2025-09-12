import mongoose from 'mongoose';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { connectDB } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleEvents = [
  {
    title: 'Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup to protect our marine environment. We will provide all necessary equipment including gloves, trash bags, and cleanup tools.',
    category: 'Environment',
    date: new Date('2025-09-20'),
    startTime: '08:00',
    endTime: '12:00',
    location: {
      address: 'Juhu Beach, Near ISKCON Temple',
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    capacity: 50,
    requirements: 'Comfortable walking shoes, hat, and water bottle',
    whatToExpect: 'Beach cleanup activity, environmental awareness session, and refreshments',
    tags: ['environment', 'cleanup', 'beach', 'marine-life'],
    status: 'published'
  },
  {
    title: 'Free Health Checkup Camp',
    description: 'Comprehensive health screening including blood pressure, diabetes, and general health checkup for underprivileged communities.',
    category: 'Healthcare',
    date: new Date('2025-09-22'),
    startTime: '09:00',
    endTime: '17:00',
    location: {
      address: 'Community Center, Dharavi',
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    capacity: 30,
    requirements: 'Basic medical knowledge preferred but not mandatory',
    whatToExpect: 'Assist doctors, patient registration, basic health screening',
    tags: ['healthcare', 'medical', 'community-service'],
    status: 'published'
  },
  {
    title: 'Digital Literacy Workshop',
    description: 'Teach basic computer skills and digital literacy to senior citizens in the community center.',
    category: 'Education',
    date: new Date('2025-09-25'),
    startTime: '14:00',
    endTime: '18:00',
    location: {
      address: 'Senior Citizen Center, Bandra',
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    capacity: 20,
    requirements: 'Basic computer knowledge and patience to teach seniors',
    whatToExpect: 'Teaching basic computer operations, internet usage, and digital safety',
    tags: ['education', 'digital-literacy', 'seniors', 'technology'],
    status: 'published'
  },
  {
    title: 'Tree Plantation Drive',
    description: 'Plant native trees in the city park to increase green cover and combat air pollution.',
    category: 'Environment',
    date: new Date('2025-09-28'),
    startTime: '07:00',
    endTime: '11:00',
    location: {
      address: 'Sanjay Gandhi National Park',
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    capacity: 100,
    requirements: 'Comfortable clothes, closed shoes, and enthusiasm for environment',
    whatToExpect: 'Tree planting, learning about native species, environmental awareness',
    tags: ['environment', 'trees', 'plantation', 'air-quality'],
    status: 'published'
  },
  {
    title: 'Food Distribution Drive',
    description: 'Help distribute nutritious meals to homeless individuals and families in need.',
    category: 'Community Development',
    date: new Date('2025-09-30'),
    startTime: '18:00',
    endTime: '21:00',
    location: {
      address: 'Churchgate Station Area',
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    capacity: 25,
    requirements: 'Willingness to interact with people from diverse backgrounds',
    whatToExpect: 'Food packaging, distribution, and interaction with beneficiaries',
    tags: ['food', 'hunger', 'community', 'homeless'],
    status: 'published'
  }
];

async function addSampleEvents() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find a verified NGO to be the organizer
    const ngo = await User.findOne({ 
      role: 'ngo_admin', 
      verificationStatus: 'approved' 
    });

    if (!ngo) {
      console.log('No verified NGO found. Creating a sample NGO first...');
      
      // Create a sample NGO
      const sampleNGO = new User({
        name: 'Green Mumbai Foundation',
        email: 'contact@greenmumbai.org',
        password: '$2a$10$rQmZ1234567890abcdefghijk', // This is a hashed password for 'password123'
        role: 'ngo_admin',
        organizationName: 'Green Mumbai Foundation',
        organizationType: 'Environment',
        isVerified: true,
        isNGOVerified: true,
        verificationStatus: 'approved',
        phone: '+91-9876543210',
        website: 'https://greenmumbai.org',
        description: 'Dedicated to environmental conservation and sustainable development in Mumbai',
        location: {
          address: 'Green Building, Eco Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        }
      });

      await sampleNGO.save();
      console.log('Sample NGO created');
      
      // Use the new NGO
      const organizerId = sampleNGO._id;
      const organizerName = sampleNGO.name;
      const organizationName = sampleNGO.organizationName || sampleNGO.name;

      // Add organizer info to each event
      const eventsWithOrganizer = sampleEvents.map(event => ({
        ...event,
        organizerId,
        organizerName,
        organizationName,
        registeredVolunteers: []
      }));

      // Insert events
      await Event.insertMany(eventsWithOrganizer);
      console.log(`✅ Added ${sampleEvents.length} sample events successfully!`);
    } else {
      // Use existing NGO
      const organizerId = ngo._id;
      const organizerName = ngo.name;
      const organizationName = ngo.organizationName || ngo.name;

      // Add organizer info to each event
      const eventsWithOrganizer = sampleEvents.map(event => ({
        ...event,
        organizerId,
        organizerName,
        organizationName,
        registeredVolunteers: []
      }));

      // Check if events already exist
      const existingEvents = await Event.countDocuments();
      if (existingEvents > 0) {
        console.log(`Database already has ${existingEvents} events. Skipping sample data creation.`);
      } else {
        await Event.insertMany(eventsWithOrganizer);
        console.log(`✅ Added ${sampleEvents.length} sample events successfully!`);
      }
    }

    // Display current events count
    const totalEvents = await Event.countDocuments();
    console.log(`📊 Total events in database: ${totalEvents}`);

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample events:', error);
    process.exit(1);
  }
}

addSampleEvents();
