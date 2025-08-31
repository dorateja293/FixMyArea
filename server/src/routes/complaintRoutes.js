const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadOptions, uploadToCloudinary } = require('../middleware/fileUpload');
const { createComplaint, getComplaintsForStaff, updateComplaintStatus, getMyComplaints } = require('../controllers/complaintController');

const router = express.Router();

// Resident routes
router.post('/', protect, restrictTo('resident'), uploadOptions, uploadToCloudinary, createComplaint);
router.get('/my-complaints', protect, restrictTo('resident'), getMyComplaints);

// Staff/Admin routes
router.get('/assigned', protect, restrictTo('staff', 'admin'), getComplaintsForStaff);
router.patch('/:id', protect, restrictTo('staff', 'admin'), updateComplaintStatus);

module.exports = router;