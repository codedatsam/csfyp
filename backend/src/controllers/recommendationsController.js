// ==========================================
// RECOMMENDATIONS CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: API handlers for recommendation endpoints
// ==========================================

const { getRecommendations, WEIGHTS } = require('../services/recommendationService');
const { prisma } = require('../config/database');
const {
  okResponse,
  badRequestResponse,
  serverErrorResponse
} = require('../utils/response');

// ==========================================
// GET RECOMMENDATIONS FOR CURRENT USER
// ==========================================
/**
 * GET /api/v1/recommendations
 * Returns personalized service recommendations for the logged-in user
 */
async function getUserRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Validate limit
    if (limit < 1 || limit > 50) {
      return badRequestResponse(res, 'Limit must be between 1 and 50');
    }

    const result = await getRecommendations(userId, limit);

    return okResponse(res, 'Recommendations retrieved successfully', {
      recommendations: result.recommendations,
      userProfile: result.userProfile,
      scoringRules: Object.keys(WEIGHTS).map(key => ({
        rule: key.toLowerCase(),
        maxPoints: WEIGHTS[key]
      }))
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    return serverErrorResponse(res, 'Failed to get recommendations');
  }
}

// ==========================================
// GET SIMILAR SERVICES
// ==========================================
/**
 * GET /api/v1/recommendations/similar/:serviceId
 * Returns services similar to a given service
 */
async function getSimilarServices(req, res) {
  try {
    const { serviceId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    // Get the reference service
    const referenceService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: true
      }
    });

    if (!referenceService) {
      return badRequestResponse(res, 'Service not found');
    }

    // Find similar services based on category and price range
    const priceRange = parseFloat(referenceService.price) * 0.3; // 30% price variance

    const similarServices = await prisma.service.findMany({
      where: {
        isActive: true,
        id: { not: serviceId },
        OR: [
          { category: referenceService.category },
          {
            price: {
              gte: parseFloat(referenceService.price) - priceRange,
              lte: parseFloat(referenceService.price) + priceRange
            }
          }
        ]
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            location: true,
            totalBookings: true
          }
        }
      },
      take: limit * 2 // Get more to filter and sort
    });

    // Score similar services
    const scored = similarServices.map(service => {
      let score = 0;
      const explanations = [];

      // Same category = 50 points
      if (service.category === referenceService.category) {
        score += 50;
        explanations.push({
          rule: 'category',
          text: `Same category: ${service.category}`
        });
      }

      // Similar price = 30 points
      const priceDiff = Math.abs(parseFloat(service.price) - parseFloat(referenceService.price));
      if (priceDiff <= priceRange) {
        const priceScore = Math.round(30 * (1 - priceDiff / priceRange));
        score += priceScore;
        explanations.push({
          rule: 'price',
          text: 'Similar price range'
        });
      }

      // High rating bonus = 20 points
      if (parseFloat(service.provider.rating) >= 4.0) {
        score += 20;
        explanations.push({
          rule: 'rating',
          text: `⭐ ${parseFloat(service.provider.rating).toFixed(1)} rating`
        });
      }

      return {
        service: {
          id: service.id,
          serviceName: service.serviceName,
          category: service.category,
          description: service.description,
          price: parseFloat(service.price),
          duration: service.duration,
          image: service.image,
          provider: service.provider
        },
        score,
        explanations
      };
    });

    // Sort and limit
    const topSimilar = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return okResponse(res, 'Similar services retrieved', {
      referenceService: {
        id: referenceService.id,
        serviceName: referenceService.serviceName,
        category: referenceService.category
      },
      similarServices: topSimilar
    });

  } catch (error) {
    console.error('Get similar services error:', error);
    return serverErrorResponse(res, 'Failed to get similar services');
  }
}

// ==========================================
// GET TRENDING SERVICES (No auth required)
// ==========================================
/**
 * GET /api/v1/recommendations/trending
 * Returns trending/popular services (no login required)
 */
async function getTrendingServices(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get services with high ratings and recent bookings
    const trendingServices = await prisma.service.findMany({
      where: {
        isActive: true,
        provider: {
          rating: { gte: 4.0 },
          totalBookings: { gte: 1 }
        }
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            location: true,
            totalBookings: true
          }
        },
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: [
        { provider: { rating: 'desc' } },
        { provider: { totalBookings: 'desc' } }
      ],
      take: limit
    });

    const formatted = trendingServices.map(service => ({
      service: {
        id: service.id,
        serviceName: service.serviceName,
        category: service.category,
        description: service.description,
        price: parseFloat(service.price),
        duration: service.duration,
        image: service.image,
        provider: {
          ...service.provider,
          rating: parseFloat(service.provider.rating)
        }
      },
      bookingCount: service._count.bookings,
      explanations: [
        {
          rule: 'trending',
          text: `⭐ ${parseFloat(service.provider.rating).toFixed(1)} rating • ${service.provider.totalBookings} bookings`
        }
      ]
    }));

    return okResponse(res, 'Trending services retrieved', {
      trending: formatted
    });

  } catch (error) {
    console.error('Get trending services error:', error);
    return serverErrorResponse(res, 'Failed to get trending services');
  }
}

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  getUserRecommendations,
  getSimilarServices,
  getTrendingServices
};
