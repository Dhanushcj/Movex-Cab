const mongoose = require('mongoose');
require('./src/models/User');
const Booking = require('./src/models/Booking');
const Driver = require('./src/models/Driver');

mongoose.connect('mongodb://127.0.0.1:27017/movex')
  .then(async () => {
    const booking = await Booking.findOne().sort({ createdAt: -1 });
    console.log('Latest booking:', booking._id, 'Vehicle:', booking.vehicleType);
    
    const [lng, lat] = booking.pickup.location.coordinates;
    const radius = 5/6371;
    
    const drivers = await Driver.find({
      approvalStatus: 'approved',
      isOnline: true,
      isAvailable: true,
      'vehicle.type': booking.vehicleType,
      currentLocation: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius]
        }
      }
    });
    
    console.log('Matching drivers:', drivers.map(d => d.name));
    
    const allDrivers = await Driver.find({});
    console.log('All drivers:', JSON.stringify(allDrivers.map(d => ({
      name: d.name,
      isOnline: d.isOnline,
      isAvailable: d.isAvailable,
      vehicleType: d.vehicle?.type,
      coords: d.currentLocation?.coordinates,
      approvalStatus: d.approvalStatus
    })), null, 2));
    
    // Also check socket online drivers if possible by hitting redis or anything? We don't have redis, we use in-memory.
    process.exit(0);
  })
  .catch(console.error);
