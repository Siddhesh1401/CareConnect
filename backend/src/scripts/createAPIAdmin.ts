import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAPIAdminUser = async () => {
  try {
    await connectDB();

    // Check if API admin already exists
    const existingAPIAdmin = await User.findOne({ role: 'api_admin' });
    if (existingAPIAdmin) {
      console.log('API Admin user already exists');
      console.log('📧 Email:', existingAPIAdmin.email);
      process.exit(0);
    }

    // Create API admin user
    const hashedPassword = await bcrypt.hash('apiadmin123', 12);

    const apiAdminUser = new User({
      name: 'Government API Admin',
      email: 'api-admin@careconnect.com',
      password: hashedPassword,
      role: 'api_admin',
      isVerified: true,
      isActive: true,
      accountStatus: 'active'
    });

    await apiAdminUser.save();
    console.log('✅ API Admin user created successfully');
    console.log('📧 Email: api-admin@careconnect.com');
    console.log('🔑 Password: apiadmin123');
    console.log('⚠️  Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating API admin user:', error);
    process.exit(1);
  }
};

createAPIAdminUser();