// ==========================================
// JWT TOKEN UTILITIES
// ==========================================
// Author: Samson Fabiyi
// Description: JWT token generation and verification
// ==========================================

const jwt = require('jsonwebtoken');

// Generate access token (short-lived)
function generateAccessToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

// Generate refresh token (long-lived)
function generateRefreshToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
}

// Verify access token
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Verify refresh token
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

// Decode token without verification (useful for debugging)
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};