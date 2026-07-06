const Joi = require('joi');

const registerUserSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  phone: Joi.string().required().pattern(/^[0-9]{10}$/),
  email: Joi.string().email().optional().allow(''),
  password: Joi.string().required().min(6),
  dob: Joi.string().optional().allow(''),
  gender: Joi.string().optional().allow(''),
  fcmToken: Joi.string().optional()
});

const loginUserSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().required(),
  role: Joi.string().valid('customer', 'driver', 'admin').optional()
}).or('phone', 'email');

const verifyOtpSchema = Joi.object({
  phone: Joi.string().required().pattern(/^[0-9]{10}$/),
  otp: Joi.string().required().length(4),
  role: Joi.string().valid('customer', 'driver').default('customer')
});

const sendOtpSchema = Joi.object({
  phone: Joi.string().required().pattern(/^[0-9]{10}$/),
  role: Joi.string().valid('customer', 'driver').default('customer')
});

const registerDriverSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  phone: Joi.string().required().pattern(/^[0-9]{10}$/),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  address: Joi.string().optional(),
  vehicle: Joi.object({
    type: Joi.string().valid('bike', 'auto', 'mini', 'sedan', 'suv').required(),
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(2000).max(new Date().getFullYear()).optional(),
    plateNumber: Joi.string().required(),
    plateType: Joi.string().valid('white', 'yellow').optional(),
    color: Joi.string().required(),
    capacity: Joi.number().integer().min(1).max(10).optional()
  }).required(),
  documents: Joi.object().optional().unknown(true),
  fcmToken: Joi.string().optional()
});

const resubmitDriverSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().required().pattern(/^[0-9]{10}$/),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  address: Joi.string().optional(),
  vehicle: Joi.object().optional().unknown(true),
  documents: Joi.object().optional().unknown(true)
});

const bookingRequestSchema = Joi.object({
  pickup: Joi.object({
    address: Joi.string().required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required() // [lng, lat]
  }).required(),
  drop: Joi.object({
    address: Joi.string().required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required() // [lng, lat]
  }).required(),
  vehicleType: Joi.string().valid('bike', 'auto', 'mini', 'sedan', 'suv').required(),
  paymentMethod: Joi.string().valid('cash', 'upi', 'qr', 'card', 'wallet').default('cash'),
  promoCode: Joi.string().optional().allow('')
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  verifyOtpSchema,
  sendOtpSchema,
  registerDriverSchema,
  resubmitDriverSchema,
  bookingRequestSchema
};
