import { connectDB } from '../config/database.js';
import User from '../models/User.js';
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
        console.log(`   Created: ${user.createdAt}`);
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

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking NGO users:', error);
    process.exit(1);
  }
};

checkNGOUsers();
