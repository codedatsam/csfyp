// ==========================================
// AUTHENTICATION CONTROLLER
// ==========================================
// Author: Samson Fabiyi
// Description: Handle user registration, login, and authentication
// ==========================================

const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const {
  createdResponse,
  okResponse,
  badRequestResponse,
  unauthorizedResponse,
  conflictResponse,
  serverErrorResponse
} = require('../utils/response');

// ==========================================
// REGISTER NEW USER
// ==========================================
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, phone, role, location } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return conflictResponse(res, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: role || 'CLIENT',
        location: location || null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        location: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Log registration
    console.log(`✅ New user registered: ${user.email} (${user.role})`);

    return createdResponse(res, 'User registered successfully', {
      user,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return serverErrorResponse(res, 'Registration failed. Please try again.');
  }
}

// ==========================================
// LOGIN USER
// ==========================================
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        location: true,
        isActive: true,
        createdAt: true
      }
    });

    // Check if user exists
    if (!user) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      return unauthorizedResponse(res, 'Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Log login
    console.log(`✅ User logged in: ${user.email}`);

    return okResponse(res, 'Login successful', {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse(res, 'Login failed. Please try again.');
  }
}

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        location: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        provider: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            isVerified: true
          }
        }
      }
    });

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    return okResponse(res, 'Profile retrieved successfully', { user });

  } catch (error) {
    console.error('Get profile error:', error);
    return serverErrorResponse(res, 'Failed to retrieve profile');
  }
}

// ==========================================
// UPDATE USER PROFILE
// ==========================================
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, location } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(location && { location })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        location: true,
        updatedAt: true
      }
    });

    console.log(`✅ Profile updated: ${updatedUser.email}`);

    return okResponse(res, 'Profile updated successfully', { user: updatedUser });

  } catch (error) {
    console.error('Update profile error:', error);
    return serverErrorResponse(res, 'Failed to update profile');
  }
}

// ==========================================
// CHANGE PASSWORD
// ==========================================
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true }
    });

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return badRequestResponse(res, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    console.log(`✅ Password changed: ${user.email}`);

    return okResponse(res, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return serverErrorResponse(res, 'Failed to change password');
  }
}

// ==========================================
// LOGOUT (Client-side token deletion)
// ==========================================
function logout(req, res) {
  // In JWT, logout is handled client-side by deleting the token
  // This endpoint is mainly for logging purposes
  console.log(`✅ User logged out: ${req.user.email}`);
  
  return okResponse(res, 'Logged out successfully. Please delete your token.');
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};