// ==========================================
// UK LOCATION AUTOCOMPLETE COMPONENT
// ==========================================
// Uses a comprehensive UK cities list with autocomplete
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

// Comprehensive UK cities and towns list
const UK_CITIES = [
  // England - Major Cities
  'London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield',
  'Bristol', 'Newcastle upon Tyne', 'Nottingham', 'Leicester', 'Coventry',
  'Bradford', 'Stoke-on-Trent', 'Wolverhampton', 'Plymouth', 'Derby',
  'Southampton', 'Portsmouth', 'Brighton', 'Hull', 'Sunderland',
  
  // England - South East
  'Reading', 'Slough', 'Oxford', 'Milton Keynes', 'Luton', 'Southend-on-Sea',
  'Basildon', 'Colchester', 'Chelmsford', 'Maidstone', 'Crawley', 'Guildford',
  'Woking', 'Watford', 'St Albans', 'Hemel Hempstead', 'Stevenage', 'Hatfield',
  'Welwyn Garden City', 'Hertford', 'High Wycombe', 'Aylesbury', 'Banbury',
  'Canterbury', 'Ashford', 'Tunbridge Wells', 'Hastings', 'Eastbourne',
  'Worthing', 'Chichester', 'Basingstoke', 'Winchester', 'Farnborough',
  'Bracknell', 'Maidenhead', 'Marlow', 'Henley-on-Thames', 'Bedford',
  
  // England - South West
  'Bath', 'Exeter', 'Bournemouth', 'Poole', 'Swindon', 'Gloucester',
  'Cheltenham', 'Taunton', 'Torquay', 'Truro', 'Salisbury', 'Yeovil',
  'Weston-super-Mare', 'Barnstaple', 'Newquay', 'Penzance', 'Falmouth',
  
  // England - East Midlands
  'Northampton', 'Lincoln', 'Mansfield', 'Chesterfield', 'Loughborough',
  'Kettering', 'Corby', 'Wellingborough', 'Boston', 'Grantham',
  
  // England - West Midlands
  'Worcester', 'Telford', 'Shrewsbury', 'Hereford', 'Walsall', 'Dudley',
  'Solihull', 'West Bromwich', 'Nuneaton', 'Rugby', 'Tamworth', 'Redditch',
  'Stafford', 'Burton upon Trent', 'Cannock', 'Lichfield',
  
  // England - North West
  'Preston', 'Blackpool', 'Bolton', 'Stockport', 'Wigan', 'Warrington',
  'Oldham', 'Rochdale', 'Salford', 'Burnley', 'Blackburn', 'Lancaster',
  'Carlisle', 'Barrow-in-Furness', 'Chester', 'Crewe', 'Macclesfield',
  'Birkenhead', 'Southport', 'St Helens', 'Bury', 'Altrincham',
  
  // England - Yorkshire
  'York', 'Huddersfield', 'Doncaster', 'Rotherham', 'Barnsley', 'Wakefield',
  'Halifax', 'Harrogate', 'Scarborough', 'Middlesbrough', 'Grimsby',
  'Scunthorpe', 'Dewsbury', 'Batley', 'Keighley', 'Skipton', 'Beverley',
  
  // England - North East
  'Durham', 'Gateshead', 'South Shields', 'Hartlepool', 'Darlington',
  'Stockton-on-Tees', 'Redcar', 'Bishop Auckland', 'Blyth', 'Cramlington',
  
  // England - East of England
  'Cambridge', 'Norwich', 'Ipswich', 'Peterborough', 'Harlow', 'Braintree',
  'Bury St Edmunds', 'Lowestoft', 'Great Yarmouth', 'King\'s Lynn',
  'Huntingdon', 'Ely', 'Newmarket', 'Thetford', 'Sudbury',
  
  // Greater London Boroughs
  'Croydon', 'Bromley', 'Barnet', 'Ealing', 'Enfield', 'Hounslow',
  'Redbridge', 'Havering', 'Hillingdon', 'Brent', 'Harrow', 'Sutton',
  'Walthamstow', 'Ilford', 'Romford', 'Uxbridge', 'Kingston upon Thames',
  'Richmond upon Thames', 'Wimbledon', 'Greenwich', 'Woolwich', 'Lewisham',
  'Stratford', 'Hackney', 'Islington', 'Camden', 'Westminster',
  
  // Scotland
  'Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling',
  'Perth', 'Paisley', 'East Kilbride', 'Livingston', 'Cumbernauld',
  'Hamilton', 'Kirkcaldy', 'Ayr', 'Kilmarnock', 'Greenock', 'Dunfermline',
  'Falkirk', 'Motherwell', 'Coatbridge', 'St Andrews', 'Dumfries',
  
  // Wales
  'Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry', 'Neath',
  'Cwmbran', 'Llanelli', 'Port Talbot', 'Bridgend', 'Pontypridd',
  'Caerphilly', 'Merthyr Tydfil', 'Rhyl', 'Colwyn Bay', 'Bangor',
  'Aberystwyth', 'Carmarthen', 'Llandudno', 'Pembroke', 'Haverfordwest',
  
  // Northern Ireland
  'Belfast', 'Derry', 'Lisburn', 'Newry', 'Bangor', 'Craigavon',
  'Newtownabbey', 'Ballymena', 'Newtownards', 'Carrickfergus', 'Coleraine',
  'Omagh', 'Larne', 'Antrim', 'Enniskillen', 'Strabane', 'Limavady',
  
  // Channel Islands & Isle of Man
  'St Helier', 'St Peter Port', 'Douglas',
].sort();

function LocationAutocomplete({ 
  value, 
  onChange, 
  error, 
  placeholder = "Start typing your city...",
  className = "" 
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterCities = (query) => {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    
    // First, find cities that START with the query (prioritized)
    const startsWithMatches = UK_CITIES.filter(city => 
      city.toLowerCase().startsWith(lowerQuery)
    );
    
    // Then, find cities that CONTAIN the query but don't start with it
    const containsMatches = UK_CITIES.filter(city => 
      city.toLowerCase().includes(lowerQuery) && 
      !city.toLowerCase().startsWith(lowerQuery)
    );
    
    // Combine and limit results
    return [...startsWithMatches, ...containsMatches].slice(0, 10);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);
    
    if (newValue.length >= 2) {
      setLoading(true);
      // Small delay for smoother UX
      setTimeout(() => {
        const filtered = filterCities(newValue);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setLoading(false);
      }, 100);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    // Clear selection if typing
    if (value && newValue !== value) {
      onChange({ target: { name: 'location', value: '' } });
    }
  };

  const handleSelectSuggestion = (city) => {
    setInputValue(city);
    onChange({ target: { name: 'location', value: city } });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange({ target: { name: 'location', value: '' } });
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          className={`input pl-10 pr-10 ${error ? 'input-error' : ''}`}
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
        {inputValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((city, index) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelectSuggestion(city)}
              className={`w-full px-4 py-3 text-left hover:bg-primary-50 flex items-center gap-3 transition-colors ${
                index === highlightedIndex ? 'bg-primary-50' : ''
              } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{city}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Hint text */}
      {!showSuggestions && !value && inputValue.length > 0 && inputValue.length < 2 && (
        <p className="text-xs text-gray-500 mt-1">Type at least 2 characters to search</p>
      )}
    </div>
  );
}

export default LocationAutocomplete;
