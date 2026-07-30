require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./src/models/Driver');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const drivers = await Driver.find({});
    console.log(`Found ${drivers.length} drivers`);
    drivers.forEach(d => {
      console.log(`- Driver ID: ${d._id}`);
      console.log(`  Name: ${d.name}`);
      console.log(`  isOnline: ${d.isOnline}`);
      console.log(`  isAvailable: ${d.isAvailable}`);
      console.log(`  approvalStatus: ${d.approvalStatus}`);
      console.log(`  vehicleType: ${d.vehicle?.type}`);
      console.log(`  Location:`, JSON.stringify(d.currentLocation));
    });
    process.exit(0);
  });
