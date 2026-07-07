const mongoose = require('mongoose');

const adBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
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
  isActive: {
    type: Boolean,
    default: true
  },
  linkUrl: {
    type: String
  },
  position: {
    type: String,
    enum: ['banner1', 'banner2'],
    default: 'banner1'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdBanner', adBannerSchema);
