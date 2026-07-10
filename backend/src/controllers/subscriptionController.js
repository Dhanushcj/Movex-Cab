const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { getRouteDetails } = require('../services/routingService');
const { calculateFare } = require('../services/fareEngine');
const { sendNotification } = require('../services/notificationService');

exports.estimatePass = async (req, res) => {
  try {
    const { pickup, drop, vehicleType, isReturnTrip } = req.body;
    const totalRides = isReturnTrip ? 60 : 30; // 30 days
    
    // Get route distance and duration
    const route = await getRouteDetails(pickup.coordinates, drop.coordinates);
    
    // Calculate standard single ride fare
    const standardFare = await calculateFare({
      vehicleType,
      distance: route.distance,
      duration: route.duration,
      userId: req.user.id
    });
    
    // Apply 10% discount for the pass
    const pricePerRide = Math.floor(standardFare.totalFare * 0.90);
    const totalPrice = pricePerRide * totalRides;
    
    res.json({
      success: true,
      data: {
        pricePerRide,
        totalPrice,
        totalRides,
        standardTotal: standardFare.totalFare * totalRides,
        savings: (standardFare.totalFare * totalRides) - totalPrice
      }
    });
  } catch (error) {
    console.error('Estimate Pass Error:', error);
    res.status(500).json({ success: false, message: 'Failed to estimate commute pass' });
  }
};

exports.purchasePass = async (req, res) => {
  try {
    const { pickup, drop, vehicleType, totalRides, pricePerRide, totalPrice, isReturnTrip, pickupTime, returnTime } = req.body;
    
    // Validate pickup time is provided
    if (!pickupTime) {
      return res.status(400).json({ success: false, message: 'Pickup time is required for commute pass' });
    }
    if (isReturnTrip && !returnTime) {
      return res.status(400).json({ success: false, message: 'Return time is required for return trip pass' });
    }
    
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days
    
    const subscription = new Subscription({
      user: req.user.id,
      pickup: {
        address: pickup.address,
        location: { type: 'Point', coordinates: pickup.coordinates }
      },
      drop: {
        address: drop.address,
        location: { type: 'Point', coordinates: drop.coordinates }
      },
      vehicleType,
      isReturnTrip,
      pickupTime,
      returnTime: isReturnTrip ? returnTime : undefined,
      totalRides,
      pricePerRide,
      totalPrice,
      validUntil
    });
    
    await subscription.save();
    
    // Send confirmation notification
    const user = await User.findById(req.user.id);
    if (user && user.fcmToken) {
      const scheduleMsg = isReturnTrip
        ? `Pickup at ${pickupTime}, Return at ${returnTime}`
        : `Daily pickup at ${pickupTime}`;
      await sendNotification(user.fcmToken, {
        title: '✅ Commute Pass Activated',
        body: `Your ${totalRides}-ride commute pass is active! ${scheduleMsg}. Rides will be booked automatically.`,
        data: { type: 'subscription_purchased', subscriptionId: subscription._id.toString() }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Commute pass purchased successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Purchase Pass Error:', error);
    res.status(500).json({ success: false, message: 'Failed to purchase commute pass' });
  }
};

exports.getUserPasses = async (req, res) => {
  try {
    const passes = await Subscription.find({ 
      user: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: passes
    });
  } catch (error) {
    console.error('Get Passes Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch commute passes' });
  }
};

exports.customizePass = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, skipPickup, skipReturn, newPickupTime, newReturnTime } = req.body;

    const subscription = await Subscription.findOne({ _id: id, user: req.user.id });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (!subscription.exceptions) {
      subscription.exceptions = [];
    }

    // Check if an exception already exists for this date
    const existingIndex = subscription.exceptions.findIndex(e => e.date === date);

    const exceptionData = {
      date,
      skipPickup: !!skipPickup,
      skipReturn: !!skipReturn,
      newPickupTime,
      newReturnTime
    };

    if (existingIndex > -1) {
      subscription.exceptions[existingIndex] = exceptionData;
    } else {
      subscription.exceptions.push(exceptionData);
    }

    await subscription.save();

    // Send reschedule/customization confirmation notification
    const user = await User.findById(req.user.id);
    if (user && user.fcmToken) {
      let notifBody = '';
      if (skipPickup && skipReturn) {
        notifBody = `Both pickup and return rides have been skipped for ${date}.`;
      } else if (skipPickup) {
        notifBody = `Pickup ride has been skipped for ${date}.`;
      } else if (skipReturn) {
        notifBody = `Return ride has been skipped for ${date}.`;
      } else {
        const parts = [];
        if (newPickupTime) parts.push(`Pickup rescheduled to ${newPickupTime}`);
        if (newReturnTime) parts.push(`Return rescheduled to ${newReturnTime}`);
        if (parts.length > 0) {
          notifBody = `${parts.join('. ')} on ${date}. Your ride will be auto-booked at the new time.`;
        } else {
          notifBody = `Ride schedule updated for ${date}.`;
        }
      }

      await sendNotification(user.fcmToken, {
        title: '📅 Schedule Updated',
        body: notifBody,
        data: { type: 'subscription_customized', subscriptionId: subscription._id.toString(), date }
      });
    }

    res.json({
      success: true,
      message: 'Commute pass customized successfully for ' + date,
      data: subscription
    });
  } catch (error) {
    console.error('Customize Pass Error:', error);
    res.status(500).json({ success: false, message: 'Failed to customize commute pass' });
  }
};

