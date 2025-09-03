import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@careconnect.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
      accountStatus: 'active'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@careconnect.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
