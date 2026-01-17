// ==========================================
// DASHBOARD PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Main dashboard after login
// ==========================================

import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  LogOut,
  Settings,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                Hustleflow
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user?.firstName}</span>
              </span>
              
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-gray-600">
            Here's your dashboard overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profile Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === 'PROVIDER' ? 'Provider' : 'Client'}
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Profile Information
              </h3>
              
              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-semibold text-gray-900">{user?.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold text-gray-900">
                      {user?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">
                      {user?.location || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Account Type</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user?.role === 'PROVIDER' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="btn btn-primary">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {user?.role === 'CLIENT' ? (
                  <>
                    <button className="w-full btn btn-primary justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Services
                    </button>
                    <button className="w-full btn btn-secondary justify-start">
                      <User className="h-4 w-4 mr-2" />
                      My Bookings
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full btn btn-primary justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Services
                    </button>
                    <button className="w-full btn btn-secondary justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      My Schedule
                    </button>
                  </>
                )}
                
                <button className="w-full btn btn-secondary justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </button>
              </div>

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Account Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user?.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alpha Testing Notice */}
        <div className="mt-8 card bg-primary-50 border-2 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-primary-900 mb-2">
                🧪 Alpha Testing Version
              </h4>
              <p className="text-sm text-primary-800">
                You're using an early version of Hustleflow. Your feedback is valuable! 
                Please report any issues or suggestions to help improve the platform.
              </p>
              <button className="mt-3 text-sm font-semibold text-primary-700 hover:text-primary-800">
                Give Feedback →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container-custom py-6">
          <p className="text-center text-sm text-gray-600">
            Hustleflow 
            <br />
            University of Hertfordshire 
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;