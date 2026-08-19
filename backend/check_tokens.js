const mongoose = require('mongoose');
const { connectDB } = require('./src/config/database');
const User = require('./src/models/User');
require('dotenv').config();
(async () => {
  await connectDB();
  const users = await User.find({ fcmToken: { $exists: true, $ne: '' } }).select('name phone fcmToken');
  console.log('Users with tokens:', users);
  process.exit(0);
})();
