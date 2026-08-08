require('dotenv').config();
const admin = require('firebase-admin');
let privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
privateKey = privateKey.replace(/\\n/g, '\n');
try {
  admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  });
  console.log('Cert OK');
} catch(e) {
  console.error('Cert Error:', e);
}
