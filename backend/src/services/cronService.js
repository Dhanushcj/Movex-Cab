const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Booking = require('../models/Booking');
const { getRouteDetails } = require('./routingService');
const { matchDriversForBooking } = require('./rideMatching');
const { sendNotification } = require('./notificationService');

function startCronJobs() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      const future = new Date(now.getTime() + 30 * 60000);
      const futureHours = String(future.getHours()).padStart(2, '0');
      const futureMinutes = String(future.getMinutes()).padStart(2, '0');
      const time30MinsFromNow = `${futureHours}:${futureMinutes}`;
      
      const todayDate = now.toISOString().split('T')[0];

      // console.log(`[CRON] Checking subscriptions. Current: ${currentTime}, Future: ${time30MinsFromNow}`);

      const subscriptions = await Subscription.find({ status: 'active' }).populate('user');

      for (const sub of subscriptions) {
        if (sub.ridesCompleted >= sub.totalRides) continue;
        if (!sub.user) continue;

        // Check for exceptions today
        const exception = sub.exceptions ? sub.exceptions.find(e => e.date === todayDate) : null;
        
        const effectivePickup = (exception && exception.newPickupTime) ? exception.newPickupTime : sub.pickupTime;
        const skipPickup = exception && exception.skipPickup;

        const effectiveReturn = (exception && exception.newReturnTime) ? exception.newReturnTime : sub.returnTime;
        const skipReturn = exception && exception.skipReturn;

        // --- 30 MIN NOTIFICATIONS ---
        if (!skipPickup && effectivePickup === time30MinsFromNow) {
          await sendNotification(sub.user.fcmToken, {
            title: 'Upcoming Commute Ride',
            body: `Your pickup is scheduled in 30 minutes at ${effectivePickup}. Open the app to reschedule or skip if needed.`,
          });
        }

        if (sub.isReturnTrip && !skipReturn && effectiveReturn === time30MinsFromNow) {
          await sendNotification(sub.user.fcmToken, {
            title: 'Upcoming Return Ride',
            body: `Your return pickup is scheduled in 30 minutes at ${effectiveReturn}. Open the app to reschedule or skip if needed.`,
          });
        }

        // --- AUTO-BOOKING ---
        let shouldBookPickup = !skipPickup && effectivePickup === currentTime;
        let shouldBookReturn = sub.isReturnTrip && !skipReturn && effectiveReturn === currentTime;

        if (shouldBookPickup || shouldBookReturn) {
          // Ensure user doesn't already have an active ride
          const activeBooking = await Booking.findOne({
            customer: sub.user._id,
            status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
          });
          
          if (!activeBooking) {
            const isReturn = shouldBookReturn;
            const actualPickup = isReturn ? sub.drop : sub.pickup;
            const actualDrop = isReturn ? sub.pickup : sub.drop;

            const route = await getRouteDetails(actualPickup.location.coordinates, actualDrop.location.coordinates);
            const rideOTP = Math.floor(1000 + Math.random() * 9000).toString();

            const booking = await Booking.create({
              customer: sub.user._id,
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
            console.log(`[CRON] Auto-booked ${isReturn ? 'return ' : ''}ride for user ${sub.user._id} for pass ${sub._id}`);
          }
        }
      }
    } catch (e) {
      console.error('[CRON] Error checking subscriptions:', e);
    }
  });
}

module.exports = { startCronJobs };
