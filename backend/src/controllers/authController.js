const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../config/firebase');
const Driver = require('../models/Driver');
const { sendNotification } = require('../services/notificationService');

// Helper to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
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

    // Generate token
    const token = generateToken(person._id, role);

    res.json({
      success: true,
      token,
      user: person
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

    const token = generateToken(person._id, role || person.role || 'customer');

    const userResponse = person.toObject();
    userResponse.role = role || person.role || 'customer';

    res.json({
      success: true,
      token,
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
  const { name, phone, email, password, gender, address, vehicle, documents, fcmToken } = req.body;
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
      if (check.value) {
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
      vehicle,
      documents,
      fcmToken,
      approvalStatus: 'pending', // Default pending admin approval
      isActive: true
    });

    const token = generateToken(driver._id, 'driver');

    const userResponse = driver.toObject();
    userResponse.role = 'driver';

    res.status(201).json({
      success: true,
      message: 'Driver registration successful. Waiting for admin approval.',
      token,
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

    const token = generateToken(user._id, 'customer');

    const userResponse = user.toObject();
    userResponse.role = 'customer';

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
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
    let person = await Model.findOne({ $or: [{ firebaseUid: uid }, { email: email }] });
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
            approvalStatus: 'pending'
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
      // Update firebase UID if missing
      if (!person.firebaseUid) {
        person.firebaseUid = uid;
        await person.save();
      }
    }

    if (fcmToken) {
      person.fcmToken = fcmToken;
    }

    person.lastLogin = new Date();
    await person.save();

    const actualRole = (person.role === 'admin') ? 'admin' : (role || person.role || 'customer');
    
    // Generate our JWT token
    const token = generateToken(person._id, actualRole);

    const userData = person.toObject();
    userData.role = actualRole;

    res.json({
      success: true,
      token,
      user: userData
    });
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
  getMe
};
