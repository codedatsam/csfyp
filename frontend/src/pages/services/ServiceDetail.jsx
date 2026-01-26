// ==========================================
// SERVICE DETAIL PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: View service details and book
// ==========================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Star, 
  Clock, 
  MapPin, 
  Calendar,
  Loader2,
  User,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking form
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchService();
  }, [id]);

  useEffect(() => {
    if (selectedDate && service) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${id}`);
      if (response.success) {
        setService(response.data.service);
      }
    } catch (error) {
      console.error('Failed to fetch service:', error);
      toast.error('Service not found');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await api.get(`/bookings/available-slots?providerId=${service.providerId}&date=${selectedDate}`);
      if (response.success) {
        setAvailableSlots(response.data.availableSlots);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      setBooking(true);
      const response = await api.post('/bookings', {
        serviceId: id,
        bookingDate: selectedDate,
        timeSlot: selectedTime,
        notes
      });

      if (response.success) {
        toast.success('Booking request sent! 🎉');
        navigate('/dashboard/my-bookings');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.error || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const isOwnService = user && service.provider?.userId === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <Link to="/services" className="inline-flex items-center text-gray-600 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="card">
              <span className="inline-block bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
                {service.category}
              </span>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {service.serviceName}
              </h1>

              <p className="text-gray-600 mb-6">
                {service.description || 'No description provided'}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <span className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {service.duration} minutes
                </span>
                <span className="text-2xl font-bold text-primary-600">
                  £{parseFloat(service.price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Provider Info Card */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the Provider</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 text-2xl font-bold">
                    {service.provider?.user?.firstName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {service.provider?.user?.firstName} {service.provider?.user?.lastName}
                  </h3>
                  {service.provider?.user?.location && (
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.provider.user.location}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    {service.provider?.rating > 0 && (
                      <span className="flex items-center text-yellow-600">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400" />
                        {parseFloat(service.provider.rating).toFixed(1)} rating
                      </span>
                    )}
                    <span className="text-gray-500">
                      {service.provider?.totalBookings || 0} completed bookings
                    </span>
                  </div>
                  
                  {/* Message Provider Button */}
                  {user && !isOwnService && service.provider?.user?.id && (
                    <Link
                      to={`/messages?to=${service.provider.user.id}`}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message Provider
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {service.provider?.reviews?.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {service.provider.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {review.client?.firstName}
                        </span>
                        <div className="flex items-center text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400' : 'fill-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm ml-10">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Book this Service
              </h2>

              {isOwnService ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">This is your own service</p>
                  <Link to="/dashboard/my-services" className="btn btn-secondary">
                    Manage Your Services
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime('');
                        }}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="input pl-10 w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time
                      </label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <p className="text-red-600 text-sm">No available slots for this date</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                selectedTime === slot
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requests..."
                        rows={3}
                        className="input pl-10 w-full"
                      />
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        £{parseFloat(service.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={booking || !selectedTime}
                      className="btn btn-primary w-full"
                    >
                      {booking ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Booking...
                        </>
                      ) : (
                        'Request Booking'
                      )}
                    </button>
                  </div>

                  {!user && (
                    <p className="text-center text-sm text-gray-500">
                      <Link to="/login" className="text-primary-600 font-medium">
                        Login
                      </Link>{' '}
                      to book this service
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail;
