// ==========================================
// ADMIN SERVICES PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Service moderation for admins
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Search,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // Edit modal
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const categories = [
    'Tutoring', 'Essay Help', 'Tech Support', 'Haircuts', 'Food Delivery',
    'Moving Help', 'Photography', 'Design Work', 'Laundry', 'Cleaning',
    'Fitness', 'Music Lessons', 'Language Lessons', 'Other'
  ];

  useEffect(() => {
    fetchServices();
  }, [pagination.page, categoryFilter, statusFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 15,
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { isActive: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await api.get(`/admin/services?${params}`);
      if (response.success) {
        setServices(response.data.services);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchServices();
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setEditForm({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      isActive: service.isActive
    });
  };

  const closeEditModal = () => {
    setEditingService(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveService = async () => {
    try {
      setSaving(true);
      const response = await api.patch(`/admin/services/${editingService.id}`, editForm);
      if (response.success) {
        toast.success('Service updated successfully');
        closeEditModal();
        fetchServices();
      }
    } catch (error) {
      console.error('Failed to update service:', error);
      toast.error(error.error || 'Failed to update service');
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      await api.patch(`/admin/services/${serviceId}`, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Service deactivated' : 'Service activated');
      fetchServices();
    } catch (error) {
      console.error('Failed to toggle service status:', error);
      toast.error('Failed to update service');
    }
  };

  const deleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to deactivate this service?')) return;
    
    try {
      await api.delete(`/admin/services/${serviceId}`);
      toast.success('Service deactivated');
      fetchServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Husleflow Management</p>
              </div>
            </div>
            <Link to="/dashboard" className="btn btn-secondary text-sm">
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/admin"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              Users
            </Link>
            <Link
              to="/admin/services"
              className="border-b-2 border-primary-600 text-primary-600 px-1 py-4 text-sm font-medium"
            >
              Services
            </Link>
            <Link
              to="/admin/bookings"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              Bookings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Moderation</h2>
            <p className="text-gray-500">{pagination.total} total services</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No services found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {service.serviceName}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description || 'No description'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.provider?.user?.firstName} {service.provider?.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.provider?.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        £{parseFloat(service.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`flex items-center gap-1 text-sm ${
                          service.isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {service.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service._count?.bookings || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleServiceStatus(service.id, service.isActive)}
                            className={`p-2 rounded ${
                              service.isActive 
                                ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={service.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {service.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => deleteService(service.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Edit Service</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  name="serviceName"
                  value={editForm.serviceName || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={editForm.category || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description || ''}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (£)</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price || ''}
                    onChange={handleEditChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    name="duration"
                    value={editForm.duration || ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={editForm.isActive || false}
                  onChange={handleEditChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Active (visible to users)</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={closeEditModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={saveService} disabled={saving} className="btn btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminServices;
