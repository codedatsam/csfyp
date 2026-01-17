// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for user authentication
// ==========================================

const express = require('express');
const router = express.Router();

// Controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

// Middleware
const { authenticate } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../middleware/validation');

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// @route   POST /api/v1/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

// @route   GET /api/v1/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

// @route   PATCH /api/v1/auth/profile
// @desc    Update user profile
// @access  Private
router.patch('/profile', authenticate, updateProfileValidation, updateProfile);

// @route   POST /api/v1/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, changePasswordValidation, changePassword);

// @route   POST /api/v1/auth/logout
// @desc    Logout user (client-side token deletion)
// @access  Private
router.post('/logout', authenticate, logout);

module.exports = router;