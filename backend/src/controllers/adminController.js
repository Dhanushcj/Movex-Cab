const Driver = require('../models/Driver');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const FareConfig = require('../models/FareConfig');
const Offer = require('../models/Offer');
const Complaint = require('../models/Complaint');
const Payout = require('../models/Payout');

/**
 * Get core Admin Dashboard stats & KPIs
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalEarnings = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, commission: { $sum: '$commission' } } }
    ]);

    const activeBookingsCount = await Booking.countDocuments({
      status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
    });

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalDrivers = await Driver.countDocuments({});
    const approvedDrivers = await Driver.countDocuments({ approvalStatus: 'approved' });
    const pendingDrivers = await Driver.countDocuments({ approvalStatus: 'pending' });

    const totalBookings = await Booking.countDocuments({});
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    res.json({
      success: true,
      data: {
        revenue: {
          total: totalEarnings[0] ? totalEarnings[0].total : 0,
          commission: totalEarnings[0] ? totalEarnings[0].commission : 0
        },
        users: {
          customers: totalCustomers,
          drivers: totalDrivers,
          approvedDrivers,
          pendingDrivers
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          active: activeBookingsCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage drivers - list and approve/reject
 * GET /api/admin/drivers
 * PUT /api/admin/drivers/:id
 */
const getDrivers = async (req, res, next) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search) {
      query.phone = { $regex: search, $options: 'i' };
    }
    const drivers = await Driver.find(query).sort({ createdAt: -1 }).lean();
    
    // Aggregate stats for each driver
    for (let driver of drivers) {
      const completedRides = await Booking.find({ driver: driver._id, status: 'completed' })
        .sort({ completedAt: -1 })
        .select('pickup dropoff fare distance completedAt');
        
      driver.tripsCompleted = completedRides.length;
      driver.lastTrip = completedRides.length > 0 ? completedRides[0] : null;
    }

    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    next(error);
  }
};

const updateDriverStatus = async (req, res, next) => {
  const { approvalStatus, rejectionReason, correctionFields, isBlocked } = req.body;
  try {
    const updateObj = {};
    if (approvalStatus) updateObj.approvalStatus = approvalStatus;
    if (rejectionReason) updateObj.rejectionReason = rejectionReason;
    if (correctionFields) updateObj.correctionFields = correctionFields;
    if (isBlocked !== undefined) updateObj.isBlocked = isBlocked;

    // If approved, make verified: true on docs for convenience
    if (approvalStatus === 'approved') {
      updateObj['documents.drivingLicense.verified'] = true;
      updateObj['documents.vehicleRC.verified'] = true;
      updateObj['documents.insurance.verified'] = true;
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $set: updateObj },
      { new: true }
    );

    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Customers - list and block/unblock
 * GET /api/admin/customers
 * PUT /api/admin/customers/:id
 */
const getCustomers = async (req, res, next) => {
  const { search } = req.query;
  try {
    let query = { role: 'customer' };
    if (search) {
      query.phone = { $regex: search, $options: 'i' };
    }
    const customers = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};

const getCustomerHistory = async (req, res, next) => {
  try {
    const history = await Booking.find({ customer: req.params.id })
      .populate('driver', 'name phone vehicle.plateNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

const updateCustomerStatus = async (req, res, next) => {
  const { isBlocked } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBlocked } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage bookings
 * GET /api/admin/bookings
 */
const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name phone')
      .populate('driver', 'name phone plateNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Vehicles
 * GET /api/admin/vehicles
 */
const getVehicles = async (req, res, next) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search) {
      query['vehicle.plateNumber'] = { $regex: search, $options: 'i' };
    }
    const driversWithVehicles = await Driver.find(query)
      .select('name phone vehicle documents.insurance documents.fitnessCertificate documents.permit approvalStatus isOnline')
      .lean();
    
    // Map to a list of vehicles with owner context
    const vehicles = driversWithVehicles.map(d => ({
      driverId: d._id,
      driverName: d.name,
      driverPhone: d.phone,
      approvalStatus: d.approvalStatus,
      isOnline: d.isOnline,
      ...d.vehicle,
      insuranceExpiry: d.documents?.insurance?.expiryDate,
      fcExpiry: d.documents?.fitnessCertificate?.expiryDate,
      permitExpiry: d.documents?.permit?.expiryDate
    })).filter(v => v.plateNumber); // Only return those that have vehicles

    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Fare Pricing Configs
 * PUT /api/admin/fares/:id
 */
const updateFareConfig = async (req, res, next) => {
  try {
    const config = await FareConfig.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' });
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Offers
 * POST /api/admin/offers
 * GET /api/admin/offers
 */
const createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

const getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Complaints
 * GET /api/admin/complaints
 * PUT /api/admin/complaints/:id
 */
const getComplaints = async (req, res, next) => {
  try {
    const tickets = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  const { status, resolution } = req.body;
  try {
    const ticket = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          resolution,
          resolvedAt: status === 'resolved' || status === 'closed' ? new Date() : null
        }
      },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const getPayouts = async (req, res, next) => {
  try {
    const payouts = await Payout.find()
      .populate('driver', 'name phone bankDetails')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payouts.length, data: payouts });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('booking', 'pickup dropoff status fare distance')
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

const getMapData = async (req, res, next) => {
  try {
    // Get online drivers and active bookings
    const onlineDrivers = await Driver.find({ isOnline: true })
      .select('name phone currentLocation vehicle status isOnline')
      .lean();
    
    const activeBookings = await Booking.find({
      status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'arrived', 'in_progress'] }
    })
      .populate('driver', 'name phone')
      .populate('customer', 'name phone')
      .select('pickup dropoff status driver customer')
      .lean();

    res.json({ 
      success: true, 
      data: {
        onlineDrivers: onlineDrivers.map(d => ({
          ...d,
          location: d.currentLocation
        })),
        activeBookings
      } 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDrivers,
  updateDriverStatus,
  getCustomers,
  getCustomerHistory,
  updateCustomerStatus,
  getBookings,
  getVehicles,
  updateFareConfig,
  createOffer,
  getOffers,
  getComplaints,
  updateComplaint,
  getPayouts,
  getPayments,
  getMapData
};
