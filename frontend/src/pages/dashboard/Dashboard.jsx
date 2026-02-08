// ==========================================
// DASHBOARD PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Main dashboard after login
// ==========================================

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Search,
  Briefcase,
  Star,
  Settings,
  Shield
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';

function Dashboard() {
  const { user } = useAuth();

  // Get user role display
  const getRoleBadge = () => {
    if (user?.role === 'ADMIN') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">🛡️ Admin</span>;
    } else if (user?.role === 'PROVIDER') {
      return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">💼 Provider</span>;
    } else {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">🎓 Student</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar */}
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary-600">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  )}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  {getRoleBadge()}
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Campus / Hall</p>
                    <p className="font-medium text-gray-900">{user?.location || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <Link 
                to="/dashboard/profile" 
                className="btn btn-primary mt-6 inline-flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {/* Find Services - Link to home for now (has services) */}
                <Link 
                  to="/" 
                  className="w-full btn btn-primary justify-start flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Services
                </Link>

                {/* My Services - Everyone can create services */}
                <Link 
                  to="/dashboard/my-services" 
                  className="w-full btn btn-secondary justify-start flex items-center"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  My Services
                </Link>

                {/* My Bookings */}
                <Link 
                  to="/dashboard/my-bookings" 
                  className="w-full btn btn-secondary justify-start flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  My Bookings
                </Link>

                {/* My Reviews - Coming Soon */}
                <button 
                  onClick={() => alert('Reviews feature coming soon!')}
                  className="w-full btn btn-secondary justify-start flex items-center opacity-60"
                >
                  <Star className="h-4 w-4 mr-2" />
                  My Reviews
                </button>

                {/* Account Settings */}
                <Link 
                  to="/dashboard/settings" 
                  className="w-full btn btn-secondary justify-start flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Link>

                {/* Admin Panel - Only for admins */}
                {user?.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="w-full btn justify-start flex items-center bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Link>
                )}
              </div>

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Account Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold mb-2">
                Welcome to Husleflow! 🎉
              </h4>
              <p className="text-sm text-white/90">
                {user?.role === 'PROVIDER' || user?.role === 'ADMIN'
                  ? "Manage your services, track bookings, and grow your business on campus."
                  : "Browse services from fellow students, book appointments, and get things done!"}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container-custom py-6">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Husleflow - University of Hertfordshire
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
