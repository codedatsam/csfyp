// ==========================================
// EMAIL SERVICE - Resend
// ==========================================
// Author: Samson Fabiyi
// Description: Email sending functionality using Resend
// ==========================================

const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender
const DEFAULT_FROM = `${process.env.EMAIL_FROM_NAME || 'Husleflow'} <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`;

// Consistent footer for all emails
const EMAIL_FOOTER = `
  <!-- Footer -->
  <tr>
    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">
        Made with ❤️ & ☕ by students, for students
      </p>
      <p style="margin: 0 0 8px; color: #0284c7; font-size: 14px; font-weight: bold;">
        ✨ Husleflow ✨
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
        © 2026 Husleflow. All rights reserved.
      </p>
    </td>
  </tr>
`;

const TEXT_FOOTER = `
---
Made with love by students, for students
✨ Husleflow ✨
© 2026 Husleflow. All rights reserved.
`;

// ==========================================
// SEND EMAIL FUNCTION
// ==========================================
async function sendEmail({ to, subject, html, text }) {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || subject,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   ID: ${data.id}`);
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// EMAIL VERIFICATION
// ==========================================
async function sendVerificationEmail(email, verificationToken, firstName = 'there') {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
  const verificationCode = verificationToken.substring(0, 6).toUpperCase();
  
  const subject = 'Verify Your Email - Husleflow 🚀';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #0284c7; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    ✨ Husleflow ✨
                  </h1>
                  <p style="margin: 10px 0 0; color: #bae6fd; font-size: 14px;">
                    Your Campus. Your Services. Your Hustle.
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; text-align: center;">
                    Hey ${firstName}! 👋
                  </h2>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                    Welcome to Husleflow! Let's verify your email to get you started on your campus hustle.
                  </p>
                  
                  <!-- Verification Code Box -->
                  <div style="margin: 30px 0; padding: 30px; background-color: #f0f9ff; border-radius: 12px; text-align: center; border: 2px dashed #0284c7;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                      Your Verification Code
                    </p>
                    <p style="margin: 0; color: #0284c7; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
                      ${verificationCode}
                    </p>
                  </div>
                  
                  <p style="margin: 20px 0; color: #4b5563; font-size: 14px; text-align: center;">
                    Or click the button below:
                  </p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 10px 0 20px;">
                        <a href="${verifyUrl}" 
                           style="display: inline-block; padding: 16px 32px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                          Verify My Email 🚀
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Warning -->
                  <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      ⏰ <strong>This code expires in 24 hours.</strong><br>
                      Didn't sign up? Just ignore this email.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                    Ready to hustle! 💪<br>
                    <strong>The Husleflow Team</strong>
                  </p>
                </td>
              </tr>
              
              ${EMAIL_FOOTER}
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
Hey ${firstName}! 👋

Welcome to Husleflow! Let's verify your email.

Your Verification Code: ${verificationCode}

Or click this link: ${verifyUrl}

This code expires in 24 hours.

Ready to hustle!
The Husleflow Team
${TEXT_FOOTER}
  `;

  return await sendEmail({ to: email, subject, html, text });
}

// ==========================================
// WELCOME EMAIL (After Verification)
// ==========================================
async function sendWelcomeEmail(email, firstName, role) {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
  
  const subject = 'Welcome to Husleflow! 🎉 Let\'s Get Hustling';
  
  const roleMessage = role === 'PROVIDER' 
    ? 'You\'re all set to offer your services and start earning from fellow students!'
    : 'You can now find and book services from talented students on campus!';
  
  const roleEmoji = role === 'PROVIDER' ? '💼' : '🎓';
  const roleLabel = role === 'PROVIDER' ? 'Service Provider' : 'Student';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #10b981; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px;">
                    🎉
                  </h1>
                  <h2 style="margin: 10px 0 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                    You're In, ${firstName}!
                  </h2>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    ${roleMessage}
                  </p>
                  
                  <!-- Account Type Badge -->
                  <div style="margin: 20px 0; padding: 16px; background-color: ${role === 'PROVIDER' ? '#f3e8ff' : '#e0f2fe'}; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; color: ${role === 'PROVIDER' ? '#7c3aed' : '#0284c7'}; font-size: 16px; font-weight: bold;">
                      ${roleEmoji} ${roleLabel}
                    </p>
                  </div>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${dashboardUrl}" 
                           style="display: inline-block; padding: 16px 32px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                          Go to Dashboard 🚀
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- What's Next -->
                  <h3 style="margin: 30px 0 15px; color: #1f2937; font-size: 18px;">
                    Quick Start Guide:
                  </h3>
                  
                  <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 2;">
                    ${role === 'PROVIDER' ? `
                      <li>Add your first service</li>
                      <li>Set your prices and availability</li>
                      <li>Wait for bookings to roll in!</li>
                    ` : `
                      <li>Browse services on campus</li>
                      <li>Find what you need</li>
                      <li>Book with one click!</li>
                    `}
                  </ul>
                  
                  <p style="margin: 30px 0 0; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                    Let's hustle! 💪<br>
                    <strong>The Husleflow Team</strong>
                  </p>
                </td>
              </tr>
              
              ${EMAIL_FOOTER}
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
Welcome to Husleflow, ${firstName}! 🎉

${roleMessage}

Account Type: ${roleLabel}

Go to your dashboard: ${dashboardUrl}

Quick Start:
${role === 'PROVIDER' 
  ? '- Add your first service\n- Set your prices\n- Wait for bookings!' 
  : '- Browse services\n- Find what you need\n- Book with one click!'}

Let's hustle!
The Husleflow Team
${TEXT_FOOTER}
  `;

  return await sendEmail({ to: email, subject, html, text });
}

// ==========================================
// PASSWORD RESET EMAIL
// ==========================================
async function sendPasswordResetEmail(email, resetToken, firstName = 'there') {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const subject = 'Reset Your Husleflow Password 🔐';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #0284c7; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    ✨ Husleflow ✨
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                    Password Reset Request
                  </h2>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Hey ${firstName}, no worries! Click below to reset your password:
                  </p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; padding: 16px 32px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                          Reset My Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 20px 0; padding: 12px; background-color: #f3f4f6; border-radius: 4px; word-break: break-all; font-size: 12px;">
                    <a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a>
                  </p>
                  
                  <!-- Warning -->
                  <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      ⏰ <strong>This link expires in 1 hour.</strong><br>
                      Didn't request this? Just ignore this email.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #4b5563; font-size: 16px;">
                    <strong>The Husleflow Team</strong>
                  </p>
                </td>
              </tr>
              
              ${EMAIL_FOOTER}
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
Password Reset Request - Husleflow

Hey ${firstName},

Click this link to reset your password:
${resetUrl}

This link expires in 1 hour.

Didn't request this? Just ignore this email.

The Husleflow Team
${TEXT_FOOTER}
  `;

  return await sendEmail({ to: email, subject, html, text });
}

// ==========================================
// BOOKING CONFIRMATION EMAIL
// ==========================================
async function sendBookingConfirmationEmail(email, bookingDetails) {
  const { firstName, serviceName, providerName, date, time, price } = bookingDetails;
  
  const subject = `Booking Confirmed: ${serviceName} ✅`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #10b981; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    ✅ Booking Confirmed!
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Hey ${firstName}! Your booking is confirmed:
                  </p>
                  
                  <!-- Booking Details -->
                  <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">${serviceName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Provider:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">${providerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">${time}</td>
                      </tr>
                      <tr style="border-top: 2px solid #e5e7eb;">
                        <td style="padding: 12px 0 0; color: #6b7280; font-size: 16px; font-weight: bold;">Total:</td>
                        <td style="padding: 12px 0 0; color: #10b981; font-size: 20px; font-weight: bold; text-align: right;">£${price}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="margin: 20px 0 0; color: #4b5563; font-size: 16px; text-align: center;">
                    <strong>The Husleflow Team</strong>
                  </p>
                </td>
              </tr>
              
              ${EMAIL_FOOTER}
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text: `Booking Confirmed: ${serviceName} with ${providerName} on ${date} at ${time}. Total: £${price}${TEXT_FOOTER}`
  });
}

// ==========================================
// TEST EMAIL FUNCTION
// ==========================================
async function sendTestEmail(to) {
  return await sendEmail({
    to,
    subject: 'Husleflow Test Email ✅',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h1 style="color: #0284c7;">✨ Husleflow ✨</h1>
        <p>Email is working! 🎉</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Made with ❤️ & ☕ by students, for students
        </p>
      </div>
    `,
    text: 'Husleflow Email Test - Working!'
  });
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendVerificationEmail,
  sendTestEmail
};
