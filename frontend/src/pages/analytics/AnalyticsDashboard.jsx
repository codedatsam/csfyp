// ==========================================
// ANALYTICS DASHBOARD
// ==========================================
// Author: Samson Fabiyi
// Description: Analytics for all users - spending & earnings
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
  TrendingUp,
  Star,
  Users,
  ArrowUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function AnalyticsDashboard() {
  const { user } = useAuth();
  const [clientAnalytics, setClientAnalytics] = useState(null);
  const [providerAnalytics, setProviderAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('spending'); // 'spending' or 'earnings'

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch client analytics (spending) for all users
      try {
        const clientResponse = await api.get('/analytics/client');
        if (clientResponse.success) {
          setClientAnalytics(clientResponse.data);
        }
      } catch (e) {
        console.log('No client analytics');
      }

      // Fetch provider analytics (earnings) if user is provider
      if (user?.role === 'PROVIDER' || user?.role === 'ADMIN') {
        try {
          const providerResponse = await api.get('/analytics/provider');
          if (providerResponse.success) {
            setProviderAnalytics(providerResponse.data);
          }
        } catch (e) {
          console.log('No provider analytics');
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  // Safe defaults
  const clientOverview = clientAnalytics?.overview || {
    totalSpent: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0
  };
  
  const spendingByCategory = clientAnalytics?.spendingByCategory || {};
  const recentClientBookings = clientAnalytics?.recentBookings || [];

  const providerOverview = providerAnalytics?.overview || {
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    averageRating: 0
  };
  
  const serviceBreakdown = providerAnalytics?.serviceBreakdown || [];
  const recentProviderBookings = providerAnalytics?.recentBookings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="container-custom py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            My Analytics 📊
          </h1>
          <p className="text-white/80">Track your activity and performance</p>
          
          {/* Tabs for providers */}
          {(user?.role === 'PROVIDER' || providerAnalytics) && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab('spending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'spending' 
                    ? 'bg-white text-primary-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                My Spending
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'earnings' 
                    ? 'bg-white text-primary-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                My Earnings
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-6">
        {/* ===== SPENDING TAB (Client Analytics) ===== */}
        {activeTab === 'spending' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      £{(clientOverview.totalSpent || 0).toFixed(2)}
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
                    <p className="text-2xl font-bold text-gray-900">{clientOverview.totalBookings || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{clientOverview.completedBookings || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{clientOverview.pendingBookings || 0}</p>
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
                  <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
                  <Link to="/dashboard/my-bookings" className="text-sm text-primary-600 hover:text-primary-700">
                    View all →
                  </Link>
                </div>
                {recentClientBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentClientBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{booking.serviceName || 'Service'}</p>
                          <p className="text-xs text-gray-500">
                            {booking.date ? new Date(booking.date).toLocaleDateString('en-GB') : 'N/A'}
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
          </>
        )}

        {/* ===== EARNINGS TAB (Provider Analytics) ===== */}
        {activeTab === 'earnings' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      £{(providerOverview.totalEarnings || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      From {providerOverview.completedBookings || 0} completed
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
                    <p className="text-sm text-gray-500 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      £{(providerOverview.monthlyEarnings || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Weekly: £{(providerOverview.weeklyEarnings || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{providerOverview.totalBookings || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {providerOverview.pendingBookings || 0} pending
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(providerOverview.averageRating || 0).toFixed(1)} ⭐
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Service Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary-600" />
                  Earnings by Service
                </h3>
                {serviceBreakdown.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No earnings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {serviceBreakdown.slice(0, 5).map((service, index) => {
                      const colors = ['bg-primary-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                      const totalEarnings = serviceBreakdown.reduce((a, b) => a + (b.earnings || 0), 0);
                      const percentage = totalEarnings > 0 ? ((service.earnings || 0) / totalEarnings) * 100 : 0;
                      return (
                        <div key={service.name || index}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700 truncate">{service.name || 'Service'}</span>
                            <span className="text-gray-900 font-medium">£{(service.earnings || 0).toFixed(2)}</span>
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

              {/* Recent Bookings from Clients */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Recent Client Bookings</h3>
                  <Link to="/dashboard/my-bookings" className="text-sm text-primary-600 hover:text-primary-700">
                    View all →
                  </Link>
                </div>
                {recentProviderBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProviderBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{booking.clientName || 'Client'}</p>
                          <p className="text-xs text-gray-500">{booking.serviceName || 'Service'}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium text-green-600">+£{(booking.amount || 0).toFixed(2)}</p>
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
          </>
        )}

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
            {(user?.role === 'PROVIDER' || user?.role === 'ADMIN') && (
              <Link to="/dashboard/my-services" className="btn btn-secondary">
                My Services
              </Link>
            )}
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
