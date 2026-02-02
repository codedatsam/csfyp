// ==========================================
// BOOKING ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for booking management
// Updated: Added provider book for client route
// ==========================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createBooking,
  createBookingForClient,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots,
  searchClients
} = require('../controllers/bookingsController');

// All routes require authentication
router.use(protect);

// Client routes
router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);

// Provider routes
router.get('/provider-bookings', getProviderBookings);
router.post('/for-client', createBookingForClient); // NEW: Provider books for client
router.get('/search-clients', searchClients); // NEW: Search clients

// Shared routes
router.get('/available-slots', getAvailableSlots);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', cancelBooking);

module.exports = router;
