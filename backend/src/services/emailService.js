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
const DEFAULT_FROM = `${process.env.EMAIL_FROM_NAME || 'husleflow'} <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`;

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
      text: text || subject, // Fallback to subject if no text provided
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
// PASSWORD RESET EMAIL
// ==========================================
async function sendPasswordResetEmail(email, resetToken, firstName = 'User') {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const subject = 'Reset Your husleflow Password';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
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
                    🚀 husleflow
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
                    Hi ${firstName},
                  </p>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password for your husleflow account. 
                    Click the button below to create a new password:
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
                  
                  <p style="margin: 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Or copy and paste this link into your browser:
                  </p>
                  
                  <p style="margin: 0 0 20px; padding: 12px; background-color: #f3f4f6; border-radius: 4px; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #0284c7; font-size: 14px;">
                      ${resetUrl}
                    </a>
                  </p>
                  
                  <!-- Warning -->
                  <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      ⏰ <strong>This link expires in 1 hour.</strong><br>
                      If you didn't request this password reset, please ignore this email.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thanks,<br>
                    <strong>The husleflow Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                    BSc Computer Science Final Year Project
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    University of Hertfordshire | Samson Fabiyi (22065067)
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request - husleflow
    
    Hi ${firstName},
    
    We received a request to reset your password for your husleflow account.
    
    Click this link to reset your password:
    ${resetUrl}
    
    This link expires in 1 hour.
    
    If you didn't request this password reset, please ignore this email.
    
    Thanks,
    The husleflow Team
    
    ---
    BSc Computer Science Final Year Project
    University of Hertfordshire | Samson Fabiyi (22065067)
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text
  });
}

// ==========================================
// WELCOME EMAIL (After Registration)
// ==========================================
async function sendWelcomeEmail(email, firstName, role) {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
  
  const subject = 'Welcome to husleflow! 🎉';
  
  const roleMessage = role === 'PROVIDER' 
    ? 'You can now set up your services and start accepting bookings from clients.'
    : 'You can now browse services and book appointments with trusted local providers.';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to husleflow</title>
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
                    🚀 husleflow
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                    Welcome, ${firstName}! 🎉
                  </h2>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thanks for joining husleflow! Your account has been created successfully.
                  </p>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    ${roleMessage}
                  </p>
                  
                  <!-- Account Type Badge -->
                  <div style="margin: 20px 0; padding: 16px; background-color: ${role === 'PROVIDER' ? '#f3e8ff' : '#e0f2fe'}; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; color: ${role === 'PROVIDER' ? '#7c3aed' : '#0284c7'}; font-size: 14px; font-weight: bold;">
                      Account Type: ${role}
                    </p>
                  </div>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${dashboardUrl}" 
                           style="display: inline-block; padding: 16px 32px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                          Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- What's Next -->
                  <h3 style="margin: 30px 0 15px; color: #1f2937; font-size: 18px;">
                    What's Next?
                  </h3>
                  
                  <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                    <li>Complete your profile</li>
                    ${role === 'PROVIDER' 
                      ? '<li>Add your services and pricing</li><li>Set your availability</li>' 
                      : '<li>Browse available services</li><li>Book your first appointment</li>'}
                    <li>Explore the platform features</li>
                  </ul>
                  
                  <!-- Alpha Testing Notice -->
                  <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      🧪 <strong>Alpha Testing:</strong> You're using an early version of husleflow. 
                      Your feedback is valuable! Please report any issues or suggestions.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Welcome aboard!<br>
                    <strong>The husleflow Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                    BSc Computer Science Final Year Project
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    University of Hertfordshire | Samson Fabiyi (22065067)
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Welcome to husleflow, ${firstName}! 🎉
    
    Thanks for joining! Your account has been created successfully.
    
    Account Type: ${role}
    
    ${roleMessage}
    
    Go to your dashboard: ${dashboardUrl}
    
    What's Next?
    - Complete your profile
    ${role === 'PROVIDER' 
      ? '- Add your services and pricing\n- Set your availability' 
      : '- Browse available services\n- Book your first appointment'}
    - Explore the platform features
    
    🧪 Alpha Testing: You're using an early version. Your feedback is valuable!
    
    Welcome aboard!
    The husleflow Team
    
    ---
    BSc Computer Science Final Year Project
    University of Hertfordshire | Samson Fabiyi (22065067)
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text
  });
}

// ==========================================
// BOOKING CONFIRMATION EMAIL
// ==========================================
async function sendBookingConfirmationEmail(email, bookingDetails) {
  const { firstName, serviceName, providerName, date, time, price } = bookingDetails;
  
  const subject = `Booking Confirmed: ${serviceName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed</title>
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
                    Hi ${firstName},
                  </p>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your booking has been confirmed! Here are the details:
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
                      <tr style="border-top: 1px solid #e5e7eb;">
                        <td style="padding: 12px 0 0; color: #6b7280; font-size: 16px; font-weight: bold;">Total:</td>
                        <td style="padding: 12px 0 0; color: #10b981; font-size: 18px; font-weight: bold; text-align: right;">£${price}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="margin: 20px 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thanks for using husleflow!<br>
                    <strong>The husleflow Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    University of Hertfordshire | Samson Fabiyi (22065067)
                  </p>
                </td>
              </tr>
              
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
    text: `Booking Confirmed: ${serviceName} with ${providerName} on ${date} at ${time}. Total: £${price}`
  });
}

// ==========================================
// TEST EMAIL FUNCTION
// ==========================================
async function sendTestEmail(to) {
  return await sendEmail({
    to,
    subject: 'husleflow Test Email ✅',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #0284c7;">🚀 husleflow Email Test</h1>
        <p>If you're reading this, your email configuration is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          BSc Computer Science Final Year Project<br>
          University of Hertfordshire | Samson Fabiyi (22065067)
        </p>
      </div>
    `,
    text: 'husleflow Email Test - If you\'re reading this, your email configuration is working!'
  });
}


// ==========================================
// EMAIL VERIFICATION
// ==========================================
async function sendVerificationEmail(email, verificationToken, firstName = 'User') {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
  
  // Generate a 6-digit code from the token (for manual entry option)
  const verificationCode = verificationToken.substring(0, 6).toUpperCase();
  
  const subject = 'Verify Your Email - husleflow';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
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
                    🚀 husleflow
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; text-align: center;">
                    Verify Your Email Address
                  </h2>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Hi ${firstName},
                  </p>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thanks for signing up for husleflow! Please verify your email address to complete your registration.
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
                          Verify My Email
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 20px 0; color: #6b7280; font-size: 12px; text-align: center;">
                    Or copy and paste this link:
                  </p>
                  
                  <p style="margin: 0 0 20px; padding: 12px; background-color: #f3f4f6; border-radius: 4px; word-break: break-all; text-align: center;">
                    <a href="${verifyUrl}" style="color: #0284c7; font-size: 12px;">
                      ${verifyUrl}
                    </a>
                  </p>
                  
                  <!-- Warning -->
                  <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      ⏰ <strong>This code expires in 24 hours.</strong><br>
                      If you didn't create an account, please ignore this email.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thanks,<br>
                    <strong>The husleflow Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                    BSc Computer Science Final Year Project
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    University of Hertfordshire 5067)
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Verify Your Email - husleflow
    
    Hi ${firstName},
    
    Thanks for signing up for husleflow! Please verify your email address.
    
    Your Verification Code: ${verificationCode}
    
    Or click this link: ${verifyUrl}
    
    This code expires in 24 hours.
    
    If you didn't create an account, please ignore this email.
    
    Thanks,
    The husleflow Team
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text
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