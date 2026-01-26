// ==========================================
// MESSAGES PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Real-time messaging interface
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Send, 
  Search,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Check,
  CheckCheck,
  Loader2,
  Heart,
  Coffee,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const recipientIdFromUrl = searchParams.get('to');
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    
    // Poll for new messages every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, true);
      }
      fetchConversations(true);
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Handle recipient from URL (e.g., starting chat from service page)
  useEffect(() => {
    if (recipientIdFromUrl && user) {
      startConversationWithUser(recipientIdFromUrl);
    }
  }, [recipientIdFromUrl, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/chat/conversations');
      if (response.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      if (!silent) {
        console.error('Failed to fetch conversations:', error);
        toast.error('Failed to load conversations');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const startConversationWithUser = async (recipientId) => {
    try {
      const response = await api.post('/chat/conversations', { recipientId });
      if (response.success) {
        const conv = response.data.conversation;
        setSelectedConversation({
          id: conv.id,
          otherParticipant: conv.otherParticipant
        });
        fetchMessages(conv.id);
        setShowMobileChat(true);
        fetchConversations(true);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      if (response.success) {
        setMessages(response.data.messages);
        if (!silent) {
          // Update unread count in conversation list
          setConversations(prev => 
            prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const selectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv.id);
    setShowMobileChat(true);
    messageInputRef.current?.focus();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Optimistic update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: user.id,
      sender: user,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await api.post(
        `/chat/conversations/${selectedConversation.id}/messages`,
        { content: messageContent }
      );
      
      if (response.success) {
        // Replace temp message with real one
        setMessages(prev => 
          prev.map(m => m.id === tempMessage.id ? response.data.message : m)
        );
        // Update conversation list
        fetchConversations(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteConversation = async (convId) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;

    try {
      await api.delete(`/chat/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedConversation?.id === convId) {
        setSelectedConversation(null);
        setMessages([]);
        setShowMobileChat(false);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString('en-GB', { weekday: 'short' });
    }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = `${conv.otherParticipant.firstName} ${conv.otherParticipant.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container-custom py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-180px)] flex overflow-hidden">
          
          {/* Conversation List - Hidden on mobile when chat is open */}
          <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary-600" />
                Messages
              </h2>
              
              {/* Search */}
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Start chatting from a service page!
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                      selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    {conv.otherParticipant.avatar ? (
                      <img
                        src={conv.otherParticipant.avatar}
                        alt={conv.otherParticipant.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                        {getInitials(conv.otherParticipant.firstName, conv.otherParticipant.lastName)}
                      </div>
                    )}
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 truncate">
                          {conv.otherParticipant.firstName} {conv.otherParticipant.lastName}
                        </p>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-1 hover:bg-gray-100 rounded"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    
                    {selectedConversation.otherParticipant.avatar ? (
                      <img
                        src={selectedConversation.otherParticipant.avatar}
                        alt={selectedConversation.otherParticipant.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                        {getInitials(
                          selectedConversation.otherParticipant.firstName,
                          selectedConversation.otherParticipant.lastName
                        )}
                      </div>
                    )}
                    
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedConversation.otherParticipant.firstName}{' '}
                        {selectedConversation.otherParticipant.lastName}
                      </p>
                      <p className="text-xs text-green-600">Online</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteConversation(selectedConversation.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-gray-400 text-sm">Say hello! 👋</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.senderId === user.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn ? 'text-primary-200' : 'text-gray-400'
                            }`}>
                              <span className="text-xs">
                                {formatTime(message.createdAt)}
                              </span>
                              {isOwn && (
                                message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Your Messages
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Select a conversation or start a new one<br />
                    from a service provider's page
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container-custom py-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>&</span>
              <Coffee className="h-4 w-4 text-amber-600" />
              <span>by students, for students</span>
            </div>
            <div className="flex items-center space-x-1 text-primary-600">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">Husleflow</span>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Messages;
