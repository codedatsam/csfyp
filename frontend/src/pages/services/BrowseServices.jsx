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
  Sparkles,
  X,
  SlidersHorizontal,
  Grid,
  List
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import { useSEO } from '../../hooks/useSEO';

// UK Cities - Organized by region for easy browsing
const UK_REGIONS = {
  'London & South East': [
    'London', 'Brighton', 'Southampton', 'Portsmouth', 'Reading', 'Oxford',
    'Milton Keynes', 'Slough', 'Guildford', 'Crawley', 'Maidstone', 'Canterbury',
    'Hatfield', 'St Albans', 'Watford', 'Hemel Hempstead', 'Stevenage', 'Hertford',
    'Welwyn Garden City', 'Luton', 'Bedford', 'Aylesbury', 'High Wycombe'
  ],
  'Midlands': [
    'Birmingham', 'Nottingham', 'Leicester', 'Coventry', 'Derby', 'Wolverhampton',
    'Stoke-on-Trent', 'Northampton', 'Worcester', 'Peterborough', 'Lincoln',
    'Warwick', 'Loughborough', 'Telford', 'Shrewsbury'
  ],
  'North West': [
    'Manchester', 'Liverpool', 'Preston', 'Blackpool', 'Bolton', 'Warrington',
    'Wigan', 'Stockport', 'Chester', 'Lancaster', 'Carlisle', 'Blackburn'
  ],
  'North East & Yorkshire': [
    'Leeds', 'Sheffield', 'Newcastle', 'Bradford', 'Hull', 'York', 'Middlesbrough',
    'Sunderland', 'Doncaster', 'Huddersfield', 'Wakefield', 'Durham', 'Harrogate'
  ],
  'South West': [
    'Bristol', 'Plymouth', 'Exeter', 'Bath', 'Gloucester', 'Swindon',
    'Bournemouth', 'Cheltenham', 'Taunton', 'Torquay', 'Truro'
  ],
  'East of England': [
    'Cambridge', 'Norwich', 'Ipswich', 'Colchester', 'Chelmsford', 'Southend-on-Sea',
    'Basildon', 'Harlow', 'Braintree'
  ],
  'Wales': [
    'Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry', 'Neath', 'Cwmbran'
  ],
  'Scotland': [
    'Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling',
    'Perth', 'Paisley', 'Falkirk'
  ],
  'Northern Ireland': [
    'Belfast', 'Derry', 'Lisburn', 'Newry', 'Bangor', 'Craigavon'
  ]
};

// Flatten for dropdown - most popular cities first
const LOCATIONS = [
  'All Locations',
  // Most popular UK cities
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol',
  'Sheffield', 'Newcastle', 'Nottingham', 'Leicester', 'Edinburgh', 'Glasgow',
  'Cardiff', 'Belfast', 'Cambridge', 'Oxford', 'Brighton', 'Southampton',
  // Then alphabetically others
  ...Object.values(UK_REGIONS).flat()
    .filter(city => !['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol',
      'Sheffield', 'Newcastle', 'Nottingham', 'Leicester', 'Edinburgh', 'Glasgow',
      'Cardiff', 'Belfast', 'Cambridge', 'Oxford', 'Brighton', 'Southampton'].includes(city))
    .sort()
].filter((city, index, self) => self.indexOf(city) === index); // Remove duplicates

// Price ranges
const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: 999999 },
  { label: 'Under £10', min: 0, max: 10 },
  { label: '£10 - £25', min: 10, max: 25 },
  { label: '£25 - £50', min: 25, max: 50 },
  { label: '£50+', min: 50, max: 999999 }
];

function BrowseServices() {
  // SEO
  useSEO({
    title: 'Browse Services - Find Local Professionals',
    description: 'Browse and book services from verified local professionals. Hair styling, fitness training, tutoring, photography and more across the UK.',
  });

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
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch services
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [selectedCategory, selectedLocation, selectedPriceRange, sortBy, order, pagination.page]);

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
      if (selectedLocation && selectedLocation !== 'All Locations') {
        params.append('location', selectedLocation);
      }
      if (selectedPriceRange > 0) {
        const range = PRICE_RANGES[selectedPriceRange];
        params.append('minPrice', range.min);
        params.append('maxPrice', range.max);
      }

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
    
    // Update URL params
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocation) params.set('location', selectedLocation);
    setSearchParams(params);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedPriceRange(0);
    setSortBy('createdAt');
    setOrder('desc');
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  const activeFiltersCount = [
    search,
    selectedCategory,
    selectedLocation && selectedLocation !== 'All Locations',
    selectedPriceRange > 0
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header with Search */}
      <div className="bg-white border-b shadow-sm">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Find Services 🔍
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Discover services from trusted local providers
              </p>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for tutoring, haircuts, tech help..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button type="submit" className="btn btn-primary px-6">
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {/* Location Quick Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Locations</option>
                {LOCATIONS.filter(l => l !== 'All Locations').map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Category Pills */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
              {selectedCategory && !categories.slice(0, 5).includes(selectedCategory) && (
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary-600 text-white">
                  {selectedCategory}
                </span>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Categories</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
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
              </div>

              {/* Location */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Location</h4>
                <div className="space-y-1">
                  {LOCATIONS.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location === 'All Locations' ? '' : location);
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        (selectedLocation === location) || (location === 'All Locations' && !selectedLocation)
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-1">
                  {PRICE_RANGES.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedPriceRange(index);
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedPriceRange === index
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
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

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {loading ? 'Loading...' : (
                  <>
                    <span className="font-semibold text-gray-900">{pagination.total}</span> service{pagination.total !== 1 ? 's' : ''} found
                    {selectedLocation && selectedLocation !== 'All Locations' && (
                      <span className="text-primary-600"> in {selectedLocation}</span>
                    )}
                  </>
                )}
              </p>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No services found
                </h3>
                <p className="text-gray-600 mb-4">
                  {search || selectedCategory || selectedLocation
                    ? 'Try adjusting your filters or search terms'
                    : 'Be the first to offer a service!'}
                </p>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="btn btn-secondary mr-2">
                    Clear Filters
                  </button>
                )}
                <Link to="/dashboard/my-services" className="btn btn-primary">
                  Post a Service
                </Link>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' 
                  : 'space-y-4'
                }>
                  {services.map((service) => (
                    viewMode === 'grid' 
                      ? <ServiceCard key={service.id} service={service} />
                      : <ServiceListItem key={service.id} service={service} />
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

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        selectedCategory === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Location</h4>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(location === 'All Locations' ? '' : location)}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${
                        (selectedLocation === location) || (location === 'All Locations' && !selectedLocation)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MapPin className="h-3 w-3" />
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPriceRange(index)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        selectedPriceRange === index
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
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

            <div className="sticky bottom-0 bg-white px-4 py-3 border-t flex gap-3">
              <button 
                onClick={clearAllFilters}
                className="btn btn-secondary flex-1"
              >
                Clear All
              </button>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="btn btn-primary flex-1"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Service Card Component (Grid View)
function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="card hover:shadow-lg transition-shadow group overflow-hidden p-0"
    >
      {/* Service Image */}
      {service.image ? (
        <div className="aspect-video bg-gray-100">
          <img 
            src={service.image} 
            alt={service.serviceName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary-400" />
        </div>
      )}

      <div className="p-4">
        {/* Category Badge */}
        <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full mb-2">
          {service.category}
        </span>

        {/* Service Name */}
        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {service.serviceName}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {service.description || 'No description provided'}
        </p>

        {/* Provider Info - Clickable to business profile */}
        <Link 
          to={`/business/${service.provider?.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
        >
          {service.provider?.user?.avatar ? (
            <img 
              src={service.provider.user.avatar} 
              alt="" 
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 text-xs font-bold">
                {(service.provider?.businessName || service.provider?.user?.firstName)?.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 hover:text-primary-600">
              {service.provider?.businessName || `${service.provider?.user?.firstName} ${service.provider?.user?.lastName}`}
            </p>
            {(service.location || service.provider?.location || service.provider?.user?.location) && (
              <p className="text-xs text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {service.location || service.provider?.location || service.provider?.user?.location}
              </p>
            )}
          </div>
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
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
      </div>
    </Link>
  );
}

// Service List Item Component (List View)
function ServiceListItem({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="card hover:shadow-lg transition-shadow flex gap-4"
    >
      {/* Provider Avatar */}
      <div className="flex-shrink-0">
        {service.provider?.user?.avatar ? (
          <img 
            src={service.provider.user.avatar} 
            alt="" 
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-primary-700 text-xl font-bold">
              {service.provider?.user?.firstName?.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full mb-1">
              {service.category}
            </span>
            <h3 className="font-bold text-gray-900 group-hover:text-primary-600">
              {service.serviceName}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              {service.description || 'No description provided'}
            </p>
          </div>
          <span className="text-xl font-bold text-primary-600 flex-shrink-0">
            £{parseFloat(service.price).toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>{service.provider?.businessName || `${service.provider?.user?.firstName} ${service.provider?.user?.lastName}`}</span>
          {(service.location || service.provider?.location || service.provider?.user?.location) && (
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {service.location || service.provider?.location || service.provider?.user?.location}
            </span>
          )}
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {service.duration} min
          </span>
          {service.provider?.rating > 0 && (
            <span className="flex items-center text-yellow-600">
              <Star className="h-3 w-3 mr-1 fill-yellow-400" />
              {parseFloat(service.provider.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default BrowseServices;
