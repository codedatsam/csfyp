// ==========================================
// USERS ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Public user profile routes
// ==========================================

const express = require('express');
const router = express.Router();
const {
  getPublicProfile,
  getProviderByUserId
} = require('../controllers/usersController');

// Public routes - no authentication required

// @route   GET /api/v1/users/:id
// @desc    Get public user profile
// @access  Public
router.get('/:id', getPublicProfile);

// @route   GET /api/v1/users/provider/:userId
// @desc    Get provider profile by user ID
// @access  Public
router.get('/provider/:userId', getProviderByUserId);

module.exports = router;
