// ==========================================
// PASSWORD UTILITIES
// ==========================================
// Author: Samson Fabiyi
// Description: Password hashing and comparison using bcrypt
// ==========================================

const bcrypt = require('bcryptjs');

// Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password with hash
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Validate password strength
function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumber) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};