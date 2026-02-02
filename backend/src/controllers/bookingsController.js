// ==========================================
// BOOKINGS CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Booking management operations
// Updated: Added provider can book for client feature
// ==========================================

const { prisma } = require('../config/database');
const { 
  okResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse 
} = require('../utils/response');

// ==========================================
// CREATE BOOKING (Client only)
// ==========================================
const createBooking = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { serviceId, bookingDate, timeSlot, notes } = req.body;

    // Validate required fields
    if (!serviceId || !bookingDate || !timeSlot) {
      return badRequestResponse(res, 'Service ID, booking date and time slot are required');
    }

    // Get service and provider info
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: {
          include: {
            user: true
          }
        }
      }
    });

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    if (!service.isActive) {
      return badRequestResponse(res, 'This service is no longer available');
    }

    // Check if user is trying to book their own service
    if (service.provider.userId === clientId) {
      return badRequestResponse(res, 'You cannot book your own service');
    }

    // Check for conflicting booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        providerId: service.providerId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (existingBooking) {
      return badRequestResponse(res, 'This time slot is already booked');
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientId,
        providerId: service.providerId,
        serviceId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        totalPrice: service.price,
        notes: notes || ''
      },
      include: {
        service: true,
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
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: service.provider.userId,
        type: 'NEW_BOOKING',
        title: 'New Booking Request',
        message: `${req.user.firstName} wants to book your ${service.serviceName} service on ${new Date(bookingDate).toLocaleDateString()}`
      }
    });

    return createdResponse(res, 'Booking created successfully', { booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return serverErrorResponse(res, 'Failed to create booking');
  }
};

// ==========================================
// CREATE BOOKING FOR CLIENT (Provider only)
// ==========================================
const createBookingForClient = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { serviceId, clientEmail, bookingDate, timeSlot, notes } = req.body;

    // Validate required fields
    if (!serviceId || !clientEmail || !bookingDate || !timeSlot) {
      return badRequestResponse(res, 'Service ID, client email, booking date and time slot are required');
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: providerId },
      include: { user: true }
    });

    if (!provider) {
      return badRequestResponse(res, 'You need a provider profile to book for clients');
    }

    // Get service and verify ownership
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    if (service.providerId !== provider.id) {
      return badRequestResponse(res, 'You can only book your own services for clients');
    }

    if (!service.isActive) {
      return badRequestResponse(res, 'This service is no longer available');
    }

    // Find client by email
    const client = await prisma.user.findUnique({
      where: { email: clientEmail.toLowerCase().trim() }
    });

    if (!client) {
      return notFoundResponse(res, 'Client not found. Please ensure they have a Husleflow account.');
    }

    // Provider cannot book for themselves
    if (client.id === providerId) {
      return badRequestResponse(res, 'You cannot book for yourself');
    }

    // Check for conflicting booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        providerId: provider.id,
        bookingDate: new Date(bookingDate),
        timeSlot,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (existingBooking) {
      return badRequestResponse(res, 'This time slot is already booked');
    }

    // Create booking with CONFIRMED status (provider already approved)
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        providerId: provider.id,
        serviceId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        totalPrice: service.price,
        notes: notes || '',
        status: 'CONFIRMED' // Auto-confirmed since provider is creating it
      },
      include: {
        service: true,
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
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: client.id,
        type: 'BOOKING_FOR_YOU',
        title: 'Booking Confirmed For You',
        message: `${provider.user.firstName} has booked ${service.serviceName} for you on ${new Date(bookingDate).toLocaleDateString()} at ${timeSlot}`,
        data: JSON.stringify({ bookingId: booking.id })
      }
    });

    return createdResponse(res, 'Booking created for client successfully', { booking });
  } catch (error) {
    console.error('Create booking for client error:', error);
    return serverErrorResponse(res, 'Failed to create booking for client');
  }
};

// ==========================================
// GET MY BOOKINGS (Client)
// ==========================================
const getMyBookings = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { clientId };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          service: true,
          provider: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              }
            }
          },
          review: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.booking.count({ where })
    ]);

    return okResponse(res, 'Bookings retrieved successfully', {
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    return serverErrorResponse(res, 'Failed to retrieve bookings');
  }
};

// ==========================================
// GET PROVIDER BOOKINGS (Provider)
// ==========================================
const getProviderBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (!provider) {
      return okResponse(res, 'No bookings found', { bookings: [] });
    }

    const where = { providerId: provider.id };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          service: true,
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          review: true
        },
        orderBy: { bookingDate: 'asc' },
        skip,
        take
      }),
      prisma.booking.count({ where })
    ]);

    return okResponse(res, 'Provider bookings retrieved successfully', {
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get provider bookings error:', error);
    return serverErrorResponse(res, 'Failed to retrieve bookings');
  }
};

// ==========================================
// GET BOOKING BY ID
// ==========================================
const getBookingById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        review: true
      }
    });

    if (!booking) {
      return notFoundResponse(res, 'Booking not found');
    }

    // Check if user is client or provider of this booking
    const provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (booking.clientId !== userId && (!provider || booking.providerId !== provider.id)) {
      return notFoundResponse(res, 'Booking not found');
    }

    return okResponse(res, 'Booking retrieved successfully', { booking });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    return serverErrorResponse(res, 'Failed to retrieve booking');
  }
};

// ==========================================
// UPDATE BOOKING STATUS (Provider)
// ==========================================
const updateBookingStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return badRequestResponse(res, 'Invalid status. Must be CONFIRMED, COMPLETED, or CANCELLED');
    }

    const provider = await prisma.provider.findUnique({
      where: { userId }
    });

    if (!provider) {
      return notFoundResponse(res, 'Provider profile not found');
    }

    const booking = await prisma.booking.findFirst({
      where: { id, providerId: provider.id },
      include: {
        client: true,
        service: true
      }
    });

    if (!booking) {
      return notFoundResponse(res, 'Booking not found or unauthorized');
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update provider total bookings if completed
    if (status === 'COMPLETED') {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { totalBookings: { increment: 1 } }
      });
    }

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: booking.clientId,
        type: 'BOOKING_UPDATE',
        title: `Booking ${status.toLowerCase()}`,
        message: `Your booking for ${booking.service.serviceName} has been ${status.toLowerCase()}`
      }
    });

    return okResponse(res, 'Booking status updated successfully', { booking: updatedBooking });
  } catch (error) {
    console.error('Update booking status error:', error);
    return serverErrorResponse(res, 'Failed to update booking status');
  }
};

// ==========================================
// CANCEL BOOKING (Client)
// ==========================================
const cancelBooking = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { id, clientId },
      include: {
        service: true,
        provider: {
          include: { user: true }
        }
      }
    });

    if (!booking) {
      return notFoundResponse(res, 'Booking not found or unauthorized');
    }

    if (booking.status === 'COMPLETED') {
      return badRequestResponse(res, 'Cannot cancel a completed booking');
    }

    if (booking.status === 'CANCELLED') {
      return badRequestResponse(res, 'Booking is already cancelled');
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: booking.provider.userId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        message: `${req.user.firstName} cancelled their booking for ${booking.service.serviceName}`
      }
    });

    return okResponse(res, 'Booking cancelled successfully', { booking: updatedBooking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return serverErrorResponse(res, 'Failed to cancel booking');
  }
};

// ==========================================
// GET AVAILABLE TIME SLOTS
// ==========================================
const getAvailableSlots = async (req, res) => {
  try {
    const { providerId, date } = req.query;

    if (!providerId || !date) {
      return badRequestResponse(res, 'Provider ID and date are required');
    }

    const bookingDate = new Date(date);
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][bookingDate.getDay()];

    // Get provider availability for this day
    const availability = await prisma.availability.findMany({
      where: {
        providerId,
        dayOfWeek,
        isAvailable: true
      }
    });

    // Get existing bookings for this date
    const existingBookings = await prisma.booking.findMany({
      where: {
        providerId,
        bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      select: { timeSlot: true }
    });

    const bookedSlots = existingBookings.map(b => b.timeSlot);

    // Generate time slots (default if no availability set)
    const defaultSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    let availableSlots;
    if (availability.length > 0) {
      // Use provider's set availability
      availableSlots = availability.map(a => a.startTime);
    } else {
      // Use default slots
      availableSlots = defaultSlots;
    }

    // Filter out booked slots
    const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

    return okResponse(res, 'Available slots retrieved successfully', {
      date,
      dayOfWeek,
      availableSlots: freeSlots,
      bookedSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    return serverErrorResponse(res, 'Failed to retrieve available slots');
  }
};

// ==========================================
// SEARCH CLIENTS (For provider to book for client)
// ==========================================
const searchClients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return okResponse(res, 'Enter at least 2 characters to search', { users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query.toLowerCase() } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true,
        id: { not: req.user.id } // Exclude current user
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      },
      take: 10
    });

    return okResponse(res, 'Users found', { users });
  } catch (error) {
    console.error('Search clients error:', error);
    return serverErrorResponse(res, 'Failed to search clients');
  }
};

module.exports = {
  createBooking,
  createBookingForClient,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots,
  searchClients
};
