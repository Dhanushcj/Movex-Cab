const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Booking = require('./src/models/Booking');
  const result = await Booking.updateMany(
    { status: { $in: ['searching', 'requested', 'accepted', 'arrived', 'in_progress'] } },
    { $set: { status: 'cancelled', cancelledAt: new Date(), cancelReason: 'Admin cancelled all active rides' } }
  );
  console.log('Cancelled rides:', result.modifiedCount);
  
  // Also free up drivers
  const Driver = require('./src/models/Driver');
  const driverResult = await Driver.updateMany(
    { isAvailable: false },
    { $set: { isAvailable: true, activeRide: null } }
  );
  console.log('Drivers freed:', driverResult.modifiedCount);
  
  process.exit(0);
}).catch(e => {
  console.error('DB Error:', e.message);
  process.exit(1);
});
