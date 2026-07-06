const express = require('express');
const router = express.Router();
const PlatformSettings = require('../models/PlatformSettings');
const AdBanner = require('../models/AdBanner');
const NotificationMessage = require('../models/NotificationMessage');

router.get('/settings', async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
});

router.get('/banners', async (req, res, next) => {
  try {
    const { targetAudience } = req.query; // 'customer' or 'driver'
    const query = { isActive: true };
    
    if (targetAudience) {
      query.$or = [
        { targetAudience: targetAudience },
        { targetAudience: 'both' }
      ];
    }
    
    const banners = await AdBanner.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
});

router.get('/notifications', async (req, res, next) => {
  try {
    const { targetAudience } = req.query;
    const query = { isActive: true };
    
    if (targetAudience) {
      query.$or = [
        { targetAudience: targetAudience },
        { targetAudience: 'both' }
      ];
    }
    
    const notifications = await NotificationMessage.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

module.exports = router;
