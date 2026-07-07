const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    type: String,
    trim: true
  },
  countryCode: {
    type: String,
    default: '+91'
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  password: {
    type: String,
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  otp: {
    code: { type: String, select: false },
    expiresAt: { type: Date, select: false }
  },
  // Documents
  documents: {
    drivingLicense: {
      url: String,
      number: String,
      expiryDate: Date,
      type: { type: String, enum: ['MCWG', 'MCW0G', 'LMV & Above'] },
      verified: { type: Boolean, default: false }
    },
    vehicleRC: {
      url: String,
      number: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    insurance: {
      url: String,
      number: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    profilePhoto: {
      url: String,
      verified: { type: Boolean, default: false }
    },
    aadhaar: {
      url: String,
      number: String,
      verified: { type: Boolean, default: false }
    },
    pan: {
      url: String,
      number: String,
      verified: { type: Boolean, default: false }
    },
    permit: {
      url: String,
      number: String,
      type: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    fitnessCertificate: {
      url: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    taxReceipt: {
      url: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    }
  },
  // Vehicle info
  vehicle: {
    type: {
      type: String,
      enum: ['bike', 'auto', 'mini', 'sedan', 'suv'],
      required: true
    },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: Number,
    plateNumber: { type: String, trim: true, uppercase: true },
    plateType: { type: String, enum: ['white', 'yellow'], default: 'white' },
    color: { type: String, trim: true },
    capacity: { type: Number, default: 4 }
  },
  // Status
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended', 'correction_needed'],
    default: 'pending'
  },
  rejectionReason: String,
  correctionFields: [{ type: String }],
  isOnline: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Current location (GeoJSON)
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  // Earnings and Virtual Wallet
  earnings: {
    total: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  wallet: {
    balance: { type: Number, default: 0 }
  },
  // Stats
  rating: {
    average: { type: Number, default: 5.0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalRides: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 100
  },
  // FCM
  fcmToken: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  lastOnline: Date
}, {
  timestamps: true
});

// Geospatial index for nearby driver queries
driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ phone: 1 });
driverSchema.index({ approvalStatus: 1, isOnline: 1, isAvailable: 1 });
driverSchema.index({ 'vehicle.type': 1 });

// Hash password before save
driverSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
driverSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update rating
driverSchema.methods.updateRating = function(newRating) {
  const totalRatings = this.rating.count;
  const currentAvg = this.rating.average;
  this.rating.average = ((currentAvg * totalRatings) + newRating) / (totalRatings + 1);
  this.rating.count = totalRatings + 1;
};

// Remove sensitive fields
driverSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Driver', driverSchema);
