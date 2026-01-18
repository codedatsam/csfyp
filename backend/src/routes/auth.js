// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for user authentication
// ==========================================

const express = require('express');
const router = express.Router();

// Controllers
const { sendTestEmail } = require('../services/emailService');
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
  verifyEmail,
  verifyEmailByCode,
  resendVerificationEmail
} = require('../controllers/authController');

const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  requestPasswordResetValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  verifyCodeValidation,
  resendVerificationValidation
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


// @route   POST /api/v1/auth/test-email
// @desc    Send test email (development only)
// @access  Public (remove in production)
router.post('/test-email', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, error: 'Not allowed in production' });
  }
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }
  
  const result = await sendTestEmail(email);
  
  if (result.success) {
    return res.json({ success: true, message: 'Test email sent!', data: result.data });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
});

// ==========================================
// EMAIL VERIFICATION ROUTES (Public)
// ==========================================

// @route   POST /api/v1/auth/verify-email
// @desc    Verify email with token (from link)
// @access  Public
router.post('/verify-email', verifyEmailValidation, verifyEmail);

// @route   POST /api/v1/auth/verify-code
// @desc    Verify email with 6-digit code
// @access  Public
router.post('/verify-code', verifyCodeValidation, verifyEmailByCode);

// @route   POST /api/v1/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', resendVerificationValidation, resendVerificationEmail);
module.exports = router;