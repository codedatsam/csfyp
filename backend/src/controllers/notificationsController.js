// ==========================================
// NOTIFICATIONS CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Handle user notifications
// ==========================================

const { prisma } = require('../config/database');
const { 
  okResponse, 
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse 
} = require('../utils/response');

// ==========================================
// GET USER NOTIFICATIONS
// ==========================================
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        isRead: false
      }
    });

    return okResponse(res, 'Notifications retrieved', { 
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return serverErrorResponse(res, 'Failed to get notifications');
  }
};

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { 
        id,
        userId
      }
    });

    if (!notification) {
      return notFoundResponse(res, 'Notification not found');
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return okResponse(res, 'Notification marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    return serverErrorResponse(res, 'Failed to mark notification as read');
  }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
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
      where: { 
        id,
        userId
      }
    });

    if (!notification) {
      return notFoundResponse(res, 'Notification not found');
    }

    await prisma.notification.delete({
      where: { id }
    });

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
    console.error('Clear all notifications error:', error);
    return serverErrorResponse(res, 'Failed to clear notifications');
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
