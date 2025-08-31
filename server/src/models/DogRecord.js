const mongoose = require('mongoose');

const dogRecordSchema = new mongoose.Schema({
  // Basic Information
  dogId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        // Can be QR code, microchip, or ear notch
        return /^[A-Z0-9]{6,12}$/.test(v);
      },
      message: props => `${props.value} is not a valid dog ID format!`
    }
  },
  
  // Physical Description
  breed: {
    type: String,
    required: true,
    trim: true
  },
  
  color: {
    type: String,
    required: true,
    trim: true
  },
  
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large'],
    required: true
  },
  
  age: {
    type: Number,
    min: 0,
    max: 25,
    required: true
  },
  
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  
  // Health Status
  vaccinationStatus: {
    type: String,
    enum: ['Not Vaccinated', 'Partially Vaccinated', 'Fully Vaccinated'],
    default: 'Not Vaccinated'
  },
  
  lastVaccinationDate: {
    type: Date
  },
  
  nextVaccinationDue: {
    type: Date
  },
  
  sterilizationStatus: {
    type: String,
    enum: ['Not Sterilized', 'Sterilized'],
    default: 'Not Sterilized'
  },
  
  sterilizationDate: {
    type: Date
  },
  
  // Behavior & Health
  isAggressive: {
    type: Boolean,
    default: false
  },
  
  isRabid: {
    type: Boolean,
    default: false
  },
  
  healthNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Location Information
  location: {
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    village: { type: String, required: true, index: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String
  },
  
  // Current Status
  status: {
    type: String,
    enum: ['Active', 'Transferred to Shelter', 'Adopted', 'Deceased', 'Lost'],
    default: 'Active'
  },
  
  // Shelter Information (if applicable)
  shelterInfo: {
    shelterName: String,
    shelterAddress: String,
    transferDate: Date,
    transferReason: String
  },
  
  // Photos
  photos: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Tracking
  firstSeenDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  lastSeenDate: {
    type: Date,
    default: Date.now
  },
  
  // Staff Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Complaints Related
  relatedComplaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],
  
  // Notes & Updates
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true,
  indexes: [
    { status: 1, assignedTo: 1 },
    { 'location.state': 1, 'location.district': 1, 'location.village': 1 },
    { vaccinationStatus: 1, sterilizationStatus: 1 },
    { isAggressive: 1, isRabid: 1 },
    { createdAt: -1 }
  ]
});

// Generate unique dog ID
dogRecordSchema.pre('save', async function(next) {
  if (!this.dogId) {
    const count = await this.constructor.countDocuments();
    this.dogId = `DOG${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update last seen date when location changes
dogRecordSchema.pre('save', function(next) {
  if (this.isModified('location.coordinates')) {
    this.lastSeenDate = new Date();
  }
  next();
});

// Methods
dogRecordSchema.methods.updateVaccinationStatus = function(status, date) {
  this.vaccinationStatus = status;
  this.lastVaccinationDate = date;
  
  // Calculate next vaccination due (typically 1 year)
  if (date && status === 'Fully Vaccinated') {
    this.nextVaccinationDue = new Date(date);
    this.nextVaccinationDue.setFullYear(this.nextVaccinationDue.getFullYear() + 1);
  }
  
  return this.save();
};

dogRecordSchema.methods.updateSterilizationStatus = function(status, date) {
  this.sterilizationStatus = status;
  if (date) {
    this.sterilizationDate = date;
  }
  return this.save();
};

dogRecordSchema.methods.transferToShelter = function(shelterName, shelterAddress, reason) {
  this.status = 'Transferred to Shelter';
  this.shelterInfo = {
    shelterName,
    shelterAddress,
    transferDate: new Date(),
    transferReason: reason
  };
  return this.save();
};

dogRecordSchema.methods.addNote = function(content, authorId) {
  this.notes.push({
    content,
    author: authorId,
    createdAt: new Date()
  });
  return this.save();
};

// Statics
dogRecordSchema.statics.findByLocation = function(state, district, village) {
  const query = { status: 'Active' };
  if (state) query['location.state'] = state;
  if (district) query['location.district'] = district;
  if (village) query['location.village'] = village;
  return this.find(query);
};

dogRecordSchema.statics.findByHealthStatus = function(vaccinationStatus, sterilizationStatus) {
  const query = { status: 'Active' };
  if (vaccinationStatus) query.vaccinationStatus = vaccinationStatus;
  if (sterilizationStatus) query.sterilizationStatus = sterilizationStatus;
  return this.find(query);
};

dogRecordSchema.statics.getAggressiveDogs = function() {
  return this.find({ 
    isAggressive: true, 
    status: 'Active' 
  }).populate('assignedTo', 'name phone');
};

dogRecordSchema.statics.getVaccinationDue = function() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  return this.find({
    status: 'Active',
    nextVaccinationDue: { $lte: nextWeek, $gte: today }
  }).populate('assignedTo', 'name phone');
};

// Virtuals
dogRecordSchema.virtual('isVaccinationDue').get(function() {
  if (!this.nextVaccinationDue) return false;
  return new Date() >= this.nextVaccinationDue;
});

dogRecordSchema.virtual('daysSinceLastSeen').get(function() {
  const now = new Date();
  const lastSeen = new Date(this.lastSeenDate);
  const diffTime = Math.abs(now - lastSeen);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

dogRecordSchema.virtual('ageGroup').get(function() {
  if (this.age < 1) return 'Puppy';
  if (this.age < 3) return 'Young';
  if (this.age < 7) return 'Adult';
  return 'Senior';
});

const DogRecord = mongoose.model('DogRecord', dogRecordSchema);
module.exports = DogRecord;
