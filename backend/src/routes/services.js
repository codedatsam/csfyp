// ==========================================
// SERVICES ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for service management
// ==========================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
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

// Protected routes (Any authenticated user can offer services)
router.post('/', protect, createService);
router.get('/provider/my-services', protect, getMyServices);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
