const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\backend\\\\src\\\\controllers\\\\authController.js';

let content = fs.readFileSync(path, 'utf8');

const targetStr = `const firebaseLogin = async (req, res, next) => {
  const { idToken, role, fcmToken, isRegistering, dob, gender, phone } = req.body;`;

const replacementStr = `const firebaseLogin = async (req, res, next) => {
  const { idToken, role, fcmToken, isRegistering, dob, gender, phone, password } = req.body;`;

content = content.replace(targetStr, replacementStr);

const targetDriverCreate = `        if (role === 'driver') {
          person = await Driver.create({
            name: name || 'Driver',
            email: email,
            firebaseUid: uid,
            phone: phone_number || phone || undefined,
            dob,
            gender,
            approvalStatus: 'pending'
          });
        } else {
          person = await User.create({
            name: name || 'User',
            email: email,
            firebaseUid: uid,
            phone: phone_number || phone || undefined,
            dob,
            gender,
            isActive: true
          });
        }`;

const replacementDriverCreate = `        if (password) {
          try {
            await admin.auth().updateUser(uid, { password: password });
          } catch(e) {
            console.error('Failed to set Firebase password for Google user', e);
          }
        }
        
        if (role === 'driver') {
          person = await Driver.create({
            name: name || 'Driver',
            email: email,
            firebaseUid: uid,
            password: password || undefined,
            phone: phone_number || phone || undefined,
            dob,
            gender,
            approvalStatus: 'pending'
          });
        } else {
          person = await User.create({
            name: name || 'User',
            email: email,
            firebaseUid: uid,
            password: password || undefined,
            phone: phone_number || phone || undefined,
            dob,
            gender,
            isActive: true
          });
        }`;

content = content.replace(targetDriverCreate, replacementDriverCreate);

fs.writeFileSync(path, content, 'utf8');
console.log('authController updated for google password link');
