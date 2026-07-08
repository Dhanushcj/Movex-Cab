const Subscription = require('../models/Subscription');
const { getRouteDetails } = require('../services/routingService');
const { calculateFare } = require('../services/fareEngine');

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
    
    // In a real app, we would integrate payment gateway here
    
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
