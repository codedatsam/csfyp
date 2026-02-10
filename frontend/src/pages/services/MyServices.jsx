// ==========================================
// MY SERVICES PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Manage user's services with modals for create/edit/book
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Search,
  Grid,
  List,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Loader2,
  X,
  MapPin,
  Settings,
  Store,
  Calendar,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import BookForClient from '../../components/BookForClient';
import ImageUpload from '../../components/common/ImageUpload';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';

const defaultCategories = [
  'Hair & Beauty',
  'Fitness & Gym',
  'Tutoring',
  'Tech Support',
  'Photography',
  'Design Work',
  'Cleaning',
  'Music Lessons',
  'Language Lessons',
  'Food & Catering',
  'Moving Help',
  'Other'
];

const daysOfWeek = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' }
];

function MyServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'business'
  
  // Business Profile State
  const [businessProfile, setBusinessProfile] = useState({
    businessName: '',
    description: '',
    businessImage: '',
    location: '',
    specialties: []
  });
  const [availability, setAvailability] = useState(
    daysOfWeek.map(d => ({
      day: d.key,
      isAvailable: false,
      startTime: '09:00',
      endTime: '17:00'
    }))
  );
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState('');
  
  // Book for Client modal
  const [bookForClientModal, setBookForClientModal] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  
  // Create/Edit Service modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    category: '',
    description: '',
    price: '',
    duration: '60',
    image: '',
    location: ''
  });

  useEffect(() => {
    fetchMyServices();
    fetchBusinessProfile();
  }, []);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services/my-services');
      if (response.success) {
        setServices(response.data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessProfile = async () => {
    try {
      const response = await api.get('/services/my-business-profile');
      if (response.success && response.data.businessProfile) {
        const profile = response.data.businessProfile;
        setBusinessProfile({
          businessName: profile.businessName || '',
          description: profile.description || '',
          businessImage: profile.businessImage || '',
          location: profile.location || '',
          specialties: profile.specialties || []
        });
        
        // Set availability
        if (response.data.availability) {
          setAvailability(response.data.availability);
        }
      }
    } catch (error) {
      console.error('Failed to fetch business profile:', error);
    }
  };

  const handleSaveBusinessProfile = async () => {
    if (!businessProfile.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }

    try {
      setSavingBusiness(true);
      const response = await api.put('/services/my-business-profile', {
        ...businessProfile,
        availability
      });
      
      if (response.success) {
        toast.success('Business profile updated! 🎉');
      }
    } catch (error) {
      console.error('Failed to save business profile:', error);
      toast.error('Failed to save business profile');
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !businessProfile.specialties.includes(specialtyInput.trim())) {
      setBusinessProfile(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()]
      }));
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setBusinessProfile(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleAvailabilityChange = (dayKey, field, value) => {
    setAvailability(prev => prev.map(a => 
      a.day === dayKey ? { ...a, [field]: value } : a
    ));
  };

  const handleToggleActive = async (serviceId, currentStatus) => {
    try {
      const response = await api.patch(`/services/${serviceId}`, {
        isActive: !currentStatus
      });
      if (response.success) {
        setServices(prev => 
          prev.map(s => s.id === serviceId ? { ...s, isActive: !currentStatus } : s)
        );
        toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      setDeleting(serviceId);
      const response = await api.delete(`/services/${serviceId}`);
      if (response.success) {
        setServices(prev => prev.filter(s => s.id !== serviceId));
        toast.success('Service deleted');
      }
    } catch (error) {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(null);
    }
  };

  const handleBookForClient = (service) => {
    setSelectedServiceForBooking(service);
    setBookForClientModal(true);
  };

  // Open modal for create
  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData({
      serviceName: '',
      category: '',
      description: '',
      price: '',
      duration: '60',
      image: '',
      location: user?.location || ''
    });
    setShowServiceModal(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      image: service.image || '',
      location: service.location || ''
    });
    setShowServiceModal(true);
  };

  // Close service modal
  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
    setFormData({
      serviceName: '',
      category: '',
      description: '',
      price: '',
      duration: '60',
      image: '',
      location: ''
    });
  };

  // Submit create/edit form
  const handleSubmitService = async (e) => {
    e.preventDefault();

    if (!formData.serviceName || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      if (editingService) {
        // Update existing service
        const response = await api.put(`/services/${editingService.id}`, formData);
        if (response.success) {
          toast.success('Service updated! ✨');
          fetchMyServices();
          handleCloseServiceModal();
        }
      } else {
        // Create new service
        const response = await api.post('/services', formData);
        if (response.success) {
          toast.success('Service created! 🎉');
          fetchMyServices();
          handleCloseServiceModal();
        }
      }
    } catch (error) {
      toast.error(error.error || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to manage services.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container-custom py-8">
        {/* Header with Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
            <p className="text-gray-600">Manage your services and business profile</p>
          </div>
          {activeTab === 'services' && (
            <button 
              onClick={handleOpenCreateModal}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Service
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'services' 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Store className="h-4 w-4 inline mr-2" />
            Services
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'business' 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Business Settings
          </button>
        </div>

        {/* Business Settings Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            {/* Business Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessProfile.businessName}
                      onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="e.g., Dollie Beauty Studio"
                      className="input w-full"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      About Your Business
                    </label>
                    <textarea
                      value={businessProfile.description}
                      onChange={(e) => setBusinessProfile(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell clients about your business, experience, and what makes you special..."
                      rows={4}
                      className="input w-full"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Business Location
                    </label>
                    <LocationAutocomplete
                      value={businessProfile.location}
                      onChange={(e) => setBusinessProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter your business location..."
                    />
                  </div>

                  {/* Specialties */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialties / Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                        placeholder="e.g., Hair Styling"
                        className="input flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecialty}
                        className="btn btn-secondary"
                      >
                        Add
                      </button>
                    </div>
                    {businessProfile.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {businessProfile.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {specialty}
                            <button
                              onClick={() => handleRemoveSpecialty(specialty)}
                              className="hover:text-primary-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Business Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Photo
                  </label>
                  <ImageUpload
                    value={businessProfile.businessImage}
                    onChange={(url) => setBusinessProfile(prev => ({ ...prev, businessImage: url }))}
                    type="business"
                    placeholder="Upload business photo"
                    previewSize="lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This image will be shown on your business profile page
                  </p>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Opening Hours
              </h2>
              
              <div className="space-y-3">
                {availability.map((dayAvail) => {
                  const dayInfo = daysOfWeek.find(d => d.key === dayAvail.day);
                  return (
                    <div 
                      key={dayAvail.day}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg ${
                        dayAvail.isAvailable ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      {/* Day Name & Toggle */}
                      <div className="flex items-center gap-3 w-full sm:w-40">
                        <button
                          type="button"
                          onClick={() => handleAvailabilityChange(dayAvail.day, 'isAvailable', !dayAvail.isAvailable)}
                          className={`p-1 rounded ${dayAvail.isAvailable ? 'text-green-600' : 'text-gray-400'}`}
                        >
                          {dayAvail.isAvailable ? (
                            <ToggleRight className="h-6 w-6" />
                          ) : (
                            <ToggleLeft className="h-6 w-6" />
                          )}
                        </button>
                        <span className={`font-medium ${dayAvail.isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                          {dayInfo?.label}
                        </span>
                      </div>

                      {/* Time Inputs */}
                      {dayAvail.isAvailable ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={dayAvail.startTime}
                            onChange={(e) => handleAvailabilityChange(dayAvail.day, 'startTime', e.target.value)}
                            className="input w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={dayAvail.endTime}
                            onChange={(e) => handleAvailabilityChange(dayAvail.day, 'endTime', e.target.value)}
                            className="input w-32"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveBusinessProfile}
                disabled={savingBusiness}
                className="btn btn-primary flex items-center gap-2"
              >
                {savingBusiness ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Save Business Profile
              </button>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <>
            {/* Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {services.length === 0 ? 'No services yet' : 'No matching services'}
            </h3>
            <p className="text-gray-600 mb-6">
              {services.length === 0 
                ? 'Start offering your skills and services!' 
                : 'Try a different search term'}
            </p>
            {services.length === 0 && (
              <button 
                onClick={handleOpenCreateModal}
                className="btn btn-primary"
              >
                Create Your First Service
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Service Image */}
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.serviceName}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="text-4xl">🎯</span>
                  </div>
                )}

                <div className="p-4">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      service.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">{service.category}</span>
                  </div>

                  {/* Service Name & Price */}
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {service.serviceName}
                  </h3>
                  <p className="text-xl font-bold text-primary-600 mb-2">
                    £{parseFloat(service.price).toFixed(2)}
                  </p>

                  {/* Duration */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration} min
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(service.id, service.isActive)}
                      className="text-gray-500 hover:text-primary-600 transition-colors"
                      title={service.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {service.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Book for Client */}
                      <button
                        onClick={() => handleBookForClient(service)}
                        className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Book for client"
                      >
                        <UserPlus className="h-5 w-5" />
                      </button>

                      {/* View */}
                      <Link
                        to={`/services/${service.id}`}
                        className="text-gray-500 hover:text-primary-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditModal(service)}
                        className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(service.id)}
                        disabled={deleting === service.id}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === service.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {service.image ? (
                        <img src={service.image} alt={service.serviceName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{service.category}</span>
                        <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{service.duration} min</span>
                        <span className="font-semibold text-primary-600">£{parseFloat(service.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(service.id, service.isActive)}
                      className="text-gray-500 hover:text-primary-600 p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {service.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button onClick={() => handleBookForClient(service)} className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg">
                      <UserPlus className="h-5 w-5" />
                    </button>
                    <Link to={`/services/${service.id}`} className="text-gray-500 hover:text-primary-600 p-2 hover:bg-gray-100 rounded-lg">
                      <Eye className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleOpenEditModal(service)} className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(service.id)} disabled={deleting === service.id} className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg disabled:opacity-50">
                      {deleting === service.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {services.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {services.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-400">
                {services.filter(s => !s.isActive).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Avg Price</p>
              <p className="text-2xl font-bold text-primary-600">
                £{services.length > 0 
                  ? (services.reduce((acc, s) => acc + parseFloat(s.price), 0) / services.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Book for Client Modal */}
      {bookForClientModal && selectedServiceForBooking && (
        <BookForClient
          service={selectedServiceForBooking}
          onClose={() => {
            setBookForClientModal(false);
            setSelectedServiceForBooking(null);
          }}
          onSuccess={() => {
            toast.success('Booking created successfully!');
          }}
        />
      )}

      {/* Create/Edit Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={handleCloseServiceModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitService} className="p-6 space-y-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  placeholder="e.g., Math Tutoring"
                  className="input w-full"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="">Select category</option>
                  {defaultCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your service..."
                  rows={3}
                  className="input w-full"
                />
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (£) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="25.00"
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input w-full"
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location
                </label>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter service location..."
                />
              </div>

              {/* Service Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image
                </label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  type="service"
                  placeholder="Upload service image"
                  previewSize="lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add an image to make your service stand out
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseServiceModal}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn btn-primary disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : editingService ? (
                    'Update Service'
                  ) : (
                    'Create Service'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyServices;
