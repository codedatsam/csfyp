// ==========================================
// CHAT CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Real-time messaging between users
// ==========================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { 
  okResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse 
} = require('../utils/response');

// ==========================================
// GET OR CREATE CONVERSATION
// ==========================================
const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return badRequestResponse(res, 'Recipient ID is required');
    }

    if (recipientId === userId) {
      return badRequestResponse(res, 'Cannot start conversation with yourself');
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, firstName: true, lastName: true, avatar: true }
    });

    if (!recipient) {
      return notFoundResponse(res, 'User not found');
    }

    // Sort IDs to ensure consistent lookup
    const [participant1Id, participant2Id] = [userId, recipientId].sort();

    // Try to find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: recipientId },
          { participant1Id: recipientId, participant2Id: userId }
        ]
      },
      include: {
        participant1: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        participant2: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id,
          participant2Id
        },
        include: {
          participant1: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          },
          participant2: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
    }

    // Get the other participant
    const otherParticipant = conversation.participant1Id === userId 
      ? conversation.participant2 
      : conversation.participant1;

    return okResponse(res, 'Conversation retrieved', { 
      conversation: {
        ...conversation,
        otherParticipant
      }
    });
  } catch (error) {
    console.error('Get/create conversation error:', error);
    return serverErrorResponse(res, 'Failed to get conversation');
  }
};

// ==========================================
// GET MY CONVERSATIONS
// ==========================================
const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: {
        participant1: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        participant2: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    // Format conversations with other participant info and unread count
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participant1Id === userId 
          ? conv.participant2 
          : conv.participant1;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false
          }
        });

        return {
          id: conv.id,
          otherParticipant,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt
        };
      })
    );

    return okResponse(res, 'Conversations retrieved', { conversations: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return serverErrorResponse(res, 'Failed to get conversations');
  }
};

// ==========================================
// GET CONVERSATION MESSAGES
// ==========================================
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: {
        participant1: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        participant2: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    if (!conversation) {
      return notFoundResponse(res, 'Conversation not found');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.message.count({ where: { conversationId } })
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    const otherParticipant = conversation.participant1Id === userId 
      ? conversation.participant2 
      : conversation.participant1;

    return okResponse(res, 'Messages retrieved', {
      conversation: {
        id: conversation.id,
        otherParticipant
      },
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return serverErrorResponse(res, 'Failed to get messages');
  }
};

// ==========================================
// SEND MESSAGE
// ==========================================
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return badRequestResponse(res, 'Message content is required');
    }

    // Check if user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return notFoundResponse(res, 'Conversation not found');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim()
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    // Create notification for recipient
    const recipientId = conversation.participant1Id === userId 
      ? conversation.participant2Id 
      : conversation.participant1Id;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `${req.user.firstName} sent you a message`
      }
    });

    return createdResponse(res, 'Message sent', { message });
  } catch (error) {
    console.error('Send message error:', error);
    return serverErrorResponse(res, 'Failed to send message');
  }
};

// ==========================================
// GET UNREAD MESSAGE COUNT
// ==========================================
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all conversations user is part of
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      select: { id: true }
    });

    const conversationIds = conversations.map(c => c.id);

    const unreadCount = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        isRead: false
      }
    });

    return okResponse(res, 'Unread count retrieved', { unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    return serverErrorResponse(res, 'Failed to get unread count');
  }
};

// ==========================================
// DELETE CONVERSATION
// ==========================================
const deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Check if user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return notFoundResponse(res, 'Conversation not found');
    }

    // Delete conversation (messages will cascade delete)
    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    return okResponse(res, 'Conversation deleted');
  } catch (error) {
    console.error('Delete conversation error:', error);
    return serverErrorResponse(res, 'Failed to delete conversation');
  }
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation
};
