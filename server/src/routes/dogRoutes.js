const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadOptions, uploadToCloudinary } = require('../middleware/fileUpload');
const { 
  createDogRecord, 
  getAllDogs, 
  getDogById, 
  updateDogRecord, 
  deleteDogRecord,
  updateVaccinationStatus,
  updateSterilizationStatus,
  transferToShelter,
  addNote
} = require('../controllers/dogController');

const router = express.Router();

// All routes require authentication and staff/admin role
router.use(protect);
router.use(restrictTo('staff', 'admin'));

// CRUD operations
router.post('/', uploadOptions, uploadToCloudinary, createDogRecord);
router.get('/', getAllDogs);
router.get('/:id', getDogById);
router.put('/:id', uploadOptions, uploadToCloudinary, updateDogRecord);
router.delete('/:id', deleteDogRecord);

// Special operations
router.patch('/:id/vaccination', updateVaccinationStatus);
router.patch('/:id/sterilization', updateSterilizationStatus);
router.patch('/:id/transfer', transferToShelter);
router.post('/:id/notes', addNote);

module.exports = router;
