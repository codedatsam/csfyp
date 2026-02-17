// ==========================================
// LOCATION SERVICE
// ==========================================
// Author: Samson Fabiyi
// Description: UK postcode and location lookup using Postcodes.io
// ==========================================

const https = require('https');

// ==========================================
// POSTCODES.IO API HELPERS
// ==========================================

/**
 * Make HTTPS request to Postcodes.io
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ==========================================
// POSTCODE AUTOCOMPLETE
// ==========================================
/**
 * Autocomplete postcodes based on partial input
 * @param {string} query - Partial postcode (e.g., "W11", "SW1A")
 * @returns {Array} List of matching postcodes with area info
 */
async function autocompletePostcode(query) {
  try {
    // Clean the query
    const cleanQuery = query.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '');
    
    if (cleanQuery.length < 2) {
      return [];
    }

    // Try autocomplete endpoint first
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanQuery)}/autocomplete`;
    const response = await makeRequest(url);

    if (response.status === 200 && response.result) {
      // Get details for each postcode
      const detailedResults = await Promise.all(
        response.result.slice(0, 7).map(async (postcode) => {
          try {
            const details = await lookupPostcode(postcode);
            return details;
          } catch {
            return null;
          }
        })
      );

      return detailedResults.filter(r => r !== null);
    }

    // If autocomplete fails, try outcode lookup (e.g., "W11" area)
    return await lookupOutcode(cleanQuery);

  } catch (error) {
    console.error('Postcode autocomplete error:', error);
    return [];
  }
}

// ==========================================
// LOOKUP FULL POSTCODE
// ==========================================
/**
 * Get details for a specific postcode
 * @param {string} postcode - Full postcode (e.g., "W11 4UL")
 * @returns {Object} Postcode details with area info
 */
async function lookupPostcode(postcode) {
  try {
    const cleanPostcode = postcode.trim().toUpperCase();
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`;
    const response = await makeRequest(url);

    if (response.status === 200 && response.result) {
      const r = response.result;
      return formatPostcodeResult(r);
    }

    return null;
  } catch (error) {
    console.error('Postcode lookup error:', error);
    return null;
  }
}

// ==========================================
// LOOKUP OUTCODE (AREA CODE)
// ==========================================
/**
 * Get details for an outcode (first part of postcode)
 * @param {string} outcode - Outcode (e.g., "W11", "SW1A")
 * @returns {Array} List of areas in that outcode
 */
async function lookupOutcode(outcode) {
  try {
    const cleanOutcode = outcode.trim().toUpperCase().split(' ')[0];
    const url = `https://api.postcodes.io/outcodes/${encodeURIComponent(cleanOutcode)}`;
    const response = await makeRequest(url);

    if (response.status === 200 && response.result) {
      const r = response.result;
      return [{
        postcode: r.outcode,
        outcode: r.outcode,
        area: r.admin_ward?.[0] || r.admin_district?.[0] || '',
        district: r.admin_district?.[0] || '',
        city: r.admin_county?.[0] || r.admin_district?.[0] || 'London',
        country: r.country?.[0] || 'England',
        latitude: r.latitude,
        longitude: r.longitude,
        displayName: formatDisplayName(r.outcode, r.admin_ward?.[0], r.admin_district?.[0], r.admin_county?.[0])
      }];
    }

    return [];
  } catch (error) {
    console.error('Outcode lookup error:', error);
    return [];
  }
}

// ==========================================
// SEARCH BY PLACE NAME
// ==========================================
/**
 * Search for locations by place name (city, town, area)
 * @param {string} placeName - Place name (e.g., "Manchester", "Notting Hill")
 * @returns {Array} List of matching locations
 */
async function searchByPlace(placeName) {
  try {
    const cleanName = placeName.trim();
    
    if (cleanName.length < 2) {
      return [];
    }

    // Use the places endpoint
    const url = `https://api.postcodes.io/places?q=${encodeURIComponent(cleanName)}&limit=10`;
    const response = await makeRequest(url);

    if (response.status === 200 && response.result) {
      return response.result.map(place => ({
        postcode: place.code || '',
        outcode: '',
        area: place.name_1 || '',
        district: place.district_borough || place.county_unitary || '',
        city: place.county_unitary || place.region || '',
        country: place.country || 'England',
        latitude: place.latitude,
        longitude: place.longitude,
        displayName: formatPlaceDisplayName(place),
        type: 'place'
      }));
    }

    return [];
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
}

// ==========================================
// COMBINED SEARCH (POSTCODES + PLACES)
// ==========================================
/**
 * Search for both postcodes and places
 * @param {string} query - Search query
 * @returns {Array} Combined results
 */
async function searchLocations(query) {
  try {
    const cleanQuery = query.trim();
    
    if (cleanQuery.length < 2) {
      return [];
    }

    // Check if query looks like a postcode
    const postcodePattern = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9]?[A-Z]{0,2}$/i;
    const isPostcodeLike = postcodePattern.test(cleanQuery.replace(/\s/g, ''));

    let results = [];

    if (isPostcodeLike) {
      // Search postcodes first
      const postcodeResults = await autocompletePostcode(cleanQuery);
      results = postcodeResults;
    } else {
      // Search places
      const placeResults = await searchByPlace(cleanQuery);
      results = placeResults;
    }

    // Also add matching UK cities from our list
    const cityMatches = UK_CITIES.filter(city => 
      city.name.toLowerCase().startsWith(cleanQuery.toLowerCase())
    ).slice(0, 5).map(city => ({
      postcode: '',
      outcode: '',
      area: city.name,
      district: city.county || '',
      city: city.name,
      country: 'England',
      latitude: city.lat,
      longitude: city.lng,
      displayName: city.county ? `${city.name}, ${city.county}` : `${city.name}, UK`,
      type: 'city'
    }));

    // Combine and deduplicate
    const combined = [...results, ...cityMatches];
    const seen = new Set();
    const unique = combined.filter(item => {
      const key = item.displayName.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.slice(0, 10);

  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatPostcodeResult(r) {
  return {
    postcode: r.postcode,
    outcode: r.outcode,
    incode: r.incode,
    area: r.admin_ward || '',
    district: r.admin_district || '',
    city: r.admin_county || r.admin_district || 'London',
    country: r.country || 'England',
    latitude: r.latitude,
    longitude: r.longitude,
    displayName: formatDisplayName(r.postcode, r.admin_ward, r.admin_district, r.admin_county)
  };
}

function formatDisplayName(postcode, ward, district, county) {
  // Format: "W11 4UL - Holland Park, London"
  const area = ward || district || '';
  const city = county || district || 'London';
  
  if (area && city && area !== city) {
    return `${postcode} - ${area}, ${city}`;
  } else if (area) {
    return `${postcode} - ${area}`;
  } else if (city) {
    return `${postcode} - ${city}`;
  }
  return postcode;
}

function formatPlaceDisplayName(place) {
  const name = place.name_1 || '';
  const district = place.district_borough || place.county_unitary || '';
  const region = place.region || '';
  
  if (district && district !== name) {
    return `${name}, ${district}`;
  } else if (region) {
    return `${name}, ${region}`;
  }
  return `${name}, UK`;
}

// ==========================================
// UK CITIES LIST (FALLBACK)
// ==========================================
const UK_CITIES = [
  { name: 'London', county: 'Greater London', lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester', county: 'Greater Manchester', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham', county: 'West Midlands', lat: 52.4862, lng: -1.8904 },
  { name: 'Leeds', county: 'West Yorkshire', lat: 53.8008, lng: -1.5491 },
  { name: 'Liverpool', county: 'Merseyside', lat: 53.4084, lng: -2.9916 },
  { name: 'Bristol', county: 'Somerset', lat: 51.4545, lng: -2.5879 },
  { name: 'Sheffield', county: 'South Yorkshire', lat: 53.3811, lng: -1.4701 },
  { name: 'Newcastle', county: 'Tyne and Wear', lat: 54.9783, lng: -1.6178 },
  { name: 'Nottingham', county: 'Nottinghamshire', lat: 52.9548, lng: -1.1581 },
  { name: 'Leicester', county: 'Leicestershire', lat: 52.6369, lng: -1.1398 },
  { name: 'Edinburgh', county: 'Scotland', lat: 55.9533, lng: -3.1883 },
  { name: 'Glasgow', county: 'Scotland', lat: 55.8642, lng: -4.2518 },
  { name: 'Cardiff', county: 'Wales', lat: 51.4816, lng: -3.1791 },
  { name: 'Belfast', county: 'Northern Ireland', lat: 54.5973, lng: -5.9301 },
  { name: 'Cambridge', county: 'Cambridgeshire', lat: 52.2053, lng: 0.1218 },
  { name: 'Oxford', county: 'Oxfordshire', lat: 51.7520, lng: -1.2577 },
  { name: 'Brighton', county: 'East Sussex', lat: 50.8225, lng: -0.1372 },
  { name: 'Southampton', county: 'Hampshire', lat: 50.9097, lng: -1.4044 },
  { name: 'Portsmouth', county: 'Hampshire', lat: 50.8198, lng: -1.0880 },
  { name: 'Reading', county: 'Berkshire', lat: 51.4543, lng: -0.9781 },
  { name: 'Coventry', county: 'West Midlands', lat: 52.4068, lng: -1.5197 },
  { name: 'Hull', county: 'East Yorkshire', lat: 53.7676, lng: -0.3274 },
  { name: 'Bradford', county: 'West Yorkshire', lat: 53.7960, lng: -1.7594 },
  { name: 'Stoke-on-Trent', county: 'Staffordshire', lat: 53.0027, lng: -2.1794 },
  { name: 'Wolverhampton', county: 'West Midlands', lat: 52.5869, lng: -2.1257 },
  { name: 'Plymouth', county: 'Devon', lat: 50.3755, lng: -4.1427 },
  { name: 'Derby', county: 'Derbyshire', lat: 52.9225, lng: -1.4746 },
  { name: 'Swansea', county: 'Wales', lat: 51.6214, lng: -3.9436 },
  { name: 'Milton Keynes', county: 'Buckinghamshire', lat: 52.0406, lng: -0.7594 },
  { name: 'Aberdeen', county: 'Scotland', lat: 57.1497, lng: -2.0943 },
  { name: 'Norwich', county: 'Norfolk', lat: 52.6309, lng: 1.2974 },
  { name: 'Luton', county: 'Bedfordshire', lat: 51.8787, lng: -0.4200 },
  { name: 'Swindon', county: 'Wiltshire', lat: 51.5558, lng: -1.7797 },
  { name: 'Bournemouth', county: 'Dorset', lat: 50.7192, lng: -1.8808 },
  { name: 'Peterborough', county: 'Cambridgeshire', lat: 52.5695, lng: -0.2405 },
  { name: 'Southend-on-Sea', county: 'Essex', lat: 51.5459, lng: 0.7077 },
  { name: 'Sunderland', county: 'Tyne and Wear', lat: 54.9061, lng: -1.3811 },
  { name: 'Warrington', county: 'Cheshire', lat: 53.3900, lng: -2.5970 },
  { name: 'Huddersfield', county: 'West Yorkshire', lat: 53.6450, lng: -1.7798 },
  { name: 'Slough', county: 'Berkshire', lat: 51.5105, lng: -0.5950 },
  { name: 'Ipswich', county: 'Suffolk', lat: 52.0567, lng: 1.1482 },
  { name: 'Telford', county: 'Shropshire', lat: 52.6766, lng: -2.4469 },
  { name: 'Dundee', county: 'Scotland', lat: 56.4620, lng: -2.9707 },
  { name: 'Blackpool', county: 'Lancashire', lat: 53.8175, lng: -3.0357 },
  { name: 'Middlesbrough', county: 'North Yorkshire', lat: 54.5742, lng: -1.2350 },
  { name: 'Bolton', county: 'Greater Manchester', lat: 53.5785, lng: -2.4299 },
  { name: 'Blackburn', county: 'Lancashire', lat: 53.7500, lng: -2.4849 },
  { name: 'York', county: 'North Yorkshire', lat: 53.9591, lng: -1.0815 },
  { name: 'Gloucester', county: 'Gloucestershire', lat: 51.8642, lng: -2.2382 },
  { name: 'Exeter', county: 'Devon', lat: 50.7184, lng: -3.5339 }
];

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  autocompletePostcode,
  lookupPostcode,
  lookupOutcode,
  searchByPlace,
  searchLocations,
  UK_CITIES
};
