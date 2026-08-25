const mongoose = require('mongoose');
const Driver = require('./src/models/Driver');
const Booking = require('./src/models/Booking');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movex');
  const drivers = await Driver.find({}, 'name isOnline isAvailable approvalStatus assignedRoute currentLocation vehicle');
  console.log("All Drivers:", JSON.stringify(drivers, null, 2));

  const bookings = await Booking.find({}, 'status vehicleType metroRouteId pickup').sort({createdAt: -1}).limit(2);
  console.log("Recent Bookings:", JSON.stringify(bookings, null, 2));

  mongoose.disconnect();
}
check();
