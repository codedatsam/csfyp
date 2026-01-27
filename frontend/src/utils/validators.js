// ==========================================
// FORM VALIDATORS
// ==========================================
// Author: Samson Fabiyi
// Description: Reusable validation functions
// ==========================================

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Password validation (mirrors backend rules)
export const validatePassword = (password, isLogin = false) => {
  if (!password) {
    return 'Password is required';
  }
  // For login, just check existence
  if (isLogin) {
    return null;
  }
  // For registration, enforce rules
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  if (name.trim().length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }
  return null;
};

// Phone validation (optional field)
export const validatePhone = (phone) => {
  if (!phone) return null; // Phone is optional
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

// Login form validator
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password, true);
  if (passwordError) errors.password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Registration form validator
export const validateRegisterForm = (formData) => {
  const errors = {};
  
  const firstNameError = validateName(formData.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateName(formData.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password, false);
  if (passwordError) errors.password = passwordError;
  
  if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Service form validator
export const validateServiceForm = (formData) => {
  const errors = {};
  
  if (!formData.serviceName || !formData.serviceName.trim()) {
    errors.serviceName = 'Service name is required';
  }
  
  if (!formData.category) {
    errors.category = 'Category is required';
  }
  
  if (!formData.price || parseFloat(formData.price) <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  
  if (!formData.duration || parseInt(formData.duration) < 15) {
    errors.duration = 'Duration must be at least 15 minutes';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateLoginForm,
  validateRegisterForm,
  validateServiceForm
};
