const express = require('express');
const { body, validationResult } = require('express-validator');
const OTPService = require('../services/otpService');
const User = require('../models/User');

const router = express.Router();

// Validation middleware
const validatePhone = body('phone')
  .isMobilePhone('any')
  .withMessage('Please provide a valid phone number');

const validateEmail = body('email')
  .optional()
  .isEmail()
  .withMessage('Please provide a valid email address');

const validateOTP = body('otp')
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be a 6-digit number');

// @desc    Send OTP for registration
// @route   POST /api/otp/send-registration
// @access  Public
router.post('/send-registration', [
  validatePhone,
  validateEmail
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Check rate limit
    const canSendOTP = await OTPService.checkRateLimit(phone, email, 'registration');
    if (!canSendOTP) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait 15 minutes before trying again.'
      });
    }

    // Create OTP
    const otpRecord = await OTPService.createOTP(phone, email, 'registration');

    // Send OTP via SMS
    const smsResult = await OTPService.sendOTPViaSMS(phone, otpRecord.otp, 'registration');

    // Send OTP via Email if provided
    let emailResult = null;
    if (email) {
      emailResult = await OTPService.sendOTPViaEmail(email, otpRecord.otp, 'registration');
    }

    console.log(`📱 Registration OTP sent to ${phone}${email ? ` and ${email}` : ''}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        email: email || null,
        smsSent: smsResult.success,
        emailSent: emailResult?.success || false,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('🚨 Error sending registration OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// @desc    Send OTP for login
// @route   POST /api/otp/send-login
// @access  Public
router.post('/send-login', [
  validatePhone,
  validateEmail
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, email } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Check rate limit
    const canSendOTP = await OTPService.checkRateLimit(phone, email, 'login');
    if (!canSendOTP) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait 15 minutes before trying again.'
      });
    }

    // Create OTP
    const otpRecord = await OTPService.createOTP(phone, email, 'login');

    // Send OTP via SMS
    const smsResult = await OTPService.sendOTPViaSMS(phone, otpRecord.otp, 'login');

    // Send OTP via Email if provided
    let emailResult = null;
    if (email) {
      emailResult = await OTPService.sendOTPViaEmail(email, otpRecord.otp, 'login');
    }

    console.log(`📱 Login OTP sent to ${phone}${email ? ` and ${email}` : ''}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        email: email || null,
        smsSent: smsResult.success,
        emailSent: emailResult?.success || false,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('🚨 Error sending login OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Public
router.post('/verify', [
  validatePhone,
  validateEmail,
  validateOTP
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, email, otp, type = 'registration' } = req.body;

    // Verify OTP
    const verificationResult = await OTPService.verifyOTP(phone, email, otp, type);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    console.log(`✅ OTP verified for ${phone}${email ? ` and ${email}` : ''}`);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        phone,
        email: email || null,
        type
      }
    });

  } catch (error) {
    console.error('🚨 Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/otp/resend
// @access  Public
router.post('/resend', [
  validatePhone,
  validateEmail
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, email, type = 'registration' } = req.body;

    // Check rate limit
    const canSendOTP = await OTPService.checkRateLimit(phone, email, type);
    if (!canSendOTP) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait 15 minutes before trying again.'
      });
    }

    // Create new OTP
    const otpRecord = await OTPService.createOTP(phone, email, type);

    // Send OTP via SMS
    const smsResult = await OTPService.sendOTPViaSMS(phone, otpRecord.otp, type);

    // Send OTP via Email if provided
    let emailResult = null;
    if (email) {
      emailResult = await OTPService.sendOTPViaEmail(email, otpRecord.otp, type);
    }

    console.log(`📱 OTP resent to ${phone}${email ? ` and ${email}` : ''}`);

    res.json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        phone,
        email: email || null,
        smsSent: smsResult.success,
        emailSent: emailResult?.success || false,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('🚨 Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
});

module.exports = router;
