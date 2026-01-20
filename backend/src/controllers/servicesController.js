// ==========================================
// SERVICES CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: CRUD operations for services
// ==========================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require('../utils/response');

// ==========================================
// CREATE SERVICE (Provider only)
// ==========================================
const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceName, category, description, price, duration } = req.body;

    // Check if user is a provider
    if (req.user.role !== 'PROVIDER') {
      return errorResponse(res, 'Only providers can create services', 403);
    }

    // Get or create provider profile
    let provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (!provider) {
      // Create provider profile automatically
      provider = await prisma.provider.create({
        data: {
          userId,
          businessName: `${req.user.firstName}'s Services`,
          description: 'Student service provider on Husleflow'
        }
      });
    }

    // Create the service
    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        serviceName,
        category,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return successResponse(res, 'Service created successfully', { service }, 201);
  } catch (error) {
    console.error('Create service error:', error);
    return errorResponse(res, 'Failed to create service', 500);
  }
};

// ==========================================
// GET ALL SERVICES (Public - with filters)
// ==========================================
const getAllServices = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter conditions
    const where = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { serviceName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get services with provider info
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          provider: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  location: true
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

    return successResponse(res, 'Services retrieved successfully', {
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
    return errorResponse(res, 'Failed to retrieve services', 500);
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
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                location: true,
                phone: true
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
      return errorResponse(res, 'Service not found', 404);
    }

    return successResponse(res, 'Service retrieved successfully', { service });
  } catch (error) {
    console.error('Get service by ID error:', error);
    return errorResponse(res, 'Failed to retrieve service', 500);
  }
};

// ==========================================
// GET MY SERVICES (Provider only)
// ==========================================
const getMyServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const provider = await prisma.provider.findUnique({
      where: { userId },
      include: {
        services: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!provider) {
      return successResponse(res, 'No services found', { services: [] });
    }

    return successResponse(res, 'My services retrieved successfully', { 
      services: provider.services 
    });
  } catch (error) {
    console.error('Get my services error:', error);
    return errorResponse(res, 'Failed to retrieve services', 500);
  }
};

// ==========================================
// UPDATE SERVICE (Provider only)
// ==========================================
const updateService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { serviceName, category, description, price, duration, isActive } = req.body;

    // Get provider
    const provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (!provider) {
      return errorResponse(res, 'Provider profile not found', 404);
    }

    // Check if service belongs to this provider
    const existingService = await prisma.service.findFirst({
      where: { id, providerId: provider.id }
    });

    if (!existingService) {
      return errorResponse(res, 'Service not found or unauthorized', 404);
    }

    // Update service
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(serviceName && { serviceName }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return successResponse(res, 'Service updated successfully', { service });
  } catch (error) {
    console.error('Update service error:', error);
    return errorResponse(res, 'Failed to update service', 500);
  }
};

// ==========================================
// DELETE SERVICE (Provider only)
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
      return errorResponse(res, 'Provider profile not found', 404);
    }

    // Check if service belongs to this provider
    const existingService = await prisma.service.findFirst({
      where: { id, providerId: provider.id }
    });

    if (!existingService) {
      return errorResponse(res, 'Service not found or unauthorized', 404);
    }

    // Soft delete - set isActive to false
    await prisma.service.update({
      where: { id },
      data: { isActive: false }
    });

    return successResponse(res, 'Service deleted successfully');
  } catch (error) {
    console.error('Delete service error:', error);
    return errorResponse(res, 'Failed to delete service', 500);
  }
};

// ==========================================
// GET SERVICE CATEGORIES (Public)
// ==========================================
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.service.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true }
    });

    // Student-focused categories
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

    return successResponse(res, 'Categories retrieved successfully', { 
      categories: categories.map(c => ({
        name: c.category,
        count: c._count.category
      })),
      defaultCategories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, 'Failed to retrieve categories', 500);
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  getMyServices,
  updateService,
  deleteService,
  getCategories
};
