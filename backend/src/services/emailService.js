// ==========================================
// EMAIL SERVICE (Using Resend)
// ==========================================
// Author: Samson Fabiyi
// Description: Email sending functionality using Resend
// Updated: Added promotional footer for guest emails
// IMPORTANT: For external emails, you need a verified domain in Resend
// ==========================================

const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email - IMPORTANT: Must be from verified domain for external emails
// onboarding@resend.dev only works for emails to your own verified address
const FROM_EMAIL = process.env.FROM_EMAIL || 'Husleflow <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://husleflow.com';

// Check if we're using Resend's test domain (won't work for external emails)
const isTestDomain = FROM_EMAIL.includes('resend.dev');
if (isTestDomain) {
  console.warn('⚠️  WARNING: Using resend.dev test domain. External emails will fail!');
  console.warn('⚠️  To send to external emails, add a verified domain in Resend dashboard');
  console.warn('⚠️  and set FROM_EMAIL env variable (e.g., noreply@yourdomain.com)');
}

// Base email template (for registered users)
const getEmailTemplate = (content, title = 'Husleflow') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 12px; margin: 5px 0; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .btn:hover { opacity: 0.9; }
    .code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; background-color: #f3f4f6; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 20px 0; }
    .info-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-box.warning { background-color: #fef3c7; border-color: #fcd34d; }
    .info-box.primary { background-color: #eef2ff; border-color: #c7d2fe; }
    .booking-details { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .booking-details table { width: 100%; border-collapse: collapse; }
    .booking-details td { padding: 8px 0; }
    .booking-details td:first-child { color: #6b7280; width: 40%; }
    .booking-details td:last-child { font-weight: 600; color: #1f2937; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
    .status-pending { background-color: #fef3c7; color: #92400e; }
    .status-confirmed { background-color: #d1fae5; color: #065f46; }
    .status-completed { background-color: #dbeafe; color: #1e40af; }
    .status-cancelled { background-color: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Husleflow</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Husleflow. All rights reserved.</p>
      <p>Student Services Marketplace</p>
    </div>
  </div>
</body>
</html>
`;

// Email template for GUEST users (with promotional footer)
const getGuestEmailTemplate = (content, title = 'Husleflow') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .promo-section { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; text-align: center; }
    .promo-section h2 { color: #ffffff; margin: 0 0 10px 0; font-size: 22px; }
    .promo-section p { color: #e0e7ff; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; }
    .promo-btn { display: inline-block; padding: 12px 24px; background-color: #ffffff; color: #4F46E5; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 5px; }
    .promo-btn:hover { opacity: 0.9; }
    .promo-btn.secondary { background-color: transparent; border: 2px solid #ffffff; color: #ffffff; }
    .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 12px; margin: 5px 0; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; background-color: #f3f4f6; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 20px 0; }
    .info-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-box.warning { background-color: #fef3c7; border-color: #fcd34d; }
    .info-box.primary { background-color: #eef2ff; border-color: #c7d2fe; }
    .booking-details { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .booking-details table { width: 100%; border-collapse: collapse; }
    .booking-details td { padding: 8px 0; }
    .booking-details td:first-child { color: #6b7280; width: 40%; }
    .booking-details td:last-child { font-weight: 600; color: #1f2937; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
    .status-confirmed { background-color: #d1fae5; color: #065f46; }
    .status-cancelled { background-color: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Husleflow</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    
    <!-- Promotional Section for Guest Users -->
    <div class="promo-section">
      <h2>🚀 Join Husleflow Today!</h2>
      <p>
        Discover more amazing services from talented students, or become a service provider yourself and start earning!
      </p>
      <div>
        <a href="${FRONTEND_URL}/register" class="promo-btn">Create Free Account</a>
        <a href="${FRONTEND_URL}/services" class="promo-btn secondary">Explore Services</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Husleflow. All rights reserved.</p>
      <p>Student Services Marketplace</p>
      <p style="margin-top: 10px;">
        <a href="${FRONTEND_URL}" style="color: #4F46E5; text-decoration: none;">Visit Husleflow</a> · 
        <a href="${FRONTEND_URL}/register" style="color: #4F46E5; text-decoration: none;">Sign Up</a> · 
        <a href="${FRONTEND_URL}/services" style="color: #4F46E5; text-decoration: none;">Browse Services</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// ==========================================
// SEND VERIFICATION EMAIL
// ==========================================
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const code = token.substring(0, 6).toUpperCase();
    
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">Welcome to Husleflow, ${firstName}! 👋</h2>
      <p style="color: #4b5563; line-height: 1.6;">Thank you for signing up! Please verify your email address using the code below:</p>
      <div style="text-align: center;">
        <div class="code">${code}</div>
      </div>
      <div class="info-box warning">
        <p style="margin: 0; color: #92400e;"><strong>⏰ This code expires in 15 minutes.</strong></p>
      </div>
      <p style="color: #4b5563;">If you didn't create an account, please ignore this email.</p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '✉️ Verify Your Email - Husleflow',
      html: getEmailTemplate(content, 'Verify Email')
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send verification email error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// SEND WELCOME EMAIL
// ==========================================
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">Welcome aboard, ${firstName}! 🎉</h2>
      <p style="color: #4b5563; line-height: 1.6;">Your email has been verified and your Husleflow account is now active!</p>
      <div class="info-box primary">
        <h3 style="margin-top: 0; color: #3730a3;">What you can do now:</h3>
        <ul style="color: #4b5563; line-height: 1.8;">
          <li>🔍 Browse services from other students</li>
          <li>📅 Book appointments with service providers</li>
          <li>💼 Offer your own services and earn money</li>
          <li>⭐ Leave reviews and build your reputation</li>
        </ul>
      </div>
      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/services" class="btn">Start Exploring →</a>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🎉 Welcome to Husleflow!',
      html: getEmailTemplate(content, 'Welcome')
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send welcome email error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// SEND PASSWORD RESET EMAIL
// ==========================================
const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">Password Reset Request 🔐</h2>
      <p style="color: #4b5563; line-height: 1.6;">Hi ${firstName}, we received a request to reset your password.</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="btn">Reset Password →</a>
      </div>
      <div class="info-box warning">
        <p style="margin: 0; color: #92400e;"><strong>⏰ This link expires in 1 hour.</strong></p>
      </div>
      <p style="color: #4b5563;">If you didn't request a password reset, please ignore this email.</p>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🔐 Reset Your Password - Husleflow',
      html: getEmailTemplate(content, 'Reset Password')
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send password reset email error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// SEND NEW BOOKING EMAIL (To Provider)
// ==========================================
const sendNewBookingEmail = async (providerEmail, providerName, booking) => {
  try {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">New Booking Request! 📅</h2>
      <p style="color: #4b5563; line-height: 1.6;">Hi ${providerName}, you have a new booking request!</p>
      
      <div class="booking-details">
        <table>
          <tr>
            <td>Service:</td>
            <td>${booking.service?.serviceName || 'N/A'}</td>
          </tr>
          <tr>
            <td>Client:</td>
            <td>${booking.client?.firstName} ${booking.client?.lastName}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>${booking.client?.email}</td>
          </tr>
          <tr>
            <td>Date:</td>
            <td>${bookingDate}</td>
          </tr>
          <tr>
            <td>Time:</td>
            <td>${booking.timeSlot}</td>
          </tr>
          <tr>
            <td>Price:</td>
            <td>£${parseFloat(booking.totalPrice).toFixed(2)}</td>
          </tr>
          ${booking.notes ? `<tr><td>Notes:</td><td>${booking.notes}</td></tr>` : ''}
          <tr>
            <td>Status:</td>
            <td><span class="status-badge status-pending">Pending</span></td>
          </tr>
        </table>
      </div>

      <div class="info-box primary">
        <p style="margin: 0; color: #3730a3;"><strong>💡 Please confirm or decline this booking in your dashboard.</strong></p>
      </div>

      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/dashboard/my-bookings" class="btn">View Booking →</a>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: providerEmail,
      subject: `📅 New Booking: ${booking.service?.serviceName || 'Service'} - Husleflow`,
      html: getEmailTemplate(content, 'New Booking')
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send new booking email error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// SEND BOOKING CONFIRMATION EMAIL (To Client)
// ==========================================
const sendBookingConfirmedEmail = async (clientEmail, clientName, booking) => {
  try {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">Booking Confirmed! ✅</h2>
      <p style="color: #4b5563; line-height: 1.6;">Hi ${clientName}, great news! Your booking has been confirmed.</p>
      
      <div class="booking-details">
        <table>
          <tr>
            <td>Service:</td>
            <td>${booking.service?.serviceName || 'N/A'}</td>
          </tr>
          <tr>
            <td>Provider:</td>
            <td>${booking.provider?.user?.firstName} ${booking.provider?.user?.lastName}</td>
          </tr>
          <tr>
            <td>Date:</td>
            <td>${bookingDate}</td>
          </tr>
          <tr>
            <td>Time:</td>
            <td>${booking.timeSlot}</td>
          </tr>
          <tr>
            <td>Price:</td>
            <td>£${parseFloat(booking.totalPrice).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Status:</td>
            <td><span class="status-badge status-confirmed">Confirmed</span></td>
          </tr>
        </table>
      </div>

      <div class="info-box">
        <p style="margin: 0; color: #065f46;"><strong>✨ Your appointment is all set! Don't forget to arrive on time.</strong></p>
      </div>

      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/dashboard/my-bookings" class="btn">View My Bookings →</a>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `✅ Booking Confirmed: ${booking.service?.serviceName || 'Service'} - Husleflow`,
      html: getEmailTemplate(content, 'Booking Confirmed')
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send booking confirmed email error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// SEND BOOKING CREATED FOR CLIENT EMAIL
// ==========================================
const sendBookingCreatedForClientEmail = async (clientEmail, clientName, booking) => {
  try {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">Booking Created For You! 🎉</h2>
      <p style="color: #4b5563; line-height: 1.6;">Hi ${clientName}, ${booking.provider?.user?.firstName} has created a booking for you!</p>
      
      <div class="booking-details">
        <table>
          <tr>
            <td>Service:</td>
            <td>${booking.service?.serviceName || 'N/A'}</td>
          </tr>
          <tr>
            <td>Provider:</td>
            <td>${booking.provider?.user?.firstName} ${booking.provider?.user?.lastName}</td>
          </tr>
          <tr>
            <td>Date:</td>
            <td>${bookingDate}</td>
          </tr>
          <tr>
            <td>Time:</td>
            <td>${booking.timeSlot}</td>
          </tr>
          <tr>
            <td>Price:</td>
            <td>£${parseFloat(booking.totalPrice).toFixed(2)}</td>
          </tr>
          ${booking.notes ? `<tr><td>Notes:</td><td>${booking.notes}</td></tr>` : ''}
          <tr>
            <td>Status:</td>
            <td><span class="status-badge status-confirmed">Confirmed</span></td>
          </tr>
        </table>
      </div>

      <div class="info-box">
        <p style="margin: 0; color: #065f46;"><strong>✨ This booking has been automatically confirmed. See you there!</strong></p>
      </div>

      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/dashboard/my-bookings" class="btn">View My Bookings →</a>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `🎉 Booking Created For You: ${booking.service?.serviceName || 'Service'} - Husleflow`,
      html: getEmailTemplate(content, 'Booking Created')
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send booking created for client email error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// SEND BOOKING CANCELLED EMAIL
// ==========================================
const sendBookingCancelledEmail = async (email, name, booking, cancelledBy) => {
  try {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">Booking Cancelled ❌</h2>
      <p style="color: #4b5563; line-height: 1.6;">Hi ${name}, a booking has been cancelled${cancelledBy ? ` by ${cancelledBy}` : ''}.</p>
      
      <div class="booking-details">
        <table>
          <tr>
            <td>Service:</td>
            <td>${booking.service?.serviceName || 'N/A'}</td>
          </tr>
          <tr>
            <td>Date:</td>
            <td>${bookingDate}</td>
          </tr>
          <tr>
            <td>Time:</td>
            <td>${booking.timeSlot}</td>
          </tr>
          <tr>
            <td>Status:</td>
            <td><span class="status-badge status-cancelled">Cancelled</span></td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/services" class="btn">Browse Services →</a>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `❌ Booking Cancelled: ${booking.service?.serviceName || 'Service'} - Husleflow`,
      html: getEmailTemplate(content, 'Booking Cancelled')
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send booking cancelled email error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// SEND BOOKING COMPLETED EMAIL
// ==========================================
const sendBookingCompletedEmail = async (clientEmail, clientName, booking) => {
  try {
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">Booking Completed! 🎊</h2>
      <p style="color: #4b5563; line-height: 1.6;">Hi ${clientName}, your booking for <strong>${booking.service?.serviceName}</strong> has been marked as complete!</p>
      
      <div class="info-box primary">
        <h3 style="margin-top: 0; color: #3730a3;">How was your experience? ⭐</h3>
        <p style="color: #4b5563; margin-bottom: 0;">Your feedback helps other students find great services. Please take a moment to leave a review!</p>
      </div>

      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/dashboard/my-bookings" class="btn">Leave a Review →</a>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `⭐ Leave a Review: ${booking.service?.serviceName || 'Service'} - Husleflow`,
      html: getEmailTemplate(content, 'Leave Review')
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send booking completed email error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// SEND EMAIL TO EXTERNAL/GUEST (Non-registered user)
// Uses special template with promotional footer!
// ==========================================
const sendExternalBookingEmail = async (email, name, booking, providerName) => {
  try {
    console.log(`📧 Attempting to send booking email to external guest: ${email}`);
    
    // Warn about test domain limitation
    if (FROM_EMAIL.includes('resend.dev')) {
      console.warn(`⚠️  Using Resend test domain - email to ${email} may fail unless it's your verified email`);
    }

    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const isCancelled = booking.status === 'CANCELLED';
    
    const content = `
      <h2 style="color: #1f2937; margin-bottom: 10px;">
        ${isCancelled ? 'Booking Cancelled ❌' : 'You Have a Booking! 🎉'}
      </h2>
      <p style="color: #4b5563; line-height: 1.6;">
        Hi there! ${isCancelled 
          ? `Your booking for <strong>${booking.serviceName}</strong> with ${providerName} has been cancelled.`
          : `${providerName} has booked <strong>${booking.serviceName}</strong> for you!`
        }
      </p>
      
      <div class="booking-details">
        <table>
          <tr>
            <td>Service:</td>
            <td><strong>${booking.serviceName}</strong></td>
          </tr>
          <tr>
            <td>Provider:</td>
            <td>${providerName}</td>
          </tr>
          <tr>
            <td>Date:</td>
            <td>${bookingDate}</td>
          </tr>
          <tr>
            <td>Time:</td>
            <td>${booking.timeSlot}</td>
          </tr>
          <tr>
            <td>Price:</td>
            <td>£${parseFloat(booking.price).toFixed(2)}</td>
          </tr>
          ${booking.notes ? `<tr><td>Notes:</td><td>${booking.notes}</td></tr>` : ''}
          <tr>
            <td>Status:</td>
            <td><span class="status-badge ${isCancelled ? 'status-cancelled' : 'status-confirmed'}">${isCancelled ? 'Cancelled' : 'Confirmed'}</span></td>
          </tr>
        </table>
      </div>

      ${!isCancelled ? `
        <div class="info-box">
          <p style="margin: 0; color: #065f46;"><strong>✨ Your appointment is confirmed. See you there!</strong></p>
        </div>
      ` : ''}
    `;

    // Use GUEST template with promotional footer
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${isCancelled ? '❌ Booking Cancelled' : '🎉 Booking Confirmed'}: ${booking.serviceName} - Husleflow`,
      html: getGuestEmailTemplate(content, isCancelled ? 'Booking Cancelled' : 'Booking Confirmation')
    });

    if (error) {
      console.error(`❌ Failed to send email to ${email}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Provide helpful message for common errors
      if (error.message?.includes('not allowed')) {
        console.error('💡 TIP: To send to external emails, you need to verify your own domain in Resend');
        console.error('💡 Visit: https://resend.com/domains to add your domain');
      }
      
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent successfully to ${email}, ID: ${data?.id}`);
    return { success: true, data };
  } catch (error) {
    console.error('Send external booking email error:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNewBookingEmail,
  sendBookingConfirmedEmail,
  sendBookingCreatedForClientEmail,
  sendBookingCancelledEmail,
  sendBookingCompletedEmail,
  sendExternalBookingEmail
};
