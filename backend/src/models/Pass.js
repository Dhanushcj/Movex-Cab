const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  name: {
    type: String, // e.g. 'Silver', 'Gold', 'Diamond'
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number, // e.g. 5, 10, 15
    default: 0
  },
  validityDays: {
    type: Number, // e.g. 30
    default: 30
  },
  benefits: {
    priorityBooking: { type: Boolean, default: false },
    freeCancellations: { type: Number, default: 0 }, // -1 for unlimited
    freeWaitTimeMinutes: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Pass', passSchema);
