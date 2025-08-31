const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['resident', 'staff', 'admin'],
    required: true,
    index: true, // Add index for role-based queries
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false,
  },
  dob: {
    type: Date,
    required: false,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return v <= new Date(); // Date of birth cannot be in the future
      },
      message: props => `Date of birth cannot be in the future`
    }
  },
  location: {
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    village: { type: String, required: true, index: true },
  },
  passwordHash: {
    type: String,
    required: true,
  },
  areasAssigned: [{
    state: String,
    district: String,
    village: String,
  }],
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
    index: true, // Add index for status queries
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
}, { 
  timestamps: true,
  // Add compound indexes for common query patterns
  indexes: [
    { role: 1, status: 1 },
    { 'location.state': 1, 'location.district': 1 },
    { createdAt: -1 }
  ]
});

// Add methods
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount = (this.loginCount || 0) + 1;
  return this.save();
};

// Add statics
userSchema.statics.findByLocation = function(state, district, village) {
  const query = { status: 'active' };
  if (state) query['location.state'] = state;
  if (district) query['location.district'] = district;
  if (village) query['location.village'] = village;
  return this.find(query);
};

// Add virtuals
userSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const User = mongoose.model('User', userSchema);
module.exports = User;