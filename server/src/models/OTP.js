const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: false,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'login', 'password_reset'],
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired OTPs
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  }
}, { 
  timestamps: true 
});

// Index for faster queries
otpSchema.index({ phone: 1, type: 1, createdAt: -1 });
otpSchema.index({ email: 1, type: 1, createdAt: -1 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Method to check if OTP can be used
otpSchema.methods.canUse = function() {
  return !this.isUsed && !this.isExpired() && this.attempts < this.maxAttempts;
};

// Method to mark OTP as used
otpSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;
