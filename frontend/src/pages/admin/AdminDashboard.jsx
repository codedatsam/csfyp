// ==========================================
// ADMIN DASHBOARD
// ==========================================
// Author: Samson Fabiyi
// Description: Admin panel main dashboard
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Calendar,
  TrendingUp,
  Shield,
  Loader2,
  UserCheck,
  UserX,
  Package,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      if (response.success) {
        setStats(response.data.stats);
        setRecentUsers(response.data.recentUsers);
        setRecentBookings(response.data.recentBookings);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Husleflow Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName}
              </span>
              <Link to="/dashboard" className="btn btn-secondary text-sm">
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/admin"
              className="border-b-2 border-primary-600 text-primary-600 px-1 py-4 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              Users
            </Link>
            <Link
              to="/admin/services"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              Services
            </Link>
            <Link
              to="/admin/bookings"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              Bookings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats?.users?.providers || 0} providers, {stats?.users?.clients || 0} clients
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Services */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Services</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.services?.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats?.services?.active || 0} active, {stats?.services?.inactive || 0} inactive
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.bookings?.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats?.bookings?.completed || 0} completed
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Bookings</p>
                <p className="text-3xl font-bold text-orange-600">{stats?.bookings?.pending || 0}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Awaiting confirmation
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-700">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentUsers.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No users yet</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-semibold">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'PROVIDER' 
                        ? 'bg-purple-100 text-purple-700' 
                        : user.role === 'ADMIN'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Link to="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-700">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentBookings.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.service?.serviceName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.client?.firstName} {booking.client?.lastName}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-700' 
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : booking.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
