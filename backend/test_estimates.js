const https = require('https');

const data = JSON.stringify({
  pickup: { coordinates: [78.2023921, 12.526968] },
  drop: { coordinates: [78.2023921, 12.526968] }
});

const options = {
  hostname: 'movex-cab.onrender.com',
  port: 443,
  path: '/api/bookings/estimates',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let resData = '';
  res.on('data', chunk => resData += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      console.log('Response:', JSON.parse(resData));
    } catch(e) {
      console.log('Raw:', resData);
    }
  });
});

req.write(data);
req.end();
