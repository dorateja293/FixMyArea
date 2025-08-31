const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LocationCatalog = require('../models/LocationCatalog');
const locationsData = require('../data/locations.json');

// This line is causing the error. It looks for the .env file
// relative to the script's location, which is not correct.
// dotenv.config({ path: '../../.env' });

// Correct the path to look for the .env file in the `apps/api` directory
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedLocations = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await LocationCatalog.deleteMany({});
    console.log('Existing location data deleted.');

    await LocationCatalog.insertMany(locationsData);
    console.log('Location data seeded successfully!');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedLocations();