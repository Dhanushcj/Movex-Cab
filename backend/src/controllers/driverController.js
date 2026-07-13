const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const DriverFeeEngine = require('../services/FeeEngine');

/**
 * Update driver location (REST endpoint fallback)
 * PUT /api/drivers/location
 */
const updateLocation = async (req, res, next) => {
  const { latitude, longitude } = req.body;
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude] // [lng, lat]
          }
        }
      },
      { new: true }
    );

    res.json({ success: true, coordinates: driver.currentLocation.coordinates });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle driver online status
 * PUT /api/drivers/status
 */
const toggleStatus = async (req, res, next) => {
  const { isOnline } = req.body;
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const isGoingOnline = typeof req.body.isOnline === 'boolean' ? req.body.isOnline : !driver.isOnline;

    if (isGoingOnline) {
      const now = new Date();
      const docs = driver.documents || {};
      
      const isInsExpired = docs.insurance?.expiryDate && new Date(docs.insurance.expiryDate) < now;
      const isFcExpired = docs.fitnessCertificate?.expiryDate && new Date(docs.fitnessCertificate.expiryDate) < now;
      const isPermitExpired = docs.permit?.expiryDate && new Date(docs.permit.expiryDate) < now;
      
      if (isInsExpired || isFcExpired || isPermitExpired) {
        return res.status(400).json({
          success: false,
          message: 'One or more of your vehicle documents have expired. You must submit updated documents and wait for admin verification before going online.'
        });
      }

      // Check Fee Engine
      const vehicleType = driver.vehicle?.type || 'bike';
      const feeResult = await DriverFeeEngine.evaluateOnLogin(driver._id, vehicleType, driver.city || 'Chennai');
      if (feeResult.status === 'BLOCKED') {
        return res.status(402).json({
          success: false,
          message: feeResult.message
        });
      }
      // We attach feeResult message to response if needed, but for now just let them pass if not BLOCKED
    }

    if (typeof req.body.isOnline === 'boolean') {
      driver.isOnline = req.body.isOnline;
    } else {
      driver.isOnline = !driver.isOnline;
    }

    if (!driver.isOnline) {
      driver.isAvailable = false;
    } else {
      driver.isAvailable = true;
    }
    await driver.save();

    res.json({ success: true, isOnline: driver.isOnline });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver earnings statement
 * GET /api/drivers/earnings
 */
const getEarnings = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    // Summary of bookings done
    const completedRides = await Booking.find({
      driver: req.user.id,
      status: 'completed'
    }).populate('customer', 'name phone').sort({ completedAt: -1 });

    const cancelledRides = await Booking.find({
      driver: req.user.id,
      status: 'cancelled'
    }).populate('customer', 'name phone').sort({ cancelledAt: -1 });

    res.json({
      success: true,
      earnings: driver.earnings,
      walletBalance: driver.wallet?.balance || 0,
      completedRidesCount: completedRides.length,
      rides: completedRides,
      cancelledRides: cancelledRides
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload driver verification documents
 * POST /api/drivers/documents
 */
const uploadDocuments = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    // Mock document urls since actual files are processed by middleware
    // Usually files are populated in req.files
    const documentsUpdate = {};

    if (req.files) {
      if (req.files.drivingLicense) {
        documentsUpdate['documents.drivingLicense.url'] = `/uploads/${req.files.drivingLicense[0].filename}`;
        documentsUpdate['documents.drivingLicense.number'] = req.body.licenseNumber || '';
        documentsUpdate['documents.drivingLicense.verified'] = false;
      }
      if (req.files.vehicleRC) {
        documentsUpdate['documents.vehicleRC.url'] = `/uploads/${req.files.vehicleRC[0].filename}`;
        documentsUpdate['documents.vehicleRC.number'] = req.body.rcNumber || '';
        documentsUpdate['documents.vehicleRC.verified'] = false;
      }
      if (req.files.insurance) {
        documentsUpdate['documents.insurance.url'] = `/uploads/${req.files.insurance[0].filename}`;
        documentsUpdate['documents.insurance.number'] = req.body.insuranceNumber || '';
        documentsUpdate['documents.insurance.verified'] = false;
      }
    } else {
      // Stub URLs if files were not actually sent for test environments
      const stubPrefix = `http://localhost:${process.env.PORT || 5000}/uploads/stub-`;
      documentsUpdate['documents.drivingLicense'] = {
        url: `${stubPrefix}license.png`,
        number: req.body.licenseNumber || 'DL1420200012345',
        verified: false
      };
      documentsUpdate['documents.vehicleRC'] = {
        url: `${stubPrefix}rc.png`,
        number: req.body.rcNumber || 'RC-DL-3C-1234',
        verified: false
      };
      documentsUpdate['documents.insurance'] = {
        url: `${stubPrefix}insurance.png`,
        number: req.body.insuranceNumber || 'INS-987654321',
        verified: false
      };
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.user.id,
      { $set: documentsUpdate },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Documents updated. Admin verification is required.',
      documents: updatedDriver.documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby online drivers
 * GET /api/drivers/nearby?lng=...&lat=...&radius=...
 */
const getNearbyDrivers = async (req, res, next) => {
  const { lng, lat, radius = 2 } = req.query; // radius in km, default 2km

  if (!lng || !lat) {
    return res.status(400).json({ success: false, message: 'Longitude and Latitude are required' });
  }

  try {
    const radiusInRad = parseFloat(radius) / 6371; // Convert km to radians for MongoDB GeoJSON

    const nearbyDrivers = await Driver.find({
      approvalStatus: 'approved',
      isOnline: true,
      isAvailable: true,
      currentLocation: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRad]
        }
      }
    }).select('name vehicle currentLocation');

    res.json({ success: true, drivers: nearbyDrivers });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver wallet details
 * GET /api/drivers/wallet
 */
const getWalletDetails = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    // Compute tips from bookings
    const completedRides = await Booking.find({ driver: req.user.id, status: 'completed' });
    const totalTips = completedRides.reduce((sum, r) => sum + (r.tipAmount || 0), 0);

    // Compute weekly earnings
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weeklyRides = completedRides.filter(r => new Date(r.completedAt) >= lastWeek);
    const weeklyEarnings = weeklyRides.reduce((sum, r) => sum + (r.fare?.totalFare * 0.8 || 0), 0);

    // Compute weekly deductions
    const weeklyDeductions = weeklyRides
      .filter(r => r.paymentMethod === 'cash')
      .reduce((sum, r) => sum + (r.fare?.totalFare * 0.2 || 0), 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const DriverWallet = require('../models/DriverWallet');
    const driverWalletDoc = await DriverWallet.findOne({ driverId: req.user.id });

    res.json({
      success: true,
      walletBalance: driver.wallet?.balance || 0,
      availableLimit: Math.max(driver.wallet?.balance || 0, 0),
      feeStatus: driverWalletDoc?.feeStatus || 'ACTIVE',
      pendingFeeAmount: driverWalletDoc?.pendingFeeAmount || 0,
      graceStartedAt: driverWalletDoc?.graceStartedAt || null,
      totalTips,
      weeklyEarnings: weeklyEarnings.toFixed(0),
      weeklyDeductions: weeklyDeductions.toFixed(0),
      weekStart: weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      weekEnd: weekEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      recentTransactions: completedRides.slice(0, 10).map(r => ({
        id: r._id,
        fare: r.fare?.totalFare || 0,
        tip: r.tipAmount || 0,
        paymentMethod: r.paymentMethod,
        date: r.completedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add money to driver wallet
 * POST /api/drivers/wallet/add
 */
const addMoney = async (req, res, next) => {
  const { amount } = req.body;
  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    driver.wallet.balance += amount;

    // If balance is now positive, unblock the driver
    if (driver.wallet.balance >= 0 && !driver.isAvailable) {
      driver.isAvailable = true;
    }

    await driver.save();
    
    // Sync the balance to DriverWallet and resolve pending fees
    const DriverWallet = require('../models/DriverWallet');
    const driverWalletDoc = await DriverWallet.findOne({ driverId: req.user.id });
    if (driverWalletDoc) {
      driverWalletDoc.balance = driver.wallet.balance;
      
      // If we topped up enough to cover the pending fee, set status to ACTIVE
      if (driverWalletDoc.balance >= 0 && driverWalletDoc.feeStatus !== 'ACTIVE') {
        driverWalletDoc.feeStatus = 'ACTIVE';
        driverWalletDoc.pendingFeeAmount = 0;
        driverWalletDoc.graceStartedAt = null;
        // Optionally, we could record a FeeTransaction here to deduct the pending fee, 
        // but for now, the driver's positive balance will just allow the engine 
        // to deduct it automatically next time they go online!
      }
      await driverWalletDoc.save();
    }

    res.json({
      success: true,
      message: `₹${amount} added to wallet`,
      walletBalance: driver.wallet.balance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw from driver wallet
 * POST /api/drivers/wallet/withdraw
 */
const withdrawMoney = async (req, res, next) => {
  const { amount } = req.body;
  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (driver.wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    driver.wallet.balance -= amount;
    await driver.save();

    res.json({
      success: true,
      message: `₹${amount} withdrawn from wallet`,
      walletBalance: driver.wallet.balance
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Update driver profile
 * PUT /api/drivers/profile
 */
const updateProfile = async (req, res, next) => {
  const { name, phone, city, vehicleType, plate, bankName, accountNo, ifsc, oldPassword, newPassword } = req.body;
  try {
    const Driver = require('../models/Driver');
    const driver = await Driver.findById(req.user.id).select('+password');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (city) driver.address = city; // mapping city to address

    if (vehicleType || plate) {
      driver.vehicle = driver.vehicle || {};
      if (vehicleType) driver.vehicle.type = vehicleType;
      if (plate) driver.vehicle.plateNumber = plate;
    }

    if (bankName || accountNo || ifsc) {
      driver.bankDetails = driver.bankDetails || {};
      if (bankName) driver.bankDetails.bankName = bankName;
      if (accountNo) driver.bankDetails.accountNumber = accountNo;
      if (ifsc) driver.bankDetails.ifscCode = ifsc;
    }

    if (oldPassword && newPassword) {
      if (!driver.password) {
        return res.status(400).json({ success: false, message: 'No existing password.' });
      }
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(oldPassword, driver.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect old password' });
      }
      driver.password = newPassword;
    }

    await driver.save();
    driver.password = undefined;

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver settings
 * GET /api/drivers/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user.id).select('settings');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver.settings || { pushNotification: false, biometricLock: false } });
  } catch (error) {
    next(error);
  }
};

/**
 * Update driver settings (pushNotification, biometricLock)
 * PUT /api/drivers/settings
 */
const updateSettings = async (req, res, next) => {
  const { pushNotification, biometricLock } = req.body;
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (!driver.settings) {
      driver.settings = { pushNotification: false, biometricLock: false };
    }
    if (typeof pushNotification === 'boolean') driver.settings.pushNotification = pushNotification;
    if (typeof biometricLock === 'boolean') driver.settings.biometricLock = biometricLock;

    await driver.save();
    res.json({ success: true, data: driver.settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete driver account and clean up associated data
 * DELETE /api/drivers/me
 */
const deleteAccount = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    // Cancel any active bookings assigned to this driver
    await Booking.updateMany(
      { driver: driverId, status: { $in: ['accepted', 'arrived', 'in_progress'] } },
      { $set: { status: 'cancelled', cancelledBy: 'driver', cancelReason: 'Account deleted', driver: null } }
    );

    // Delete the driver
    await Driver.findByIdAndDelete(driverId);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver achievements
 * GET /api/drivers/achievements
 */
const getAchievements = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const completedRidesCount = await Booking.countDocuments({
      driver: req.user.id,
      status: 'completed'
    });

    const totalEarnings = driver.earnings || 0;
    const rating = driver.rating || 0;

    const achievements = [
      {
        id: 'first_trip',
        title: 'First Trip',
        description: 'Complete your first ride',
        icon: 'star',
        currentProgress: completedRidesCount,
        target: 1,
        unlocked: completedRidesCount >= 1
      },
      {
        id: 'road_warrior',
        title: 'Road Warrior',
        description: 'Complete 50 rides',
        icon: 'map',
        currentProgress: completedRidesCount,
        target: 50,
        unlocked: completedRidesCount >= 50
      },
      {
        id: 'centurion',
        title: 'Centurion',
        description: 'Complete 100 rides',
        icon: 'award',
        currentProgress: completedRidesCount,
        target: 100,
        unlocked: completedRidesCount >= 100
      },
      {
        id: 'top_rated',
        title: 'Top Rated',
        description: 'Maintain a 4.8+ rating',
        icon: 'thumbs-up',
        currentProgress: rating,
        target: 4.8,
        unlocked: rating >= 4.8 && completedRidesCount >= 10
      },
      {
        id: 'five_star',
        title: 'Five Star',
        description: 'Achieve a perfect 5.0 rating',
        icon: 'star-on',
        currentProgress: rating,
        target: 5.0,
        unlocked: rating === 5.0 && completedRidesCount >= 25
      },
      {
        id: 'hustler',
        title: 'Hustler',
        description: 'Earn over ₹10,000 total',
        icon: 'dollar-sign',
        currentProgress: totalEarnings,
        target: 10000,
        unlocked: totalEarnings >= 10000
      }
    ];

    res.json({
      success: true,
      achievements,
      stats: {
        completedRides: completedRidesCount,
        rating,
        totalEarnings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  updateLocation,
  toggleStatus,
  getEarnings,
  uploadDocuments,
  getNearbyDrivers,
  getWalletDetails,
  addMoney,
  withdrawMoney,
  getSettings,
  updateSettings,
  deleteAccount,
  getAchievements
};
