// ==========================================
// NOTIFICATIONS ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for notification management
// ==========================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationsController');

// All routes require authentication
router.use(protect);

// Get user notifications
router.get('/', getNotifications);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

// Clear all notifications
router.delete('/', clearAllNotifications);

module.exports = router;
