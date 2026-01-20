// ==========================================
// REVIEWS ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for review management
// ==========================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReview,
  getProviderReviews,
  getMyReviews,
  getReviewsAboutMe,
  updateReview,
  deleteReview
} = require('../controllers/reviewsController');

// Public routes
router.get('/provider/:providerId', getProviderReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.get('/about-me', protect, getReviewsAboutMe);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
