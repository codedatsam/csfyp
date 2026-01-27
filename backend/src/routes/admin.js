// ==========================================
// ADMIN ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Admin panel routes
// ==========================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllServicesAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  getAllBookingsAdmin
} = require('../controllers/adminController');

// All routes require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Services
router.get('/services', getAllServicesAdmin);
router.patch('/services/:id', updateServiceAdmin);
router.delete('/services/:id', deleteServiceAdmin);

// Bookings
router.get('/bookings', getAllBookingsAdmin);

module.exports = router;
