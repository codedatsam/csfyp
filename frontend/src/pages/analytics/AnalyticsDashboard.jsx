// ==========================================
// ANALYTICS DASHBOARD
// ==========================================
// Author: Samson Fabiyi
// Description: Provider earnings and statistics
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(user?.role === 'PROVIDER' ? 'provider' : 'client');

  useEffect(() => {
    fetchAnalytics();
  }, [viewMode]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch based on view mode (provider or client)
      const endpoint = viewMode === 'provider' ? '/analytics/provider' : '/analytics/client';
      const response = await api.get(endpoint);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // If provider analytics fails, try client
      if (viewMode === 'provider') {
        try {
          const clientResponse = await api.get('/analytics/client');
          if (clientResponse.success) {
            setAnalytics(clientResponse.data);
            setViewMode('client');
          }
        } catch (e) {
          toast.error('Failed to load analytics');
        }
      } else {
        toast.error('Failed to load analytics');
      }
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container-custom py-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Analytics Available</h2>
          <p className="text-gray-500 mb-4">
            {viewMode === 'provider' 
              ? 'Start offering services to see your analytics!'
              : 'Start booking services to see your spending analytics!'}
          </p>
          <Link to={viewMode === 'provider' ? '/dashboard/my-services' : '/services'} className="btn btn-primary">
            {viewMode === 'provider' ? 'Create a Service' : 'Browse Services'}
          </Link>
        </div>
      </div>
    );
  }

  // Client Analytics View
  if (viewMode === 'client') {
    const { overview, spendingByCategory, recentBookings } = analytics;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container-custom py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  My Spending Analytics 💰
                </h1>
                <p className="text-gray-600">Track your bookings and spending</p>
              </div>
              {user?.role === 'PROVIDER' && (
                <button
                  onClick={() => setViewMode('provider')}
                  className="btn btn-secondary"
                >
                  View Provider Analytics
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container-custom py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    £{overview.totalSpent?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

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
              {!spendingByCategory || Object.keys(spendingByCategory).length === 0 ? (
                <p className="text-gray-500 text-sm">No completed bookings yet</p>
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
                          <span className="text-gray-900 font-medium">£{amount.toFixed(2)}</span>
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
                <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
                <Link to="/dashboard/my-bookings" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>
              {!recentBookings || recentBookings.length === 0 ? (
                <p className="text-gray-500 text-sm">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{booking.serviceName}</p>
                        <p className="text-xs text-gray-500">{booking.providerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">£{booking.amount?.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { overview, serviceBreakdown, monthlyData, recentBookings, recentReviews } = analytics;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Analytics Dashboard 📊
              </h1>
              <p className="text-gray-600">Track your earnings and performance</p>
            </div>
            <button
              onClick={() => setViewMode('client')}
              className="btn btn-secondary"
            >
              View My Spending
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  £{overview.totalEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  From {overview.completedBookings} completed
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  £{overview.monthlyEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Weekly: £{overview.weeklyEarnings.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{overview.totalBookings}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {overview.pendingBookings} pending
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.averageRating > 0 ? overview.averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview.totalReviews} review{overview.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              Earnings Over Time
            </h3>
            <div className="h-64">
              {/* Simple bar chart */}
              <div className="flex items-end justify-between h-full gap-2">
                {monthlyData.map((month, index) => {
                  const maxEarning = Math.max(...monthlyData.map(m => m.earnings), 1);
                  const height = (month.earnings / maxEarning) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-48">
                        <span className="text-xs text-gray-600 mb-1">
                          £{month.earnings.toFixed(0)}
                        </span>
                        <div 
                          className="w-full bg-primary-500 rounded-t-md transition-all duration-300 hover:bg-primary-600"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                      <span className="text-xs text-gray-400">{month.bookings} bookings</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary-600" />
              Earnings by Service
            </h3>
            {serviceBreakdown.length === 0 ? (
              <p className="text-gray-500 text-sm">No completed bookings yet</p>
            ) : (
              <div className="space-y-3">
                {serviceBreakdown.slice(0, 5).map((service, index) => {
                  const colors = ['bg-primary-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                  const totalEarnings = serviceBreakdown.reduce((sum, s) => sum + s.total, 0);
                  const percentage = totalEarnings > 0 ? (service.total / totalEarnings) * 100 : 0;
                  return (
                    <div key={service.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 truncate">{service.name}</span>
                        <span className="text-gray-900 font-medium">£{service.total.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{service.count} booking{service.count !== 1 ? 's' : ''}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Booking Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.completedBookings}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.confirmedBookings}</p>
              <p className="text-xs text-gray-500">Confirmed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.pendingBookings}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.cancelledBookings}</p>
              <p className="text-xs text-gray-500">Cancelled</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
              <Link to="/dashboard/my-bookings" className="text-sm text-primary-600 hover:text-primary-700">
                View all →
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-gray-500 text-sm">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{booking.serviceName}</p>
                      <p className="text-xs text-gray-500">{booking.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">£{booking.amount.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Reviews</h3>
            {recentReviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm">{review.clientName}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
