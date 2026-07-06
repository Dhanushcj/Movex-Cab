const admin = require('firebase-admin');
const path = require('path');

try {
  // We resolve the path to the root of the backend folder
  const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin Initialized successfully with Service Account Key.');
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase Admin Initialization Error:', error.message);
    console.warn('Authentication will fail without proper Firebase credentials configured.');
  }
}

module.exports = admin;
