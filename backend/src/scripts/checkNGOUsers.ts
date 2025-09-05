import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkNGOUsers = async () => {
  try {
    await connectDB();

    // Find all NGO users
    const ngoUsers = await User.find({ role: 'ngo_admin' });
    
    console.log('📊 NGO Users found:', ngoUsers.length);
    
    if (ngoUsers.length === 0) {
      console.log('No NGO users found. Creating sample NGOs...');
      
      // Create sample NGOs
      const sampleNGOs = [
        {
          name: 'Admin User',
          email: 'admin@careconnect.com',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMqRd.h6W9qGQD2', // hashed 'admin123'
          role: 'ngo_admin',
          organizationName: 'Green Earth Foundation',
          organizationType: 'Environment',
          description: 'Dedicated to environmental conservation and sustainability.',
          location: {
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India'
          },
          foundedYear: 2015,
          website: 'https://greenearth.org',
          isEmailVerified: true,
          verificationStatus: 'approved',
          isNGOVerified: true,
          emailVerificationAttempts: 0
        },
        {
          name: 'Education First',
          email: 'contact@educationfirst.org',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMqRd.h6W9qGQD2',
          role: 'ngo_admin',
          organizationName: 'Education First',
          organizationType: 'Education',
          description: 'Providing quality education to underprivileged children.',
          location: {
            city: 'Delhi',
            state: 'Delhi',
            country: 'India'
          },
          foundedYear: 2018,
          website: 'https://educationfirst.org',
          isEmailVerified: true,
          verificationStatus: 'approved',
          isNGOVerified: true,
          emailVerificationAttempts: 0
        },
        {
          name: 'Health Care Plus',
          email: 'info@healthcareplus.org',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMqRd.h6W9qGQD2',
          role: 'ngo_admin',
          organizationName: 'Health Care Plus',
          organizationType: 'Healthcare',
          description: 'Improving healthcare access for rural communities.',
          location: {
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India'
          },
          foundedYear: 2020,
          website: 'https://healthcareplus.org',
          isEmailVerified: true,
          verificationStatus: 'approved',
          isNGOVerified: true,
          emailVerificationAttempts: 0
        }
      ];

      await User.insertMany(sampleNGOs);
      console.log('✅ Created 3 sample NGOs');
      
      // Fetch again to show the created NGOs
      const newNgoUsers = await User.find({ role: 'ngo_admin' });
      console.log('📊 NGO Users after creation:', newNgoUsers.length);
      
      newNgoUsers.forEach(user => {
        console.log(`🏢 ${user.organizationName || user.name} (ID: ${user._id})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.verificationStatus}`);
        console.log(`   NGO Verified: ${user.isNGOVerified}`);
        console.log('   ---');
      });
    } else {
      ngoUsers.forEach(user => {
        console.log(`🏢 ${user.organizationName || user.name} (ID: ${user._id})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.verificationStatus}`);
        console.log(`   NGO Verified: ${user.isNGOVerified}`);
        console.log(`   Created: ${user.joinedDate || 'N/A'}`);  
        console.log('   ---');
      });
    }

    // Update any NGO users that don't have the correct pending status
    // Comment this out since we want to keep the NGO approved for testing
    /*
    const ngoUsersToUpdate = await User.find({ 
      role: 'ngo_admin', 
      verificationStatus: { $ne: 'pending' } 
    });

    if (ngoUsersToUpdate.length > 0) {
      console.log(`🔧 Updating ${ngoUsersToUpdate.length} NGO users to pending status...`);
      
      await User.updateMany(
        { role: 'ngo_admin', verificationStatus: { $ne: 'approved' } },
        { 
          verificationStatus: 'pending',
          isNGOVerified: false 
        }
      );
      
      console.log('✅ NGO users updated to pending status');
    }
    */

    // Create sample volunteers if they don't exist
    const volunteerCount = await User.countDocuments({ role: 'volunteer' });
    if (volunteerCount === 0) {
      console.log('Creating sample volunteers...');
      
      const sampleVolunteers = [
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@email.com',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMqRd.h6W9qGQD2',
          role: 'volunteer',
          phone: '+91 98765 43210',
          skills: ['Event Management', 'Community Outreach'],
          interests: ['Environment', 'Education'],
          location: {
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India'
          },
          isEmailVerified: true,
          points: 150,
          level: 2,
          isActive: true
        },
        {
          name: 'Rahul Kumar',
          email: 'rahul.kumar@email.com',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMqRd.h6W9qGQD2',
          role: 'volunteer',
          phone: '+91 87654 32109',
          skills: ['Teaching', 'Digital Literacy'],
          interests: ['Education', 'Technology'],
          location: {
            city: 'Delhi',
            state: 'Delhi',
            country: 'India'
          },
          isEmailVerified: true,
          points: 220,
          level: 3,
          isActive: true
        },
        {
          name: 'Sneha Patel',
          email: 'sneha.patel@email.com',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMqRd.h6W9qGQD2',
          role: 'volunteer',
          phone: '+91 76543 21098',
          skills: ['Healthcare', 'First Aid'],
          interests: ['Healthcare', 'Community Service'],
          location: {
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India'
          },
          isEmailVerified: true,
          points: 80,
          level: 1,
          isActive: false
        },
        {
          name: 'Amit Singh',
          email: 'amit.singh@email.com',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMqRd.h6W9qGQD2',
          role: 'volunteer',
          phone: '+91 65432 10987',
          skills: ['Environmental Conservation', 'Project Management'],
          interests: ['Environment', 'Leadership'],
          location: {
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India'
          },
          isEmailVerified: true,
          points: 300,
          level: 4,
          isActive: true
        }
      ];

      await User.insertMany(sampleVolunteers);
      console.log('✅ Created 4 sample volunteers');
    }

    // Create sample events with volunteer registrations
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log('Creating sample events with volunteer registrations...');
      
      const ngoUsers = await User.find({ role: 'ngo_admin' });
      const volunteers = await User.find({ role: 'volunteer' });
      
      if (ngoUsers.length > 0 && volunteers.length > 0) {
        const sampleEvents = [
          {
            title: 'Beach Cleanup Drive',
            description: 'Join us for a community beach cleanup to protect marine life and keep our beaches clean.',
            category: 'Environment',
            date: new Date('2025-02-15'),
            startTime: '09:00',
            endTime: '13:00',
            location: {
              address: 'Juhu Beach, Mumbai',
              city: 'Mumbai',
              state: 'Maharashtra',
              country: 'India',
              coordinates: {
                latitude: 19.0889,
                longitude: 72.8267
              }
            },
            capacity: 50,
            requirements: ['Comfortable clothing', 'Water bottle', 'Sunscreen'],
            whatToExpect: 'Team briefing, cleanup activities, lunch break, certificate distribution',
            tags: ['environment', 'cleanup', 'marine', 'community'],
            organizerId: ngoUsers[0]._id,
            status: 'published',
            registeredVolunteers: [
              {
                userId: volunteers[0]._id,
                userName: volunteers[0].name,
                userEmail: volunteers[0].email,
                registrationDate: new Date('2025-01-20'),
                status: 'confirmed'
              },
              {
                userId: volunteers[1]._id,
                userName: volunteers[1].name,
                userEmail: volunteers[1].email,
                registrationDate: new Date('2025-01-18'),
                status: 'confirmed'
              }
            ]
          },
          {
            title: 'Digital Literacy Workshop',
            description: 'Learn essential computer skills and internet safety in this hands-on workshop.',
            category: 'Education',
            date: new Date('2025-02-20'),
            startTime: '10:00',
            endTime: '16:00',
            location: {
              address: 'Community Center, Delhi',
              city: 'Delhi',
              state: 'Delhi',
              country: 'India',
              coordinates: {
                latitude: 28.6139,
                longitude: 77.2090
              }
            },
            capacity: 30,
            requirements: ['Notebook', 'Pen', 'Basic computer knowledge'],
            whatToExpect: 'Introduction to computers, internet basics, online safety, practical exercises',
            tags: ['education', 'technology', 'digital literacy', 'workshop'],
            organizerId: ngoUsers[1]._id,
            status: 'published',
            registeredVolunteers: [
              {
                userId: volunteers[1]._id,
                userName: volunteers[1].name,
                userEmail: volunteers[1].email,
                registrationDate: new Date('2025-01-15'),
                status: 'confirmed'
              },
              {
                userId: volunteers[3]._id,
                userName: volunteers[3].name,
                userEmail: volunteers[3].email,
                registrationDate: new Date('2025-01-22'),
                status: 'confirmed'
              }
            ]
          },
          {
            title: 'Health Camp for Rural Community',
            description: 'Provide basic healthcare services and health education to rural communities.',
            category: 'Healthcare',
            date: new Date('2025-03-10'),
            startTime: '08:00',
            endTime: '17:00',
            location: {
              address: 'Rural Health Center, Bangalore',
              city: 'Bangalore',
              state: 'Karnataka',
              country: 'India',
              coordinates: {
                latitude: 12.9716,
                longitude: 77.5946
              }
            },
            capacity: 20,
            requirements: ['Medical background preferred', 'First aid kit', 'Health education materials'],
            whatToExpect: 'Health screenings, consultations, health education sessions, follow-up planning',
            tags: ['healthcare', 'rural', 'medical', 'community'],
            organizerId: ngoUsers[2]._id,
            status: 'published',
            registeredVolunteers: [
              {
                userId: volunteers[2]._id,
                userName: volunteers[2].name,
                userEmail: volunteers[2].email,
                registrationDate: new Date('2025-01-25'),
                status: 'confirmed'
              }
            ]
          }
        ];

        await Event.insertMany(sampleEvents);
        console.log('✅ Created 3 sample events with volunteer registrations');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking NGO users:', error);
    process.exit(1);
  }
};

checkNGOUsers();
