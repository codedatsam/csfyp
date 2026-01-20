// ==========================================
// REVIEWS CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Review management operations
// ==========================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { 
  okResponse, 
  createdResponse, 
  badRequestResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse 
} = require('../utils/response');

// ==========================================
// CREATE REVIEW (Client only, after booking completed)
// ==========================================
const createReview = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { bookingId, rating, comment } = req.body;

    // Validate required fields
    if (!bookingId || !rating) {
      return badRequestResponse(res, 'Booking ID and rating are required');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return badRequestResponse(res, 'Rating must be between 1 and 5');
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
        provider: {
          include: { user: true }
        }
      }
    });

    if (!booking) {
      return notFoundResponse(res, 'Booking not found');
    }

    if (booking.clientId !== clientId) {
      return forbiddenResponse(res, 'Unauthorized to review this booking');
    }

    if (booking.status !== 'COMPLETED') {
      return badRequestResponse(res, 'Can only review completed bookings');
    }

    if (booking.review) {
      return badRequestResponse(res, 'You have already reviewed this booking');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        clientId,
        providerId: booking.providerId,
        rating: parseInt(rating),
        comment: comment || ''
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Update provider average rating
    const providerReviews = await prisma.review.aggregate({
      where: { providerId: booking.providerId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.provider.update({
      where: { id: booking.providerId },
      data: {
        rating: providerReviews._avg.rating || 0
      }
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: booking.provider.userId,
        type: 'NEW_REVIEW',
        title: 'New Review Received',
        message: `${req.user.firstName} left a ${rating}-star review`
      }
    });

    return createdResponse(res, 'Review created successfully', { review });
  } catch (error) {
    console.error('Create review error:', error);
    return serverErrorResponse(res, 'Failed to create review');
  }
};

// ==========================================
// GET PROVIDER REVIEWS (Public)
// ==========================================
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { providerId },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          booking: {
            include: {
              service: {
                select: {
                  serviceName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.review.count({ where: { providerId } }),
      prisma.review.aggregate({
        where: { providerId },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { providerId },
      _count: { rating: true }
    });

    return okResponse(res, 'Reviews retrieved successfully', {
      reviews,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
        distribution: ratingDistribution.reduce((acc, r) => {
          acc[r.rating] = r._count.rating;
          return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    return serverErrorResponse(res, 'Failed to retrieve reviews');
  }
};

// ==========================================
// GET MY REVIEWS (Reviews I've written)
// ==========================================
const getMyReviews = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { clientId },
        include: {
          provider: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          booking: {
            include: {
              service: {
                select: {
                  serviceName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.review.count({ where: { clientId } })
    ]);

    return okResponse(res, 'My reviews retrieved successfully', {
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    return serverErrorResponse(res, 'Failed to retrieve reviews');
  }
};

// ==========================================
// GET REVIEWS ABOUT ME (Provider)
// ==========================================
const getReviewsAboutMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (!provider) {
      return okResponse(res, 'No reviews found', { 
        reviews: [],
        stats: { averageRating: 0, totalReviews: 0 }
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { providerId: provider.id },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          booking: {
            include: {
              service: {
                select: {
                  serviceName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.review.count({ where: { providerId: provider.id } }),
      prisma.review.aggregate({
        where: { providerId: provider.id },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    return okResponse(res, 'Reviews about me retrieved successfully', {
      reviews,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews about me error:', error);
    return serverErrorResponse(res, 'Failed to retrieve reviews');
  }
};

// ==========================================
// UPDATE REVIEW
// ==========================================
const updateReview = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findFirst({
      where: { id, clientId }
    });

    if (!review) {
      return notFoundResponse(res, 'Review not found or unauthorized');
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return badRequestResponse(res, 'Rating must be between 1 and 5');
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(comment !== undefined && { comment })
      }
    });

    // Update provider average rating
    const providerReviews = await prisma.review.aggregate({
      where: { providerId: review.providerId },
      _avg: { rating: true }
    });

    await prisma.provider.update({
      where: { id: review.providerId },
      data: {
        rating: providerReviews._avg.rating || 0
      }
    });

    return okResponse(res, 'Review updated successfully', { review: updatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    return serverErrorResponse(res, 'Failed to update review');
  }
};

// ==========================================
// DELETE REVIEW
// ==========================================
const deleteReview = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { id } = req.params;

    const review = await prisma.review.findFirst({
      where: { id, clientId }
    });

    if (!review) {
      return notFoundResponse(res, 'Review not found or unauthorized');
    }

    await prisma.review.delete({
      where: { id }
    });

    // Update provider average rating
    const providerReviews = await prisma.review.aggregate({
      where: { providerId: review.providerId },
      _avg: { rating: true }
    });

    await prisma.provider.update({
      where: { id: review.providerId },
      data: {
        rating: providerReviews._avg.rating || 0
      }
    });

    return okResponse(res, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete review error:', error);
    return serverErrorResponse(res, 'Failed to delete review');
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getMyReviews,
  getReviewsAboutMe,
  updateReview,
  deleteReview
};
