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
const { 
  generateResetToken, 
  generateTokenExpiry, 
  generateVerificationToken,
  generateVerificationExpiry 
} = require('../utils/token');

const { 
  sendPasswordResetEmail, 
  sendWelcomeEmail,
  sendVerificationEmail 
} = require('../services/emailService');
// ==========================================
// REGISTER NEW USER (Step 1 - Send Verification)
// ==========================================
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, phone, role, location } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // If user exists but not verified, allow re-registration
      if (!existingUser.isEmailVerified) {
        // Delete the unverified user so they can register again
        await prisma.user.delete({
          where: { id: existingUser.id }
        });
      } else {
        return conflictResponse(res, 'Email already registered');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = generateVerificationExpiry();

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: role || 'CLIENT',
        location: location || null,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName
    );

    if (!emailResult.success) {
      console.error(`❌ Failed to send verification email: ${emailResult.error}`);
      // Delete the user if email fails
      await prisma.user.delete({ where: { id: user.id } });
      return serverErrorResponse(res, 'Failed to send verification email. Please try again.');
    }

    console.log(`📧 Verification email sent to ${user.email}`);
    console.log(`🔐 Verification token: ${verificationToken.substring(0, 6).toUpperCase()}`);

    return createdResponse(res, 'Registration initiated! Please check your email to verify your account.', {
      email: user.email,
      message: 'A verification email has been sent. Please check your inbox and spam folder.'
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
        isEmailVerified: true,
        createdAt: true
      }
    });

    // Check if user exists
    if (!user) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return unauthorizedResponse(
        res, 
        'Please verify your email before logging in. Check your inbox or request a new verification email.'
      );
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
    const { password: _, isEmailVerified: __, ...userWithoutPassword } = user;

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

// ==========================================
// REQUEST PASSWORD RESET
// ==========================================
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true }
    });

    // Don't reveal if user exists or not (security)
    if (!user) {
      return okResponse(
        res, 
        'If that email exists, a password reset link has been sent'
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = generateTokenExpiry();

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // In production, send email with reset link
    // For now, we'll just return the token (for testing)
    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email, 
      resetToken, 
      user.firstName
    );

    if (emailResult.success) {
      console.log(`📧 Password reset email sent to ${email}`);
    } else {
      console.error(`❌ Failed to send password reset email: ${emailResult.error}`);
      // Still return success - don't reveal email sending issues
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 PASSWORD RESET TOKEN for ${email}:`);
      console.log(`Token: ${resetToken}`);
      console.log(`Reset URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
      console.log(`Expires: ${resetTokenExpiry}\n`);
    }

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    return okResponse(
      res,
      'If that email exists, a password reset link has been sent',
      {
        // Only in development - remove in production!
        ...(process.env.NODE_ENV === 'development' && {
          resetToken,
          resetUrl: `http://localhost:5173/reset-password?token=${resetToken}`
        })
      }
    );

  } catch (error) {
    console.error('Password reset request error:', error);
    return serverErrorResponse(res, 'Failed to process password reset request');
  }
}

// ==========================================
// RESET PASSWORD
// ==========================================
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token not expired
        }
      },
      select: {
        id: true,
        email: true,
        resetTokenExpiry: true
      }
    });

    if (!user) {
      return badRequestResponse(
        res,
        'Invalid or expired reset token. Please request a new password reset.'
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    console.log(`✅ Password reset successful: ${user.email}`);

    return okResponse(res, 'Password reset successful. You can now log in with your new password.');

  } catch (error) {
    console.error('Password reset error:', error);
    return serverErrorResponse(res, 'Failed to reset password');
  }
}

// ==========================================
// VERIFY RESET TOKEN
// ==========================================
async function verifyResetToken(req, res) {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return badRequestResponse(res, 'Invalid or expired reset token');
    }

    return okResponse(res, 'Token is valid', {
      email: user.email
    });

  } catch (error) {
    console.error('Verify token error:', error);
    return serverErrorResponse(res, 'Failed to verify token');
  }
}

// ==========================================
// VERIFY EMAIL
// ==========================================
async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return badRequestResponse(res, 'Verification token is required');
    }

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: {
          gt: new Date()
        },
        isEmailVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (!user) {
      return badRequestResponse(
        res,
        'Invalid or expired verification token. Please register again.'
      );
    }

    // Mark email as verified and clear token
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null
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

    // Generate tokens for automatic login
    const accessToken = generateAccessToken({ userId: verifiedUser.id, role: verifiedUser.role });
    const refreshToken = generateRefreshToken({ userId: verifiedUser.id });

    // Send welcome email (in background)
    sendWelcomeEmail(verifiedUser.email, verifiedUser.firstName, verifiedUser.role)
      .then(result => {
        if (result.success) {
          console.log(`📧 Welcome email sent to ${verifiedUser.email}`);
        }
      })
      .catch(err => console.error('Welcome email error:', err));

    console.log(`✅ Email verified: ${verifiedUser.email}`);

    return okResponse(res, 'Email verified successfully! Welcome to Hustleflow!', {
      user: verifiedUser,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return serverErrorResponse(res, 'Failed to verify email');
  }
}

// ==========================================
// VERIFY EMAIL BY CODE (6-digit code)
// ==========================================
async function verifyEmailByCode(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return badRequestResponse(res, 'Email and verification code are required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true,
        isEmailVerified: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (!user) {
      return badRequestResponse(res, 'User not found');
    }

    if (user.isEmailVerified) {
      return badRequestResponse(res, 'Email already verified');
    }

    if (!user.emailVerificationToken || new Date() > user.emailVerificationExpiry) {
      return badRequestResponse(res, 'Verification code expired. Please register again.');
    }

    // Check if code matches (first 6 characters of token)
    const expectedCode = user.emailVerificationToken.substring(0, 6).toUpperCase();
    const providedCode = code.toUpperCase().replace(/\s/g, '');

    if (providedCode !== expectedCode) {
      return badRequestResponse(res, 'Invalid verification code');
    }

    // Mark email as verified
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null
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
    const accessToken = generateAccessToken({ userId: verifiedUser.id, role: verifiedUser.role });
    const refreshToken = generateRefreshToken({ userId: verifiedUser.id });

    // Send welcome email
    sendWelcomeEmail(verifiedUser.email, verifiedUser.firstName, verifiedUser.role)
      .catch(err => console.error('Welcome email error:', err));

    console.log(`✅ Email verified via code: ${verifiedUser.email}`);

    return okResponse(res, 'Email verified successfully!', {
      user: verifiedUser,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    });

  } catch (error) {
    console.error('Code verification error:', error);
    return serverErrorResponse(res, 'Failed to verify code');
  }
}

// ==========================================
// RESEND VERIFICATION EMAIL
// ==========================================
async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return badRequestResponse(res, 'Email is required');
    }

    // Find unverified user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        isEmailVerified: true
      }
    });

    if (!user) {
      // Don't reveal if user exists
      return okResponse(res, 'If that email exists and is unverified, a new verification email has been sent.');
    }

    if (user.isEmailVerified) {
      return badRequestResponse(res, 'Email is already verified. Please login.');
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = generateVerificationExpiry();

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry
      }
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName
    );

    if (!emailResult.success) {
      console.error(`❌ Failed to resend verification email: ${emailResult.error}`);
      return serverErrorResponse(res, 'Failed to send verification email');
    }

    console.log(`📧 Verification email resent to ${user.email}`);

    return okResponse(res, 'Verification email sent! Please check your inbox.');

  } catch (error) {
    console.error('Resend verification error:', error);
    return serverErrorResponse(res, 'Failed to resend verification email');
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
  verifyEmail,
  verifyEmailByCode,
  resendVerificationEmail
};