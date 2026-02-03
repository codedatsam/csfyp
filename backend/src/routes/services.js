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
  getCategories
} = require('../controllers/servicesController');

// Public routes
router.get('/', getAllServices);
router.get('/categories', getCategories);

// Protected routes - must come BEFORE /:id to avoid conflicts
router.get('/my-services', protect, getMyServices);
router.get('/provider/my-services', protect, getMyServices); // Alias for backwards compatibility
router.post('/', protect, authorize('PROVIDER'), createService);

// Dynamic routes with :id
router.get('/:id', getServiceById);
router.put('/:id', protect, authorize('PROVIDER'), updateService);
router.patch('/:id', protect, authorize('PROVIDER'), updateService);
router.delete('/:id', protect, authorize('PROVIDER'), deleteService);

module.exports = router;
