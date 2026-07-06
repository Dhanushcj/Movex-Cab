const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const User = require('./src/models/User');
const Driver = require('./src/models/Driver');

mongoose.connect('mongodb://localhost:27017/movex').then(async () => {
  try {
    const user = await User.findOne({ phone: '9444667411' });
    if (!user) {
      console.log('User not found.');
      process.exit(1);
    }

    const booking = await Booking.findOne({
      customer: user._id,
      status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
    });

    if (!booking) {
      console.log('No active booking found for this user.');
      process.exit(1);
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    console.log(`Booking ${booking._id} marked as completed.`);

    if (booking.driver) {
      await Driver.findByIdAndUpdate(booking.driver, { isAvailable: true });
      console.log(`Driver ${booking.driver} is now available again.`);
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
