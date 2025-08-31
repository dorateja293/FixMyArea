const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OTPService = require('../services/otpService');

// @desc    Register user with OTP verification
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('📝 Registration request received:', {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      role: req.body.role,
      hasPassword: !!req.body.password,
      location: req.body.location,
      hasOTP: !!req.body.otp
    });

    const { name, phone, email, role, password, location, otp } = req.body;

    // Validate required fields
    if (!name || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, phone, and role'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // OTP verification is already done in the frontend before calling this endpoint
    // No need to verify OTP again here

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Create user
    const userData = {
      name: name.trim(),
      phone: phone.replace(/\s/g, ''),
      role,
      location: location || {},
      status: 'active',
      passwordHash: passwordHash // Always include passwordHash
    };

    if (email) userData.email = email;
    
    // Ensure password is provided
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    console.log('📝 User data to be created:', userData);

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        status: user.status 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User registered successfully:', user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('🚨 Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.log('❌ Mongoose validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user with OTP verification
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('🔑 Login request received:', {
      phone: req.body.phone,
      hasPassword: !!req.body.password,
      hasOTP: !!req.body.otp
    });

    const { phone, password, otp } = req.body;

    // Validate required fields
    if (!phone || (!password && !otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and either password or OTP'
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    let isValidLogin = false;

    // Try password login first
    if (password && user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (isPasswordValid) {
        isValidLogin = true;
        console.log('✅ Password login successful');
      }
    }

    // Try OTP login if password failed or not provided
    if (!isValidLogin && otp) {
      const otpVerification = await OTPService.verifyOTP(phone, user.email, otp, 'login');
      if (otpVerification.success) {
        isValidLogin = true;
        console.log('✅ OTP login successful');
      } else {
        return res.status(400).json({
          success: false,
          message: otpVerification.message
        });
      }
    }

    if (!isValidLogin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        status: user.status 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });

  } catch (error) {
    console.error('🚨 Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  console.log('👤 Get profile request for user ID:', req.user.id);
  
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('✅ User profile retrieved:', {
      id: user._id,
      name: user.name,
      role: user.role,
      status: user.status
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('🚨 Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = async (req, res) => {
  console.log('🔄 Token refresh request for user ID:', req.user.id);
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.status !== 'active') {
      console.log('❌ User not found or inactive for token refresh');
      return res.status(401).json({ 
        success: false,
        message: 'User not found or inactive' 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        status: user.status 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ New token generated for refresh');

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('🚨 Refresh token error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { register, login, getMe, refreshToken };