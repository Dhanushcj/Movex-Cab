const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Booking = require('../models/Booking');
const { getRouteDetails } = require('./routingService');
const { matchDriversForBooking } = require('./rideMatching');

function startCronJobs() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      
      console.log(`[CRON] Checking subscriptions for time: ${currentTime}`);

      const subscriptions = await Subscription.find({
        status: 'active',
        $or: [
          { pickupTime: currentTime },
          { isReturnTrip: true, returnTime: currentTime }
        ]
      });

      for (const sub of subscriptions) {
        if (sub.ridesCompleted >= sub.totalRides) continue;

        // Ensure user doesn't already have an active ride
        const activeBooking = await Booking.findOne({
          customer: sub.user,
          status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
        });
        if (activeBooking) continue;

        const isReturn = (sub.isReturnTrip && sub.returnTime === currentTime);
        const actualPickup = isReturn ? sub.drop : sub.pickup;
        const actualDrop = isReturn ? sub.pickup : sub.drop;

        const route = await getRouteDetails(actualPickup.location.coordinates, actualDrop.location.coordinates);

        const rideOTP = Math.floor(1000 + Math.random() * 9000).toString();

        const booking = await Booking.create({
          customer: sub.user,
          subscriptionId: sub._id,
          pickup: actualPickup,
          drop: actualDrop,
          vehicleType: sub.vehicleType,
          route,
          fare: {
            distance: route.distance,
            duration: route.duration,
            baseFare: sub.pricePerRide,
            distanceFare: 0,
            timeFare: 0,
            surgeMultiplier: 1,
            totalFare: sub.pricePerRide,
            offeredFare: sub.pricePerRide,
          },
          paymentMethod: 'wallet',
          rideOTP,
          status: 'searching'
        });

        // Dispatch drivers
        matchDriversForBooking(booking._id.toString());
        
        console.log(`[CRON] Auto-booked ride for user ${sub.user} for pass ${sub._id}`);
      }
    } catch (e) {
      console.error('[CRON] Error checking subscriptions:', e);
    }
  });
}

module.exports = { startCronJobs };
