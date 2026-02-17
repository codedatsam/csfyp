// ==========================================
// LOCATION ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: API routes for location/postcode search
// ==========================================

const express = require('express');
const router = express.Router();
const {
  searchLocationAutocomplete,
  getPostcodeDetails,
  searchServicesByLocation,
  getNearbyServices
} = require('../controllers/locationController');

// ==========================================
// ALL ROUTES ARE PUBLIC (No auth required)
// ==========================================

// GET /api/v1/locations/search?q=W11
// Autocomplete for postcodes and places
router.get('/search', searchLocationAutocomplete);

// GET /api/v1/locations/postcode/:postcode
// Get details for a specific postcode
router.get('/postcode/:postcode', getPostcodeDetails);

// GET /api/v1/locations/services?location=W11&category=Hair
// Search services by location
router.get('/services', searchServicesByLocation);

// GET /api/v1/locations/nearby?lat=51.5&lng=-0.1&radius=5
// Get services near coordinates
router.get('/nearby', getNearbyServices);

module.exports = router;
