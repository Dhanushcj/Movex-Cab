const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\backend\\\\src\\\\controllers\\\\userController.js';

let content = fs.readFileSync(path, 'utf8');

// Update updateMe function
const oldUpdateMe = `const updateMe = async (req, res, next) => {
  const { name, email, avatar, emergencyContacts } = req.body;
  try {
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (avatar) fieldsToUpdate.avatar = avatar;
    if (emergencyContacts) fieldsToUpdate.emergencyContacts = emergencyContacts;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};`;

const newUpdateMe = `const updateMe = async (req, res, next) => {
  const { name, email, phone, avatar, emergencyContacts, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (emergencyContacts) user.emergencyContacts = emergencyContacts;

    // Handle password change
    if (oldPassword && newPassword) {
      if (!user.password) {
        return res.status(400).json({ success: false, message: 'No existing password. Please set one using reset flow or login with Google.' });
      }
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect old password' });
      }
      user.password = newPassword;
    }

    await user.save(); // This triggers the pre('save') hook to hash the new password
    user.password = undefined; // Don't send back in response

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};`;

if (content.includes('const updateMe = async')) {
  content = content.replace(oldUpdateMe, newUpdateMe);
  fs.writeFileSync(path, content, 'utf8');
  console.log('userController updated');
} else {
  console.log('Could not find updateMe in userController');
}
