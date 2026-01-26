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
  Settings,
  Shield,
  Sparkles,
  Heart,
  Coffee,
  Search,
  PlusCircle,
  Clock,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

function Dashboard() {
  const { user } = useAuth();

  // Get avatar initials
  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Ready to hustle, {user?.firstName}? 🚀
          </h2>
          <p className="text-gray-600">
            Find services or offer your own - you can do both on Husleflow!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Status */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Role</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === 'PROVIDER' ? 'Hustler' : 'Student'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Can book & offer services
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Bookings/Services */}
          <Link 
            to="/dashboard/my-services"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Services</p>
                <p className="text-2xl font-bold text-gray-900">View All</p>
                <p className="text-xs text-primary-600 mt-1">Manage services →</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Link>

          {/* Account Status */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <p className="text-2xl font-bold text-green-600">Verified</p>
                <p className="text-xs text-gray-500 mt-1">Ready to hustle!</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center gap-4 mb-6">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
                    {getInitials()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user?.role === 'PROVIDER' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role === 'PROVIDER' ? '💼 Provider' : '🎓 Student'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
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
                    <p className="text-sm text-gray-600">Campus / Hall</p>
                    <p className="font-semibold text-gray-900">
                      {user?.location || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link to="/dashboard/edit-profile" className="btn btn-primary inline-flex">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
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
                <Link to="/services" className="w-full btn btn-primary justify-start flex">
                  <Search className="h-4 w-4 mr-2" />
                  Find Services
                </Link>
                <Link to="/dashboard/my-services" className="w-full btn btn-secondary justify-start flex">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  My Services
                </Link>
                <Link to="/dashboard/my-bookings" className="w-full btn btn-secondary justify-start flex">
                  <Clock className="h-4 w-4 mr-2" />
                  My Bookings
                </Link>
                <Link to="/dashboard/my-bookings" className="w-full btn btn-secondary justify-start flex">
                  <Star className="h-4 w-4 mr-2" />
                  My Reviews
                </Link>
                
                <Link to="/dashboard/edit-profile" className="w-full btn btn-secondary justify-start flex">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Link>
              </div>

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Member Since</p>
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

        {/* Campus Services Section */}
        <div className="mt-8">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Popular on Campus 🔥
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Tutoring', 'Essay Help', 'Tech Support', 'Haircuts', 'Food Delivery', 'Moving Help', 'Photography', 'Design Work'].map((service) => (
                <Link 
                  key={service}
                  to={`/services?category=${encodeURIComponent(service)}`}
                  className="bg-gray-100 hover:bg-primary-100 px-4 py-2 rounded-full text-sm text-gray-700 hover:text-primary-700 cursor-pointer transition-colors"
                >
                  {service}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Beta Notice */}
        <div className="mt-8 card bg-primary-50 border-2 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-primary-900 mb-2">
                🚀 You're an Early Adopter!
              </h4>
              <p className="text-sm text-primary-800">
                Thanks for being one of the first to try Husleflow! We're building this for students like you. 
                Your feedback helps shape the future of campus services.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Creative Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container-custom py-6">
          <div className="flex flex-col items-center space-y-3">
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
            <p className="text-xs text-gray-400">
              © 2026 Husleflow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
