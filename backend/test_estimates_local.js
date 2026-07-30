require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./src/models/Driver');
const FareConfig = require('./src/models/FareConfig');

const testEstimates = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const pickupLng = 78.2023921;
  const pickupLat = 12.526968;
  const radiusInKm = parseInt(process.env.DRIVER_SEARCH_RADIUS_KM || '10');
  const radiusInRad = radiusInKm / 6378.1;

  const vehicleTypes = ['any', 'bike', 'auto', 'mini', 'sedan', 'suv'];
  
  for (const type of vehicleTypes) {
    const query = {
      approvalStatus: 'approved',
      isOnline: true,
      isAvailable: true,
      currentLocation: {
        $geoWithin: {
          $centerSphere: [[pickupLng, pickupLat], radiusInRad]
        }
      }
    };
    if (type !== 'any') {
      query['vehicle.type'] = type;
    }

    console.log(`Querying for ${type}:`, JSON.stringify(query, null, 2));
    const nearestDrivers = await Driver.find(query).select('currentLocation vehicle').lean().limit(10);
    console.log(`Found ${nearestDrivers.length} drivers for type ${type}`);

    let nearestDriver = null;
    if (nearestDrivers.length > 0) {
      nearestDriver = nearestDrivers[0];
    }
    
    let available = false;
    if (nearestDriver && nearestDriver.currentLocation && nearestDriver.currentLocation.coordinates) {
      available = true;
    }

    console.log(`Result for ${type}: available=${available}\n`);
  }
  process.exit(0);
};

testEstimates().catch(console.error);
