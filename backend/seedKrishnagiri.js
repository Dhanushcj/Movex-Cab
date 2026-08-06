const mongoose = require('mongoose');
require('dotenv').config();
const Route = require('./src/models/Route');
const Junction = require('./src/models/Junction');

const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/movex-cab';

// Helper to encode array of [lat, lng] to polyline string
function encodePolyline(coordinates) {
  let result = '';
  let prevLat = 0;
  let prevLng = 0;

  for (let i = 0; i < coordinates.length; i++) {
    let lat = Math.round(coordinates[i][0] * 1e5);
    let lng = Math.round(coordinates[i][1] * 1e5);

    let dLat = lat - prevLat;
    let dLng = lng - prevLng;

    prevLat = lat;
    prevLng = lng;

    result += encodeValue(dLat) + encodeValue(dLng);
  }
  return result;
}

function encodeValue(value) {
  value = value < 0 ? ~(value << 1) : value << 1;
  let result = '';
  while (value >= 0x20) {
    result += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
    value >>= 5;
  }
  result += String.fromCharCode(value + 63);
  return result;
}

const krishnagiriBargurRoute = {
  name: 'Krishnagiri - Bargur',
  junctions: [
    { name: 'Krishnagiri New Bus Stand', coordinates: [78.2195, 12.5273] },
    { name: 'Toll Gate', coordinates: [78.2589, 12.5401] },
    { name: 'Orappam', coordinates: [78.3090, 12.5520] },
    { name: 'Bargur Bus Stand', coordinates: [78.3610, 12.5510] }
  ]
};

async function seed() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB');

    // Just add the new route, keep existing ones
    
    // Delete if already exists to avoid duplicate key error on junction names
    await Route.deleteMany({ name: 'Krishnagiri - Bargur' });
    for (let j of krishnagiriBargurRoute.junctions) {
      await Junction.deleteMany({ name: j.name });
    }

    let junctionIds = [];
    let routeCoords = [];

    for (let j of krishnagiriBargurRoute.junctions) {
      const createdJunc = await Junction.create({
        name: j.name,
        location: {
          type: 'Point',
          coordinates: j.coordinates // [lng, lat]
        }
      });
      junctionIds.push(createdJunc._id);
      routeCoords.push([j.coordinates[1], j.coordinates[0]]); // [lat, lng]
    }

    const polyline = encodePolyline(routeCoords);

    await Route.create({
      name: krishnagiriBargurRoute.name,
      junctions: junctionIds,
      polyline: polyline,
      isActive: true
    });
    console.log(`Created route: ${krishnagiriBargurRoute.name}`);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
