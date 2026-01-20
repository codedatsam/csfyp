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
router.get('/:id', getServiceById);

// Protected routes (Provider only)
router.post('/', protect, authorize('PROVIDER'), createService);
router.get('/provider/my-services', protect, authorize('PROVIDER'), getMyServices);
router.put('/:id', protect, authorize('PROVIDER'), updateService);
router.delete('/:id', protect, authorize('PROVIDER'), deleteService);

module.exports = router;
