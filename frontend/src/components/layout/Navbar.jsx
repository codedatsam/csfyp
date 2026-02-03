// ==========================================
// NAVBAR COMPONENT (FIXED)
// ==========================================
// Author: Samson Fabiyi
// Description: Navigation bar with centered notification panel on mobile
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Bell, 
  Settings,
  LayoutDashboard,
  Briefcase,
  Calendar,
  Star,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_BOOKING':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'BOOKING_UPDATE':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'BOOKING_CANCELLED':
        return <Calendar className="h-4 w-4 text-red-500" />;
      case 'NEW_REVIEW':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">Husleflow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/browse" 
              className={`text-gray-600 hover:text-primary-600 transition-colors ${
                location.pathname === '/browse' ? 'text-primary-600 font-medium' : ''
              }`}
            >
              Browse Services
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown - Desktop */}
                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border overflow-hidden">
                      <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                !notification.isRead ? 'bg-primary-50' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatTimeAgo(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <Link
                          to="/dashboard/notifications"
                          className="block p-3 text-center text-sm text-primary-600 hover:bg-gray-50 border-t"
                          onClick={() => setNotificationOpen(false)}
                        >
                          View all notifications
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-bold text-sm">
                          {user.firstName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border overflow-hidden">
                      <div className="p-4 border-b">
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/my-services"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Briefcase className="h-4 w-4" />
                          My Services
                        </Link>
                        <Link
                          to="/dashboard/my-bookings"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Calendar className="h-4 w-4" />
                          My Bookings
                        </Link>
                        <Link
                          to="/provider/book-for-customer"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <UserPlus className="h-4 w-4" />
                          Book for Customer
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn btn-secondary">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-gray-600 hover:text-primary-600"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary-600"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Notification Panel - CENTERED */}
      {notificationOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setNotificationOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Centered Panel */}
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-h-[80vh] flex flex-col">
            <div 
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center bg-primary-600">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h3>
                <button 
                  onClick={() => setNotificationOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <div className="p-3 border-b bg-gray-50">
                  <button 
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all as read ({unreadCount})
                  </button>
                </div>
              )}
              
              {/* Notifications List */}
              <div className="max-h-[50vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        markAsRead(notification.id);
                      }}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                        !notification.isRead ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <Link
                  to="/dashboard/notifications"
                  className="block p-4 text-center text-sm text-primary-600 hover:bg-gray-50 border-t font-medium"
                  onClick={() => setNotificationOpen(false)}
                >
                  View all notifications
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container-custom py-4 space-y-4">
            <Link
              to="/browse"
              className="block py-2 text-gray-600 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Services
            </Link>

            {user ? (
              <>
                <div className="border-t pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-bold">
                          {user.firstName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 py-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/my-services"
                      className="flex items-center gap-3 py-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Briefcase className="h-5 w-5" />
                      My Services
                    </Link>
                    <Link
                      to="/dashboard/my-bookings"
                      className="flex items-center gap-3 py-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="h-5 w-5" />
                      My Bookings
                    </Link>
                    <Link
                      to="/provider/book-for-customer"
                      className="flex items-center gap-3 py-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5" />
                      Book for Customer
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center gap-3 py-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-3 py-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-2 text-red-600 mt-4 border-t pt-4 w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Link
                  to="/login"
                  className="btn btn-secondary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
