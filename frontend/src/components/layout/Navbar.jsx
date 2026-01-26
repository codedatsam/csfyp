// ==========================================
// NAVBAR COMPONENT
// ==========================================
// Author: Samson Fabiyi
// Description: Reusable navigation with notifications
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Check,
  Trash2,
  CheckCheck,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications and messages
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchUnreadMessages();
      
      // Poll every 10 seconds for updates
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchUnreadMessages();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/chat/unread-count');
      if (response.success) {
        setUnreadMessages(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread messages:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=10');
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!notificationsOpen) {
      fetchNotifications();
    }
    setNotificationsOpen(!notificationsOpen);
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_BOOKING': return '📅';
      case 'BOOKING_UPDATE': return '✅';
      case 'BOOKING_CANCELLED': return '❌';
      case 'NEW_REVIEW': return '⭐';
      default: return '🔔';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  // Get avatar initials
  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">Husleflow</h1>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="text-gray-600 hover:text-primary-600 font-medium">
              Browse Services
            </Link>
            <Link to="/dashboard/my-services" className="text-gray-600 hover:text-primary-600 font-medium">
              My Services
            </Link>
            <Link to="/dashboard/my-bookings" className="text-gray-600 hover:text-primary-600 font-medium">
              My Bookings
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Messages */}
            <Link
              to="/messages"
              className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors group"
              title="Messages"
            >
              <MessageCircle className="h-5 w-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Messages
              </span>
            </Link>

            {/* Notifications Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors group"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {/* Tooltip - only show when dropdown is closed */}
                {!notificationsOpen && (
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Notifications
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                            !notification.isRead ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} text-gray-900`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-primary-600"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <Link
                      to="/dashboard/notifications"
                      className="block text-center py-3 text-sm text-primary-600 hover:bg-gray-50 border-t border-gray-200"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar */}
            <Link
              to="/dashboard/edit-profile"
              className="flex items-center gap-2 hover:opacity-80"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                  {getInitials()}
                </div>
              )}
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.firstName}
              </span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary flex items-center gap-2 py-2 px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <Link
                to="/services"
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Services
              </Link>
              <Link
                to="/dashboard/my-services"
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Services
              </Link>
              <Link
                to="/dashboard/my-bookings"
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
              <Link
                to="/dashboard/edit-profile"
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Edit Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
