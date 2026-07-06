const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Driver = require('./src/models/Driver');

mongoose.connect('mongodb://localhost:27017/movex')
  .then(async () => {
    try {
      let driver = await Driver.findOne({ phone: '1212121212' });
      if (!driver) {
        console.log('Driver not found.');
        process.exit(1);
      }
      
      const newPasswordHash = await bcrypt.hash('password123', 12);
      await Driver.updateOne({ _id: driver._id }, { $set: { password: newPasswordHash } });
      
      console.log('Password reset successfully to password123');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
