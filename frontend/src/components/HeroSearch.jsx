// ==========================================
// HERO SEARCH COMPONENT (Fresha-style)
// ==========================================
// Author: Samson Fabiyi
// Description: Home page search bar with service + location + date
// ==========================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ChevronDown } from 'lucide-react';
import LocationSearch from './common/LocationSearch';

// Service categories
const SERVICE_CATEGORIES = [
  { value: '', label: 'All treatments and venues' },
  { value: 'Hair & Beauty', label: 'Hair & Beauty' },
  { value: 'Barber', label: 'Barber' },
  { value: 'Nails', label: 'Nails' },
  { value: 'Massage', label: 'Massage & Spa' },
  { value: 'Fitness', label: 'Fitness & Wellness' },
  { value: 'Makeup', label: 'Makeup & Aesthetics' },
  { value: 'Tattoo', label: 'Tattoo & Piercing' },
  { value: 'Photography', label: 'Photography' },
  { value: 'Tutoring', label: 'Tutoring' },
  { value: 'Other', label: 'Other Services' }
];

// Time options
const TIME_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this-week', label: 'This week' },
  { value: 'next-week', label: 'Next week' }
];

function HeroSearch({ className = '' }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [time, setTime] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const handleSearch = () => {
    // Build search params
    const params = new URLSearchParams();
    
    if (category) {
      params.set('category', category);
    }
    if (location) {
      params.set('location', location);
    }
    if (locationData?.latitude && locationData?.longitude) {
      params.set('lat', locationData.latitude);
      params.set('lng', locationData.longitude);
    }
    if (time) {
      params.set('time', time);
    }

    // Navigate to browse services with filters
    navigate(`/services?${params.toString()}`);
  };

  const handleLocationSelect = (loc) => {
    setLocationData(loc);
    if (loc) {
      setLocation(loc.displayName);
    }
  };

  const getCategoryLabel = () => {
    const cat = SERVICE_CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : 'All treatments and venues';
  };

  const getTimeLabel = () => {
    const t = TIME_OPTIONS.find(opt => opt.value === time);
    return t ? t.label : 'Any time';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 ${className}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Service Category */}
        <div className="relative flex-1 border-b lg:border-b-0 lg:border-r border-gray-200">
          <button
            type="button"
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowTimeDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
          >
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className={`block truncate ${category ? 'text-gray-900' : 'text-gray-500'}`}>
                {getCategoryLabel()}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setCategory(cat.value);
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors ${
                    category === cat.value ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="px-2 py-1">
            <LocationSearch
              value={location}
              onChange={setLocation}
              onSelect={handleLocationSelect}
              placeholder="Enter postcode or city"
              showIcon={true}
              clearable={true}
              size="md"
              className="border-0 shadow-none"
            />
          </div>
        </div>

        {/* Time */}
        <div className="relative flex-1 border-b lg:border-b-0 lg:border-r border-gray-200">
          <button
            type="button"
            onClick={() => {
              setShowTimeDropdown(!showTimeDropdown);
              setShowCategoryDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className={`block truncate ${time ? 'text-gray-900' : 'text-gray-500'}`}>
                {getTimeLabel()}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Time Dropdown */}
          {showTimeDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTime(opt.value);
                    setShowTimeDropdown(false);
                  }}
                  className={`w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors ${
                    time === opt.value ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="p-2">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full lg:w-auto px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroSearch;
