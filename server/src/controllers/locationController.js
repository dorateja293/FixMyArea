const LocationCatalog = require('../models/LocationCatalog');

// @desc    Get all unique states
// @route   GET /api/locations/states
// @access  Public
const getStates = async (req, res) => {
  try {
    const states = await LocationCatalog.find().distinct('state');
    res.json(states);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all unique districts for a given state
// @route   GET /api/locations/districts?state=...
// @access  Public
const getDistricts = async (req, res) => {
  const { state } = req.query;
  try {
    const districts = await LocationCatalog.find({ state }).distinct('district');
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all unique villages for a given state and district
// @route   GET /api/locations/villages?state=...&district=...
// @access  Public
const getVillages = async (req, res) => {
  const { state, district } = req.query;
  try {
    const villages = await LocationCatalog.find({ state, district }).distinct('village');
    res.json(villages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getStates, getDistricts, getVillages };