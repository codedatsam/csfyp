// ==========================================
// ANALYTICS CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Provider analytics and statistics
// ==========================================

const { prisma } = require('../config/database');
const { 
  okResponse, 
  notFoundResponse,
  serverErrorResponse 
} = require('../utils/response');

// ==========================================
// GET PROVIDER ANALYTICS
// ==========================================
const getProviderAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get provider
    let provider = await prisma.provider.findUnique({
      where: { userId },
      include: {
        services: {
          select: { id: true, serviceName: true, price: true, isActive: true }
        }
      }
    });

    // If no provider profile, return empty analytics (don't error out)
    if (!provider) {
      return okResponse(res, 'Analytics retrieved', {
        overview: {
          totalEarnings: 0,
          monthlyEarnings: 0,
          weeklyEarnings: 0,
          totalBookings: 0,
          completedBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          totalServices: 0,
          activeServices: 0,
          averageRating: 0,
          totalReviews: 0
        },
        serviceBreakdown: [],
        monthlyData: [],
        recentBookings: [],
        recentReviews: []
      });
    }

    // Get all bookings for this provider
    const bookings = await prisma.booking.findMany({
      where: { providerId: provider.id },
      include: {
        service: { select: { serviceName: true, price: true } },
        client: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

    // Calculate earnings (only from completed bookings)
    const totalEarnings = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

    // Calculate earnings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = bookings
      .filter(b => b.status === 'COMPLETED' && new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

    // Calculate earnings this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyEarnings = bookings
      .filter(b => b.status === 'COMPLETED' && new Date(b.createdAt) >= startOfWeek)
      .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

    // Get earnings by service
    const earningsByService = {};
    bookings
      .filter(b => b.status === 'COMPLETED')
      .forEach(b => {
        const serviceName = b.service?.serviceName || 'Unknown';
        if (!earningsByService[serviceName]) {
          earningsByService[serviceName] = { count: 0, total: 0 };
        }
        earningsByService[serviceName].count++;
        earningsByService[serviceName].total += parseFloat(b.totalPrice);
      });

    // Convert to array and sort by total
    const serviceBreakdown = Object.entries(earningsByService)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    // Get monthly earnings for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthEarnings = bookings
        .filter(b => 
          b.status === 'COMPLETED' && 
          new Date(b.createdAt) >= monthStart && 
          new Date(b.createdAt) <= monthEnd
        )
        .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

      const monthBookings = bookings.filter(b => 
        new Date(b.createdAt) >= monthStart && 
        new Date(b.createdAt) <= monthEnd
      ).length;

      monthlyData.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        year: monthStart.getFullYear(),
        earnings: monthEarnings,
        bookings: monthBookings
      });
    }

    // Recent bookings (last 10)
    const recentBookings = bookings.slice(0, 10).map(b => ({
      id: b.id,
      serviceName: b.service?.serviceName,
      clientName: `${b.client?.firstName} ${b.client?.lastName}`,
      date: b.bookingDate,
      timeSlot: b.timeSlot,
      amount: parseFloat(b.totalPrice),
      status: b.status,
      createdAt: b.createdAt
    }));

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { providerId: provider.id },
      include: {
        client: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return okResponse(res, 'Analytics retrieved', {
      overview: {
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        totalBookings,
        completedBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalServices: provider.services.length,
        activeServices: provider.services.filter(s => s.isActive).length,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviews.length
      },
      serviceBreakdown,
      monthlyData,
      recentBookings,
      recentReviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        clientName: `${r.client?.firstName} ${r.client?.lastName}`,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Get provider analytics error:', error);
    return serverErrorResponse(res, 'Failed to get analytics');
  }
};

// ==========================================
// GET CLIENT ANALYTICS (Spending Overview)
// ==========================================
const getClientAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all bookings for this client
    const bookings = await prisma.booking.findMany({
      where: { clientId: userId },
      include: {
        service: { select: { serviceName: true, category: true } },
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;

    // Calculate total spent
    const totalSpent = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

    // Spending by category
    const spendingByCategory = {};
    bookings
      .filter(b => b.status === 'COMPLETED')
      .forEach(b => {
        const category = b.service?.category || 'Other';
        if (!spendingByCategory[category]) {
          spendingByCategory[category] = 0;
        }
        spendingByCategory[category] += parseFloat(b.totalPrice);
      });

    // Recent bookings
    const recentBookings = bookings.slice(0, 10).map(b => ({
      id: b.id,
      serviceName: b.service?.serviceName,
      providerName: `${b.provider?.user?.firstName} ${b.provider?.user?.lastName}`,
      date: b.bookingDate,
      timeSlot: b.timeSlot,
      amount: parseFloat(b.totalPrice),
      status: b.status,
      createdAt: b.createdAt
    }));

    return okResponse(res, 'Client analytics retrieved', {
      overview: {
        totalSpent,
        totalBookings,
        completedBookings,
        pendingBookings
      },
      spendingByCategory,
      recentBookings
    });
  } catch (error) {
    console.error('Get client analytics error:', error);
    return serverErrorResponse(res, 'Failed to get analytics');
  }
};

module.exports = {
  getProviderAnalytics,
  getClientAnalytics
};
