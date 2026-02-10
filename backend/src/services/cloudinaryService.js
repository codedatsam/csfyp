// ==========================================
// CLOUDINARY UPLOAD SERVICE
// ==========================================
// Author: Samson Fabiyi
// Description: Image upload service using Cloudinary
// ==========================================

let cloudinary = null;
let isConfigured = false;

try {
  cloudinary = require('cloudinary').v2;
  
  // Check if Cloudinary credentials are set
  if (process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET) {
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    isConfigured = true;
    console.log('✅ Cloudinary configured successfully');
  } else {
    console.warn('⚠️ Cloudinary credentials not set - uploads will store base64 directly');
  }
} catch (e) {
  console.warn('⚠️ Cloudinary package not installed - uploads will store base64 directly');
}

// ==========================================
// UPLOAD IMAGE FROM BASE64
// ==========================================
const uploadImage = async (base64Image, folder = 'husleflow') => {
  try {
    // If it's already a URL, return it
    if (base64Image && (base64Image.startsWith('http://') || base64Image.startsWith('https://'))) {
      return { success: true, url: base64Image };
    }

    // If cloudinary is not configured, return the base64 as-is
    if (!isConfigured || !cloudinary) {
      console.log('Cloudinary not configured, storing image directly');
      return { success: true, url: base64Image };
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Return base64 as fallback
    return {
      success: true,
      url: base64Image
    };
  }
};

// ==========================================
// UPLOAD PROFILE IMAGE
// ==========================================
const uploadProfileImage = async (base64Image, userId) => {
  return uploadImage(base64Image, `husleflow/profiles/${userId}`);
};

// ==========================================
// UPLOAD SERVICE IMAGE
// ==========================================
const uploadServiceImage = async (base64Image, serviceId) => {
  return uploadImage(base64Image, `husleflow/services`);
};

// ==========================================
// UPLOAD BUSINESS IMAGE
// ==========================================
const uploadBusinessImage = async (base64Image, providerId) => {
  return uploadImage(base64Image, `husleflow/businesses/${providerId}`);
};

// ==========================================
// DELETE IMAGE
// ==========================================
const deleteImage = async (publicId) => {
  try {
    if (!publicId || !isConfigured || !cloudinary) return { success: true };
    
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadImage,
  uploadProfileImage,
  uploadServiceImage,
  uploadBusinessImage,
  deleteImage,
  cloudinary,
  isConfigured
};
