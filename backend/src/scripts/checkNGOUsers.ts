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
    
    ngoUsers.forEach(user => {
      console.log(`🏢 ${user.organizationName || user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.verificationStatus}`);
      console.log(`   NGO Verified: ${user.isNGOVerified}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });

    // Update any NGO users that don't have the correct pending status
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

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking NGO users:', error);
    process.exit(1);
  }
};

checkNGOUsers();
