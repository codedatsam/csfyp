// ==========================================
// MY REVIEWS PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: View reviews given and received
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  MessageSquare, 
  User,
  Calendar,
  Loader2,
  ThumbsUp,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function MyReviews() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'given'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalGiven: 0,
    averageRating: 0
  });

  // Fetch stats on mount
  useEffect(() => {
    fetchAllStats();
  }, []);

  // Fetch reviews when tab changes
  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchAllStats = async () => {
    try {
      // Fetch both endpoints to get complete stats
      const [receivedRes, givenRes] = await Promise.all([
        api.get('/reviews/about-me').catch(() => ({ success: false })),
        api.get('/reviews/my-reviews').catch(() => ({ success: false }))
      ]);

      setStats({
        totalReceived: receivedRes.success ? receivedRes.data.stats?.totalReviews || receivedRes.data.pagination?.total || 0 : 0,
        totalGiven: givenRes.success ? givenRes.data.stats?.totalGiven || givenRes.data.pagination?.total || 0 : 0,
        averageRating: receivedRes.success ? receivedRes.data.stats?.averageRating || 0 : 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'received' 
        ? '/reviews/about-me' 
        : '/reviews/my-reviews';
      
      const response = await api.get(endpoint);
      
      if (response.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-gray-600">
            View and manage reviews you've given and received
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Average Rating</p>
                <p className="text-3xl font-bold">{stats.averageRating?.toFixed(1) || '0.0'}</p>
              </div>
              <Star className="h-10 w-10 text-yellow-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Reviews Received</p>
                <p className="text-3xl font-bold">{stats.totalReceived || 0}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Reviews Given</p>
                <p className="text-3xl font-bold">{stats.totalGiven || 0}</p>
              </div>
              <ThumbsUp className="h-10 w-10 text-green-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Reviews Received
          </button>
          <button
            onClick={() => setActiveTab('given')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'given'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Reviews Given
          </button>
        </div>

        {/* Reviews List */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'received'
                  ? "You haven't received any reviews yet. Complete bookings to get reviews!"
                  : "You haven't given any reviews yet. Review services after your bookings!"}
              </p>
              {activeTab === 'received' ? (
                <Link
                  to="/services"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  Browse Services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/dashboard/my-bookings"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  View Bookings
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {activeTab === 'received'
                            ? review.reviewer?.firstName || 'Anonymous'
                            : review.service?.serviceName || 'Service'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                      "{review.comment}"
                    </p>
                  )}

                  {review.service && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link
                        to={`/services/${review.service.id}`}
                        className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                      >
                        View Service: {review.service.serviceName}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                About Reviews
              </h4>
              <p className="text-sm text-blue-800">
                Reviews help build trust in the Husleflow community. After completing a booking, 
                both parties can leave reviews. Good reviews help service providers attract more 
                customers and help clients find quality services.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyReviews;
