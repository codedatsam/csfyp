// ==========================================
// MY SERVICES PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Manage user's services with Book for Client feature
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Clock, 
  MapPin,
  Search,
  Filter,
  Grid,
  List,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import BookForClient from '../../components/BookForClient';

function MyServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [deleting, setDeleting] = useState(null);
  
  // Book for Client modal
  const [bookForClientModal, setBookForClientModal] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

  useEffect(() => {
    fetchMyServices();
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
            <p className="text-gray-600">Manage your service offerings</p>
          </div>
          <Link to="/dashboard/my-services/create" className="btn btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Service
          </Link>
        </div>

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
                ? 'Start offering your skills to other students!' 
                : 'Try a different search term'}
            </p>
            {services.length === 0 && (
              <Link to="/dashboard/my-services/create" className="btn btn-primary">
                Create Your First Service
              </Link>
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
                      <Link
                        to={`/dashboard/my-services/edit/${service.id}`}
                        className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>

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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Service</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Duration</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {service.image ? (
                          <img 
                            src={service.image} 
                            alt={service.serviceName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span>🎯</span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{service.serviceName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{service.category}</td>
                    <td className="px-4 py-3 font-semibold text-primary-600">
                      £{parseFloat(service.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{service.duration} min</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        service.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleBookForClient(service)}
                          className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg"
                          title="Book for client"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/services/${service.id}`}
                          className="text-gray-500 hover:text-primary-600 p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/dashboard/my-services/edit/${service.id}`}
                          className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(service.id)}
                          disabled={deleting === service.id}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          {deleting === service.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        {services.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-2xl font-bold text-gray-500">
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
    </div>
  );
}

export default MyServices;
