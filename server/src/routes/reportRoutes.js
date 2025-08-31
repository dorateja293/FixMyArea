const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { getComplaintReports, getStaffPerformance } = require('../controllers/reportController');

const router = express.Router();

router.get('/complaints', protect, restrictTo('admin', 'staff'), getComplaintReports);
router.get('/staff-performance', protect, restrictTo('admin'), getStaffPerformance);

module.exports = router;