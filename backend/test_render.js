const https = require('https');

const lng = 78.2023921;
const lat = 12.526968;
const url = `https://movex-cab.onrender.com/api/drivers/nearby?lng=${lng}&lat=${lat}&radius=10`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    } catch(e) {
      console.log('Response string:', data);
    }
  });
}).on('error', (e) => {
  console.error(e);
});
