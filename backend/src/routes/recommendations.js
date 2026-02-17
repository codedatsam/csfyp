// ==========================================
// RECOMMENDATIONS ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: API routes for recommendation system
// ==========================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserRecommendations,
  getSimilarServices,
  getTrendingServices
} = require('../controllers/recommendationsController');

// ==========================================
// PUBLIC ROUTES
// ==========================================

// GET /api/v1/recommendations/trending
// Returns popular/trending services (no auth required)
router.get('/trending', getTrendingServices);

// GET /api/v1/recommendations/similar/:serviceId
// Returns services similar to a given service (no auth required)
router.get('/similar/:serviceId', getSimilarServices);

// ==========================================
// PROTECTED ROUTES (require login)
// ==========================================

// GET /api/v1/recommendations
// Returns personalized recommendations for logged-in user
router.get('/', protect, getUserRecommendations);

module.exports = router;
