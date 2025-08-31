const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users (with optional filters)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role, state, district, village } = req.query;
    let filter = {};

    if (role) filter.role = role;
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    if (village) filter['location.village'] = village;

    const users = await User.find(filter).select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new staff or admin user
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  const { name, phone, role, password, gender, dob, location, areasAssigned } = req.body;

  try {
    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }
    
    // Admin can only create staff or other admins
    if (role === 'resident') {
      return res.status(400).json({ message: 'Cannot create a resident through this endpoint' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      phone,
      role,
      passwordHash,
      gender,
      dob,
      location,
      areasAssigned,
    });

    const createdUser = await user.save();
    res.status(201).json({
      _id: createdUser._id,
      name: createdUser.name,
      phone: createdUser.phone,
      role: createdUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile (for authenticated users)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log('👤 Profile update request for user ID:', req.user.id);
    console.log('📦 Update data:', req.body);

    const { name, gender, dob, location } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update allowed fields
    if (name) user.name = name.trim();
    if (gender) user.gender = gender;
    if (dob) user.dob = new Date(dob);
    if (location) {
      user.location = {
        state: location.state,
        district: location.district,
        village: location.village
      };
    }

    // Save the updated user
    await user.save();
    
    console.log('✅ Profile updated successfully');

    // Return updated user data (without sensitive info)
    const updatedUser = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      gender: user.gender,
      dob: user.dob,
      location: user.location,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('🚨 Profile update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user details
// @route   PATCH /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  const { role, status, areasAssigned } = req.body;
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) user.role = role;
    if (status) user.status = status;
    if (areasAssigned) user.areasAssigned = areasAssigned;

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, updateProfile };