require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./src/models/Driver');

const checkDrivers = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const drivers = await Driver.find({});
  for (const d of drivers) {
    console.log(`Driver: ${d.name} | isOnline: ${d.isOnline} | isAvailable: ${d.isAvailable} | approvalStatus: ${d.approvalStatus} | Vehicle: ${d.vehicle?.type} | Location: ${JSON.stringify(d.currentLocation)}`);
  }
  process.exit(0);
};

checkDrivers().catch(console.error);
