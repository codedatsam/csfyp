// ==========================================
// SIMILAR SERVICES COMPONENT
// ==========================================
// Author: Samson Fabiyi
// Description: Display services similar to a given service
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import api from '../services/api';

function SimilarServices({ serviceId, limit = 4 }) {
  const [similarServices, setSimilarServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      fetchSimilarServices();
    }
  }, [serviceId]);

  const fetchSimilarServices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/recommendations/similar/${serviceId}?limit=${limit}`);
      
      if (response.success) {
        setSimilarServices(response.data.similarServices || []);
      }
    } catch (err) {
      console.error('Failed to fetch similar services:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Services</h3>
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (similarServices.length === 0) {
    return null; // Don't show section if no similar services
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Similar Services</h3>
        <Link 
          to="/services" 
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Similar Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {similarServices.map((item) => (
          <Link
            key={item.service.id}
            to={`/services/${item.service.id}`}
            className="group block"
          >
            <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 hover:border-gray-200">
              {/* Service Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {item.service.image ? (
                  <img 
                    src={item.service.image} 
                    alt={item.service.serviceName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {item.service.serviceName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 text-sm">
                  {item.service.serviceName}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {item.service.provider.businessName}
                </p>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {item.service.provider.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {item.service.provider.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {item.service.duration}m
                    </span>
                  </div>
                  <span className="font-semibold text-primary-600 text-sm">
                    £{item.service.price.toFixed(2)}
                  </span>
                </div>

                {/* Why similar - small badge */}
                {item.explanations?.length > 0 && (
                  <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1">
                    {item.explanations[0].text}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SimilarServices;
