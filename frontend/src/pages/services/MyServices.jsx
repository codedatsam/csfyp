// ==========================================
// MY SERVICES PAGE (Provider)
// ==========================================
// Author: Samson Fabiyi
// Description: Manage provider services
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const defaultCategories = [
  'Tutoring',
  'Essay Help',
  'Tech Support',
  'Haircuts',
  'Food Delivery',
  'Moving Help',
  'Photography',
  'Design Work',
  'Laundry',
  'Cleaning',
  'Fitness',
  'Music Lessons',
  'Language Lessons',
  'Other'
];

function MyServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    serviceName: '',
    category: '',
    description: '',
    price: '',
    duration: '60'
  });

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services/provider/my-services');
      if (response.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        serviceName: service.serviceName,
        category: service.category,
        description: service.description || '',
        price: service.price.toString(),
        duration: service.duration.toString()
      });
    } else {
      setEditingService(null);
      setFormData({
        serviceName: '',
        category: '',
        description: '',
        price: '',
        duration: '60'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceName || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      if (editingService) {
        const response = await api.put(`/services/${editingService.id}`, formData);
        if (response.success) {
          toast.success('Service updated! ✨');
          fetchMyServices();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/services', formData);
        if (response.success) {
          toast.success('Service created! 🎉');
          fetchMyServices();
          handleCloseModal();
        }
      }
    } catch (error) {
      toast.error(error.error || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await api.put(`/services/${service.id}`, { isActive: !service.isActive });
      toast.success(service.isActive ? 'Service hidden' : 'Service visible');
      fetchMyServices();
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const handleDelete = async (service) => {
    if (!confirm(`Delete "${service.serviceName}"?`)) return;

    try {
      await api.delete(`/services/${service.id}`);
      toast.success('Service deleted');
      fetchMyServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

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
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Services 💼</h1>
              <p className="text-gray-600">Manage the services you offer</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              <Plus className="h-5 w-5 mr-2" />Add Service
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 mb-6">Start earning by offering your skills!</p>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              <Plus className="h-5 w-5 mr-2" />Create Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className={`card ${!service.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {service.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{service.serviceName}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description || 'No description'}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />{service.duration} min
                  </span>
                  <span className="text-lg font-bold text-primary-600">£{parseFloat(service.price).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button onClick={() => handleOpenModal(service)} className="flex-1 btn btn-secondary text-sm">
                    <Edit2 className="h-4 w-4 mr-1" />Edit
                  </button>
                  <button onClick={() => handleToggleActive(service)} className="btn btn-secondary text-sm">
                    {service.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleDelete(service)} className="btn btn-secondary text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={handleCloseModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                <input type="text" value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input w-full" required>
                  <option value="">Select category</option>
                  {defaultCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (£) *</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="input w-full">
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn btn-primary">
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : editingService ? 'Update' : 'Create'}
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
