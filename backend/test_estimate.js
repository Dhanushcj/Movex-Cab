const mongoose = require('mongoose');
const { estimatePass } = require('./src/controllers/subscriptionController');
const { calculateFare } = require('./src/services/fareEngine');

// Mock request and response
const req = {
  body: {
    pickup: { address: 'Home', coordinates: [77.5946, 12.9716] }, // Bangalore
    drop: { address: 'Office', coordinates: [77.6101, 12.9352] }, // Koramangala
    vehicleType: 'mini',
    isReturnTrip: true
  },
  user: {
    id: new mongoose.Types.ObjectId().toString()
  }
};

const res = {
  json: (data) => console.log('SUCCESS:', data),
  status: (code) => {
    return {
      json: (data) => console.log(`ERROR ${code}:`, data)
    };
  }
};

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cab_app');
  console.log('Connected to DB');
  await estimatePass(req, res);
  process.exit(0);
}

run().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
