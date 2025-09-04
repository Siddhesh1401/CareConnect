import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const fixNGOStatus = async () => {
  try {
    await connectDB();

    // Update the NGO back to approved status
    const result = await User.updateOne(
      { _id: '68b85253f7b5a02ceb5049f1' },
      { 
        verificationStatus: 'approved',
        isNGOVerified: true 
      }
    );

    console.log('✅ NGO status updated:', result);

    // Check the NGO again
    const ngo = await User.findById('68b85253f7b5a02ceb5049f1');
    console.log('NGO details:');
    console.log('- Name:', ngo?.organizationName || ngo?.name);
    console.log('- Email:', ngo?.email);
    console.log('- Status:', ngo?.verificationStatus);
    console.log('- Verified:', ngo?.isNGOVerified);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixNGOStatus();
