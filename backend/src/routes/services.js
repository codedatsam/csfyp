// ==========================================
// SERVICES ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for service management
// ==========================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createService,
  getAllServices,
  getServiceById,
  getMyServices,
  updateService,
  deleteService,
  getCategories,
  getBusinessProfile
} = require('../controllers/servicesController');

// Public routes
router.get('/', getAllServices);
router.get('/categories', getCategories);
router.get('/business/:providerId', getBusinessProfile);

// Protected routes - must come BEFORE /:id to avoid conflicts
router.get('/my-services', protect, getMyServices);
router.get('/provider/my-services', protect, getMyServices); // Alias for backwards compatibility
router.post('/', protect, createService); // Anyone can create services (they become provider)

// Dynamic routes with :id
router.get('/:id', getServiceById);
router.put('/:id', protect, updateService); // Owner check in controller
router.patch('/:id', protect, updateService); // Owner check in controller
router.delete('/:id', protect, deleteService); // Owner check in controller

module.exports = router;
