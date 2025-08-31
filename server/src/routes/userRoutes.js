
const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { getUsers, createUser, updateUser, updateProfile } = require('../controllers/userController');

const router = express.Router();

// Profile update route for authenticated users
router.put('/profile', protect, updateProfile);

// Admin-only routes
router.use(protect, restrictTo('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .patch(updateUser);

module.exports = router;