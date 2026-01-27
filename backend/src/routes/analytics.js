// ==========================================
// ANALYTICS ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Analytics endpoints
// ==========================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProviderAnalytics,
  getClientAnalytics
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(protect);

// Provider analytics
router.get('/provider', getProviderAnalytics);

// Client analytics
router.get('/client', getClientAnalytics);

module.exports = router;
