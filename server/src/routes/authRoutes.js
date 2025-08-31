const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, getMe, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('phone').isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  body('role').isIn(['resident', 'staff', 'admin']).withMessage('Role must be resident, staff, or admin'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be a 6-digit number')
];

const validateLogin = [
  body('phone').isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('password').optional().isLength({ min: 1 }).withMessage('Password is required if not using OTP'),
  body('otp').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be a 6-digit number')
];

// @desc    Register user with OTP verification
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  await register(req, res);
});

// @desc    Login user with OTP or password
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  await login(req, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, refreshToken);

module.exports = router;