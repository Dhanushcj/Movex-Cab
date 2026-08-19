const mongoose = require('mongoose');

const junctionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

junctionSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Junction', junctionSchema);
