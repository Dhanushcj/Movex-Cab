const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movex-cab';

mongoose.connect(URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const Booking = require('./src/models/Booking');
  const Driver = require('./src/models/Driver');

  const result = await Booking.updateMany(
    { status: { $in: ['searching', 'requested', 'accepted', 'arrived', 'in_progress'] } },
    { $set: { status: 'cancelled', cancelledAt: new Date(), cancelReason: 'Admin cancelled all active rides' } }
  );
  console.log('Cancelled rides:', result.modifiedCount);

  const driverResult = await Driver.updateMany(
    { isAvailable: false },
    { $set: { isAvailable: true } }
  );
  console.log('Drivers freed:', driverResult.modifiedCount);

  process.exit(0);
}).catch(e => {
  console.error('DB Error:', e.message);
  process.exit(1);
});
