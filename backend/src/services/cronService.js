const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { getRouteDetails } = require('./routingService');
const { matchDriversForBooking } = require('./rideMatching');
const { sendNotification } = require('./notificationService');
const { getIO } = require('../config/socket');

// Track active retries to avoid overlapping retry loops
const activeRetries = new Map(); // bookingId -> { retryCount, subscriptionId, isReturn }

const MAX_RETRIES = 3;
const RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes between retries

/**
 * Check if a subscription ride was already booked today for the given leg (pickup/return).
 * Uses both lastBookedDates tracking AND active booking lookup for safety.
 */
async function isAlreadyBookedToday(sub, todayDate, isReturn) {
  // Check lastBookedDates on the subscription
  const dateEntry = sub.lastBookedDates?.find(e => e.date === todayDate);
  if (dateEntry) {
    if (!isReturn && dateEntry.pickupBooked) return true;
    if (isReturn && dateEntry.returnBooked) return true;
  }

  // Double-check: look for an existing booking linked to this subscription today
  const startOfDay = new Date(todayDate + 'T00:00:00.000Z');
  const endOfDay = new Date(todayDate + 'T23:59:59.999Z');

  const existingBooking = await Booking.findOne({
    subscriptionId: sub._id,
    requestedAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['cancelled'] } // Exclude cancelled — we allow retry after cancellation
  });

  // If an active booking exists, check if it matches the leg direction
  if (existingBooking) {
    const isReturnBooking = (
      existingBooking.pickup.address === sub.drop.address &&
      existingBooking.drop.address === sub.pickup.address
    );
    if (isReturn === isReturnBooking) return true;
    if (!isReturn && !isReturnBooking) return true;
  }

  return false;
}

/**
 * Mark a subscription date as booked for a specific leg.
 */
async function markDateAsBooked(sub, todayDate, isReturn) {
  const existingIndex = sub.lastBookedDates?.findIndex(e => e.date === todayDate) ?? -1;

  if (existingIndex > -1) {
    if (isReturn) {
      sub.lastBookedDates[existingIndex].returnBooked = true;
    } else {
      sub.lastBookedDates[existingIndex].pickupBooked = true;
    }
  } else {
    if (!sub.lastBookedDates) sub.lastBookedDates = [];
    sub.lastBookedDates.push({
      date: todayDate,
      pickupBooked: !isReturn,
      returnBooked: isReturn
    });
  }

  // Clean up old entries (older than 7 days) to prevent unbounded growth
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];
  sub.lastBookedDates = sub.lastBookedDates.filter(e => e.date >= cutoffDate);

  await sub.save();
}

/**
 * Create an auto-booked ride for a subscription and dispatch driver matching.
 */
async function createSubscriptionRide(sub, isReturn) {
  const actualPickup = isReturn ? sub.drop : sub.pickup;
  const actualDrop = isReturn ? sub.pickup : sub.drop;

  const route = await getRouteDetails(
    actualPickup.location.coordinates,
    actualDrop.location.coordinates
  );
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

  return booking;
}

/**
 * Retry driver matching for a subscription booking that failed.
 * Retries up to MAX_RETRIES times with RETRY_INTERVAL_MS delay.
 */
async function retryDriverMatching(bookingId, subscriptionId, isReturn, retryCount = 0) {
  const retryKey = bookingId.toString();

  if (retryCount >= MAX_RETRIES) {
    // All retries exhausted — notify customer
    activeRetries.delete(retryKey);
    const sub = await Subscription.findById(subscriptionId).populate('user');
    if (sub && sub.user && sub.user.fcmToken) {
      const legType = isReturn ? 'return' : 'pickup';
      await sendNotification(sub.user.fcmToken, {
        title: '⚠️ Scheduled Ride Failed',
        body: `We couldn't find a driver for your commute ${legType} ride after multiple attempts. Please book manually from the app.`,
        data: { type: 'subscription_ride_failed', subscriptionId: subscriptionId.toString() }
      });
    }

    // Also emit via socket
    const io = getIO();
    if (io && sub && sub.user) {
      io.to(`user:${sub.user._id}`).emit('subscription:ride_failed', {
        subscriptionId: subscriptionId.toString(),
        isReturn,
        message: 'No drivers available for your scheduled ride. Please book manually.'
      });
    }

    console.log(`[CRON] All ${MAX_RETRIES} retries exhausted for subscription ${subscriptionId} (${isReturn ? 'return' : 'pickup'})`);
    return;
  }

  activeRetries.set(retryKey, { retryCount, subscriptionId, isReturn });

  console.log(`[CRON] Retry ${retryCount + 1}/${MAX_RETRIES} for subscription ride ${bookingId}`);

  // Re-create a new booking (old one was cancelled)
  const sub = await Subscription.findById(subscriptionId).populate('user');
  if (!sub || sub.status !== 'active' || !sub.user) {
    activeRetries.delete(retryKey);
    return;
  }

  // Check if user already has an active ride now (maybe they booked manually)
  const activeBooking = await Booking.findOne({
    customer: sub.user._id,
    status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
  });

  if (activeBooking) {
    console.log(`[CRON] User ${sub.user._id} already has active ride, stopping retry`);
    activeRetries.delete(retryKey);
    return;
  }

  try {
    const newBooking = await createSubscriptionRide(sub, isReturn);

    // Notify customer about retry
    if (sub.user.fcmToken) {
      await sendNotification(sub.user.fcmToken, {
        title: '🔄 Retrying Ride Search',
        body: `Still looking for a driver for your commute ${isReturn ? 'return' : ''} ride. Attempt ${retryCount + 1}/${MAX_RETRIES}.`,
        data: { type: 'subscription_ride_retry', bookingId: newBooking._id.toString() }
      });
    }

    // Dispatch driver matching with retry callback
    matchDriversForBooking(newBooking._id.toString(), {
      isSubscriptionRide: true,
      onAllDriversExhausted: () => {
        setTimeout(() => {
          retryDriverMatching(newBooking._id, subscriptionId, isReturn, retryCount + 1);
        }, RETRY_INTERVAL_MS);
      }
    });
  } catch (err) {
    console.error(`[CRON] Retry booking creation failed:`, err);
    activeRetries.delete(retryKey);
  }
}

function startCronJobs() {
  // Run every minute to check subscription schedules
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

      const future = new Date(now.getTime() + 30 * 60000);
      const futureHours = String(future.getHours()).padStart(2, '0');
      const futureMinutes = String(future.getMinutes()).padStart(2, '0');
      const time30MinsFromNow = `${futureHours}:${futureMinutes}`;

      const todayDate = now.toISOString().split('T')[0];

      const subscriptions = await Subscription.find({ status: 'active' }).populate('user');

      for (const sub of subscriptions) {
        if (sub.ridesCompleted >= sub.totalRides) continue;
        if (!sub.user) continue;

        // Check if today is a scheduled day
        const scheduledDays = sub.scheduledDays || [1, 2, 3, 4, 5, 6];
        if (!scheduledDays.includes(currentDay)) continue;

        // Check subscription validity
        if (sub.validUntil && new Date(sub.validUntil) < now) continue;
        if (sub.validFrom && new Date(sub.validFrom) > now) continue;

        // Check for exceptions today
        const exception = sub.exceptions ? sub.exceptions.find(e => e.date === todayDate) : null;

        const effectivePickup = (exception && exception.newPickupTime) ? exception.newPickupTime : sub.pickupTime;
        const skipPickup = exception && exception.skipPickup;
        const isPickupRescheduled = exception && exception.newPickupTime && exception.newPickupTime !== sub.pickupTime;

        const effectiveReturn = (exception && exception.newReturnTime) ? exception.newReturnTime : sub.returnTime;
        const skipReturn = exception && exception.skipReturn;
        const isReturnRescheduled = exception && exception.newReturnTime && exception.newReturnTime !== sub.returnTime;

        // ─── 30-MINUTE ADVANCE NOTIFICATIONS ───────────────────────────────

        if (!skipPickup && effectivePickup === time30MinsFromNow) {
          const rescheduledNote = isPickupRescheduled
            ? ` (rescheduled from ${sub.pickupTime})`
            : '';
          await sendNotification(sub.user.fcmToken, {
            title: '🚗 Upcoming Commute Ride',
            body: `Your pickup is scheduled in 30 minutes at ${effectivePickup}${rescheduledNote}. A driver will be assigned automatically. Open the app to reschedule or skip if needed.`,
            data: { type: 'subscription_reminder', subscriptionId: sub._id.toString() }
          });
        }

        if (sub.isReturnTrip && !skipReturn && effectiveReturn === time30MinsFromNow) {
          const rescheduledNote = isReturnRescheduled
            ? ` (rescheduled from ${sub.returnTime})`
            : '';
          await sendNotification(sub.user.fcmToken, {
            title: '🚗 Upcoming Return Ride',
            body: `Your return pickup is scheduled in 30 minutes at ${effectiveReturn}${rescheduledNote}. A driver will be assigned automatically. Open the app to reschedule or skip if needed.`,
            data: { type: 'subscription_reminder', subscriptionId: sub._id.toString() }
          });
        }

        // ─── AUTO-BOOKING AT SCHEDULED TIME ────────────────────────────────

        // Handle pickup and return INDEPENDENTLY
        const shouldBookPickup = !skipPickup && effectivePickup === currentTime;
        const shouldBookReturn = sub.isReturnTrip && !skipReturn && effectiveReturn === currentTime;

        // Ensure user doesn't already have an active ride before either booking
        if (shouldBookPickup || shouldBookReturn) {
          const activeBooking = await Booking.findOne({
            customer: sub.user._id,
            status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
          });

          if (activeBooking) {
            console.log(`[CRON] User ${sub.user._id} already has active ride, skipping auto-booking`);
            continue;
          }
        }

        // ── PICKUP AUTO-BOOKING ──
        if (shouldBookPickup) {
          const alreadyBooked = await isAlreadyBookedToday(sub, todayDate, false);
          if (!alreadyBooked) {
            try {
              const booking = await createSubscriptionRide(sub, false);
              await markDateAsBooked(sub, todayDate, false);

              // Notify customer: ride booked
              if (sub.user.fcmToken) {
                await sendNotification(sub.user.fcmToken, {
                  title: '🚗 Commute Ride Booked',
                  body: `Your scheduled pickup ride has been booked. Finding a driver near ${sub.pickup.address.substring(0, 40)}...`,
                  data: { type: 'subscription_ride_booked', bookingId: booking._id.toString() }
                });
              }

              // Emit via socket
              const io = getIO();
              if (io) {
                io.to(`user:${sub.user._id}`).emit('subscription:ride_booked', {
                  bookingId: booking._id.toString(),
                  subscriptionId: sub._id.toString(),
                  isReturn: false
                });
              }

              // Dispatch driver matching with subscription-aware retry
              matchDriversForBooking(booking._id.toString(), {
                isSubscriptionRide: true,
                onAllDriversExhausted: () => {
                  setTimeout(() => {
                    retryDriverMatching(booking._id, sub._id, false, 1);
                  }, RETRY_INTERVAL_MS);
                }
              });

              console.log(`[CRON] Auto-booked pickup ride for user ${sub.user._id} for pass ${sub._id}`);
            } catch (err) {
              console.error(`[CRON] Failed to auto-book pickup ride for sub ${sub._id}:`, err);
            }
          }
        }

        // ── RETURN AUTO-BOOKING ──
        if (shouldBookReturn) {
          const alreadyBooked = await isAlreadyBookedToday(sub, todayDate, true);
          if (!alreadyBooked) {
            // Re-check for active rides (pickup might have just been booked above)
            const activeNow = await Booking.findOne({
              customer: sub.user._id,
              status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
            });

            if (activeNow) {
              console.log(`[CRON] User ${sub.user._id} has active ride, skipping return auto-booking`);
              continue;
            }

            try {
              const booking = await createSubscriptionRide(sub, true);
              await markDateAsBooked(sub, todayDate, true);

              // Notify customer: return ride booked
              if (sub.user.fcmToken) {
                await sendNotification(sub.user.fcmToken, {
                  title: '🚗 Return Ride Booked',
                  body: `Your scheduled return ride has been booked. Finding a driver near ${sub.drop.address.substring(0, 40)}...`,
                  data: { type: 'subscription_ride_booked', bookingId: booking._id.toString() }
                });
              }

              // Emit via socket
              const io = getIO();
              if (io) {
                io.to(`user:${sub.user._id}`).emit('subscription:ride_booked', {
                  bookingId: booking._id.toString(),
                  subscriptionId: sub._id.toString(),
                  isReturn: true
                });
              }

              // Dispatch driver matching with subscription-aware retry
              matchDriversForBooking(booking._id.toString(), {
                isSubscriptionRide: true,
                onAllDriversExhausted: () => {
                  setTimeout(() => {
                    retryDriverMatching(booking._id, sub._id, true, 1);
                  }, RETRY_INTERVAL_MS);
                }
              });

              console.log(`[CRON] Auto-booked return ride for user ${sub.user._id} for pass ${sub._id}`);
            } catch (err) {
              console.error(`[CRON] Failed to auto-book return ride for sub ${sub._id}:`, err);
            }
          }
        }
      }
    } catch (e) {
      console.error('[CRON] Error checking subscriptions:', e);
    }
  });
}

module.exports = { startCronJobs, retryDriverMatching };
