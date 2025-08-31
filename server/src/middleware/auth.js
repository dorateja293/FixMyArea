const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token has expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired. Please login again.' 
        });
      }

      // Get user from database to ensure they still exist and are active
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Check if user is still active
      if (user.status !== 'active') {
        return res.status(403).json({ 
          success: false,
          message: 'Account is disabled. Please contact administrator.' 
        });
      }

      // Add user info to request
      req.user = {
        id: user._id,
        role: user.role,
        status: user.status,
        phone: user.phone
      };

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token. Please login again.' 
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired. Please login again.' 
        });
      } else {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, token failed' 
        });
      }
    }
  } else {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};

// Middleware to check if user is active
const requireActiveUser = (req, res, next) => {
  if (!req.user || req.user.status !== 'active') {
    return res.status(403).json({ 
      success: false,
      message: 'Account is disabled. Please contact administrator.' 
    });
  }
  next();
};

module.exports = { protect, restrictTo, requireActiveUser };