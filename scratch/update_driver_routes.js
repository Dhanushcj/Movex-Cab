const fs = require('fs');
const pathDriverController = 'd:\\\\Cab Application\\\\backend\\\\src\\\\controllers\\\\driverController.js';
const pathDriverRoutes = 'd:\\\\Cab Application\\\\backend\\\\src\\\\routes\\\\driverRoutes.js';

let driverController = fs.readFileSync(pathDriverController, 'utf8');
let driverRoutes = fs.readFileSync(pathDriverRoutes, 'utf8');

const updateProfileFunc = `
/**
 * Update driver profile
 * PUT /api/drivers/profile
 */
const updateProfile = async (req, res, next) => {
  const { name, phone, city, vehicleType, plate, bankName, accountNo, ifsc, oldPassword, newPassword } = req.body;
  try {
    const Driver = require('../models/Driver');
    const driver = await Driver.findById(req.user.id).select('+password');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (city) driver.address = city; // mapping city to address

    if (vehicleType || plate) {
      driver.vehicle = driver.vehicle || {};
      if (vehicleType) driver.vehicle.type = vehicleType;
      if (plate) driver.vehicle.plateNumber = plate;
    }

    if (bankName || accountNo || ifsc) {
      driver.bankDetails = driver.bankDetails || {};
      if (bankName) driver.bankDetails.bankName = bankName;
      if (accountNo) driver.bankDetails.accountNumber = accountNo;
      if (ifsc) driver.bankDetails.ifscCode = ifsc;
    }

    if (oldPassword && newPassword) {
      if (!driver.password) {
        return res.status(400).json({ success: false, message: 'No existing password.' });
      }
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(oldPassword, driver.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect old password' });
      }
      driver.password = newPassword;
    }

    await driver.save();
    driver.password = undefined;

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};
`;

if (!driverController.includes('const updateProfile = async')) {
  // Append to exports
  driverController = driverController.replace(
    'module.exports = {',
    updateProfileFunc + '\nmodule.exports = {\n  updateProfile,'
  );
  fs.writeFileSync(pathDriverController, driverController, 'utf8');
  console.log('driverController updated');
}

if (!driverRoutes.includes('router.put(\'/profile\'')) {
  driverRoutes = driverRoutes.replace(
    `const {\n  updateLocation,`,
    `const {\n  updateProfile,\n  updateLocation,`
  );
  driverRoutes = driverRoutes.replace(
    `router.put('/location', updateLocation);`,
    `router.put('/profile', updateProfile);\nrouter.put('/location', updateLocation);`
  );
  fs.writeFileSync(pathDriverRoutes, driverRoutes, 'utf8');
  console.log('driverRoutes updated');
}
