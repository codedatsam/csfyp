// ==========================================
// CHAT ROUTES
// ==========================================
// Author: Samson Fabiyi
// Description: Routes for messaging
// ==========================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

// Conversations
router.post('/conversations', getOrCreateConversation);
router.get('/conversations', getMyConversations);
router.delete('/conversations/:conversationId', deleteConversation);

// Messages
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

// Unread count
router.get('/unread-count', getUnreadCount);

module.exports = router;
