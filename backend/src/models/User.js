const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
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
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  otp: {
    code: { type: String, select: false },
    expiresAt: { type: Date, select: false }
  },
  savedAddresses: [{
    label: { type: String, enum: ['home', 'work', 'other'] },
    address: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  }],
  wallet: {
    balance: { type: Number, default: 0, min: 0 }
  },
  fcmToken: {
    type: String,
    default: null
  },
  emergencyContacts: [{
    name: String,
    phone: String
  }],
  settings: {
    pushNotification: { type: Boolean, default: false },
    biometricLock: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  totalRides: {
    type: Number,
    default: 0
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Index for geospatial queries on saved addresses
userSchema.index({ 'savedAddresses.location': '2dsphere' });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
