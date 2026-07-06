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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdBanner', adBannerSchema);
