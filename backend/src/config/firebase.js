const admin = require('firebase-admin');
const path = require('path');

try {
  let credential;
  
  // First try to load from environment variables (useful for Render/production)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
    console.log('Firebase Admin Initialized successfully with Environment Variables.');
  } else {
    // Fallback to serviceAccountKey.json
    const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
    credential = admin.credential.cert(serviceAccount);
    console.log('Firebase Admin Initialized successfully with Service Account Key.');
  }

  admin.initializeApp({ credential });
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase Admin Initialization Error:', error.message);
    console.warn('Authentication will fail without proper Firebase credentials configured.');
  }
}

module.exports = admin;
