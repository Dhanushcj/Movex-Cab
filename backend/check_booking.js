require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(3);
    console.log(`Latest 3 bookings`);
    bookings.forEach(b => {
      console.log(`- Booking ID: ${b._id}`);
      console.log(`  Status: ${b.status}`);
      console.log(`  VehicleType: ${b.vehicleType}`);
      console.log(`  Pickup:`, JSON.stringify(b.pickup.location));
      console.log(`  Requested At: ${b.createdAt}`);
    });
    process.exit(0);
  });
