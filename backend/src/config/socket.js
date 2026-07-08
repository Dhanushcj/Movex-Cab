const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// In-memory store for driver locations (replace with Redis in production)
const driverLocations = new Map();
const onlineDrivers = new Map();
const activeRides = new Map();

let ioInstance = null;

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      return next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId} (${socket.userRole})`);

    // ==================== DRIVER EVENTS ====================

    // Driver goes online
    socket.on('driver:online', (data) => {
      const { driverId, location, vehicleType } = data;
      onlineDrivers.set(driverId, {
        socketId: socket.id,
        location,
        vehicleType,
        available: true,
        lastUpdate: Date.now()
      });
      driverLocations.set(driverId, location);
      socket.join(`driver:${driverId}`);
      console.log(`🟢 Driver ${driverId} is now online`);
      socket.emit('status:updated', { status: 'online' });
    });

    // Driver goes offline
    socket.on('driver:offline', (data) => {
      const { driverId } = data;
      onlineDrivers.delete(driverId);
      driverLocations.delete(driverId);
      socket.leave(`driver:${driverId}`);
      console.log(`🔴 Driver ${driverId} is now offline`);
      socket.emit('status:updated', { status: 'offline' });
    });

    // Driver location update
    socket.on('location:update', (data) => {
      const { driverId, location } = data;
      driverLocations.set(driverId, location);

      const driverData = onlineDrivers.get(driverId);
      if (driverData) {
        driverData.location = location;
        driverData.lastUpdate = Date.now();
        onlineDrivers.set(driverId, driverData);
      }

      // Broadcast to active ride room if driver is on a ride
      const rideId = findActiveRideForDriver(driverId);
      if (rideId) {
        io.to(`ride:${rideId}`).emit('driver:location', {
          driverId,
          location,
          timestamp: Date.now()
        });
      }
    });

    // ==================== RIDE EVENTS ====================

    // Customer requests a ride
    socket.on('booking:request', (data) => {
      const { bookingId, customerId } = data;
      socket.join(`ride:${bookingId}`);
      console.log(`📍 Customer ${customerId} requesting ride ${bookingId}`);
    });

    // Send ride request to a specific driver
    socket.on('ride:sendToDriver', (data) => {
      const { driverId, bookingDetails } = data;
      const driverData = onlineDrivers.get(driverId);
      if (driverData) {
        io.to(driverData.socketId).emit('ride:incoming', bookingDetails);
        console.log(`📨 Ride request sent to driver ${driverId}`);
      }
    });

    // Driver accepts ride
    socket.on('ride:accept', (data) => {
      const { bookingId, driverId, driverInfo } = data;
      socket.join(`ride:${bookingId}`);

      // Mark driver as unavailable
      const driverData = onlineDrivers.get(driverId);
      if (driverData) {
        driverData.available = false;
        onlineDrivers.set(driverId, driverData);
      }

      // Track active ride
      activeRides.set(bookingId, { driverId, status: 'accepted' });

      // Notify customer
      io.to(`ride:${bookingId}`).emit('ride:accepted', {
        bookingId,
        driverInfo,
        timestamp: Date.now()
      });
      console.log(`✅ Driver ${driverId} accepted ride ${bookingId}`);
    });

    // Driver rejects ride
    socket.on('ride:reject', (data) => {
      const { bookingId, driverId } = data;
      const { triggerNextDriver } = require('../services/rideMatching');
      io.to(`ride:${bookingId}`).emit('ride:rejected', {
        bookingId,
        driverId,
        timestamp: Date.now()
      });
      triggerNextDriver(bookingId);
      console.log(`❌ Driver ${driverId} rejected ride ${bookingId}`);
    });

    // Driver sends a counter-offer
    socket.on('ride:counter_offer', async (data) => {
      const { bookingId, driverId, driverInfo, fare } = data;
      const Booking = require('../models/Booking');
      try {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.status === 'searching') {
          booking.status = 'negotiating';
          booking.currentNegotiation = {
            driverId,
            fare,
            status: 'countered'
          };
          await booking.save();
          
          io.to(`ride:${bookingId}`).emit('ride:counter_offer', {
            bookingId,
            driverId,
            driverInfo,
            fare,
            timestamp: Date.now()
          });
          console.log(`💬 Driver ${driverId} countered ride ${bookingId} with fare ${fare}`);
        }
      } catch (e) {
        console.error('Error handling counter offer', e);
      }
    });

    // Customer responds to a counter-offer
    socket.on('ride:customer_response', async (data) => {
      const { bookingId, driverId, accept } = data;
      const Booking = require('../models/Booking');
      const { triggerNextDriver } = require('../services/rideMatching');
      try {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.status === 'negotiating' && booking.currentNegotiation?.driverId?.toString() === driverId) {
          if (accept) {
            // Customer accepts the counter
            booking.status = 'accepted';
            booking.driver = driverId;
            booking.fare.finalFare = booking.currentNegotiation.fare;
            booking.fare.totalFare = booking.currentNegotiation.fare;
            booking.currentNegotiation.status = 'accepted';
            await booking.save();

            // Track active ride
            activeRides.set(bookingId, { driverId, status: 'accepted' });

            // Mark driver as unavailable
            const driverData = onlineDrivers.get(driverId);
            if (driverData) {
              driverData.available = false;
              onlineDrivers.set(driverId, driverData);
            }

            // Notify Driver
            const socketDriver = onlineDrivers.get(driverId);
            if (socketDriver) {
              io.to(socketDriver.socketId).emit('ride:accepted', {
                bookingId,
                timestamp: Date.now()
              });
            }
            console.log(`✅ Customer accepted counter from driver ${driverId} for ride ${bookingId}`);
          } else {
            // Customer rejects the counter
            booking.currentNegotiation.status = 'rejected';
            await booking.save();
            
            // Notify driver that customer rejected
            const socketDriver = onlineDrivers.get(driverId);
            if (socketDriver) {
              io.to(socketDriver.socketId).emit('ride:expired', { bookingId });
            }
            
            // Move to next driver
            triggerNextDriver(bookingId);
            console.log(`❌ Customer rejected counter from driver ${driverId} for ride ${bookingId}`);
          }
        }
      } catch (e) {
        console.error('Error handling customer response', e);
      }
    });

    // Driver arrived at pickup
    socket.on('ride:driverArrived', (data) => {
      const { bookingId } = data;
      const ride = activeRides.get(bookingId);
      if (ride) {
        ride.status = 'arrived';
        activeRides.set(bookingId, ride);
      }
      io.to(`ride:${bookingId}`).emit('ride:driverArrived', {
        bookingId,
        timestamp: Date.now()
      });
    });

    // Trip started
    socket.on('ride:started', (data) => {
      const { bookingId } = data;
      const ride = activeRides.get(bookingId);
      if (ride) {
        ride.status = 'in_progress';
        activeRides.set(bookingId, ride);
      }
      io.to(`ride:${bookingId}`).emit('ride:started', {
        bookingId,
        timestamp: Date.now()
      });
      console.log(`🚗 Ride ${bookingId} started`);
    });

    // Trip completed
    socket.on('ride:completed', (data) => {
      const { bookingId, driverId, fare } = data;

      // Mark driver as available again
      const driverData = onlineDrivers.get(driverId);
      if (driverData) {
        driverData.available = true;
        onlineDrivers.set(driverId, driverData);
      }

      // Clean up active ride
      activeRides.delete(bookingId);

      io.to(`ride:${bookingId}`).emit('ride:completed', {
        bookingId,
        fare,
        timestamp: Date.now()
      });
      console.log(`🏁 Ride ${bookingId} completed`);
    });

    // ==================== CUSTOMER EVENTS ====================

    // Customer joins tracking room
    socket.on('tracking:join', (data) => {
      const { bookingId } = data;
      socket.join(`ride:${bookingId}`);
    });

    // ==================== DISCONNECT ====================

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.userId} - ${reason}`);

      // If driver, mark offline
      if (socket.userRole === 'driver') {
        for (const [driverId, data] of onlineDrivers.entries()) {
          if (data.socketId === socket.id) {
            onlineDrivers.delete(driverId);
            driverLocations.delete(driverId);
            console.log(`🔴 Driver ${driverId} went offline (disconnected)`);
            break;
          }
        }
      }
    });
  });

  ioInstance = io;
  return io;
};

// Helper to find active ride for a driver
function findActiveRideForDriver(driverId) {
  for (const [rideId, ride] of activeRides.entries()) {
    if (ride.driverId === driverId) return rideId;
  }
  return null;
}

// Exported getters for use in controllers
const getOnlineDrivers = () => onlineDrivers;
const getDriverLocations = () => driverLocations;
const getActiveRides = () => activeRides;
const getIO = () => ioInstance;

const setDriverAvailable = (driverId, available) => {
  const driverData = onlineDrivers.get(driverId.toString());
  if (driverData) {
    driverData.available = available;
    onlineDrivers.set(driverId.toString(), driverData);
  }
};

module.exports = {
  initializeSocket,
  getOnlineDrivers,
  getDriverLocations,
  getActiveRides,
  getIO,
  setDriverAvailable
};
