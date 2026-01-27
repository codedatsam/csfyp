// ==========================================
// ADMIN CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Admin panel operations
// ==========================================

const { prisma } = require('../config/database');
const { 
  okResponse, 
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse 
} = require('../utils/response');

// ==========================================
// DASHBOARD STATS
// ==========================================
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalClients,
      totalServices,
      activeServices,
      totalBookings,
      pendingBookings,
      completedBookings,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { firstName: true, lastName: true } },
          service: { select: { serviceName: true } }
        }
      })
    ]);

    return okResponse(res, 'Dashboard stats retrieved', {
      stats: {
        users: {
          total: totalUsers,
          providers: totalProviders,
          clients: totalClients
        },
        services: {
          total: totalServices,
          active: activeServices,
          inactive: totalServices - activeServices
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          completed: completedBookings
        }
      },
      recentUsers,
      recentBookings
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return serverErrorResponse(res, 'Failed to get dashboard stats');
  }
};

// ==========================================
// GET ALL USERS
// ==========================================
const getAllUsers = async (req, res) => {
  try {
    const { 
      role, 
      search, 
      isActive,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          location: true,
          avatar: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bookingsAsClient: true,
              reviews: true
            }
          }
        },
        orderBy: { [sortBy]: order },
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);

    return okResponse(res, 'Users retrieved', {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return serverErrorResponse(res, 'Failed to get users');
  }
};

// ==========================================
// GET USER BY ID
// ==========================================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        location: true,
        avatar: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        provider: {
          include: {
            services: true,
            _count: {
              select: { bookings: true, reviews: true }
            }
          }
        },
        bookingsAsClient: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            service: { select: { serviceName: true } }
          }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    return okResponse(res, 'User retrieved', { user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return serverErrorResponse(res, 'Failed to get user');
  }
};

// ==========================================
// UPDATE USER (Admin)
// ==========================================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isActive, isEmailVerified } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    // Prevent admin from demoting themselves
    if (id === req.user.id && role && role !== 'ADMIN') {
      return badRequestResponse(res, 'Cannot change your own admin role');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(isEmailVerified !== undefined && { isEmailVerified })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true
      }
    });

    return okResponse(res, 'User updated', { user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return serverErrorResponse(res, 'Failed to update user');
  }
};

// ==========================================
// DELETE USER (Soft delete)
// ==========================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return badRequestResponse(res, 'Cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    // Soft delete - deactivate account
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    return okResponse(res, 'User deactivated');
  } catch (error) {
    console.error('Delete user error:', error);
    return serverErrorResponse(res, 'Failed to delete user');
  }
};

// ==========================================
// GET ALL SERVICES (Admin)
// ==========================================
const getAllServicesAdmin = async (req, res) => {
  try {
    const { 
      category, 
      isActive,
      search,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { serviceName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          provider: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          },
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: { [sortBy]: order },
        skip,
        take
      }),
      prisma.service.count({ where })
    ]);

    return okResponse(res, 'Services retrieved', {
      services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all services admin error:', error);
    return serverErrorResponse(res, 'Failed to get services');
  }
};

// ==========================================
// UPDATE SERVICE (Admin)
// ==========================================
const updateServiceAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName, category, description, price, duration, isActive } = req.body;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(serviceName && { serviceName }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    return okResponse(res, 'Service updated', { service: updatedService });
  } catch (error) {
    console.error('Update service admin error:', error);
    return serverErrorResponse(res, 'Failed to update service');
  }
};

// ==========================================
// DELETE SERVICE (Admin)
// ==========================================
const deleteServiceAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    // Soft delete
    await prisma.service.update({
      where: { id },
      data: { isActive: false }
    });

    return okResponse(res, 'Service deactivated');
  } catch (error) {
    console.error('Delete service admin error:', error);
    return serverErrorResponse(res, 'Failed to delete service');
  }
};

// ==========================================
// GET ALL BOOKINGS (Admin)
// ==========================================
const getAllBookingsAdmin = async (req, res) => {
  try {
    const { 
      status,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          client: { select: { firstName: true, lastName: true, email: true } },
          provider: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          },
          service: { select: { serviceName: true, price: true } }
        },
        orderBy: { [sortBy]: order },
        skip,
        take
      }),
      prisma.booking.count({ where })
    ]);

    return okResponse(res, 'Bookings retrieved', {
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all bookings admin error:', error);
    return serverErrorResponse(res, 'Failed to get bookings');
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllServicesAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  getAllBookingsAdmin
};
