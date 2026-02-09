// ==========================================
// ANALYTICS DASHBOARD
// ==========================================
// Author: Samson Fabiyi
// Description: User spending analytics (same for all users)
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  PieChart,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/client');
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  // Safe defaults for analytics data
  const overview = analytics?.overview || {
    totalSpent: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0
  };
  
  const spendingByCategory = analytics?.spendingByCategory || {};
  const recentBookings = analytics?.recentBookings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="container-custom py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            My Analytics 📊
          </h1>
          <p className="text-white/80">Track your bookings and spending</p>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Spent */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  £{(overview.totalSpent || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{overview.totalBookings || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{overview.completedBookings || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{overview.pendingBookings || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending by Category */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary-600" />
              Spending by Category
            </h3>
            {Object.keys(spendingByCategory).length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No completed bookings yet</p>
                <Link to="/services" className="text-primary-600 text-sm hover:underline">
                  Browse services →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(spendingByCategory).slice(0, 5).map(([category, amount], index) => {
                  const colors = ['bg-primary-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                  const totalSpending = Object.values(spendingByCategory).reduce((a, b) => a + b, 0);
                  const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 truncate">{category}</span>
                        <span className="text-gray-900 font-medium">£{(amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                Recent Bookings
              </h3>
              <Link to="/dashboard/my-bookings" className="text-sm text-primary-600 hover:text-primary-700">
                View all →
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No bookings yet</p>
                <Link to="/services" className="text-primary-600 text-sm hover:underline">
                  Book your first service →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{booking.serviceName || 'Service'}</p>
                      <p className="text-xs text-gray-500">
                        {booking.date ? new Date(booking.date).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-gray-900">£{(booking.amount || 0).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/services" className="btn btn-primary">
              Browse Services
            </Link>
            <Link to="/dashboard/my-bookings" className="btn btn-secondary">
              My Bookings
            </Link>
            <Link to="/dashboard/reviews" className="btn btn-secondary">
              My Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
