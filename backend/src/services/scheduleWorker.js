const cron = require('node-cron');
const ScheduledRide = require('../models/ScheduledRide');
const Booking = require('../models/Booking');
const { sendNotification } = require('./notificationService');
const { matchDriversForBooking } = require('./rideMatching');

const initScheduleWorker = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Look ahead 15 minutes + 1 minute buffer
      const lookAheadTime = new Date(now.getTime() + 16 * 60 * 1000);

      // Find rides that need a reminder (15 mins before pickup)
      const upcomingRides = await ScheduledRide.find({
        status: 'scheduled',
        notificationSent: false,
        pickupDateTime: { $lte: lookAheadTime }
      }).populate('customer');

      for (const ride of upcomingRides) {
        console.log(`[ScheduleWorker] Processing ride ${ride.rideId}`);

        // 1. Send Reminder
        if (ride.customer && ride.customer.fcmToken) {
          await sendNotification({
            token: ride.customer.fcmToken,
            title: 'Upcoming Ride',
            body: 'Your scheduled ride starts in 15 minutes. A driver will be assigned shortly.',
            data: { rideId: ride.rideId, type: 'SCHEDULED_RIDE_REMINDER' }
          });
        }
        ride.notificationSent = true;
        
        // 2. We need to create an active Booking record from this ScheduledRide to run standard dispatch
        const newBooking = new Booking({
          customer: ride.customer._id,
          pickup: ride.pickup,
          drop: ride.drop,
          vehicleType: ride.vehicleType,
          status: 'requested',
          preferences: [],
          isWomenOnly: false
        });

        await newBooking.save();

        // 3. Mark the scheduled ride as searching
        ride.status = 'searching';
        await ride.save();

        console.log(`[ScheduleWorker] Created active booking ${newBooking.bookingId} for Scheduled Ride ${ride.rideId}`);

        // 4. Trigger auto-assignment via existing rideMatching logic
        await matchDriversForBooking(newBooking._id);
      }

    } catch (error) {
      console.error('[ScheduleWorker] Error processing scheduled rides:', error);
    }
  });
  console.log('✅ Scheduled Ride Worker initialized');
};

module.exports = { initScheduleWorker };
