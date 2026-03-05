import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'shelva@test.com' }).select('+password');
    
    if (!user) {
      console.log('User not found!');
    } else {
      console.log('User found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Approved:', user.isApproved);
      console.log('Password hash:', user.password);
      
      // Test password comparison
      const isMatch = await bcrypt.compare('shelva', user.password);
      console.log('\nPassword "shelva" matches:', isMatch);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUser();
