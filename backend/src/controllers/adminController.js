const Driver = require('../models/Driver');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const FareConfig = require('../models/FareConfig');
const Offer = require('../models/Offer');
const Complaint = require('../models/Complaint');
const Payout = require('../models/Payout');
const { sendMulticastNotification } = require('../services/notificationService');

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

    // Aggregate Vehicle Distribution
    const vehicleDistAgg = await Driver.aggregate([
      { $match: { 'vehicle.type': { $exists: true } } },
      { $group: { _id: '$vehicle.type', count: { $sum: 1 } } }
    ]);
    const vehicleDistribution = vehicleDistAgg.map(v => ({
      name: v._id.charAt(0).toUpperCase() + v._id.slice(1),
      count: v.count
    }));

    // Aggregate Revenue Data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const revenueAgg = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          Revenue: { $sum: "$amount" },
          Commission: { $sum: "$commission" }
        }
      }
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      const found = revenueAgg.find(r => r._id === dateStr);
      revenueData.push({
        name: dayName,
        Revenue: found ? found.Revenue : 0,
        Commission: found ? found.Commission : 0
      });
    }

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
        },
        chartData: {
          vehicleDistribution,
          revenueData
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
  const { approvalStatus, rejectionReason, correctionFields, isBlocked, employeeId, vehicle, documents } = req.body;
  try {
    const updateObj = {};
    if (approvalStatus) updateObj.approvalStatus = approvalStatus;
    if (rejectionReason) updateObj.rejectionReason = rejectionReason;
    if (correctionFields) updateObj.correctionFields = correctionFields;
    if (isBlocked !== undefined) updateObj.isBlocked = isBlocked;
    
    // Explicit updates for nested vehicle/docs from the admin
    if (vehicle) updateObj.vehicle = vehicle;
    
    if (documents) {
      if (documents.profilePhoto) {
        if (documents.profilePhoto.url) updateObj['documents.profilePhoto.url'] = documents.profilePhoto.url;
      }
      if (documents.drivingLicense) {
        if (documents.drivingLicense.expiryDate) updateObj['documents.drivingLicense.expiryDate'] = documents.drivingLicense.expiryDate;
        if (documents.drivingLicense.number !== undefined) updateObj['documents.drivingLicense.number'] = documents.drivingLicense.number;
        if (documents.drivingLicense.url) updateObj['documents.drivingLicense.url'] = documents.drivingLicense.url;
      }
      if (documents.vehicleRC) {
        if (documents.vehicleRC.expiryDate) updateObj['documents.vehicleRC.expiryDate'] = documents.vehicleRC.expiryDate;
        if (documents.vehicleRC.number !== undefined) updateObj['documents.vehicleRC.number'] = documents.vehicleRC.number;
        if (documents.vehicleRC.url) updateObj['documents.vehicleRC.url'] = documents.vehicleRC.url;
      }
      if (documents.insurance) {
        if (documents.insurance.expiryDate) updateObj['documents.insurance.expiryDate'] = documents.insurance.expiryDate;
        if (documents.insurance.number !== undefined) updateObj['documents.insurance.number'] = documents.insurance.number;
        if (documents.insurance.url) updateObj['documents.insurance.url'] = documents.insurance.url;
      }
      if (documents.permit) {
        if (documents.permit.expiryDate) updateObj['documents.permit.expiryDate'] = documents.permit.expiryDate;
        if (documents.permit.number !== undefined) updateObj['documents.permit.number'] = documents.permit.number;
        if (documents.permit.url) updateObj['documents.permit.url'] = documents.permit.url;
      }
      if (documents.fitnessCertificate) {
        if (documents.fitnessCertificate.expiryDate) updateObj['documents.fitnessCertificate.expiryDate'] = documents.fitnessCertificate.expiryDate;
        if (documents.fitnessCertificate.number !== undefined) updateObj['documents.fitnessCertificate.number'] = documents.fitnessCertificate.number;
        if (documents.fitnessCertificate.url) updateObj['documents.fitnessCertificate.url'] = documents.fitnessCertificate.url;
      }
    }

    // Auto-generate employee ID if approved and not set
    if (approvalStatus === 'approved') {
      if (!employeeId) {
        const driver = await Driver.findById(req.params.id);
        if (!driver.employeeId) {
          // generate sequential DRV-XXXX
          const lastDriver = await Driver.findOne({ employeeId: { $exists: true } }).sort({ employeeId: -1 });
          let nextIdNumber = 1001;
          if (lastDriver && lastDriver.employeeId && lastDriver.employeeId.startsWith('DRV-')) {
            const num = parseInt(lastDriver.employeeId.split('-')[1]);
            if (!isNaN(num)) nextIdNumber = num + 1;
          }
          updateObj.employeeId = `DRV-${nextIdNumber}`;
        }
      }
      // If approved, make verified: true on docs for convenience
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

const PlatformSettings = require('../models/PlatformSettings');
const AdBanner = require('../models/AdBanner');
const NotificationMessage = require('../models/NotificationMessage');

// Settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

const updateSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// Fares
const getFares = async (req, res, next) => {
  try {
    const fares = await FareConfig.find();
    res.json({ success: true, data: fares });
  } catch (err) { next(err); }
};

const createFare = async (req, res, next) => {
  try {
    const fare = await FareConfig.create(req.body);
    res.json({ success: true, data: fare });
  } catch (err) { next(err); }
};

const deleteFare = async (req, res, next) => {
  try {
    await FareConfig.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// Banners
const getBanners = async (req, res, next) => {
  try {
    const banners = await AdBanner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
};

const createBanner = async (req, res, next) => {
  try {
    const banner = await AdBanner.create(req.body);
    res.json({ success: true, data: banner });
  } catch (err) { next(err); }
};

const updateBanner = async (req, res, next) => {
  try {
    const banner = await AdBanner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: banner });
  } catch (err) { next(err); }
};

const deleteBanner = async (req, res, next) => {
  try {
    await AdBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// Notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await NotificationMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
};

const createNotification = async (req, res, next) => {
  try {
    const notification = await NotificationMessage.create(req.body);
    
    // Trigger Push Notification
    let tokens = [];
    if (notification.targetAudience === 'customer' || notification.targetAudience === 'both') {
      const customers = await User.find({ fcmToken: { $exists: true, $ne: null, $ne: '' } }).select('fcmToken');
      tokens = tokens.concat(customers.map(c => c.fcmToken));
    }
    if (notification.targetAudience === 'driver' || notification.targetAudience === 'both') {
      const drivers = await Driver.find({ fcmToken: { $exists: true, $ne: null, $ne: '' } }).select('fcmToken');
      tokens = tokens.concat(drivers.map(d => d.fcmToken));
    }
    
    if (tokens.length > 0) {
      await sendMulticastNotification(tokens, {
        title: notification.title,
        body: notification.message,
        data: { type: 'admin_notification', id: notification._id.toString() }
      });
    }

    res.json({ success: true, data: notification });
  } catch (err) { next(err); }
};

const updateNotification = async (req, res, next) => {
  try {
    const notification = await NotificationMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: notification });
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await NotificationMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

const seedFeeTiers = async (req, res, next) => {
  try {
    const FeeTier = require('../models/FeeTier');
    
    // Clear existing
    await FeeTier.deleteMany({});
    
    const defaultTiers = [
      { vehicleType: 'bike', city: 'Chennai', feeModel: 'commission', commissionPercent: 12 },
      { vehicleType: 'auto', city: 'Chennai', feeModel: 'daily_fixed', dailyFeeMin: 9, dailyFeeMax: 29, graceHours: 12 },
      { vehicleType: 'cab', city: 'Chennai', feeModel: 'monthly_threshold', monthlyFeeAmount: 500, monthlyEarningsThreshold: 10000, graceHours: 48 },
      { vehicleType: 'mini', city: 'Chennai', feeModel: 'monthly_threshold', monthlyFeeAmount: 500, monthlyEarningsThreshold: 10000, graceHours: 48 },
      { vehicleType: 'sedan', city: 'Chennai', feeModel: 'monthly_threshold', monthlyFeeAmount: 500, monthlyEarningsThreshold: 10000, graceHours: 48 },
      { vehicleType: 'suv', city: 'Chennai', feeModel: 'monthly_threshold', monthlyFeeAmount: 500, monthlyEarningsThreshold: 10000, graceHours: 48 },
    ];
    
    await FeeTier.insertMany(defaultTiers);
    
    res.json({ success: true, message: 'Fee tiers seeded successfully', data: defaultTiers });
  } catch (err) { next(err); }
};

const getPasses = async (req, res) => {
  try {
    const passes = await require('../models/Pass').find({});
    res.json({ success: true, data: passes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch passes' });
  }
};

const updatePass = async (req, res) => {
  try {
    const updated = await require('../models/Pass').findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Pass not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update pass' });
  }
};

/**
 * Get System Alerts for Admin (Pending Drivers, Support Tickets, Expiring Documents)
 * GET /api/admin/alerts
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = [];

    // 1. Pending Driver Applications
    const pendingDrivers = await Driver.find({ approvalStatus: 'pending' }).select('name createdAt');
    pendingDrivers.forEach(driver => {
      alerts.push({
        id: `pending_${driver._id}`,
        type: 'application',
        title: `New driver application`,
        description: `Driver ${driver.name} is waiting for approval.`,
        date: driver.createdAt,
        link: '/drivers',
        icon: 'UserPlus',
        color: 'blue'
      });
    });

    // 2. Open Support Tickets (Complaints)
    const openTickets = await Complaint.find({ status: 'open' }).select('subject createdAt userType');
    openTickets.forEach(ticket => {
      alerts.push({
        id: `ticket_${ticket._id}`,
        type: 'support',
        title: `New support ticket`,
        description: ticket.subject,
        date: ticket.createdAt,
        link: '/complaints',
        icon: 'AlertCircle',
        color: 'rose'
      });
    });

    // 3. Expiring Documents
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    // Find drivers whose documents expire soon
    const driversWithExpiringDocs = await Driver.find({
      approvalStatus: 'approved',
      $or: [
        { 'documents.drivingLicense.expiryDate': { $lt: thirtyDaysFromNow, $gt: new Date() } },
        { 'documents.vehicleRC.expiryDate': { $lt: thirtyDaysFromNow, $gt: new Date() } },
        { 'documents.insurance.expiryDate': { $lt: thirtyDaysFromNow, $gt: new Date() } },
        { 'documents.permit.expiryDate': { $lt: thirtyDaysFromNow, $gt: new Date() } },
        { 'documents.fitnessCertificate.expiryDate': { $lt: thirtyDaysFromNow, $gt: new Date() } },
        { 'documents.taxReceipt.expiryDate': { $lt: thirtyDaysFromNow, $gt: new Date() } }
      ]
    }).select('name documents');

    driversWithExpiringDocs.forEach(driver => {
      alerts.push({
        id: `doc_${driver._id}`,
        type: 'document',
        title: `Documents expiring soon`,
        description: `Driver ${driver.name} has documents expiring within 30 days.`,
        date: new Date(),
        link: '/drivers',
        icon: 'FileWarning',
        color: 'amber'
      });
    });

    // Sort by date descending (newest first)
    alerts.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getFares,
  createFare,
  deleteFare,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
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
  getMapData,
  seedFeeTiers,
  getPasses,
  updatePass,
  getAlerts
};
