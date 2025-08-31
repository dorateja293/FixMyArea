const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get complaint counts grouped by status or category
// @route   GET /api/reports/complaints
// @access  Private (Admin, Staff)
const getComplaintReports = async (req, res) => {
  const { groupBy, startDate, endDate } = req.query;

  const match = {};
  if (startDate) match.createdAt = { ...match.createdAt, $gte: new Date(startDate) };
  if (endDate) match.createdAt = { ...match.createdAt, $lte: new Date(endDate) };

  try {
    let pipeline = [];
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 }
      }
    });

    const reportData = await Complaint.aggregate(pipeline);
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get staff performance metrics
// @route   GET /api/reports/staff-performance
// @access  Private (Admin)
const getStaffPerformance = async (req, res) => {
  try {
    const staffPerformance = await Complaint.aggregate([
      { $match: { assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staffDetails'
        }
      },
      { $unwind: '$staffDetails' },
      {
        $project: {
          _id: 0,
          name: '$staffDetails.name',
          resolvedCount: 1,
          totalCount: 1
        }
      }
    ]);
    res.json(staffPerformance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getComplaintReports, getStaffPerformance };