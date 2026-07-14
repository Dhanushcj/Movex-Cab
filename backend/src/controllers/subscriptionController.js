const Pass = require('../models/Pass');
const UserPass = require('../models/UserPass');
const User = require('../models/User');

exports.getAvailablePasses = async (req, res) => {
  try {
    const passes = await Pass.find({ isActive: true });
    res.json({ success: true, data: passes });
  } catch (error) {
    console.error('Get Passes Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch passes' });
  }
};

exports.purchasePass = async (req, res) => {
  try {
    const { passId } = req.body;
    
    const pass = await Pass.findById(passId);
    if (!pass || !pass.isActive) {
      return res.status(404).json({ success: false, message: 'Pass not found or inactive' });
    }

    // Check if user already has an active pass
    const activePass = await UserPass.findOne({
      user: req.user.id,
      status: 'active',
      validUntil: { $gt: new Date() }
    });

    if (activePass) {
      return res.status(400).json({ success: false, message: 'You already have an active pass' });
    }

    // Create UserPass
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + pass.validityDays);
    
    const userPass = new UserPass({
      user: req.user.id,
      pass: pass._id,
      validUntil
    });
    
    await userPass.save();
    
    res.status(201).json({
      success: true,
      message: `${pass.name} pass purchased successfully!`,
      data: userPass
    });
  } catch (error) {
    console.error('Purchase Pass Error:', error);
    res.status(500).json({ success: false, message: 'Failed to purchase pass' });
  }
};

exports.getMyPass = async (req, res) => {
  try {
    const userPass = await UserPass.findOne({ 
      user: req.user.id,
      status: 'active',
      validUntil: { $gt: new Date() }
    }).populate('pass');
    
    res.json({
      success: true,
      data: userPass || null
    });
  } catch (error) {
    console.error('Get My Pass Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your pass' });
  }
};
