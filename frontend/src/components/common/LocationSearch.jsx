// ==========================================
// LOCATION SEARCH COMPONENT (Fresha-style)
// ==========================================
// Author: Samson Fabiyi
// Description: Postcode/place autocomplete search like Fresha
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2, Search } from 'lucide-react';
import api from '../../services/api';

function LocationSearch({ 
  value = '', 
  onChange, 
  onSelect,
  placeholder = 'Enter postcode or city',
  className = '',
  showIcon = true,
  clearable = true,
  size = 'md' // 'sm', 'md', 'lg'
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Size classes
  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-5 text-lg'
  };

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== query && !isOpen) {
      setQuery(value);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await api.get(`/locations/search?q=${encodeURIComponent(query)}`);
        
        if (response.success && response.data.results) {
          setSuggestions(response.data.results);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Location search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedLocation(null);
    setIsOpen(true);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSelect = (location) => {
    setQuery(location.displayName);
    setSelectedLocation(location);
    setIsOpen(false);
    setSuggestions([]);
    
    if (onSelect) {
      onSelect(location);
    }
    if (onChange) {
      onChange(location.displayName);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedLocation(null);
    setSuggestions([]);
    
    if (onChange) {
      onChange('');
    }
    if (onSelect) {
      onSelect(null);
    }
    
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  // Get icon for location type
  const getLocationIcon = (type) => {
    switch (type) {
      case 'city':
        return '🏙️';
      case 'place':
        return '📍';
      default:
        return '📮';
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        {showIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <MapPin className="h-5 w-5" />
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`
            w-full rounded-lg border border-gray-300 
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            transition-all duration-200
            ${showIcon ? 'pl-10' : 'pl-4'}
            ${clearable && query ? 'pr-10' : 'pr-4'}
            ${sizeClasses[size]}
          `}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {/* Clear Button */}
        {clearable && query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          {suggestions.map((location, index) => (
            <button
              key={`${location.postcode || location.area}-${index}`}
              type="button"
              onClick={() => handleSelect(location)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              {/* Location Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <MapPin className="h-4 w-4" />
              </div>

              {/* Location Details */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">
                  {location.postcode || location.area}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {location.area && location.postcode && location.area !== location.postcode && (
                    <>{location.area}, </>
                  )}
                  {location.district && location.district !== location.area && (
                    <>{location.district}, </>
                  )}
                  {location.city && location.city !== location.district && (
                    <>{location.city}, </>
                  )}
                  UK
                </div>
              </div>

              {/* Type Badge */}
              {location.type === 'city' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  City
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No locations found for "{query}"</p>
          <p className="text-xs text-gray-400 mt-1">Try a UK postcode or city name</p>
        </div>
      )}
    </div>
  );
}

export default LocationSearch;
