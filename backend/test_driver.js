require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./src/models/Driver');

const checkDriver = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const d = await Driver.findOne({ 'vehicle.type': 'mini' });
  console.log('Driver FCM Token:', d.fcmToken);
  console.log('Driver Phone:', d.phone);
  console.log('Driver Online:', d.isOnline);
  process.exit(0);
};

checkDriver().catch(console.error);
