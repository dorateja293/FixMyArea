const express = require('express');
const router = express.Router();
const { getStates, getDistricts, getVillages } = require('../controllers/locationController');

router.get('/states', getStates);
router.get('/districts', getDistricts);
router.get('/villages', getVillages);

module.exports = router;