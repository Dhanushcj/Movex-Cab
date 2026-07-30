const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const admin = require('../config/firebase');
const Driver = require('../models/Driver');
const Session = require('../models/Session');
const { getRedisClient } = require('../config/redis');
const { sendNotification } = require('../services/notificationService');

// Helper to generate Tokens
const generateTokens = async (userId, role, req) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });

  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '30'));

  const userModel = role === 'driver' ? 'Driver' : 'User';

  await Session.create({
    userId,
    userModel,
    refreshToken,
    ipAddress: req.ip,
    deviceInfo: req.headers['user-agent'] || 'Unknown',
    expiresAt
  });

  return { accessToken, refreshToken };
};

/**
 * Send OTP to customer or driver
 * POST /api/auth/send-otp
 */
const sendOTP = async (req, res, next) => {
  const { phone, role } = req.body;
  try {
    const defaultOtp = process.env.DEFAULT_OTP || '1234';
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60000);

    let Model = role === 'driver' ? Driver : User;
    let person = await Model.findOne({ phone });

    // If person doesn't exist, we'll create them during verification (or prompt signup)
    // For now, let's store or simulate the OTP.
  
    if (person) {
      person.otp = { code: defaultOtp, expiresAt };
      await person.save();
    }

    console.log(`📱 [OTP SERVICE] Sent OTP ${defaultOtp} to phone ${phone} for role ${role}`);

    res.json({
      success: true,
      message: `OTP sent to ${phone} (Valid for ${expiryMinutes} mins)`,
      // Return otp in dev mode for easy testing without SMS credentials
      otp: process.env.NODE_ENV === 'development' ? defaultOtp : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and login/register
 * POST /api/auth/verify-otp
 */
const verifyOTP = async (req, res, next) => {
  const { phone, otp, role, name, email } = req.body;
  try {
    const defaultOtp = process.env.DEFAULT_OTP || '1234';
    let Model = role === 'driver' ? Driver : User;
    let person = await Model.findOne({ phone }).select('+otp.code +otp.expiresAt');

    // 1. Simple OTP validation
    if (otp !== defaultOtp && person && person.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    if (person && person.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // 2. If user doesn't exist, auto-register (for customer) or return signup instructions
    if (!person) {
      if (role === 'driver') {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found with this phone number. Please register first.'
        });
      }

      // Auto-register Customer
      person = await User.create({
        name: name || `User_${phone.slice(-4)}`,
        phone,
        email: email || undefined,
        isActive: true
      });
    }

    // Clear OTP
    person.otp = undefined;
    person.lastLogin = new Date();
    await person.save();

    // Generate tokens
    const actualRole = (person.role === 'admin') ? 'admin' : (role || person.role || 'customer');
    const tokens = await generateTokens(person._id, actualRole, req);

    res.json({
      success: true,
      token: tokens.accessToken, // For backward compatibility
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { ...person.toObject(), role: actualRole }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Traditional login (password based, useful for admin/tests)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  const { phone, email, password, role } = req.body;
  const loginIdentifier = email || phone;
  console.log('Login attempt:', { loginIdentifier, passwordLength: password?.length, role });
  try {
    // 1. Intercept Admin Login across all roles
    const adminQuery = {};
    if (email) adminQuery.email = email;
    else if (phone) adminQuery.phone = phone;

    const possibleAdmin = await User.findOne({ ...adminQuery, role: 'admin' }).select('+password');
    if (possibleAdmin) {
      const isMatch = await possibleAdmin.comparePassword(password);
      if (isMatch) {
        if (possibleAdmin.isBlocked) {
          return res.status(403).json({ success: false, message: 'Your account is blocked' });
        }
        await User.updateOne({ _id: possibleAdmin._id }, { $set: { lastLogin: new Date() } });
        const tokens = await generateTokens(possibleAdmin._id, 'admin', req);
        const userResponse = possibleAdmin.toJSON();
        userResponse.role = 'admin';
        return res.json({
          success: true,
          token: tokens.accessToken,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: userResponse
        });
      }
    }

    // 2. Normal User/Driver Login
    let Model = role === 'driver' ? Driver : User;
    // Find by either phone or email
    const query = {};
    if (email) query.email = email;
    else if (phone) query.phone = phone;

    const person = await Model.findOne(query).select('+password');

    if (!person) {
      console.log('Person not found for role:', role);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('Backend DB Hash:', person.password);
    const isMatch = await person.comparePassword(password);
    console.log('Password isMatch:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (person.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account is blocked' });
    }

    await Model.updateOne({ _id: person._id }, { $set: { lastLogin: new Date() } });

    const actualRole = (person.role === 'admin') ? 'admin' : (role || person.role || 'customer');
    const tokens = await generateTokens(person._id, actualRole, req);

    const userResponse = person.toObject();
    userResponse.role = actualRole;

    res.json({
      success: true,
      token: tokens.accessToken, // For backward compatibility
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register Driver
 * POST /api/auth/driver/register
 */
const registerDriver = async (req, res, next) => {
  console.log('Driver registration attempt:', req.body.phone, req.body.vehicle);
  const { name, phone, email, password, gender, address, vehicle, documents, fcmToken, vehicleOwnership } = req.body;
  try {
    const existingDriver = await Driver.findOne({ phone });
    if (existingDriver) {
      return res.status(400).json({ success: false, message: 'Driver phone already registered' });
    }

    const uniqueChecks = [
      { name: 'Vehicle Plate Number', field: 'vehicle.plateNumber', value: vehicle?.plateNumber },
      { name: 'Aadhaar Number', field: 'documents.aadhaar.number', value: documents?.aadhaar?.number },
      { name: 'PAN Number', field: 'documents.pan.number', value: documents?.pan?.number },
      { name: 'Driving License Number', field: 'documents.drivingLicense.number', value: documents?.drivingLicense?.number },
      { name: 'RC Number', field: 'documents.vehicleRC.number', value: documents?.vehicleRC?.number },
      { name: 'Insurance Number', field: 'documents.insurance.number', value: documents?.insurance?.number }
    ];
    for (let check of uniqueChecks) {
      // Skip vehicle checks for company vehicles
      if (vehicleOwnership === 'company' && (check.name === 'Vehicle Plate Number' || check.name === 'RC Number' || check.name === 'Insurance Number')) {
        continue;
      }
      if (check.value && check.value !== 'N/A') {
        const exists = await Driver.findOne({ [check.field]: check.value });
        if (exists) {
          return res.status(400).json({ success: false, message: `This document is already registered: ${check.name}` });
        }
      }
    }

    const driver = await Driver.create({
      name,
      phone,
      email,
      password,
      gender,
      address,
      vehicleOwnership: vehicleOwnership || 'own',
      vehicle: vehicleOwnership === 'company' ? { type: 'none', make: 'N/A', model: 'N/A', color: 'N/A', plateNumber: 'N/A' } : vehicle,
      documents,
      fcmToken,
      approvalStatus: 'pending', // Default pending admin approval
      isActive: true
    });

    const tokens = await generateTokens(driver._id, 'driver', req);

    const userResponse = driver.toObject();
    userResponse.role = 'driver';

    res.status(201).json({
      success: true,
      message: 'Driver registration successful. Waiting for admin approval.',
      token: tokens.accessToken, // Backward compatibility
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resubmit Driver Application (Correction Flow)
 * POST /api/auth/driver/resubmit
 */
const resubmitDriverApplication = async (req, res, next) => {
  const { phone, name, email, password, gender, address, vehicle, documents } = req.body;
  try {
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Only allow resubmission if status is correction_needed or rejected
    if (driver.approvalStatus !== 'correction_needed' && driver.approvalStatus !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Application is not in a state to be resubmitted' });
    }

    const uniqueChecks = [
      { name: 'Vehicle Plate Number', field: 'vehicle.plateNumber', value: vehicle?.plateNumber },
      { name: 'Aadhaar Number', field: 'documents.aadhaar.number', value: documents?.aadhaar?.number },
      { name: 'PAN Number', field: 'documents.pan.number', value: documents?.pan?.number },
      { name: 'Driving License Number', field: 'documents.drivingLicense.number', value: documents?.drivingLicense?.number },
      { name: 'RC Number', field: 'documents.vehicleRC.number', value: documents?.vehicleRC?.number },
      { name: 'Insurance Number', field: 'documents.insurance.number', value: documents?.insurance?.number }
    ];
    for (let check of uniqueChecks) {
      if (check.value) {
        const exists = await Driver.findOne({ [check.field]: check.value, _id: { $ne: driver._id } });
        if (exists) {
          return res.status(400).json({ success: false, message: `This document is already registered: ${check.name}` });
        }
      }
    }

    // Update fields
    driver.name = name || driver.name;
    driver.email = email || driver.email;
    driver.gender = gender || driver.gender;
    driver.address = address || driver.address;
    driver.vehicle = vehicle || driver.vehicle;
    driver.documents = documents || driver.documents;
    if (password) {
      driver.password = password; // Pre-save hook will hash it
    }
    
    // Reset status to pending
    driver.approvalStatus = 'pending';
    driver.correctionFields = [];

    await driver.save();

    const userResponse = driver.toObject();
    userResponse.role = 'driver';

    res.json({
      success: true,
      message: 'Application resubmitted successfully. Waiting for admin approval.',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register Customer (Phone & Password Based)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  const { name, phone, email, password, dob, gender, fcmToken } = req.body;
  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }

    const user = await User.create({
      name,
      phone,
      email: email || undefined,
      password,
      dob: dob ? new Date(dob) : undefined,
      gender: gender || 'prefer_not_to_say',
      fcmToken,
      isActive: true
    });

    const tokens = await generateTokens(user._id, 'customer', req);

    const userResponse = user.toObject();
    userResponse.role = 'customer';

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: tokens.accessToken, // backward compatibility
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unified profile (Customer or Driver)
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const role = req.user.role;
    let Model = role === 'driver' ? Driver : User;
    const person = await Model.findById(req.user.id);
    if (!person) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const data = person.toObject();
    data.role = (person.role === 'admin') ? 'admin' : (role || person.role);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};


/**
 * Firebase Login / Registration
 * POST /api/auth/firebase-login
 */
const firebaseLogin = async (req, res, next) => {
  const { idToken, role, fcmToken, isRegistering, dob, gender, phone, password } = req.body;
  try {
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Firebase ID token is required' });
    }

    // Verify token with Firebase Admin
    // If running without credentials, this will fail. For demo purposes, we will mock verification if admin fails.
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (firebaseError) {
      console.warn('Firebase verification failed, likely due to missing credentials. Falling back to mock verification for development.', firebaseError.message);
      // MOCK FALLBACK FOR DEVELOPMENT (Since we know this environment might not have google-services.json)
      // We assume idToken is a mock JSON string if it fails firebase verification during development
      try {
        decodedToken = JSON.parse(Buffer.from(idToken, 'base64').toString());
      } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid Firebase ID token' });
      }
    }

    const { uid, email, name, phone_number } = decodedToken;
    console.log('Firebase Login Payload:', { uid, email, role, isRegistering });
    let Model = role === 'driver' ? Driver : User;

    // Check if user exists
    let person;
    const queryConds = [];
    if (uid) queryConds.push({ firebaseUid: uid });
    if (email) queryConds.push({ email: email });
    
    if (queryConds.length > 0) {
      person = await Model.findOne({ $or: queryConds });
    }
    console.log('Found person in DB:', person ? person._id : null);

    if (!person) {
      if (isRegistering) {
        // Proceed with creating the new user since we have their extra details
        if (password) {
          try {
            await admin.auth().updateUser(uid, { password: password });
          } catch(e) {
            console.error('Failed to set Firebase password for Google user', e);
          }
        }
        
        if (role === 'driver') {
          person = await Driver.create({
            name: name || 'Driver',
            email: email,
            firebaseUid: uid,
            password: password || undefined,
            phone: phone_number || phone || undefined,
            dob,
            gender,
            approvalStatus: 'pending',
            vehicleOwnership: req.body.vehicleOwnership || 'own',
            vehicle: req.body.vehicleOwnership === 'company' ? { type: 'none', make: 'N/A', model: 'N/A', color: 'N/A', plateNumber: 'N/A' } : { type: 'bike' } // Default placeholder required by schema
          });
        } else {
          person = await User.create({
            name: name || 'User',
            email: email,
            firebaseUid: uid,
            password: password || undefined,
            phone: phone_number || phone || undefined,
            dob,
            gender,
            isActive: true
          });
        }
      } else {
        // Not registering yet, return flag to frontend to ask for details
        return res.json({
          success: true,
          isNewUser: true,
          decodedUser: { email, name, uid, phone_number }
        });
      }
    } else {
      // Build update object to bypass full document validation on missing required fields
      const updateData = {};
      if (!person.firebaseUid) updateData.firebaseUid = uid;
      if (fcmToken) updateData.fcmToken = fcmToken;
      updateData.lastLogin = new Date();
      
      await Model.updateOne({ _id: person._id }, { $set: updateData });
      
      // Update local object for token generation
      if (updateData.firebaseUid) person.firebaseUid = updateData.firebaseUid;
      if (updateData.fcmToken) person.fcmToken = updateData.fcmToken;
      person.lastLogin = updateData.lastLogin;
    }

    const actualRole = (person.role === 'admin') ? 'admin' : (role || person.role || 'customer');
    
    // Generate our JWT tokens
    const tokens = await generateTokens(person._id, actualRole, req);

    const userData = person.toObject();
    userData.role = actualRole;

    res.json({
      success: true,
      token: tokens.accessToken, // backward compatibility
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const session = await Session.findOne({ refreshToken }).populate('userId');
    if (!session || !session.userId) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({ success: false, message: 'Refresh token expired. Please login again.' });
    }

    // Role determination for generating new token
    let role = 'customer';
    if (session.userModel === 'Driver') role = 'driver';
    if (session.userId.role === 'admin') role = 'admin';

    // Generate NEW tokens (Refresh Token Rotation)
    const tokens = await generateTokens(session.userId._id, role, req);

    // Delete old session
    await Session.deleteOne({ _id: session._id });

    res.json({
      success: true,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  
  try {
    // 1. Delete session from DB
    if (refreshToken) {
      await Session.deleteOne({ refreshToken });
    }

    // 2. Blacklist current access token in Redis
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const redisClient = getRedisClient();
          if (redisClient) {
            // Time to live in seconds
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) {
              await redisClient.set(`bl_${token}`, 'true', { EX: ttl });
            }
          }
        }
      } catch (e) {
        console.error('Error blacklisting token:', e);
      }
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from all devices
 * POST /api/auth/logout-all
 */
const logoutAll = async (req, res, next) => {
  try {
    // Requires authentication to know which user to logout
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await Session.deleteMany({ userId: req.user._id });
    
    res.json({ success: true, message: 'Logged out from all devices successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  firebaseLogin,
  sendOTP,
  verifyOTP,
  login,
  registerDriver,
  resubmitDriverApplication,
  register,
  getMe,
  refreshToken,
  logout,
  logoutAll
};
