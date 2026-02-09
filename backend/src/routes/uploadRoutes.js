// ==========================================
// UPLOAD ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Image upload endpoints
// ==========================================

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { okResponse, badRequestResponse, serverErrorResponse } = require('../utils/response');

// Try to load cloudinary, but don't fail if not installed
let cloudinaryService = null;
try {
  cloudinaryService = require('../services/cloudinaryService');
  console.log('✅ Cloudinary service loaded');
} catch (e) {
  console.warn('⚠️ Cloudinary not available - image uploads will store URLs directly');
}

// ==========================================
// UPLOAD GENERIC IMAGE
// ==========================================
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { image, type } = req.body;

    if (!image) {
      return badRequestResponse(res, 'Image data is required');
    }

    // If cloudinary is available, use it
    if (cloudinaryService) {
      let result;
      switch (type) {
        case 'profile':
          result = await cloudinaryService.uploadProfileImage(image, req.user.id);
          break;
        case 'service':
          result = await cloudinaryService.uploadServiceImage(image);
          break;
        case 'business':
          result = await cloudinaryService.uploadBusinessImage(image, req.user.id);
          break;
        default:
          result = await cloudinaryService.uploadImage(image);
      }

      if (!result.success) {
        return badRequestResponse(res, result.error || 'Upload failed');
      }

      return okResponse(res, 'Image uploaded successfully', { 
        url: result.url,
        publicId: result.publicId 
      });
    }

    // Fallback: If it's already a URL, return it
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return okResponse(res, 'Image URL stored', { url: image });
    }

    // Fallback: Store base64 directly (not ideal for production)
    return okResponse(res, 'Image stored', { url: image });
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

    if (cloudinaryService) {
      const result = await cloudinaryService.uploadProfileImage(image, req.user.id);
      if (!result.success) {
        return badRequestResponse(res, result.error || 'Upload failed');
      }
      return okResponse(res, 'Profile image uploaded successfully', { url: result.url });
    }

    // Fallback - just return the image as-is
    return okResponse(res, 'Profile image stored', { url: image });
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

    if (cloudinaryService) {
      const result = await cloudinaryService.uploadServiceImage(image);
      if (!result.success) {
        return badRequestResponse(res, result.error || 'Upload failed');
      }
      return okResponse(res, 'Service image uploaded successfully', { url: result.url });
    }

    // Fallback
    return okResponse(res, 'Service image stored', { url: image });
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

    if (cloudinaryService) {
      const result = await cloudinaryService.uploadBusinessImage(image, req.user.id);
      if (!result.success) {
        return badRequestResponse(res, result.error || 'Upload failed');
      }
      return okResponse(res, 'Business image uploaded successfully', { url: result.url });
    }

    // Fallback
    return okResponse(res, 'Business image stored', { url: image });
  } catch (error) {
    console.error('Business image upload error:', error);
    return serverErrorResponse(res, 'Failed to upload business image');
  }
});

module.exports = router;
