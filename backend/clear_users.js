require('dotenv').config();
const { connectDB } = require('./src/config/database');
const User = require('./src/models/User');
const Driver = require('./src/models/Driver');
const mongoose = require('mongoose');

const clearDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to Database. Preparing to clear users and drivers...');

    // Delete all records
    const userResult = await User.deleteMany({});
    const driverResult = await Driver.deleteMany({});

    console.log(`✅ Successfully deleted ${userResult.deletedCount} Customers.`);
    console.log(`✅ Successfully deleted ${driverResult.deletedCount} Drivers.`);

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

clearDatabase();
