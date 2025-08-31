const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Resident)
const createComplaint = async (req, res) => {
  try {
    console.log('📝 Creating new complaint:', {
      body: req.body,
      files: req.files,
      user: req.user.id
    });

    const { category, description, location } = req.body;
    const residentId = req.user.id;

    // Validate required fields
    if (!category || !description || !location) {
      return res.status(400).json({ 
        success: false,
        message: 'Please include all required fields: category, description, and location.' 
      });
    }

    // Parse location safely
    let parsedLocation;
    try {
      parsedLocation = JSON.parse(location);
    } catch (error) {
      console.log('❌ Invalid location format:', location);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid location format. Please provide valid coordinates.' 
      });
    }

    // Handle uploaded images
    let images = [];
    if (req.body.images && req.body.images.length > 0) {
      // Images are already uploaded to Cloudinary and URLs are in req.body.images
      images = req.body.images;
      console.log(`📸 Processing ${images.length} uploaded images`);
    } else if (req.files && req.files.length > 0) {
      // Fallback for direct file handling (if middleware didn't process)
      images = req.files.map(file => ({
        url: file.cloudinaryUrl || file.path,
        filename: file.originalname,
        uploadedAt: new Date()
      }));
      console.log(`📸 Processing ${images.length} files directly`);
    }

    const newComplaint = new Complaint({
      resident: residentId,
      category,
      description: description.trim(),
      location: parsedLocation,
      images,
      status: 'Pending',
      priority: 'Medium'
    });

    console.log('💾 Saving complaint to database...');
    const createdComplaint = await newComplaint.save();
    console.log('✅ Complaint created successfully:', createdComplaint._id);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: createdComplaint
    });
  } catch (error) {
    console.error('🚨 Complaint creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get complaints for the logged-in resident
// @route   GET /api/complaints/my-complaints
// @access  Private (Resident)
const getMyComplaints = async (req, res) => {
  try {
    console.log('🔍 Fetching complaints for resident:', req.user.id);
    
    const complaints = await Complaint.find({ resident: req.user.id })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name role');

    console.log('✅ Found complaints:', complaints.length);
    
    res.json(complaints);
  } catch (error) {
    console.error('🚨 Error fetching user complaints:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all complaints for a logged-in staff user
// @route   GET /api/complaints/assigned
// @access  Private (Staff)
const getComplaintsForStaff = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.id })
      .populate('resident', 'name phone')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a complaint's status
// @route   PATCH /api/complaints/:id
// @access  Private (Staff/Admin)
const updateComplaintStatus = async (req, res) => {
  const { status, assignedTo } = req.body;
  const { id } = req.params;

  try {
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Authorization check: staff can only update if assigned to them
    if (req.user.role === 'staff' && complaint.assignedTo && complaint.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this complaint.' });
    }
    
    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    
    await complaint.save();

    res.json({ message: 'Complaint updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintsForStaff,
  updateComplaintStatus
};