import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Load environment variables
dotenv.config();

const createAdminToken = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bouncehousekids');
    console.log('Connected to MongoDB');

    // Find or create admin user
    let adminUser = await User.findOne({ email: 'admin@bouncehousekids.com' });
    
    if (!adminUser) {
      console.log('Admin user not found. Please run the seed script first:');
      console.log('npm run seed');
      return;
    }

    // Generate token
    const token = jwt.sign(
      { _id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('\n=== ADMIN TOKEN FOR TESTING ===');
    console.log('Token:', token);
    console.log('\nUse this token in your curl requests:');
    console.log('-H "Authorization: Bearer ' + token + '"');
    console.log('\nExample curl command:');
    console.log(`curl "http://localhost:5000/api/companies" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  --data-raw '{"name":"test","subdomain":"test","email":"test@example.com","phone":"1234567890"}'`);
    console.log('\n==============================');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminToken(); 