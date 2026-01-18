// ==========================================
// TOKEN UTILITIES
// ==========================================
// Author: Samson Fabiyi
// Description: Generate secure tokens for password reset
// ==========================================

const crypto = require('crypto');

// Generate secure random token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate token expiry (1 hour from now)
function generateTokenExpiry() {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}

// Check if token is expired
function isTokenExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}

// Generate verification token (longer for URL safety)
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate verification expiry (24 hours from now)
function generateVerificationExpiry() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
}


module.exports = {
  generateResetToken,
  generateTokenExpiry,
  isTokenExpired,
  generateVerificationToken,
  generateVerificationExpiry
};