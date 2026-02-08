// ==========================================
// BOOK FOR CLIENT COMPONENT
// ==========================================
// Author: Samson Fabiyi
// Description: Provider can book for registered users OR guests
// ==========================================

import { useState, useEffect } from 'react';
import { X, Search, User, UserPlus, Calendar, Clock, Check, Loader2, Mail, Phone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

function BookForClient({ service, onClose, onSuccess }) {
  const [bookingType, setBookingType] = useState('registered'); // 'registered' or 'guest'
  const [step, setStep] = useState(1); // 1: Select client, 2: Select date/time
  
  // Registered user search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searching, setSearching] = useState(false);
  
  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  
  // Booking details
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Search clients as user types
  useEffect(() => {
    if (bookingType !== 'registered') return;
    
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchClients();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, bookingType]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && service?.providerId) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const searchClients = async () => {
    try {
      setSearching(true);
      const response = await api.get(`/bookings/search-clients?query=${encodeURIComponent(searchQuery)}`);
      if (response.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
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
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setStep(2);
  };

  const handleGuestContinue = () => {
    if (!guestName.trim()) {
      toast.error('Please enter guest name');
      return;
    }
    if (!guestEmail.trim()) {
      toast.error('Please enter guest email');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      setLoading(true);
      
      let response;
      
      if (bookingType === 'registered' && selectedClient) {
        // Book for registered user
        response = await api.post('/bookings/for-client', {
          serviceId: service.id,
          clientEmail: selectedClient.email,
          bookingDate: selectedDate,
          timeSlot: selectedTime,
          notes
        });
      } else {
        // Book for guest
        response = await api.post('/bookings/for-guest', {
          serviceId: service.id,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim().toLowerCase(),
          guestPhone: guestPhone.trim() || null,
          bookingDate: selectedDate,
          timeSlot: selectedTime,
          notes
        });
      }

      if (response.success) {
        const clientName = bookingType === 'registered' 
          ? selectedClient.firstName 
          : guestName;
        
        // Show appropriate message based on email status
        if (bookingType === 'guest' && response.data.emailSent === false) {
          toast.success(`Booking created for ${clientName}! ⚠️ Email could not be sent.`, {
            duration: 5000
          });
        } else {
          toast.success(`Booking created for ${clientName}! 📧 Confirmation sent.`);
        }
        
        if (onSuccess) onSuccess(response.data.booking);
        onClose();
      }
    } catch (error) {
      toast.error(error.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getClientDisplay = () => {
    if (bookingType === 'registered' && selectedClient) {
      return {
        name: `${selectedClient.firstName} ${selectedClient.lastName}`,
        email: selectedClient.email,
        isGuest: false
      };
    }
    return {
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      isGuest: true
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-primary-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Book for Client</h2>
            <p className="text-sm text-gray-500">{service?.serviceName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              {/* Booking Type Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => { setBookingType('registered'); setSearchQuery(''); setSearchResults([]); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    bookingType === 'registered' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Registered User
                </button>
                <button
                  onClick={() => { setBookingType('guest'); setSelectedClient(null); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    bookingType === 'guest' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Guest (New)
                </button>
              </div>

              {bookingType === 'registered' ? (
                /* Search Registered Users */
                <>
                  <p className="text-sm text-gray-600">
                    Search for a registered Husleflow user by email or name.
                  </p>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by email or name..."
                      className="input pl-10"
                      autoFocus
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600 animate-spin" />
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-2">No users found.</p>
                        <button
                          onClick={() => setBookingType('guest')}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          Book as guest instead →
                        </button>
                      </div>
                    )}

                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectClient(user)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-primary-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Check className="h-5 w-5 text-primary-600 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Guest Form */
                <>
                  <p className="text-sm text-gray-600">
                    Enter guest details. They'll receive an email confirmation with a link to join Husleflow.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guest Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="John Smith"
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="07123 456789"
                          className="input pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-blue-800">
                      📧 The guest will receive an email with booking details and an invitation to join Husleflow.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Selected Client/Guest */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                getClientDisplay().isGuest 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  getClientDisplay().isGuest 
                    ? 'bg-orange-100' 
                    : 'bg-green-100'
                }`}>
                  {getClientDisplay().isGuest 
                    ? <UserPlus className="h-5 w-5 text-orange-600" />
                    : <User className="h-5 w-5 text-green-600" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{getClientDisplay().name}</p>
                    {getClientDisplay().isGuest && (
                      <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">Guest</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{getClientDisplay().email}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                  min={getMinDate()}
                  className="input"
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
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No available slots for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                            selectedTime === slot
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  className="input"
                  rows={2}
                />
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Client:</strong> {getClientDisplay().name} {getClientDisplay().isGuest && '(Guest)'}</p>
                    <p><strong>Service:</strong> {service.serviceName}</p>
                    <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Price:</strong> £{parseFloat(service.price).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="btn btn-secondary flex-1"
            >
              Back
            </button>
          )}
          <button
            onClick={
              step === 1 
                ? (bookingType === 'guest' ? handleGuestContinue : onClose)
                : handleSubmit
            }
            disabled={step === 2 && (!selectedDate || !selectedTime || loading)}
            className="btn btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : step === 1 ? (
              bookingType === 'guest' ? 'Continue' : 'Cancel'
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookForClient;
