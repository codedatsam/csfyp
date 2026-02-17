// ==========================================
// LOCATION CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: API handlers for location/postcode search
// ==========================================

const { 
  searchLocations, 
  lookupPostcode, 
  autocompletePostcode 
} = require('../services/locationService');
const { prisma } = require('../config/database');
const {
  okResponse,
  badRequestResponse,
  serverErrorResponse
} = require('../utils/response');

// ==========================================
// SEARCH LOCATIONS (POSTCODES + PLACES)
// ==========================================
/**
 * GET /api/v1/locations/search?q=W11
 * Returns autocomplete suggestions for postcodes and places
 */
async function searchLocationAutocomplete(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return okResponse(res, 'Query too short', { results: [] });
    }

    const results = await searchLocations(q);

    return okResponse(res, 'Location suggestions retrieved', {
      query: q,
      results: results.map(r => ({
        postcode: r.postcode,
        outcode: r.outcode,
        area: r.area,
        district: r.district,
        city: r.city,
        country: r.country,
        displayName: r.displayName,
        latitude: r.latitude,
        longitude: r.longitude,
        type: r.type || 'postcode'
      }))
    });

  } catch (error) {
    console.error('Location search error:', error);
    return serverErrorResponse(res, 'Failed to search locations');
  }
}

// ==========================================
// LOOKUP SPECIFIC POSTCODE
// ==========================================
/**
 * GET /api/v1/locations/postcode/:postcode
 * Returns details for a specific postcode
 */
async function getPostcodeDetails(req, res) {
  try {
    const { postcode } = req.params;

    if (!postcode) {
      return badRequestResponse(res, 'Postcode is required');
    }

    const result = await lookupPostcode(postcode);

    if (!result) {
      return badRequestResponse(res, 'Postcode not found');
    }

    return okResponse(res, 'Postcode details retrieved', { location: result });

  } catch (error) {
    console.error('Postcode lookup error:', error);
    return serverErrorResponse(res, 'Failed to lookup postcode');
  }
}

// ==========================================
// SEARCH SERVICES BY LOCATION
// ==========================================
/**
 * GET /api/v1/locations/services?location=W11&category=Hair
 * Returns services filtered by location (postcode/city/area)
 */
async function searchServicesByLocation(req, res) {
  try {
    const { location, category, limit = 20 } = req.query;

    if (!location) {
      return badRequestResponse(res, 'Location is required');
    }

    // Build the where clause
    const whereClause = {
      isActive: true,
      provider: {
        OR: [
          // Match exact location
          { location: { contains: location, mode: 'insensitive' } },
          // Match postcode in location field
          { location: { startsWith: location.split(' ')[0], mode: 'insensitive' } }
        ]
      }
    };

    // Add category filter if provided
    if (category) {
      whereClause.category = { contains: category, mode: 'insensitive' };
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            totalReviews: true,
            totalBookings: true,
            location: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: [
        { provider: { rating: 'desc' } },
        { provider: { totalBookings: 'desc' } }
      ],
      take: parseInt(limit)
    });

    // Format response
    const formattedServices = services.map(service => ({
      id: service.id,
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: parseFloat(service.price),
      duration: service.duration,
      image: service.image,
      location: service.location,
      provider: {
        id: service.provider.id,
        businessName: service.provider.businessName || 
          `${service.provider.user.firstName} ${service.provider.user.lastName}`,
        rating: parseFloat(service.provider.rating) || 0,
        totalReviews: service.provider.totalReviews,
        totalBookings: service.provider.totalBookings,
        location: service.provider.location
      }
    }));

    return okResponse(res, 'Services retrieved', {
      location: location,
      category: category || 'All',
      count: formattedServices.length,
      services: formattedServices
    });

  } catch (error) {
    console.error('Service location search error:', error);
    return serverErrorResponse(res, 'Failed to search services by location');
  }
}

// ==========================================
// GET NEARBY SERVICES (BY COORDINATES)
// ==========================================
/**
 * GET /api/v1/locations/nearby?lat=51.5&lng=-0.1&radius=5
 * Returns services near given coordinates
 * Note: This is a simplified version - for production, use PostGIS or similar
 */
async function getNearbyServices(req, res) {
  try {
    const { lat, lng, radius = 10, category, limit = 20 } = req.query;

    if (!lat || !lng) {
      return badRequestResponse(res, 'Latitude and longitude are required');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Get all active services with location data
    const whereClause = {
      isActive: true,
      provider: {
        location: { not: null }
      }
    };

    if (category) {
      whereClause.category = { contains: category, mode: 'insensitive' };
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            totalReviews: true,
            totalBookings: true,
            location: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      take: 100 // Get more to filter by distance
    });

    // For now, just return services - in production you'd calculate actual distances
    // using the Haversine formula or a geospatial database
    const formattedServices = services.slice(0, parseInt(limit)).map(service => ({
      id: service.id,
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: parseFloat(service.price),
      duration: service.duration,
      image: service.image,
      provider: {
        id: service.provider.id,
        businessName: service.provider.businessName || 
          `${service.provider.user.firstName} ${service.provider.user.lastName}`,
        rating: parseFloat(service.provider.rating) || 0,
        totalReviews: service.provider.totalReviews,
        location: service.provider.location
      }
    }));

    return okResponse(res, 'Nearby services retrieved', {
      center: { lat: latitude, lng: longitude },
      radius: radiusKm,
      count: formattedServices.length,
      services: formattedServices
    });

  } catch (error) {
    console.error('Nearby services error:', error);
    return serverErrorResponse(res, 'Failed to find nearby services');
  }
}

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  searchLocationAutocomplete,
  getPostcodeDetails,
  searchServicesByLocation,
  getNearbyServices
};
