const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickup: {
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    }
  },
  drop: {
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    }
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'mini', 'sedan', 'suv'],
    required: true
  },
  isReturnTrip: {
    type: Boolean,
    default: false
  },
  pickupTime: {
    type: String, // format "HH:MM" 24h
    required: true
  },
  returnTime: {
    type: String, // format "HH:MM" 24h
    required: function() { return this.isReturnTrip; }
  },
  totalRides: {
    type: Number,
    default: 20
  },
  ridesCompleted: {
    type: Number,
    default: 0
  },
  pricePerRide: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'exhausted', 'cancelled'],
    default: 'active'
  },
  exceptions: [{
    date: { type: String, required: true }, // Format YYYY-MM-DD
    skipPickup: { type: Boolean, default: false },
    skipReturn: { type: Boolean, default: false },
    newPickupTime: { type: String }, // format HH:MM
    newReturnTime: { type: String }  // format HH:MM
  }],
  // Days of the week when rides should be auto-booked (0=Sun, 1=Mon, ..., 6=Sat)
  scheduledDays: {
    type: [Number],
    default: [1, 2, 3, 4, 5, 6] // Mon-Sat by default
  },
  // Track dates where auto-booking was already attempted (prevents duplicates)
  lastBookedDates: [{
    date: { type: String, required: true },      // Format YYYY-MM-DD
    pickupBooked: { type: Boolean, default: false },
    returnBooked: { type: Boolean, default: false }
  }]
}, { timestamps: true });

subscriptionSchema.index({ 'pickup.location': '2dsphere' });
subscriptionSchema.index({ 'drop.location': '2dsphere' });

module.exports = mongoose.model('Subscription', subscriptionSchema);
