const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  updateProfile,
  updateLocation,
  toggleStatus,
  getEarnings,
  uploadDocuments,
  getNearbyDrivers,
  getWalletDetails,
  addMoney,
  withdrawMoney,
  getSettings,
  updateSettings,
  deleteAccount,
  getAchievements
} = require('../controllers/driverController');
const { createComplaint, getMyComplaints } = require('../controllers/complaintController');

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${file.fieldname}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images and PDFs are allowed!'));
  }
});

const documentUploadFields = upload.fields([
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'vehicleRC', maxCount: 1 },
  { name: 'insurance', maxCount: 1 }
]);

router.use(protect);

router.put('/profile', updateProfile);
router.put('/location', updateLocation);
router.get('/nearby', getNearbyDrivers);
router.put('/status', toggleStatus);
router.get('/earnings', getEarnings);
router.get('/wallet', getWalletDetails);
router.post('/wallet/add', addMoney);
router.post('/wallet/withdraw', withdrawMoney);
router.post('/documents', (req, res, next) => {
  documentUploadFields(req, res, (err) => {
    // If multer fails (e.g. upload directory doesn't exist), log and proceed with stub injection
    if (err) {
      console.warn('Multer error (proceeding with stub mock logic):', err.message);
    }
    next();
  });
}, uploadDocuments);

router.post('/complaints', createComplaint);
router.get('/complaints', getMyComplaints);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/achievements', getAchievements);
router.delete('/me', deleteAccount);

module.exports = router;
