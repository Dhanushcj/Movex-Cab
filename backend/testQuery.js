const mongoose = require('mongoose'); 
require('dotenv').config(); 
mongoose.connect(process.env.MONGODB_URI).then(async () => { 
  const Driver = require('./src/models/Driver'); 
  const pickupLng = 78.2024267; 
  const pickupLat = 12.5268412; 
  const radiusInRad = 5 / 6371; 
  const query = { 
    approvalStatus: 'approved', 
    currentLocation: { 
      $geoWithin: { 
        $centerSphere: [[pickupLng, pickupLat], radiusInRad] 
      } 
    } 
  }; 
  console.log('Query:', JSON.stringify(query)); 
  const drivers = await Driver.find(query); 
  console.log('Found:', drivers.length); 
  process.exit(0); 
});
