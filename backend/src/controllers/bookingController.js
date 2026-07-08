const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { getRouteDetails } = require('../services/routingService');
const { calculateFare } = require('../services/fareEngine');
const { matchDriversForBooking } = require('../services/rideMatching');
const { processPayment } = require('../services/paymentService');
const { sendNotification } = require('../services/notificationService');
const { getIO, setDriverAvailable } = require('../config/socket');

/**
 * Get route estimates & fares for all vehicle types
 * POST /api/bookings/estimate
 */
const estimateFare = async (req, res, next) => {
  const { pickup, drop, promoCode } = req.body; // pickup/drop: { address, coordinates: [lng, lat] }
  try {
    // 1. Get route geometry
    let route = { distance: 0, duration: 0, polyline: '', steps: [] };
    if (drop && drop.coordinates && drop.coordinates.length === 2 && !(drop.coordinates[0] === 0 && drop.coordinates[1] === 0)) {
      route = await getRouteDetails(pickup.coordinates, drop.coordinates);
    }

    // 2. Compute fare estimations across all types
    const vehicles = ['bike', 'auto', 'mini', 'sedan', 'suv'];
    const estimates = await Promise.all(
      vehicles.map(async (type) => {
        const fare = await calculateFare({
          vehicleType: type,
          distance: route.distance,
          duration: route.duration,
          promoCode,
          userId: req.user.id
        });
        return {
          vehicleType: type,
          fareDetails: fare,
          routeDetails: route
        };
      })
    );

    res.json({
      success: true,
      estimates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Place a ride booking request
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
  const { pickup, drop, vehicleType, paymentMethod, promoCode, preferences, offeredFare, subscriptionId } = req.body;
  try {
    // Check if customer already has active rides
    const activeBooking = await Booking.findOne({
      customer: req.user.id,
      status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ride request.',
        booking: activeBooking
      });
    }

    let sub = null;
    let finalPaymentMethod = paymentMethod;
    if (subscriptionId) {
      sub = await Subscription.findById(subscriptionId);
      if (!sub || sub.user.toString() !== req.user.id || sub.status !== 'active' || sub.ridesCompleted >= sub.totalRides) {
        return res.status(400).json({ success: false, message: 'Invalid or exhausted subscription pass' });
      }
      finalPaymentMethod = 'wallet';
    }

    // 1. Get route directions
    let route = { distance: 0, duration: 0, polyline: '', steps: [] };
    if (drop && drop.coordinates && drop.coordinates.length === 2 && !(drop.coordinates[0] === 0 && drop.coordinates[1] === 0)) {
      route = await getRouteDetails(pickup.coordinates, drop.coordinates);
    }

    // 2. Calculate fare (estimates, or use offered fare)
    const calculatedFare = await calculateFare({
      vehicleType,
      distance: route.distance,
      duration: route.duration,
      promoCode,
      userId: req.user.id
    });

    let finalOfferedFare = offeredFare || calculatedFare.totalFare;
    if (sub) {
      finalOfferedFare = sub.pricePerRide;
    }
    
    calculatedFare.offeredFare = finalOfferedFare;
    calculatedFare.totalFare = finalOfferedFare;

    // 3. Generate verification OTP
    const rideOTP = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code

    // 4. Create record
    const booking = await Booking.create({
      customer: req.user.id,
      subscriptionId: sub ? sub._id : null,
      pickup: {
        address: pickup.address,
        location: { type: 'Point', coordinates: pickup.coordinates }
      },
      drop: drop && drop.address ? {
        address: drop.address,
        location: { type: 'Point', coordinates: drop.coordinates }
      } : undefined,
      vehicleType,
      preferences: preferences || [],
      route,
      fare: calculatedFare,
      paymentMethod: finalPaymentMethod,
      rideOTP,
      status: 'searching'
    });

    res.status(201).json({
      success: true,
      message: 'Booking request created. Finding drivers...',
      data: booking
    });

    // 5. Fire matching system asynchronously
    // Using schedule/process matching logic
    setTimeout(() => {
      matchDriversForBooking(booking._id);
    }, 1000);

  } catch (error) {
    next(error);
  }
};

/**
 * Accept Booking (Driver role)
 * PUT /api/bookings/:id/accept
 */
const acceptBooking = async (req, res, next) => {
  const bookingId = req.params.id;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status !== 'searching' && booking.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Ride is no longer available. Current status: ${booking.status}`
      });
    }

    // Verify driver is approved and online
    const driver = await Driver.findById(req.user.id);
    if (!driver || driver.approvalStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Driver accounts must be approved to accept rides' });
    }

    // Assign driver to ride
    booking.driver = driver._id;
    booking.status = 'accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    // Make driver unavailable
    driver.isAvailable = false;
    await driver.save();
    setDriverAvailable(driver._id, false);

    // Increment ride count
    await User.findByIdAndUpdate(booking.customer, { $inc: { totalRides: 1 } });
    driver.totalRides += 1;
    await driver.save();

    res.json({
      success: true,
      message: 'Ride booking accepted successfully',
      data: booking
    });

    // Notify customer via push notification
    const customer = await User.findById(booking.customer);
    if (customer && customer.fcmToken) {
      await sendNotification(customer.fcmToken, {
        title: 'Ride Confirmed!',
        body: `${driver.name} has accepted your ride request.`,
        data: { bookingId: booking._id }
      });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Driver arrived at pickup
 * PUT /api/bookings/:id/arrived
 */
const driverArrived = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'arrived';
    booking.arrivedAt = new Date();
    await booking.save();

    res.json({ success: true, message: 'Arrived at pickup point', data: booking });

    // Notify customer
    const customer = await User.findById(booking.customer);
    if (customer && customer.fcmToken) {
      await sendNotification(customer.fcmToken, {
        title: 'Driver Arrived!',
        body: 'Your driver has arrived at the pickup location.',
        data: { bookingId: booking._id }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 * POST /api/bookings/:id/verify-otp
 */
const verifyOTP = async (req, res, next) => {
  const { otp } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.rideOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP verification code' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Start Trip (Verify OTP)
 * PUT /api/bookings/:id/start
 */
const startTrip = async (req, res, next) => {
  const { otp } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.rideOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP verification code' });
    }

    booking.status = 'in_progress';
    booking.startedAt = new Date();
    await booking.save();

    res.json({ success: true, message: 'Trip started successfully', data: booking });

    // Notify customer
    const customer = await User.findById(booking.customer);
    if (customer && customer.fcmToken) {
      await sendNotification(customer.fcmToken, {
        title: 'Trip Started',
        body: 'Have a safe journey!',
        data: { bookingId: booking._id }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Trip & Payment Processing
 * PUT /api/bookings/:id/complete
 */
const completeTrip = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Only active trips can be marked as complete' });
    }

    booking.fare.finalFare = booking.fare.totalFare + (booking.tipAmount || 0);

    if (booking.paymentMethod === 'qr') {
      booking.status = 'payment_pending';
      await booking.save();
      
      const io = getIO();
      if (io) io.to(`ride:${booking._id}`).emit('booking:status', { status: 'payment_pending' });
      
      return res.json({
        success: true,
        message: 'Waiting for customer QR payment',
        data: booking,
        isPaymentPending: true
      });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    // ── Wallet Commission Logic ──
    const DriverFeeEngine = require('../services/FeeEngine');
    const driver = await Driver.findById(booking.driver);
    const fare = booking.fare.totalFare || 0;
    const tip = booking.tipAmount || 0;
    
    // Call the Fee Engine to calculate payout and update earnings
    const feeResult = await DriverFeeEngine.onRideCompleted(driver._id, driver.vehicle.type, driver.city || 'Chennai', fare);
    const commission = fare - feeResult.driverPayout;

    if (booking.paymentMethod === 'upi' || booking.paymentMethod === 'qr') {
      // Platform collects 100%, credits driver their payout + Tip
      driver.wallet.balance += (feeResult.driverPayout + tip);
    } else {
      // Driver collects 100% Cash + Tip. Platform deducts the commission from their wallet (if commission model)
      driver.wallet.balance -= commission;
    }
    
    // Check if wallet falls into negative (insufficient balance)
    const isWalletNegative = driver.wallet.balance < 0;
    await driver.save();
    
    // Sync the balance to DriverWallet to keep FeeEngine consistent
    const DriverWallet = require('../models/DriverWallet');
    await DriverWallet.findOneAndUpdate(
      { driverId: driver._id },
      { $set: { balance: driver.wallet.balance } }
    );

    // Release driver availability (Block if negative balance)
    if (isWalletNegative) {
      driver.isAvailable = false;
      await driver.save();
      setDriverAvailable(booking.driver, false);
    } else {
      driver.isAvailable = true;
      await driver.save();
      setDriverAvailable(booking.driver, true);
    }

    // Process payment integration
    const payment = await processPayment({
      bookingId: booking._id,
      customBookingId: booking.bookingId,
      customerId: booking.customer,
      driverId: booking.driver,
      amount: booking.fare.totalFare,
      method: booking.paymentMethod
    });

    booking.paymentStatus = payment.status;
    await booking.save();

    res.json({
      success: true,
      message: 'Trip completed and invoice generated',
      data: booking,
      payment,
      walletBalance: driver.wallet.balance,
      isWalletNegative
    });

    // Notify customer
    const customer = await User.findById(booking.customer);
    if (customer && customer.fcmToken) {
      await sendNotification(customer.fcmToken, {
        title: 'Trip Completed',
        body: `Hope you enjoyed your ride. Paid ₹${booking.fare.totalFare}`,
        data: { bookingId: booking._id }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Booking
 * PUT /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res, next) => {
  const { reason } = req.body;
  const role = req.userRole; // from auth middleware
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const cancelableStatuses = ['requested', 'searching', 'accepted', 'arriving', 'arrived'];
    if (!cancelableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Ride cannot be cancelled at this stage (current status: ${booking.status})`
      });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = role;
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();

    // Restore driver availability if ride was assigned
    if (booking.driver) {
      await Driver.findByIdAndUpdate(booking.driver, { $set: { isAvailable: true } });
      setDriverAvailable(booking.driver, true);
    }

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });

    // Notify counterpart
    const io = getIO();
    if (io) {
      io.to(`ride:${booking._id}`).emit('booking:status', {
        status: 'cancelled',
        reason: booking.cancellationReason
      });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Get single booking details
 * GET /api/bookings/:id
 */
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone email avatar')
      .populate('driver', 'name phone avatar rating vehicle currentLocation');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Update payment preferences during a ride (Customer)
 * PUT /api/bookings/:id/payment-method
 */
const updatePaymentPreferences = async (req, res, next) => {
  const { paymentMethod, tipAmount } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (paymentMethod) booking.paymentMethod = paymentMethod;
    if (tipAmount !== undefined) booking.tipAmount = tipAmount;
    await booking.save();

    // Notify driver about the update via socket
    const io = getIO();
    if (io) {
      io.to(`ride:${booking._id}`).emit('booking:payment_updated', {
        paymentMethod: booking.paymentMethod,
        tipAmount: booking.tipAmount
      });
    }

    res.json({ success: true, message: 'Payment preferences updated', data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Process QR Payment from Customer
 * PUT /api/bookings/:id/pay
 */
const payTrip = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body; // e.g., 'wallet', 'gpay', 'phonepe'
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status !== 'payment_pending') {
      return res.status(400).json({ success: false, message: 'Trip is not pending payment' });
    }

    // Process payment integration using the selected method
    const { processPayment } = require('../services/paymentService');
    const payment = await processPayment({
      bookingId: booking._id,
      customBookingId: booking.bookingId,
      customerId: booking.customer,
      driverId: booking.driver,
      amount: booking.fare.finalFare,
      method: paymentMethod === 'phonepe' || paymentMethod === 'gpay' ? 'upi' : paymentMethod
    });

    // Mark as completed
    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = payment.status;
    await booking.save();

    // ── Wallet Commission Logic ──
    const DriverFeeEngine = require('../services/FeeEngine');
    const Driver = require('../models/Driver');
    const driver = await Driver.findById(booking.driver);
    const fare = booking.fare.totalFare || 0;
    const tip = booking.tipAmount || 0;
    
    // Call the Fee Engine to calculate payout and update earnings
    const feeResult = await DriverFeeEngine.onRideCompleted(driver._id, driver.vehicle.type, driver.city || 'Chennai', fare);

    // Platform collected via wallet/online, credits driver their payout + Tip
    driver.wallet.balance += (feeResult.driverPayout + tip);
    
    // Check if wallet falls into negative
    const isWalletNegative = driver.wallet.balance < 0;
    await driver.save();

    // Sync the balance to DriverWallet to keep FeeEngine consistent
    const DriverWallet = require('../models/DriverWallet');
    await DriverWallet.findOneAndUpdate(
      { driverId: driver._id },
      { $set: { balance: driver.wallet.balance } }
    );

    const { setDriverAvailable } = require('../services/routingService');
    if (isWalletNegative) {
      driver.isAvailable = false;
      await driver.save();
      setDriverAvailable(booking.driver, false);
    } else {
      driver.isAvailable = true;
      await driver.save();
      setDriverAvailable(booking.driver, true);
    }

    res.json({
      success: true,
      message: 'Payment successful and trip completed',
      data: booking,
      payment,
      walletBalance: driver.wallet.balance,
      isWalletNegative
    });

    const io = getIO();
    if (io) {
      io.to(`ride:${booking._id}`).emit('booking:status', { status: 'completed' });
      io.to(`ride:${booking._id}`).emit('ride:completed');
    }

    const User = require('../models/User');
    const { sendNotification } = require('../services/pushNotificationService');
    const customer = await User.findById(booking.customer);
    if (customer && customer.fcmToken) {
      await sendNotification(customer.fcmToken, {
        title: 'Payment Successful',
        body: `Paid ₹${booking.fare.finalFare}`,
        data: { bookingId: booking._id }
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  estimateFare,
  createBooking,
  acceptBooking,
  driverArrived,
  startTrip,
  completeTrip,
  payTrip,
  cancelBooking,
  getBooking,
  updatePaymentPreferences,
  verifyOTP
};
