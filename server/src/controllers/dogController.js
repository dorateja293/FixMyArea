const DogRecord = require('../models/DogRecord');

// @desc    Create a new dog record
// @route   POST /api/dogs
// @access  Private (Staff/Admin)
const createDogRecord = async (req, res) => {
  try {
    console.log('🐕 Creating new dog record:', req.body);
    
    const {
      breed,
      color,
      size,
      age,
      gender,
      location,
      isAggressive,
      isRabid,
      healthNotes
    } = req.body;

    // Validate required fields
    if (!breed || !color || !size || !age || !gender || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: breed, color, size, age, gender, and location are required'
      });
    }

    // Create dog record
    const dogData = {
      breed: breed.trim(),
      color: color.trim(),
      size,
      age: parseInt(age),
      gender,
      location: {
        state: location.state,
        district: location.district,
        village: location.village,
        coordinates: {
          lat: parseFloat(location.coordinates?.lat || 0),
          lng: parseFloat(location.coordinates?.lng || 0)
        },
        address: location.address
      },
      isAggressive: isAggressive || false,
      isRabid: isRabid || false,
      healthNotes: healthNotes?.trim(),
      assignedTo: req.user.id
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      dogData.photos = req.files.map(file => ({
        url: file.cloudinaryUrl,
        caption: `Photo uploaded on ${new Date().toLocaleDateString()}`
      }));
    }

    const dogRecord = new DogRecord(dogData);
    await dogRecord.save();

    console.log('✅ Dog record created successfully:', dogRecord.dogId);

    res.status(201).json({
      success: true,
      data: dogRecord
    });
  } catch (error) {
    console.error('🚨 Error creating dog record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating dog record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all dog records
// @route   GET /api/dogs
// @access  Private (Staff/Admin)
const getAllDogs = async (req, res) => {
  try {
    console.log('🔍 Fetching all dog records');
    
    const { status, vaccination, sterilization, aggressive, location } = req.query;
    
    let query = {};
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (vaccination && vaccination !== 'all') {
      query.vaccinationStatus = vaccination;
    }
    
    if (sterilization && sterilization !== 'all') {
      query.sterilizationStatus = sterilization;
    }
    
    if (aggressive === 'true') {
      query.isAggressive = true;
    }
    
    if (location) {
      const { state, district, village } = JSON.parse(location);
      if (state) query['location.state'] = state;
      if (district) query['location.district'] = district;
      if (village) query['location.village'] = village;
    }

    const dogs = await DogRecord.find(query)
      .populate('assignedTo', 'name phone')
      .populate('relatedComplaints', 'category status')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${dogs.length} dog records`);

    res.json({
      success: true,
      data: dogs
    });
  } catch (error) {
    console.error('🚨 Error fetching dog records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dog records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get dog record by ID
// @route   GET /api/dogs/:id
// @access  Private (Staff/Admin)
const getDogById = async (req, res) => {
  try {
    console.log('🔍 Fetching dog record:', req.params.id);
    
    const dog = await DogRecord.findById(req.params.id)
      .populate('assignedTo', 'name phone')
      .populate('relatedComplaints', 'category status description createdAt')
      .populate('notes.author', 'name');

    if (!dog) {
      return res.status(404).json({
        success: false,
        message: 'Dog record not found'
      });
    }

    console.log('✅ Dog record fetched successfully');

    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('🚨 Error fetching dog record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dog record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update dog record
// @route   PUT /api/dogs/:id
// @access  Private (Staff/Admin)
const updateDogRecord = async (req, res) => {
  try {
    console.log('🔧 Updating dog record:', req.params.id);
    
    const dog = await DogRecord.findById(req.params.id);
    
    if (!dog) {
      return res.status(404).json({
        success: false,
        message: 'Dog record not found'
      });
    }

    // Update fields
    const updateData = { ...req.body };
    
    // Handle location coordinates
    if (updateData.location?.coordinates) {
      updateData.location.coordinates = {
        lat: parseFloat(updateData.location.coordinates.lat),
        lng: parseFloat(updateData.location.coordinates.lng)
      };
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => ({
        url: file.cloudinaryUrl,
        caption: `Photo updated on ${new Date().toLocaleDateString()}`
      }));
      
      updateData.photos = [...(dog.photos || []), ...newPhotos];
    }

    const updatedDog = await DogRecord.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name phone');

    console.log('✅ Dog record updated successfully');

    res.json({
      success: true,
      data: updatedDog
    });
  } catch (error) {
    console.error('🚨 Error updating dog record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating dog record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete dog record
// @route   DELETE /api/dogs/:id
// @access  Private (Admin only)
const deleteDogRecord = async (req, res) => {
  try {
    console.log('🗑️ Deleting dog record:', req.params.id);
    
    const dog = await DogRecord.findById(req.params.id);
    
    if (!dog) {
      return res.status(404).json({
        success: false,
        message: 'Dog record not found'
      });
    }

    await DogRecord.findByIdAndDelete(req.params.id);

    console.log('✅ Dog record deleted successfully');

    res.json({
      success: true,
      message: 'Dog record deleted successfully'
    });
  } catch (error) {
    console.error('🚨 Error deleting dog record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting dog record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update vaccination status
// @route   PATCH /api/dogs/:id/vaccination
// @access  Private (Staff/Admin)
const updateVaccinationStatus = async (req, res) => {
  try {
    console.log('💉 Updating vaccination status for dog:', req.params.id);
    
    const { status, date } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Vaccination status is required'
      });
    }

    const dog = await DogRecord.findById(req.params.id);
    
    if (!dog) {
      return res.status(404).json({
        success: false,
        message: 'Dog record not found'
      });
    }

    await dog.updateVaccinationStatus(status, date ? new Date(date) : undefined);

    console.log('✅ Vaccination status updated successfully');

    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('🚨 Error updating vaccination status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vaccination status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update sterilization status
// @route   PATCH /api/dogs/:id/sterilization
// @access  Private (Staff/Admin)
const updateSterilizationStatus = async (req, res) => {
  try {
    console.log('🔧 Updating sterilization status for dog:', req.params.id);
    
    const { status, date } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Sterilization status is required'
      });
    }

    const dog = await DogRecord.findById(req.params.id);
    
    if (!dog) {
      return res.status(404).json({
        success: false,
        message: 'Dog record not found'
      });
    }

    await dog.updateSterilizationStatus(status, date ? new Date(date) : undefined);

    console.log('✅ Sterilization status updated successfully');

    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('🚨 Error updating sterilization status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating sterilization status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Transfer dog to shelter
// @route   PATCH /api/dogs/:id/transfer
// @access  Private (Staff/Admin)
const transferToShelter = async (req, res) => {
  try {
    console.log('🏠 Transferring dog to shelter:', req.params.id);
    
    const { shelterName, shelterAddress, reason } = req.body;
    
    if (!shelterName || !shelterAddress || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Shelter name, address, and reason are required'
      });
    }

    const dog = await DogRecord.findById(req.params.id);
    
    if (!dog) {
      return res.status(404).json({
        success: false,
        message: 'Dog record not found'
      });
    }

    await dog.transferToShelter(shelterName, shelterAddress, reason);

    console.log('✅ Dog transferred to shelter successfully');

    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('🚨 Error transferring dog to shelter:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while transferring dog to shelter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add note to dog record
// @route   POST /api/dogs/:id/notes
// @access  Private (Staff/Admin)
const addNote = async (req, res) => {
  try {
    console.log('📝 Adding note to dog record:', req.params.id);
    
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const dog = await DogRecord.findById(req.params.id);
    
    if (!dog) {
      return res.status(404).json({
        success: false,
        message: 'Dog record not found'
      });
    }

    await dog.addNote(content, req.user.id);

    console.log('✅ Note added successfully');

    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('🚨 Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createDogRecord,
  getAllDogs,
  getDogById,
  updateDogRecord,
  deleteDogRecord,
  updateVaccinationStatus,
  updateSterilizationStatus,
  transferToShelter,
  addNote
};
