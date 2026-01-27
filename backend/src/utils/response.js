// ==========================================
// API RESPONSE UTILITIES
// ==========================================
// Author: Samson Fabiyi
// Description: Standardized API responses
// ==========================================

// Error codes for frontend handling
const ERROR_CODES = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SERVER_ERROR: 'SERVER_ERROR'
};

// Success response
function successResponse(res, statusCode, message, data = null) {
  const response = {
    success: true,
    message
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

// Error response with optional code
function errorResponse(res, statusCode, message, code = null, errors = null) {
  const response = {
    success: false,
    error: message
  };

  if (code) {
    response.code = code;
  }

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

// Created response (201)
function createdResponse(res, message, data) {
  return successResponse(res, 201, message, data);
}

// OK response (200)
function okResponse(res, message, data = null) {
  return successResponse(res, 200, message, data);
}

// Bad request (400)
function badRequestResponse(res, message, errors = null) {
  return errorResponse(res, 400, message, ERROR_CODES.VALIDATION_ERROR, errors);
}

// Unauthorized (401)
function unauthorizedResponse(res, message = 'Unauthorized', code = ERROR_CODES.UNAUTHORIZED) {
  return errorResponse(res, 401, message, code);
}

// Forbidden (403)
function forbiddenResponse(res, message = 'Forbidden') {
  return errorResponse(res, 403, message, ERROR_CODES.FORBIDDEN);
}

// Not found (404)
function notFoundResponse(res, message = 'Resource not found') {
  return errorResponse(res, 404, message, ERROR_CODES.NOT_FOUND);
}

// Conflict (409)
function conflictResponse(res, message, code = null) {
  return errorResponse(res, 409, message, code);
}

// Internal server error (500)
function serverErrorResponse(res, message = 'Internal server error') {
  return errorResponse(res, 500, message, ERROR_CODES.SERVER_ERROR);
}

module.exports = {
  ERROR_CODES,
  successResponse,
  errorResponse,
  createdResponse,
  okResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  serverErrorResponse
};