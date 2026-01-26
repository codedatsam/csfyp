// ==========================================
// NOTIFICATIONS CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Notification management
// ==========================================

const { prisma } = require('../config/database');
const { 
  okResponse, 
  createdResponse, 
  notFoundResponse,
  serverErrorResponse 
} = require('../utils/response');

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const where = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);

    return okResponse(res, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return serverErrorResponse(res, 'Failed to retrieve notifications');
  }
};

// ==========================================
// GET UNREAD COUNT
// ==========================================
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return okResponse(res, 'Unread count retrieved', { unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return serverErrorResponse(res, 'Failed to get unread count');
  }
};

// ==========================================
// MARK AS READ
// ==========================================
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return notFoundResponse(res, 'Notification not found');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return okResponse(res, 'Notification marked as read', { notification: updated });
  } catch (error) {
    console.error('Mark as read error:', error);
    return serverErrorResponse(res, 'Failed to mark notification as read');
  }
};

// ==========================================
// MARK ALL AS READ
// ==========================================
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return okResponse(res, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all as read error:', error);
    return serverErrorResponse(res, 'Failed to mark all notifications as read');
  }
};

// ==========================================
// DELETE NOTIFICATION
// ==========================================
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return notFoundResponse(res, 'Notification not found');
    }

    await prisma.notification.delete({ where: { id } });

    return okResponse(res, 'Notification deleted');
  } catch (error) {
    console.error('Delete notification error:', error);
    return serverErrorResponse(res, 'Failed to delete notification');
  }
};

// ==========================================
// CLEAR ALL NOTIFICATIONS
// ==========================================
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.deleteMany({
      where: { userId }
    });

    return okResponse(res, 'All notifications cleared');
  } catch (error) {
    console.error('Clear notifications error:', error);
    return serverErrorResponse(res, 'Failed to clear notifications');
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
