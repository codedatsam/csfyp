// ==========================================
// UPLOAD ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Image upload endpoints
// ==========================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { okResponse, badRequestResponse, serverErrorResponse } = require('../utils/response');

// Try to load cloudinary service
let cloudinaryService = null;
try {
  cloudinaryService = require('../services/cloudinaryService');
  if (cloudinaryService.isConfigured) {
    console.log('✅ Cloudinary service loaded and configured');
  } else {
    console.log('⚠️ Cloudinary service loaded but not configured - using fallback');
  }
} catch (e) {
  console.warn('⚠️ Cloudinary service not available:', e.message);
}

// Helper function to handle upload
const handleUpload = async (image, type, userId) => {
  // If no image provided
  if (!image) {
    return { success: false, error: 'Image data is required' };
  }

  // If it's already a URL, just return it
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return { success: true, url: image };
  }

  // Try cloudinary if available
  if (cloudinaryService) {
    try {
      let result;
      switch (type) {
        case 'profile':
          result = await cloudinaryService.uploadProfileImage(image, userId);
          break;
        case 'service':
          result = await cloudinaryService.uploadServiceImage(image);
          break;
        case 'business':
          result = await cloudinaryService.uploadBusinessImage(image, userId);
          break;
        default:
          result = await cloudinaryService.uploadImage(image);
      }
      return result;
    } catch (e) {
      console.error('Cloudinary error:', e);
      // Fall through to return base64
    }
  }

  // Fallback: return the base64 image directly
  return { success: true, url: image };
};

// ==========================================
// UPLOAD GENERIC IMAGE
// ==========================================
router.post('/', authenticate, async (req, res) => {
  try {
    const { image, type } = req.body;
    const result = await handleUpload(image, type, req.user.id);
    
    if (!result.success) {
      return badRequestResponse(res, result.error || 'Upload failed');
    }
    
    return okResponse(res, 'Image uploaded successfully', { url: result.url });
  } catch (error) {
    console.error('Upload error:', error);
    return serverErrorResponse(res, 'Failed to upload image');
  }
});

// ==========================================
// UPLOAD PROFILE IMAGE
// ==========================================
router.post('/profile', authenticate, async (req, res) => {
  try {
    const { image } = req.body;
    const result = await handleUpload(image, 'profile', req.user.id);
    
    if (!result.success) {
      return badRequestResponse(res, result.error || 'Upload failed');
    }
    
    return okResponse(res, 'Profile image uploaded successfully', { url: result.url });
  } catch (error) {
    console.error('Profile upload error:', error);
    return serverErrorResponse(res, 'Failed to upload profile image');
  }
});

// ==========================================
// UPLOAD SERVICE IMAGE
// ==========================================
router.post('/service', authenticate, async (req, res) => {
  try {
    const { image } = req.body;
    const result = await handleUpload(image, 'service', req.user.id);
    
    if (!result.success) {
      return badRequestResponse(res, result.error || 'Upload failed');
    }
    
    return okResponse(res, 'Service image uploaded successfully', { url: result.url });
  } catch (error) {
    console.error('Service image upload error:', error);
    return serverErrorResponse(res, 'Failed to upload service image');
  }
});

// ==========================================
// UPLOAD BUSINESS IMAGE
// ==========================================
router.post('/business', authenticate, async (req, res) => {
  try {
    const { image } = req.body;
    const result = await handleUpload(image, 'business', req.user.id);
    
    if (!result.success) {
      return badRequestResponse(res, result.error || 'Upload failed');
    }
    
    return okResponse(res, 'Business image uploaded successfully', { url: result.url });
  } catch (error) {
    console.error('Business image upload error:', error);
    return serverErrorResponse(res, 'Failed to upload business image');
  }
});

module.exports = router;
