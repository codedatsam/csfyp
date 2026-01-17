// ==========================================
// API RESPONSE UTILITIES
// ==========================================
// Author: Samson Fabiyi
// Description: Standardized API responses
// ==========================================

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

// Error response
function errorResponse(res, statusCode, message, errors = null) {
  const response = {
    success: false,
    error: message
  };

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
  return errorResponse(res, 400, message, errors);
}

// Unauthorized (401)
function unauthorizedResponse(res, message = 'Unauthorized') {
  return errorResponse(res, 401, message);
}

// Forbidden (403)
function forbiddenResponse(res, message = 'Forbidden') {
  return errorResponse(res, 403, message);
}

// Not found (404)
function notFoundResponse(res, message = 'Resource not found') {
  return errorResponse(res, 404, message);
}

// Conflict (409)
function conflictResponse(res, message) {
  return errorResponse(res, 409, message);
}

// Internal server error (500)
function serverErrorResponse(res, message = 'Internal server error') {
  return errorResponse(res, 500, message);
}

module.exports = {
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