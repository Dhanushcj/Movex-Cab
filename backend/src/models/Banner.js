const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['customer', 'driver', 'both'],
    default: 'both'
  },
  position: {
    type: String,
    enum: ['banner1', 'banner2'],
    default: 'banner1'
  },
  linkUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
