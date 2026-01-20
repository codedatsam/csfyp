// ==========================================
// BROWSE SERVICES PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Browse and search all services
// ==========================================

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function BrowseServices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Fetch services
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [selectedCategory, sortBy, order, pagination.page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order
      });

      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await api.get(`/services?${params}`);
      
      if (response.success) {
        setServices(response.data.services);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/services/categories');
      if (response.success) {
        setCategories(response.data.defaultCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchServices();
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Services 🔍
          </h1>
          <p className="text-gray-600">
            Discover what your fellow students are offering
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services..."
                    className="input pl-10 w-full"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-2">
                  Search
                </button>
              </form>

              {/* Categories */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="text-sm text-primary-600 mt-3"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-3">Sort By</h4>
                <select
                  value={`${sortBy}-${order}`}
                  onChange={(e) => {
                    const [newSortBy, newOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setOrder(newOrder);
                  }}
                  className="input w-full"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No services found
                </h3>
                <p className="text-gray-600 mb-4">
                  {search || selectedCategory
                    ? 'Try adjusting your filters'
                    : 'Be the first to offer a service!'}
                </p>
                <Link to="/dashboard/my-services" className="btn btn-primary">
                  Post a Service
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    {pagination.total} service{pagination.total !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="btn btn-secondary"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="btn btn-secondary"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="card hover:shadow-lg transition-shadow group"
    >
      {/* Category Badge */}
      <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full mb-3">
        {service.category}
      </span>

      {/* Service Name */}
      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {service.serviceName}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {service.description || 'No description provided'}
      </p>

      {/* Provider Info */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-700 text-sm font-bold">
            {service.provider?.user?.firstName?.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {service.provider?.user?.firstName} {service.provider?.user?.lastName}
          </p>
          {service.provider?.user?.location && (
            <p className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {service.provider.user.location}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {service.duration} min
          </span>
          {service.provider?.rating > 0 && (
            <span className="flex items-center text-sm text-yellow-600">
              <Star className="h-4 w-4 mr-1 fill-yellow-400" />
              {parseFloat(service.provider.rating).toFixed(1)}
            </span>
          )}
        </div>
        <span className="text-lg font-bold text-primary-600">
          £{parseFloat(service.price).toFixed(2)}
        </span>
      </div>
    </Link>
  );
}

export default BrowseServices;
