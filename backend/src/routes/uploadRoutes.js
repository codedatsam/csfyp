// ==========================================
// UPLOAD ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Image upload endpoints
// ==========================================

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadImage, uploadProfileImage, uploadServiceImage, uploadBusinessImage } = require('../services/cloudinaryService');
const { okResponse, badRequestResponse, serverErrorResponse } = require('../utils/response');

// ==========================================
// UPLOAD GENERIC IMAGE
// ==========================================
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { image, type } = req.body;

    if (!image) {
      return badRequestResponse(res, 'Image data is required');
    }

    let result;
    switch (type) {
      case 'profile':
        result = await uploadProfileImage(image, req.user.id);
        break;
      case 'service':
        result = await uploadServiceImage(image);
        break;
      case 'business':
        result = await uploadBusinessImage(image, req.user.id);
        break;
      default:
        result = await uploadImage(image);
    }

    if (!result.success) {
      return badRequestResponse(res, result.error || 'Upload failed');
    }

    return okResponse(res, 'Image uploaded successfully', { 
      url: result.url,
      publicId: result.publicId 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return serverErrorResponse(res, 'Failed to upload image');
  }
});

// ==========================================
// UPLOAD PROFILE IMAGE
// ==========================================
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return badRequestResponse(res, 'Image data is required');
    }

    const result = await uploadProfileImage(image, req.user.id);

    if (!result.success) {
      return badRequestResponse(res, result.error || 'Upload failed');
    }

    return okResponse(res, 'Profile image uploaded successfully', { 
      url: result.url 
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    return serverErrorResponse(res, 'Failed to upload profile image');
  }
});

// ==========================================
// UPLOAD SERVICE IMAGE
// ==========================================
router.post('/service', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return badRequestResponse(res, 'Image data is required');
    }

    const result = await uploadServiceImage(image);

    if (!result.success) {
      return badRequestResponse(res, result.error || 'Upload failed');
    }

    return okResponse(res, 'Service image uploaded successfully', { 
      url: result.url 
    });
  } catch (error) {
    console.error('Service image upload error:', error);
    return serverErrorResponse(res, 'Failed to upload service image');
  }
});

// ==========================================
// UPLOAD BUSINESS IMAGE
// ==========================================
router.post('/business', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return badRequestResponse(res, 'Image data is required');
    }

    const result = await uploadBusinessImage(image, req.user.id);

    if (!result.success) {
      return badRequestResponse(res, result.error || 'Upload failed');
    }

    return okResponse(res, 'Business image uploaded successfully', { 
      url: result.url 
    });
  } catch (error) {
    console.error('Business image upload error:', error);
    return serverErrorResponse(res, 'Failed to upload business image');
  }
});

module.exports = router;
