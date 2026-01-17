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
  logout,
  requestPasswordReset,
  resetPassword,
  verifyResetToken
} = require('../controllers/authController');

// Middleware
const { authenticate } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  requestPasswordResetValidation,
  resetPasswordValidation
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
// PASSWORD RESET ROUTES (Public)
// ==========================================

// @route   POST /api/v1/auth/forgot-password
// @desc    Request password reset (sends email with token)
// @access  Public
router.post('/forgot-password', requestPasswordResetValidation, requestPasswordReset);

// @route   GET /api/v1/auth/verify-reset-token/:token
// @desc    Verify if reset token is valid
// @access  Public
router.get('/verify-reset-token/:token', verifyResetToken);

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPasswordValidation, resetPassword);

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