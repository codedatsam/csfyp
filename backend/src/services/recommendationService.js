// ==========================================
// RECOMMENDATION SERVICE
// ==========================================
// Author: Samson Fabiyi
// Description: Rule-based scoring algorithm for service recommendations
// ==========================================

const { prisma } = require('../config/database');

// ==========================================
// SCORING WEIGHTS (Total = 100 points)
// ==========================================
const WEIGHTS = {
  CATEGORY_MATCH: 25,      // User has booked this category before
  LOCATION_MATCH: 25,      // Service is in same city as user
  PRICE_RANGE: 20,         // Price matches user's typical spending
  PROVIDER_RATING: 15,     // Provider has good ratings
  TIME_AVAILABILITY: 15    // Provider available on user's preferred days
};

// ==========================================
// MAIN RECOMMENDATION FUNCTION
// ==========================================
/**
 * Get personalized service recommendations for a user
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum recommendations to return (default 10)
 * @returns {Array} Scored and sorted recommendations with explanations
 */
async function getRecommendations(userId, limit = 10) {
  try {
    // 1. Get user data and booking history
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        location: true,
        bookingsAsClient: {
          where: { status: { in: ['COMPLETED', 'CONFIRMED'] } },
          include: {
            service: {
              select: {
                id: true,
                category: true,
                price: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return { recommendations: [], message: 'User not found' };
    }

    const bookingHistory = user.bookingsAsClient || [];

    // 2. Analyze user's booking patterns
    const userProfile = analyzeUserProfile(bookingHistory);

    // 3. Get all active services (excluding ones user has already booked)
    const bookedServiceIds = bookingHistory.map(b => b.service.id);
    
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        id: { notIn: bookedServiceIds } // Exclude already booked services
      },
      include: {
        provider: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            },
            availability: true
          }
        }
      }
    });

    // 4. Score each service
    const scoredServices = services.map(service => {
      const { score, explanations } = calculateScore(
        service,
        user,
        userProfile,
        bookingHistory
      );

      return {
        service: {
          id: service.id,
          serviceName: service.serviceName,
          category: service.category,
          description: service.description,
          price: parseFloat(service.price),
          duration: service.duration,
          image: service.image,
          provider: {
            id: service.provider.id,
            businessName: service.provider.businessName,
            rating: parseFloat(service.provider.rating),
            location: service.provider.location,
            totalBookings: service.provider.totalBookings
          }
        },
        score,
        explanations
      };
    });

    // 5. Sort by score (highest first) and limit results
    const recommendations = scoredServices
      .filter(s => s.score > 0) // Only include services with some match
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      recommendations,
      userProfile: {
        totalBookings: bookingHistory.length,
        favoriteCategories: userProfile.categories,
        averageSpend: userProfile.avgPrice,
        preferredDays: userProfile.preferredDays
      }
    };

  } catch (error) {
    console.error('Recommendation service error:', error);
    throw error;
  }
}

// ==========================================
// ANALYZE USER'S BOOKING PATTERNS
// ==========================================
function analyzeUserProfile(bookingHistory) {
  if (bookingHistory.length === 0) {
    return {
      categories: [],
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      preferredDays: []
    };
  }

  // Count category frequency
  const categoryCounts = {};
  let totalPrice = 0;
  let minPrice = Infinity;
  let maxPrice = 0;
  const dayCounts = {};

  bookingHistory.forEach(booking => {
    // Category tracking
    const category = booking.service.category;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    // Price tracking
    const price = parseFloat(booking.service.price);
    totalPrice += price;
    minPrice = Math.min(minPrice, price);
    maxPrice = Math.max(maxPrice, price);

    // Day preference tracking
    const dayOfWeek = new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
  });

  // Sort categories by frequency
  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  // Sort days by frequency
  const preferredDays = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([day, count]) => ({ day, count }));

  return {
    categories,
    avgPrice: totalPrice / bookingHistory.length,
    minPrice: minPrice === Infinity ? 0 : minPrice,
    maxPrice,
    preferredDays
  };
}

// ==========================================
// CALCULATE SCORE FOR A SERVICE
// ==========================================
function calculateScore(service, user, userProfile, bookingHistory) {
  let score = 0;
  const explanations = [];

  // ----------------------------------------
  // 1. CATEGORY MATCH (25 points)
  // ----------------------------------------
  const categoryMatch = userProfile.categories.find(
    c => c.category === service.category
  );
  
  if (categoryMatch) {
    // More bookings in this category = higher score
    const categoryScore = Math.min(WEIGHTS.CATEGORY_MATCH, categoryMatch.count * 5);
    score += categoryScore;
    explanations.push({
      rule: 'category',
      points: categoryScore,
      text: `You've booked ${service.category} ${categoryMatch.count} time${categoryMatch.count > 1 ? 's' : ''}`
    });
  }

  // ----------------------------------------
  // 2. LOCATION MATCH (25 points)
  // ----------------------------------------
  const userLocation = user.location?.toLowerCase();
  const serviceLocation = service.provider.location?.toLowerCase();
  
  if (userLocation && serviceLocation) {
    if (userLocation === serviceLocation) {
      // Exact city match
      score += WEIGHTS.LOCATION_MATCH;
      explanations.push({
        rule: 'location',
        points: WEIGHTS.LOCATION_MATCH,
        text: `In your city (${service.provider.location})`
      });
    } else if (serviceLocation.includes(userLocation) || userLocation.includes(serviceLocation)) {
      // Partial match (e.g., "London" matches "East London")
      score += WEIGHTS.LOCATION_MATCH * 0.6;
      explanations.push({
        rule: 'location',
        points: Math.round(WEIGHTS.LOCATION_MATCH * 0.6),
        text: `Near your location`
      });
    }
  }

  // ----------------------------------------
  // 3. PRICE RANGE FIT (20 points)
  // ----------------------------------------
  if (userProfile.avgPrice > 0) {
    const servicePrice = parseFloat(service.price);
    const priceDiff = Math.abs(servicePrice - userProfile.avgPrice);
    const priceRange = userProfile.maxPrice - userProfile.minPrice || userProfile.avgPrice;
    
    // Calculate how close the price is to user's average
    const priceProximity = 1 - (priceDiff / (priceRange * 1.5));
    
    if (priceProximity > 0) {
      const priceScore = Math.round(WEIGHTS.PRICE_RANGE * Math.max(0, priceProximity));
      if (priceScore > 0) {
        score += priceScore;
        explanations.push({
          rule: 'price',
          points: priceScore,
          text: `Similar to your usual spend (avg £${userProfile.avgPrice.toFixed(0)})`
        });
      }
    }
  }

  // ----------------------------------------
  // 4. PROVIDER RATING (15 points)
  // ----------------------------------------
  const rating = parseFloat(service.provider.rating);
  
  if (rating >= 4.0) {
    // 4.0+ rating gets proportional points
    const ratingScore = Math.round((rating / 5) * WEIGHTS.PROVIDER_RATING);
    score += ratingScore;
    explanations.push({
      rule: 'rating',
      points: ratingScore,
      text: `⭐ ${rating.toFixed(1)} rating${service.provider.totalBookings > 5 ? ` (${service.provider.totalBookings} bookings)` : ''}`
    });
  } else if (rating >= 3.0) {
    // 3.0-3.9 gets reduced points
    const ratingScore = Math.round((rating / 5) * WEIGHTS.PROVIDER_RATING * 0.5);
    score += ratingScore;
    explanations.push({
      rule: 'rating',
      points: ratingScore,
      text: `⭐ ${rating.toFixed(1)} rating`
    });
  }

  // ----------------------------------------
  // 5. TIME/DAY AVAILABILITY (15 points)
  // ----------------------------------------
  if (userProfile.preferredDays.length > 0 && service.provider.availability?.length > 0) {
    const userTopDays = userProfile.preferredDays.slice(0, 3).map(d => d.day);
    const providerDays = service.provider.availability
      .filter(a => a.isAvailable)
      .map(a => a.dayOfWeek);

    const matchingDays = userTopDays.filter(day => providerDays.includes(day));
    
    if (matchingDays.length > 0) {
      const timeScore = Math.round((matchingDays.length / userTopDays.length) * WEIGHTS.TIME_AVAILABILITY);
      score += timeScore;
      explanations.push({
        rule: 'availability',
        points: timeScore,
        text: `Available on ${matchingDays.length === 1 ? matchingDays[0].toLowerCase() : 'your preferred days'}`
      });
    }
  }

  // ----------------------------------------
  // BONUS: New user boost
  // ----------------------------------------
  if (bookingHistory.length === 0) {
    // For new users, boost highly-rated services
    if (rating >= 4.5 && service.provider.totalBookings >= 5) {
      score += 10;
      explanations.push({
        rule: 'popular',
        points: 10,
        text: 'Popular with other clients'
      });
    }
  }

  return { score, explanations };
}

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  getRecommendations,
  analyzeUserProfile,
  calculateScore,
  WEIGHTS
};
