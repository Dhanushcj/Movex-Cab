const User = require('../models/User');
const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');

/**
 * Get profile of current user
 * GET /api/users/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile of current user
 * PUT /api/users/me
 */
const updateMe = async (req, res, next) => {
  const { name, email, phone, avatar, emergencyContacts, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (emergencyContacts) user.emergencyContacts = emergencyContacts;

    // Handle password change
    if (oldPassword && newPassword) {
      if (!user.password) {
        return res.status(400).json({ success: false, message: 'No existing password. Please set one using reset flow or login with Google.' });
      }
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect old password' });
      }
      user.password = newPassword;
    }

    await user.save(); // This triggers the pre('save') hook to hash the new password
    user.password = undefined; // Don't send back in response

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's booking history
 * GET /api/users/me/rides
 */
const getMyRides = async (req, res, next) => {
  try {
    const rides = await Booking.find({ customer: req.user.id })
      .populate('driver', 'name phone rating avatar vehicle')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    next(error);
  }
};

/**
 * Save/Update user addresses
 * PUT /api/users/me/saved-addresses
 */
const saveAddress = async (req, res, next) => {
  const { label, address, coordinates } = req.body; // coordinates: [lng, lat]
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if label already exists
    const addressIndex = user.savedAddresses.findIndex(addr => addr.label === label);

    const newAddressObj = {
      label,
      address,
      location: {
        type: 'Point',
        coordinates
      }
    };

    if (addressIndex > -1) {
      user.savedAddresses[addressIndex] = newAddressObj;
    } else {
      user.savedAddresses.push(newAddressObj);
    }

    await user.save();
    res.json({ success: true, data: user.savedAddresses });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user settings
 * GET /api/users/me/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.settings || { pushNotification: false, biometricLock: false } });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user settings (pushNotification, biometricLock)
 * PUT /api/users/me/settings
 */
const updateSettings = async (req, res, next) => {
  const { pushNotification, biometricLock } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.settings) {
      user.settings = { pushNotification: false, biometricLock: false };
    }
    if (typeof pushNotification === 'boolean') user.settings.pushNotification = pushNotification;
    if (typeof biometricLock === 'boolean') user.settings.biometricLock = biometricLock;

    await user.save();
    res.json({ success: true, data: user.settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account and clean up associated data
 * DELETE /api/users/me
 */
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Cancel any active/searching bookings
    await Booking.updateMany(
      { customer: userId, status: { $in: ['searching', 'requested', 'accepted', 'arrived'] } },
      { $set: { status: 'cancelled', cancelledBy: 'customer', cancelReason: 'Account deleted' } }
    );

    // Cancel active subscriptions
    try {
      await Subscription.updateMany(
        { user: userId, status: 'active' },
        { $set: { status: 'cancelled' } }
      );
    } catch (e) {
      // Subscription model may not exist — skip gracefully
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, getMyRides, saveAddress, getSettings, updateSettings, deleteAccount };
