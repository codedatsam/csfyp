// ==========================================
// MY BOOKINGS PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: View and manage bookings
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, all

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Try provider bookings first, then client bookings
      const endpoint = user?.role === 'PROVIDER' ? '/bookings/provider-bookings' : '/bookings/my-bookings';
      const response = await api.get(endpoint);
      if (response.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/status`, { status });
      if (response.success) {
        toast.success(`Booking ${status.toLowerCase()}`);
        fetchBookings();
      }
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const filterBookings = () => {
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(b => new Date(b.bookingDate) >= now && b.status !== 'CANCELLED');
      case 'past':
        return bookings.filter(b => new Date(b.bookingDate) < now || b.status === 'COMPLETED');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view bookings.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">
            {user?.role === 'PROVIDER' 
              ? 'Manage bookings from your clients' 
              : 'View your service bookings'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['upcoming', 'past', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'PROVIDER'
                ? "You haven't received any bookings yet"
                : "You haven't made any bookings yet"}
            </p>
            {user?.role !== 'PROVIDER' && (
              <Link to="/services" className="btn btn-primary">
                Browse Services
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.service?.serviceName || 'Service'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.bookingDate).toLocaleDateString('en-GB', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.timeSlot}
                          </span>
                        </div>
                        
                        {/* Client/Provider Info */}
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          {user?.role === 'PROVIDER' ? (
                            <span>
                              Client: {booking.client?.firstName} {booking.client?.lastName}
                              {booking.notes?.includes('[GUEST:') && (
                                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Guest</span>
                              )}
                            </span>
                          ) : (
                            <span>Provider: {booking.service?.provider?.user?.firstName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(booking.status)}
                    
                    <p className="text-lg font-bold text-primary-600">
                      £{parseFloat(booking.service?.price || 0).toFixed(2)}
                    </p>

                    {/* Provider Actions */}
                    {user?.role === 'PROVIDER' && booking.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {user?.role === 'PROVIDER' && booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && !booking.notes.includes('[GUEST:') && (
                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'PENDING').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'CONFIRMED').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
