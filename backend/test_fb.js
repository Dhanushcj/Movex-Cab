require('dotenv').config();
const admin = require('firebase-admin');
let privateKey = process.env.FIREBASE_PRIVATE_KEY_BASE64 
  ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8')
  : process.env.FIREBASE_PRIVATE_KEY;
console.log('Firebase Private Key Base64 Length:', process.env.FIREBASE_PRIVATE_KEY_BASE64 ? process.env.FIREBASE_PRIVATE_KEY_BASE64.length : 'none');
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
}
privateKey = privateKey.replace(/\\n/g, '\n');
console.log('Final Private Key Starts With:', privateKey.substring(0, 50));
try {
  const credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  });
  console.log('Credential object created successfully');
} catch (e) {
  console.error('Error:', e.message);
}
