const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be exactly 10 digits'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .isIn(['resident', 'staff', 'admin'])
    .withMessage('Invalid role'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Date of birth cannot be in the future');
      }
      const age = now.getFullYear() - date.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
  body('location.state')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('location.district')
    .notEmpty()
    .withMessage('District is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('District must be between 2 and 50 characters'),
  body('location.village')
    .notEmpty()
    .withMessage('Village is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Village must be between 2 and 50 characters'),
  validate
];

// Complaint validation
const validateComplaint = [
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters')
    .isIn(['Stray Dogs', 'Garbage', 'Roads', 'Water', 'Electricity', 'Other'])
    .withMessage('Invalid complaint category'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('location.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude (must be between -90 and 90)'),
  body('location.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude (must be between -180 and 180)'),
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  validate
];

// User update validation
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be exactly 10 digits'),
  body('role')
    .optional()
    .isIn(['resident', 'staff', 'admin'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['active', 'disabled'])
    .withMessage('Invalid status'),
  validate
];

// Login validation
const validateLogin = [
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be exactly 10 digits'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

module.exports = {
  validateRegistration,
  validateComplaint,
  validateUserUpdate,
  validateLogin,
  validate
};
