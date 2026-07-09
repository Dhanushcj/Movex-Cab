const mongoose = require('mongoose');
require('./src/models/User');
const Driver = require('./src/models/Driver');

mongoose.connect('mongodb://127.0.0.1:27017/movex')
  .then(async () => {
    await Driver.updateMany({ isOnline: true }, { isAvailable: true });
    console.log('Reset driver availability');
    process.exit(0);
  })
  .catch(console.error);
