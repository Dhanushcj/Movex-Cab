const mongoose = require('mongoose');
require('dotenv').config();
const Route = require('./src/models/Route');
const Junction = require('./src/models/Junction');

const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/movex-cab';

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

const routesData = [
  {
    name: 'Red Line (Central to Airport)',
    junctions: [
      { name: 'Central Bus Stand', coordinates: [78.6795, 10.8050] },
      { name: 'TVS Tollgate', coordinates: [78.6942, 10.7925] },
      { name: 'Pudukkottai Road Jn', coordinates: [78.7100, 10.7800] },
      { name: 'Trichy Airport', coordinates: [78.7186, 10.7656] }
    ]
  },
  {
    name: 'Blue Line (Chatram to NIT)',
    junctions: [
      { name: 'Chatram Bus Stand', coordinates: [78.6881, 10.8288] },
      { name: 'Main Guard Gate', coordinates: [78.6975, 10.8290] },
      { name: 'Thillai Nagar', coordinates: [78.6820, 10.8190] },
      { name: 'BHEL Training Centre', coordinates: [78.7613, 10.7681] },
      { name: 'NIT Trichy', coordinates: [78.8132, 10.7615] }
    ]
  },
  {
    name: 'Green Line (Srirangam to Central)',
    junctions: [
      { name: 'Srirangam Temple', coordinates: [78.6896, 10.8624] },
      { name: 'Amma Mandapam', coordinates: [78.6830, 10.8520] },
      { name: 'Cauvery Bridge', coordinates: [78.6920, 10.8400] },
      { name: 'Central Bus Stand', coordinates: [78.6795, 10.8050] }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB');

    await Route.deleteMany({});
    await Junction.deleteMany({});
    console.log('Cleared existing routes and junctions');

    for (let r of routesData) {
      let junctionIds = [];
      let routeCoords = []; // array of [lat, lng] for polyline

      for (let j of r.junctions) {
        const createdJunc = await Junction.create({
          name: j.name,
          location: {
            type: 'Point',
            coordinates: j.coordinates // [lng, lat]
          }
        });
        junctionIds.push(createdJunc._id);
        // Note: polyline encoder expects [lat, lng]
        routeCoords.push([j.coordinates[1], j.coordinates[0]]);
      }

      // Generate a basic polyline connecting the junctions directly
      // In a real app, this would follow roads using Google Directions API
      const polyline = encodePolyline(routeCoords);

      await Route.create({
        name: r.name,
        junctions: junctionIds,
        polyline: polyline,
        isActive: true
      });
      console.log(`Created route: ${r.name}`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
