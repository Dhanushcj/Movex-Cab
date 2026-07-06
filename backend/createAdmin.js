const mongoose = require('mongoose');
const admin = require('./src/config/firebase');
const User = require('./src/models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movex');
    console.log('MongoDB connected');

    const email = 'admin@cab.com';
    const password = 'AdminPassword123!';
    const name = 'Super Admin';

    // 1. Create in Firebase
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
      console.log('Firebase user already exists:', firebaseUser.uid);
      await admin.auth().updateUser(firebaseUser.uid, { password });
      console.log('Password updated in Firebase');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        firebaseUser = await admin.auth().createUser({
          email,
          password,
          displayName: name,
          emailVerified: true
        });
        console.log('Created new Firebase user:', firebaseUser.uid);
      } else {
        throw e;
      }
    }

    // 2. Create in MongoDB
    let dbUser = await User.findOne({ email });
    if (dbUser) {
      dbUser.role = 'admin';
      dbUser.firebaseUid = firebaseUser.uid;
      dbUser.password = password; // Ensure DB password matches
      await dbUser.save();
      console.log('Updated existing MongoDB user to admin role with password');
    } else {
      dbUser = await User.create({
        name,
        email,
        phone: '+10000000000', // Dummy phone to satisfy unique index
        firebaseUid: firebaseUser.uid,
        password, // Save password for traditional login
        role: 'admin',
        isActive: true
      });
      console.log('Created new admin user in MongoDB');
    }

    console.log('\n--- Admin Credentials ---');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('-------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
