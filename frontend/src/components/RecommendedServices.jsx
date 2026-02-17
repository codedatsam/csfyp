// ==========================================
// RECOMMENDED SERVICES COMPONENT
// ==========================================
// Author: Samson Fabiyi
// Description: Display personalized service recommendations
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Star, 
  MapPin, 
  Clock, 
  ChevronRight,
  Loader2,
  Info,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';

function RecommendedServices({ limit = 4, showExplanations = true }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/recommendations?limit=${limit}`);
      
      if (response.success) {
        setRecommendations(response.data.recommendations || []);
        setUserProfile(response.data.userProfile || null);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Unable to load recommendations');
      // Try to fetch trending instead
      fetchTrending();
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await api.get(`/recommendations/trending?limit=${limit}`);
      if (response.success) {
        setRecommendations(response.data.trending || []);
      }
    } catch (err) {
      console.error('Failed to fetch trending:', err);
    }
  };

  // Get icon for explanation type
  const getExplanationIcon = (rule) => {
    switch (rule) {
      case 'category': return '📂';
      case 'location': return '📍';
      case 'price': return '💰';
      case 'rating': return '⭐';
      case 'availability': return '📅';
      case 'popular': return '🔥';
      case 'trending': return '📈';
      default: return '✓';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Discover Services</h3>
        </div>
        <p className="text-gray-500 text-center py-4">
          Book a few services to get personalized recommendations!
        </p>
        <Link 
          to="/services" 
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          Browse All Services
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
        </div>
        <Link 
          to="/services" 
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* User Profile Summary (optional) */}
      {userProfile && userProfile.totalBookings > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
          <p>
            Based on your <strong>{userProfile.totalBookings}</strong> bookings
            {userProfile.favoriteCategories?.length > 0 && (
              <> in <strong>{userProfile.favoriteCategories[0].category}</strong></>
            )}
          </p>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.service.id}
            to={`/services/${rec.service.id}`}
            className="block group"
          >
            <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              {/* Service Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {rec.service.image ? (
                  <img 
                    src={rec.service.image} 
                    alt={rec.service.serviceName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {rec.service.serviceName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {rec.service.serviceName}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {rec.service.provider.businessName}
                    </p>
                  </div>
                  <span className="font-bold text-primary-600">
                    £{parseFloat(rec.service.price).toFixed(2)}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {rec.service.provider.rating && parseFloat(rec.service.provider.rating) > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {parseFloat(rec.service.provider.rating).toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {rec.service.duration} min
                  </span>
                  {rec.service.provider.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {rec.service.provider.location}
                    </span>
                  )}
                </div>

                {/* Explanations */}
                {showExplanations && rec.explanations?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.explanations.slice(0, 3).map((exp, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full"
                        title={`+${exp.points} points`}
                      >
                        {getExplanationIcon(exp.rule)} {exp.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Score Legend (optional tooltip) */}
      {showExplanations && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Info className="h-3 w-3" />
            <span>Recommendations based on your booking history</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendedServices;
