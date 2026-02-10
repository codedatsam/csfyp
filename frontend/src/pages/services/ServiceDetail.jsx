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
  QrCode,
  Share2,
  Copy,
  Check,
  X,
  Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

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
      // Generate time slots (simplified - in production, check against existing bookings)
      const slots = [];
      for (let hour = 9; hour <= 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 18) {
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book');
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
        serviceId: service.id,
        bookingDate: selectedDate,
        timeSlot: selectedTime,
        notes
      });

      if (response.success) {
        toast.success('Booking request sent! 🎉');
        navigate('/dashboard/my-bookings');
      }
    } catch (error) {
      toast.error(error.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getBookingUrl = () => {
    return `${window.location.origin}/services/${id}`;
  };

  const copyBookingUrl = () => {
    navigator.clipboard.writeText(getBookingUrl());
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareService = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.serviceName,
          text: `Check out this service on Husleflow: ${service.serviceName}`,
          url: getBookingUrl()
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyBookingUrl();
        }
      }
    } else {
      copyBookingUrl();
    }
  };

  // Generate QR Code using API
  const getQRCodeUrl = () => {
    const bookingUrl = encodeURIComponent(getBookingUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingUrl}&bgcolor=ffffff&color=4F46E5`;
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

  if (!service) {
    return null;
  }

  const isOwnService = user && service.provider?.user?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container-custom py-4 flex items-center justify-between">
          <Link to="/services" className="inline-flex items-center text-gray-600 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={shareService}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
              title="QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Image */}
            {service.image && (
              <div className="rounded-xl overflow-hidden bg-white shadow-sm">
                <img 
                  src={service.image} 
                  alt={service.serviceName}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
            )}

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
                {service.provider?.user?.avatar ? (
                  <img 
                    src={service.provider.user.avatar}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 text-2xl font-bold">
                      {(service.provider?.businessName || service.provider?.user?.firstName)?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {service.provider?.businessName || `${service.provider?.user?.firstName} ${service.provider?.user?.lastName}`}
                  </h3>
                  {(service.location || service.provider?.location || service.provider?.user?.location) && (
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.location || service.provider?.location || service.provider?.user?.location}
                    </p>
                  )}
                  {service.provider?.rating > 0 && (
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{parseFloat(service.provider.rating).toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">rating</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {service.provider?.reviews?.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {service.provider.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Book this Service
              </h2>

              {isOwnService ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">This is your service</p>
                  <Link to="/dashboard/my-services" className="btn btn-secondary w-full">
                    Manage Services
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      className="input w-full"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Select Time
                      </label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                selectedTime === slot
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'border-gray-200 hover:border-primary-300'
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
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input w-full"
                      rows={3}
                      placeholder="Any special requests or requirements..."
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        £{parseFloat(service.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={booking || !selectedDate || !selectedTime}
                    className="btn btn-primary w-full"
                  >
                    {booking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Booking...
                      </>
                    ) : (
                      'Request Booking'
                    )}
                  </button>

                  {!user && (
                    <p className="text-sm text-gray-500 text-center">
                      <Link to="/login" className="text-primary-600 hover:underline">
                        Login
                      </Link>{' '}
                      to book this service
                    </p>
                  )}
                </form>
              )}

              {/* QR Code for quick booking */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowQRModal(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                >
                  <QrCode className="h-4 w-4" />
                  Share via QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Share Service</h3>
              <button 
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-sm border">
                <img 
                  src={getQRCodeUrl()}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Scan this QR code to book <strong>{service.serviceName}</strong>
              </p>
              
              {/* Copy Link */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <input
                  type="text"
                  value={getBookingUrl()}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                />
                <button
                  onClick={copyBookingUrl}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={shareService}
                className="flex-1 btn btn-primary"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceDetail;
