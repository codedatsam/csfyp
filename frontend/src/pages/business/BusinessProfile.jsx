// ==========================================
// BUSINESS PROFILE PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Public business profile with services, hours, reviews
// ==========================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  Award,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Phone,
  Mail
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function BusinessProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHours, setShowHours] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchBusinessProfile();
  }, [providerId]);

  const fetchBusinessProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/business/${providerId}`);
      if (response.success) {
        setBusiness(response.data.business);
        setServices(response.data.services || []);
        setBusinessHours(response.data.businessHours || []);
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch business profile:', error);
      toast.error('Business not found');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDayStatus = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const today = days[new Date().getDay()];
    const todayHours = businessHours.find(h => h.day === today);
    
    if (!todayHours || !todayHours.isOpen) return { isOpen: false, text: 'Closed today' };
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentTime >= todayHours.startTime && currentTime <= todayHours.endTime) {
      return { isOpen: true, text: `Open · Closes ${todayHours.endTime}` };
    } else if (currentTime < todayHours.startTime) {
      return { isOpen: false, text: `Opens ${todayHours.startTime}` };
    } else {
      return { isOpen: false, text: 'Closed' };
    }
  };

  const formatDay = (day) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
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

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container-custom py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Business not found</h2>
          <Link to="/services" className="btn btn-primary mt-4">Browse Services</Link>
        </div>
      </div>
    );
  }

  const dayStatus = getCurrentDayStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-white border-b">
        {/* Back Button */}
        <div className="container-custom pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>

        <div className="container-custom pb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Business Image */}
            <div className="w-full md:w-80 h-48 md:h-56 rounded-xl overflow-hidden flex-shrink-0">
              {business.image ? (
                <img 
                  src={business.image} 
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-6xl text-white font-bold">
                    {business.name?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {business.name}
                    </h1>
                    {business.isTopRated && (
                      <div className="bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Top Rated
                      </div>
                    )}
                    {business.isVerified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 font-semibold text-gray-900">
                        {business.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {business.totalReviews} reviews
                    </span>
                  </div>

                  {/* Location */}
                  {business.location && (
                    <p className="text-gray-600 flex items-center mb-3">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {business.location}
                    </p>
                  )}

                  {/* Open Status */}
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setShowHours(!showHours)}
                  >
                    <span className={`w-2 h-2 rounded-full ${dayStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm ${dayStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {dayStatus.text}
                    </span>
                    {showHours ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {/* Description */}
              {business.description && (
                <p className="text-gray-600 mt-4 line-clamp-3">
                  {business.description}
                </p>
              )}

              {/* Specialties */}
              {business.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {business.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Hours Dropdown */}
        {showHours && (
          <div className="container-custom pb-6">
            <div className="bg-gray-50 rounded-xl p-4 mt-2">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Opening Hours
              </h3>
              <div className="space-y-2">
                {businessHours.map((dayHours, index) => {
                  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                  const isToday = days[new Date().getDay()] === dayHours.day;
                  return (
                    <div 
                      key={index}
                      className={`flex justify-between text-sm ${isToday ? 'font-semibold text-primary-600' : 'text-gray-600'}`}
                    >
                      <span className="flex items-center">
                        {isToday && <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />}
                        {formatDay(dayHours.day)}
                      </span>
                      <span className={dayHours.isOpen ? '' : 'text-gray-400'}>
                        {dayHours.isOpen ? dayHours.hours : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services Section */}
      <div className="container-custom py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Services</h2>
        
        {services.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border">
            <p className="text-gray-500">No services available</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border divide-y">
            {services.map((service) => (
              <Link 
                key={service.id}
                to={`/services/${service.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.duration} mins</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">£{service.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="container-custom py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Reviews ({business.totalReviews})
          </h2>
          {reviews.length > 3 && (
            <button 
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="text-primary-600 text-sm hover:underline"
            >
              {showAllReviews ? 'Show less' : 'See all'}
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-4 border">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    {review.client.avatar ? (
                      <img 
                        src={review.client.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-700 font-semibold">
                        {review.client.name?.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{review.client.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    {review.comment && (
                      <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Book Button */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:hidden">
        <Link 
          to={services.length > 0 ? `/services/${services[0].id}` : '#'}
          className="btn btn-primary w-full"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

export default BusinessProfile;
