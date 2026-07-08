const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const { getOnlineDrivers, getIO } = require('../config/socket');
const { calculateHaversineDistance } = require('./routingService');
const { sendNotification } = require('./notificationService');

const activeDispatches = new Map(); // Store driver lists for active sequential dispatches

/**
 * Find nearby active drivers for a ride request and dispatch booking notifications.
 * @param {string} bookingId - MongoDB ObjectId of booking
 */
const matchDriversForBooking = async (bookingId) => {
  const io = getIO();
  if (!io) {
    console.error('❌ Cannot match drivers: Socket.IO is not initialized');
    return;
  }

  try {
    const booking = await Booking.findById(bookingId).populate('customer');
    if (!booking || booking.status !== 'requested') {
      console.log(`⚠️ Ride matching stopped: Booking ${bookingId} not found or status changed`);
      return;
    }

    // Update booking status to searching
    booking.status = 'searching';
    await booking.save();
    io.to(`ride:${booking._id}`).emit('booking:status', { status: 'searching' });

    const [pickupLng, pickupLat] = booking.pickup.location.coordinates;
    const searchRadiusKm = parseFloat(process.env.DRIVER_SEARCH_RADIUS_KM || '5');
    const radiusInRad = searchRadiusKm / 6371; // Convert km to radians for MongoDB GeoJSON query

    // Query DB for online, available, approved drivers of matching vehicle type
    const query = {
      approvalStatus: 'approved',
      isOnline: true,
      isAvailable: true,
      'vehicle.type': booking.vehicleType,
      currentLocation: {
        $geoWithin: {
          $centerSphere: [[pickupLng, pickupLat], radiusInRad]
        }
      }
    };

    const nearbyDrivers = await Driver.find(query).limit(10); // Check up to 10 closest drivers

    if (nearbyDrivers.length === 0) {
      console.log(`ℹ️ No drivers found for ride ${bookingId}`);
      booking.status = 'cancelled';
      booking.cancelledBy = 'system';
      booking.cancellationReason = 'No drivers available in your area';
      booking.cancelledAt = new Date();
      await booking.save();

      io.to(`ride:${booking._id}`).emit('booking:status', {
        status: 'cancelled',
        reason: 'No drivers available in your area'
      });
      return;
    }

    console.log(`🔍 Found ${nearbyDrivers.length} matching drivers for booking ${bookingId}`);

    // Sort drivers by distance, with random noise (up to 500m) to randomize assignment for drivers in the same area
    const sortedDrivers = nearbyDrivers.map(driver => {
      const [driverLng, driverLat] = driver.currentLocation.coordinates;
      const distance = calculateHaversineDistance(pickupLat, pickupLng, driverLat, driverLng);
      const distanceWithNoise = distance + (Math.random() * 0.5); // 0 to 500m noise
      return { driver, distance, distanceWithNoise };
    }).sort((a, b) => a.distanceWithNoise - b.distanceWithNoise);

    // Sequentially notify drivers
    dispatchRequestsSequentially(booking, sortedDrivers, 0);

  } catch (error) {
    console.error('❌ Error matching drivers:', error);
  }
};

/**
 * Sends booking request to drivers one by one with a timeout
 */
const dispatchRequestsSequentially = async (booking, driverList, index) => {
  activeDispatches.set(booking._id.toString(), { booking, driverList, index });
  
  const io = getIO();
  if (!io) return;

  // If we've exhausted all available drivers
  if (index >= driverList.length) {
    console.log(`⚠️ All drivers declined/timed out for ride ${booking._id}`);
    
    // Refresh booking state
    const currentBooking = await Booking.findById(booking._id);
    if (currentBooking && (currentBooking.status === 'searching' || currentBooking.status === 'negotiating')) {
      currentBooking.status = 'cancelled';
      currentBooking.cancelledBy = 'system';
      currentBooking.cancellationReason = 'Drivers are busy. Please try again.';
      currentBooking.cancelledAt = new Date();
      await currentBooking.save();

      io.to(`ride:${booking._id}`).emit('booking:status', {
        status: 'cancelled',
        reason: 'Drivers are busy. Please try again.'
      });
    }
    activeDispatches.delete(booking._id.toString());
    return;
  }

  const { driver, distance } = driverList[index];
  
  // Verify booking is still looking for a driver
  const currentBooking = await Booking.findById(booking._id);
  if (!currentBooking || currentBooking.status !== 'searching') {
    console.log(`ℹ️ Booking status changed. Stopping dispatch loop.`);
    return;
  }

  // Get current socket server online drivers cache
  const onlineDrivers = getOnlineDrivers();
  const socketDriver = onlineDrivers.get(driver._id.toString());

  if (!socketDriver || !socketDriver.available) {
    // Driver went offline or became busy, try next driver immediately
    return dispatchRequestsSequentially(booking, driverList, index + 1);
  }

  console.log(`📨 Dispatching request to Driver: ${driver.name} (Socket: ${socketDriver.socketId})`);

  // Build booking payload for driver
  const bookingPayload = {
    bookingId: currentBooking._id,
    customBookingId: currentBooking.bookingId,
    customer: {
      name: currentBooking.customer.name,
      phone: currentBooking.customer.phone,
      rating: 4.8 // Mock rating
    },
    pickup: currentBooking.pickup,
    drop: currentBooking.drop,
    route: currentBooking.route,
    fare: currentBooking.fare,
    offeredFare: currentBooking.fare.offeredFare,
    preferences: currentBooking.preferences,
    estimatedEarnings: Number((currentBooking.fare.totalFare * (1 - parseFloat(process.env.COMMISSION_RATE || '0.20'))).toFixed(2)),
    distanceToPickup: Number(distance.toFixed(2))
  };

  // Emit to driver socket
  io.to(socketDriver.socketId).emit('ride:incoming', bookingPayload);

  // Send push notification to driver (so it appears when app is closed)
  if (driver.fcmToken) {
    sendNotification(driver.fcmToken, {
      title: 'New Ride Request!',
      body: `Pickup: ${currentBooking.pickup.address.substring(0, 30)}...`,
      data: { bookingId: currentBooking._id }
    }).catch(console.error);
  }

  // Set timeout to wait for acceptance
  const timeoutSec = parseInt(process.env.DRIVER_REQUEST_TIMEOUT_SEC || '30');
  
  setTimeout(async () => {
    // Re-check booking status
    const verifiedBooking = await Booking.findById(booking._id);
    // If it's still 'searching', it means the driver didn't accept, reject, or counter yet.
    if (verifiedBooking && verifiedBooking.status === 'searching') {
      console.log(`⏰ Driver ${driver.name} request timed out`);
      
      // Notify the driver that request expired
      io.to(socketDriver.socketId).emit('ride:expired', { bookingId: booking._id });
      
      // Try next driver
      dispatchRequestsSequentially(booking, driverList, index + 1);
    }
    // If it's 'negotiating', we DO NOT move to the next driver. We wait for customer response.
  }, timeoutSec * 1000);
};

const triggerNextDriver = async (bookingId) => {
  const dispatch = activeDispatches.get(bookingId.toString());
  if (dispatch) {
    const booking = await Booking.findById(bookingId);
    if (booking && (booking.status === 'searching' || booking.status === 'negotiating')) {
      booking.status = 'searching';
      await booking.save();
      // Notify current driver their counter/request expired
      const driver = dispatch.driverList[dispatch.index]?.driver;
      if (driver) {
         const onlineDrivers = getOnlineDrivers();
         const socketDriver = onlineDrivers.get(driver._id.toString());
         if (socketDriver) {
           const io = getIO();
           io.to(socketDriver.socketId).emit('ride:expired', { bookingId });
         }
      }
      dispatchRequestsSequentially(dispatch.booking, dispatch.driverList, dispatch.index + 1);
    }
  }
};

module.exports = { matchDriversForBooking, triggerNextDriver };
