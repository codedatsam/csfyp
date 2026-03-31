// ==========================================
// USERS CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Public user profile operations
// ==========================================

const { prisma } = require('../config/database');
const { 
  okResponse, 
  notFoundResponse,
  serverErrorResponse 
} = require('../utils/response');

// ==========================================
// GET PUBLIC USER PROFILE
// ==========================================
const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        location: true,
        role: true,
        createdAt: true,
        // Include provider info if they are a provider
        provider: {
          select: {
            id: true,
            businessName: true,
            description: true,
            rating: true,
            totalBookings: true,
            isVerified: true,
            businessImage: true,
            services: {
              where: { isActive: true },
              select: {
                id: true,
                serviceName: true,
                category: true,
                price: true,
                duration: true,
                image: true
              },
              take: 6
            },
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                client: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    // Don't expose inactive users
    const userRecord = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!userRecord.isActive) {
      return notFoundResponse(res, 'User not found');
    }

    return okResponse(res, 'User profile retrieved successfully', { user });

  } catch (error) {
    console.error('Get public profile error:', error);
    return serverErrorResponse(res, 'Failed to retrieve user profile');
  }
};

// ==========================================
// GET PROVIDER PROFILE BY USER ID
// ==========================================
const getProviderByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            location: true,
            createdAt: true
          }
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            serviceName: true,
            category: true,
            price: true,
            duration: true,
            image: true,
            description: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        availability: {
          where: { isAvailable: true },
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    if (!provider) {
      return notFoundResponse(res, 'Provider not found');
    }

    return okResponse(res, 'Provider profile retrieved successfully', { provider });

  } catch (error) {
    console.error('Get provider by user ID error:', error);
    return serverErrorResponse(res, 'Failed to retrieve provider profile');
  }
};

module.exports = {
  getPublicProfile,
  getProviderByUserId
};
