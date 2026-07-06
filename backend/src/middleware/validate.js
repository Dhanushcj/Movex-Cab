const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    console.error('Validation failed:', errors);
    return res.status(400).json({ success: false, errors, message: errors.join(', ') });
  }
  next();
};

module.exports = validate;
