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
  MapPin, 
  User,
  Star,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const isProvider = user?.role === 'PROVIDER';

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint = isProvider ? '/bookings/provider-bookings' : '/bookings/my-bookings';
      const params = activeTab !== 'all' ? `?status=${activeTab.toUpperCase()}` : '';
      const response = await api.get(`${endpoint}${params}`);
      if (response.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      toast.success(`Booking ${status.toLowerCase()}!`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewData({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/reviews', {
        bookingId: selectedBooking.id,
        ...reviewData
      });
      toast.success('Review submitted! ⭐');
      setShowReviewModal(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isProvider ? 'Booking Requests 📋' : 'My Bookings 📅'}
          </h1>
          <p className="text-gray-600">
            {isProvider ? 'Manage booking requests from students' : 'Track your service bookings'}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">
              {isProvider ? 'Bookings will appear here when students book your services' : 'Browse services to make your first booking'}
            </p>
            {!isProvider && (
              <Link to="/services" className="btn btn-primary">Browse Services</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{booking.service?.serviceName}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(booking.bookingDate).toLocaleDateString('en-GB', { 
                          weekday: 'short', day: 'numeric', month: 'short' 
                        })}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {booking.timeSlot}
                      </span>
                      <span className="font-bold text-primary-600">
                        £{parseFloat(booking.totalPrice).toFixed(2)}
                      </span>
                    </div>
                    {/* Client/Provider Info */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isProvider 
                            ? `${booking.client?.firstName} ${booking.client?.lastName}`
                            : `${booking.provider?.user?.firstName} ${booking.provider?.user?.lastName}`
                          }
                        </p>
                        {booking.notes && (
                          <p className="text-xs text-gray-500 flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {isProvider && booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                          className="btn btn-primary text-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                          className="btn btn-secondary text-sm text-red-600"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {isProvider && booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                        className="btn btn-primary text-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                    {!isProvider && booking.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="btn btn-secondary text-sm text-red-600"
                      >
                        Cancel
                      </button>
                    )}
                    {!isProvider && booking.status === 'COMPLETED' && !booking.review && (
                      <button
                        onClick={() => openReviewModal(booking)}
                        className="btn btn-primary text-sm"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Leave Review
                      </button>
                    )}
                    {booking.review && (
                      <span className="flex items-center text-sm text-yellow-600">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400" />
                        {booking.review.rating}/5 reviewed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
            <p className="text-gray-600 mb-4">
              How was your experience with {selectedBooking.service?.serviceName}?
            </p>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={3}
                  className="input w-full"
                  placeholder="Tell others about your experience..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 btn btn-primary">
                  {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
