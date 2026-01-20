// ==========================================
// BOOKINGS ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for booking management
// ==========================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots
} = require('../controllers/bookingsController');

// Public routes
router.get('/available-slots', getAvailableSlots);

// Protected routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/provider-bookings', protect, authorize('PROVIDER'), getProviderBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, authorize('PROVIDER'), updateBookingStatus);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
