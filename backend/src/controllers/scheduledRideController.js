const ScheduledRide = require('../models/ScheduledRide');
const MonthlySchedule = require('../models/MonthlySchedule');

// Calculate distance using haversine or simple straight line for estimated fare
const calculateEstimatedFare = (vehicleType, numberOfRides) => {
  // Mock fare calculation based on vehicle type
  const baseFares = { bike: 50, auto: 80, mini: 150, sedan: 200, suv: 250 };
  const singleRideFare = baseFares[vehicleType] || 150;
  return singleRideFare * numberOfRides;
};

exports.createOneTimeRide = async (req, res) => {
  try {
    const { pickup, drop, vehicleType, scheduledDate, scheduledTime, estimatedFare, tripType, returnTime } = req.body;
    
    // Combine date and time for precise cron matching
    // assuming scheduledDate is YYYY-MM-DD and scheduledTime is HH:mm
    const pickupDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    
    if (pickupDateTime <= new Date()) {
      return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
    }

    const rides = [];
    const ride = new ScheduledRide({
      customer: req.user.id,
      pickup,
      drop,
      vehicleType,
      pickupDateTime,
      estimatedFare
    });
    await ride.save();
    rides.push(ride);

    if (tripType === 'round' && returnTime) {
      const returnDateTime = new Date(`${scheduledDate}T${returnTime}:00`);
      if (returnDateTime > pickupDateTime) {
        const returnRide = new ScheduledRide({
          customer: req.user.id,
          pickup: drop, // Swapped
          drop: pickup, // Swapped
          vehicleType,
          pickupDateTime: returnDateTime,
          estimatedFare
        });
        await returnRide.save();
        rides.push(returnRide);
      }
    }

    res.status(201).json({ success: true, data: rides });
  } catch (error) {
    console.error('Create one-time ride error:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule ride' });
  }
};

exports.createMonthlySchedule = async (req, res) => {
  try {
    const { pickup, drop, vehicleType, repeatDay, scheduledTime, startMonth, numberOfMonths, tripType, returnTime } = req.body;
    
    // 1. Calculate fares
    const totalRides = tripType === 'round' ? numberOfMonths * 2 : numberOfMonths;
    const estimatedFarePerRide = calculateEstimatedFare(vehicleType, 1);
    const totalEstimatedFare = estimatedFarePerRide * totalRides;
    
    // 10% discount
    const discountAmount = totalEstimatedFare * 0.10;
    const finalAmount = totalEstimatedFare - discountAmount;

    // 2. Create the MonthlySchedule parent object
    const schedule = new MonthlySchedule({
      customer: req.user.id,
      pickup,
      drop,
      vehicleType,
      repeatDay,
      scheduledTime,
      startMonth: new Date(startMonth),
      numberOfMonths,
      totalEstimatedFare,
      discountAmount,
      finalAmount,
      paymentStatus: 'paid' // Assuming payment is processed before this route or marked paid for now
    });

    await schedule.save();

    // 3. Generate individual ScheduledRide entries
    const createdRides = [];
    const startDt = new Date(startMonth);
    
    for (let i = 0; i < numberOfMonths; i++) {
      // Calculate next month
      let targetMonth = startDt.getMonth() + i;
      let targetYear = startDt.getFullYear();
      if (targetMonth > 11) {
        targetYear += Math.floor(targetMonth / 12);
        targetMonth = targetMonth % 12;
      }
      
      const rideDateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(repeatDay).padStart(2, '0')}`;
      const pickupDateTime = new Date(`${rideDateStr}T${scheduledTime}:00`);

      const ride = new ScheduledRide({
        customer: req.user.id,
        scheduleId: schedule._id,
        pickup,
        drop,
        vehicleType,
        pickupDateTime,
        estimatedFare: estimatedFarePerRide
      });
      await ride.save();
      createdRides.push(ride);

      if (tripType === 'round' && returnTime) {
        const returnDateTime = new Date(`${rideDateStr}T${returnTime}:00`);
        if (returnDateTime > pickupDateTime) {
          const returnRide = new ScheduledRide({
            customer: req.user.id,
            scheduleId: schedule._id,
            pickup: drop, // Swapped
            drop: pickup, // Swapped
            vehicleType,
            pickupDateTime: returnDateTime,
            estimatedFare: estimatedFarePerRide
          });
          await returnRide.save();
          createdRides.push(returnRide);
        }
      }
    }

    res.status(201).json({ 
      success: true, 
      data: { schedule, rides: createdRides }
    });

  } catch (error) {
    console.error('Create monthly schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to create monthly schedule' });
  }
};

exports.getUserScheduledRides = async (req, res) => {
  try {
    const rides = await ScheduledRide.find({ customer: req.user.id }).sort({ pickupDateTime: 1 });
    res.status(200).json({ success: true, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch scheduled rides' });
  }
};

exports.cancelScheduledRide = async (req, res) => {
  try {
    let query = { customer: req.user.id };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = req.params.id;
    } else {
      query.rideId = req.params.id;
    }
    const ride = await ScheduledRide.findOne(query);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status === 'cancelled') {
      return res.json({ success: true, message: 'Ride is already cancelled' });
    }

    if (!['scheduled', 'searching', 'driver_assigned', 'assignment_failed'].includes(ride.status)) {
      return res.status(400).json({ success: false, message: 'Only upcoming scheduled rides can be cancelled' });
    }

    // 24 hour refund logic check
    const now = new Date();
    const hoursDifference = (ride.pickupDateTime - now) / (1000 * 60 * 60);
    let refundIssued = false;
    if (hoursDifference >= 24) {
      refundIssued = true;
      // In reality, process refund API here
    }

    ride.status = 'cancelled';
    await ride.save();

    res.status(200).json({ 
      success: true, 
      message: refundIssued ? 'Ride cancelled and refunded' : 'Ride cancelled (No refund, < 24h)',
      refundIssued
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel ride' });
  }
};
