// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
// Author: Samson Fabiyi
// Description: JWT authentication and authorization middleware
// ==========================================

const { verifyAccessToken } = require('../utils/jwt');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/response');
const { prisma } = require('../config/database');

// Authenticate user via JWT token
async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'No token provided. Please login.');
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return unauthorizedResponse(res, 'User not found. Token invalid.');
    }

    if (!user.isActive) {
      return unauthorizedResponse(res, 'Account is deactivated.');
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error.message);
    return unauthorizedResponse(res, 'Invalid or expired token.');
  }
}

// Authorize based on user role
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return forbiddenResponse(
        res, 
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      );
    }

    next();
  };
}

// Optional authentication (doesn't fail if no token)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });

      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

module.exports = {
  authenticate,
  protect: authenticate, // Alias for backwards compatibility
  authorize,
  optionalAuth
};