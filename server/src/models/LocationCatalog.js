const mongoose = require('mongoose');

const locationCatalogSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
});

locationCatalogSchema.index({ state: 1, district: 1, village: 1 });

const LocationCatalog = mongoose.model('LocationCatalog', locationCatalogSchema);
module.exports = LocationCatalog;