// ==========================================
// SERVICES CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Service management operations
// ==========================================

const { prisma } = require('../config/database');
const { 
  okResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse,
  forbiddenResponse,
  serverErrorResponse 
} = require('../utils/response');

// Default service categories
const defaultCategories = [
  'Tutoring',
  'Essay Help',
  'Tech Support',
  'Haircuts',
  'Food Delivery',
  'Moving Help',
  'Photography',
  'Design Work',
  'Laundry',
  'Cleaning',
  'Fitness',
  'Music Lessons',
  'Language Lessons',
  'Other'
];

// ==========================================
// GET ALL SERVICES (Public)
// ==========================================
const getAllServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sortBy = 'createdAt', 
      order = 'desc',
      minPrice,
      maxPrice
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { serviceName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Get services with pagination
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              location: true,
              rating: true,
              totalBookings: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  location: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: order },
        skip,
        take
      }),
      prisma.service.count({ where })
    ]);

    return okResponse(res, 'Services retrieved successfully', {
      services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all services error:', error);
    return serverErrorResponse(res, 'Failed to retrieve services');
  }
};

// ==========================================
// GET SERVICE BY ID (Public)
// ==========================================
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            location: true,
            rating: true,
            totalBookings: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                location: true,
                avatar: true,
                phone: true,
                email: true
              }
            },
            reviews: {
              include: {
                client: {
                  select: {
                    firstName: true,
                    lastName: true
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

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    return okResponse(res, 'Service retrieved successfully', { service });
  } catch (error) {
    console.error('Get service by ID error:', error);
    return serverErrorResponse(res, 'Failed to retrieve service');
  }
};

// ==========================================
// GET MY SERVICES (Provider)
// ==========================================
const getMyServices = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create provider profile
    let provider = await prisma.provider.findUnique({
      where: { userId }
    });

    // If no provider profile, return empty array (user hasn't created services yet)
    if (!provider) {
      return okResponse(res, 'No services yet', { services: [] });
    }

    const services = await prisma.service.findMany({
      where: { providerId: provider.id },
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
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return okResponse(res, 'Services retrieved successfully', { services });
  } catch (error) {
    console.error('Get my services error:', error);
    return serverErrorResponse(res, 'Failed to retrieve services');
  }
};

// ==========================================
// CREATE SERVICE (Provider)
// ==========================================
const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceName, category, description, price, duration, imageUrl, image, location } = req.body;

    // Validate required fields
    if (!serviceName || !category || !price) {
      return badRequestResponse(res, 'Service name, category, and price are required');
    }

    // Validate price
    if (isNaN(price) || parseFloat(price) < 0) {
      return badRequestResponse(res, 'Invalid price');
    }

    // Get user info for default business name
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, location: true }
    });

    // Get or create provider profile
    let provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (!provider) {
      // Create provider profile if doesn't exist
      provider = await prisma.provider.create({
        data: {
          userId,
          businessName: `${user.firstName} ${user.lastName}`, // Use user's name as default
          description: '',
          location: user.location || null,
          rating: 0,
          totalBookings: 0
        }
      });

      // Update user role to PROVIDER if not already
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'PROVIDER' }
      });
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        serviceName,
        category,
        description: description || '',
        price: parseFloat(price),
        duration: parseInt(duration) || 60,
        image: image || imageUrl || null,
        location: location || user.location || null,
        isActive: true
      },
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
        }
      }
    });

    return createdResponse(res, 'Service created successfully', { service });
  } catch (error) {
    console.error('Create service error:', error);
    return serverErrorResponse(res, 'Failed to create service');
  }
};

// ==========================================
// UPDATE SERVICE (Provider)
// ==========================================
const updateService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Get provider
    const provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (!provider) {
      return forbiddenResponse(res, 'Provider profile not found');
    }

    // Find service and verify ownership
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    if (service.providerId !== provider.id) {
      return forbiddenResponse(res, 'You can only update your own services');
    }

    // Build update data
    const updateData = {};
    if (updates.serviceName !== undefined) updateData.serviceName = updates.serviceName;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = parseFloat(updates.price);
    if (updates.duration !== undefined) updateData.duration = parseInt(updates.duration);
    if (updates.imageUrl !== undefined) updateData.image = updates.imageUrl;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    // Update service
    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
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
        }
      }
    });

    return okResponse(res, 'Service updated successfully', { service: updatedService });
  } catch (error) {
    console.error('Update service error:', error);
    return serverErrorResponse(res, 'Failed to update service');
  }
};

// ==========================================
// DELETE SERVICE (Provider)
// ==========================================
const deleteService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get provider
    const provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (!provider) {
      return forbiddenResponse(res, 'Provider profile not found');
    }

    // Find service and verify ownership
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    if (service.providerId !== provider.id) {
      return forbiddenResponse(res, 'You can only delete your own services');
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        serviceId: id,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (activeBookings > 0) {
      return badRequestResponse(res, 'Cannot delete service with active bookings');
    }

    // Delete service
    await prisma.service.delete({
      where: { id }
    });

    return okResponse(res, 'Service deleted successfully');
  } catch (error) {
    console.error('Delete service error:', error);
    return serverErrorResponse(res, 'Failed to delete service');
  }
};

// ==========================================
// GET CATEGORIES (Public)
// ==========================================
const getCategories = async (req, res) => {
  try {
    return okResponse(res, 'Categories retrieved successfully', {
      defaultCategories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return serverErrorResponse(res, 'Failed to retrieve categories');
  }
};

// ==========================================
// GET BUSINESS PROFILE (Public)
// ==========================================
const getBusinessProfile = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            location: true
          }
        },
        services: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        availability: {
          orderBy: { dayOfWeek: 'asc' }
        },
        reviews: {
          include: {
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
        }
      }
    });

    if (!provider) {
      return notFoundResponse(res, 'Business not found');
    }

    // Format availability into business hours
    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const businessHours = daysOrder.map(day => {
      const dayAvailability = provider.availability.filter(a => a.dayOfWeek === day && a.isAvailable);
      if (dayAvailability.length === 0) {
        return { day, isOpen: false, hours: 'Closed' };
      }
      // Get earliest start and latest end
      const startTimes = dayAvailability.map(a => a.startTime).sort();
      const endTimes = dayAvailability.map(a => a.endTime).sort().reverse();
      return {
        day,
        isOpen: true,
        startTime: startTimes[0],
        endTime: endTimes[0],
        hours: `${startTimes[0]} - ${endTimes[0]}`
      };
    });

    // Calculate stats
    const totalReviews = provider.reviews.length;
    const completedBookings = provider.totalBookings;

    // Check if "Top Rated" (rating >= 4.5 and at least 5 reviews)
    const isTopRated = parseFloat(provider.rating) >= 4.5 && totalReviews >= 5;

    return okResponse(res, 'Business profile retrieved successfully', {
      business: {
        id: provider.id,
        name: provider.businessName,
        description: provider.description,
        image: provider.businessImage || provider.user.avatar,
        location: provider.location || provider.user.location,
        rating: parseFloat(provider.rating),
        totalReviews,
        totalBookings: completedBookings,
        isVerified: provider.isVerified,
        isTopRated,
        specialties: provider.specialties,
        owner: {
          firstName: provider.user.firstName,
          lastName: provider.user.lastName,
          avatar: provider.user.avatar
        }
      },
      services: provider.services.map(s => ({
        id: s.id,
        name: s.serviceName,
        description: s.description,
        price: parseFloat(s.price),
        duration: s.duration,
        category: s.category,
        image: s.image
      })),
      businessHours,
      reviews: provider.reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        client: {
          name: `${r.client.firstName} ${r.client.lastName?.charAt(0) || ''}.`,
          avatar: r.client.avatar
        }
      }))
    });
  } catch (error) {
    console.error('Get business profile error:', error);
    return serverErrorResponse(res, 'Failed to retrieve business profile');
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
  getCategories,
  getBusinessProfile
};
