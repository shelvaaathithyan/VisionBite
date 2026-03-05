import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'shelva@test.com' });
    if (existingUser) {
      console.log('Deleting existing user...');
      await User.deleteOne({ email: 'shelva@test.com' });
    }

    // Create the admin user (password will be hashed by the pre-save hook)
    const admin = await User.create({
      name: 'shelva',
      email: 'shelva@test.com',
      password: 'shelva', // Plain password - will be hashed automatically
      role: 'admin',
      isApproved: true
    });

    console.log('Admin user created successfully!');
    console.log('Email: shelva@test.com');
    console.log('Password: shelva');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
