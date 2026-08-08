require('dotenv').config();
const admin = require('firebase-admin');
let privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
privateKey = privateKey.replace(/\\n/g, '\n');
console.log(privateKey);
