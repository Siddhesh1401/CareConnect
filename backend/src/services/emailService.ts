import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// =============================================================================
// EMAIL CONFIGURATION - FOR TEAMMATES TO UPDATE WHEN SETTING UP
// =============================================================================
// TODO: Replace these with your actual email credentials when deploying
// For development, emails will be logged to terminal instead of sent
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Create transporter (recreate for each email to avoid caching issues)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Interface for event cancellation email data
interface EventCancellationData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  organizationName: string;
  customMessage: string; // Custom message from NGO admin
}

// Interface for event update email data
interface EventUpdateData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  organizationName: string;
  changes: string[]; // List of changes made
  updatedFields: Record<string, any>; // The updated field values
}

// Interface for volunteer data
interface VolunteerData {
  email: string;
  name: string;
}

// =============================================================================
// DEVELOPMENT MODE: LOG EMAILS TO TERMINAL
// =============================================================================
const logEmailToTerminal = (
  volunteerEmail: string,
  volunteerName: string,
  eventData: EventCancellationData
): void => {
  logger.email(`Event cancellation email prepared for ${volunteerName} (${volunteerEmail}) - Event: ${eventData.eventTitle}`);
};

// Send event cancellation email to a single volunteer
export const sendEventCancellationEmail = async (
  volunteerEmail: string,
  volunteerName: string,
  eventData: EventCancellationData
): Promise<boolean> => {
  try {
    // DEVELOPMENT MODE: Log to terminal instead of sending
    if (process.env.EMAIL_DEV_MODE === 'true') {
      logEmailToTerminal(volunteerEmail, volunteerName, eventData);
      return true;
    }

    // PRODUCTION MODE: Actually send the email
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: volunteerEmail,
      subject: `Event Cancelled: ${eventData.eventTitle}`,
      text: `
Dear ${volunteerName},

${eventData.customMessage}

Event Details:
Event: ${eventData.eventTitle}
Date: ${formatDate(eventData.eventDate)}
Time: ${eventData.eventTime}
Location: ${eventData.eventLocation}
Organized by: ${eventData.organizationName}

Please check our platform for other upcoming volunteer opportunities.

Thank you for your understanding.

Best regards,
CareConnect Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Cancelled</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background-color: #f8fafc; 
              line-height: 1.6;
              color: #334155;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white; 
              border-radius: 12px; 
              padding: 30px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            .header { 
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #ef4444;
              padding-bottom: 20px;
            }
            .header h2 {
              color: #ef4444;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .message-box {
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              border: 1px solid #fecaca;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #ef4444;
            }
            .event-details { 
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #cbd5e1; 
              border-radius: 8px; 
              padding: 24px; 
              margin: 24px 0; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e2e8f0; 
              text-align: center; 
              color: #64748b; 
              font-size: 14px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Event Cancelled</h2>
              <p>CareConnect Platform</p>
            </div>
            
            <p>Dear <strong>${volunteerName}</strong>,</p>
            
            <div class="message-box">
              <p>${eventData.customMessage}</p>
            </div>
            
            <div class="event-details">
              <h3>${eventData.eventTitle}</h3>
              <p><strong>📅 Date:</strong> ${formatDate(eventData.eventDate)}</p>
              <p><strong>🕒 Time:</strong> ${eventData.eventTime}</p>
              <p><strong>📍 Location:</strong> ${eventData.eventLocation}</p>
              <p><strong>🏢 Organized by:</strong> ${eventData.organizationName}</p>
            </div>
            
            <p>Please check our platform for other upcoming volunteer opportunities.</p>
            
            <div class="footer">
              <p><strong>Thank you for your understanding.</strong></p>
              <p><strong>Best regards,<br>CareConnect Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    logger.email(`Sending event cancellation email to: ${volunteerEmail}`);

    const transporter = createTransporter();
    const result = await transporter.sendMail(mailOptions);
    logger.email(`Event cancellation email sent successfully to: ${volunteerEmail}`);
    return true;

  } catch (error) {
    logger.error(`Failed to send event cancellation email to ${volunteerEmail}:`, error);
    return false;
  }
};

// =============================================================================
// EVENT UPDATE EMAIL FUNCTIONS
// =============================================================================

// Send single event update email to a volunteer
export const sendEventUpdateEmail = async (
  volunteerEmail: string,
  volunteerName: string,
  eventData: EventUpdateData
): Promise<boolean> => {
  try {
    // DEVELOPMENT MODE: Log to terminal instead of sending
    if (process.env.EMAIL_DEV_MODE === 'true') {
      logEventUpdateToTerminal(volunteerEmail, volunteerName, eventData);
      return true;
    }

    // PRODUCTION MODE: Actually send the email
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: volunteerEmail,
      subject: `Event Updated: ${eventData.eventTitle}`,
      text: `
Dear ${volunteerName},

An event you registered for has been updated. Here are the changes:

${eventData.changes.map(change => `• ${change}`).join('\n')}

Updated Event Details:
Event: ${eventData.eventTitle}
Date: ${formatDate(eventData.eventDate)}
Time: ${eventData.eventTime}
Location: ${eventData.eventLocation}
Organized by: ${eventData.organizationName}

Please check the event details on our platform for the most current information.

Best regards,
CareConnect Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Updated</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8fafc;
              line-height: 1.6;
              color: #334155;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #f59e0b;
              padding-bottom: 20px;
            }
            .header h2 {
              color: #f59e0b;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .changes-box {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #fcd34d;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #f59e0b;
            }
            .changes-list {
              margin: 0;
              padding-left: 20px;
            }
            .changes-list li {
              margin-bottom: 8px;
              color: #92400e;
            }
            .event-details {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 24px;
              margin: 24px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Event Updated</h2>
              <p>CareConnect Platform</p>
            </div>

            <p>Dear <strong>${volunteerName}</strong>,</p>

            <p>An event you registered for has been updated. Here are the changes:</p>

            <div class="changes-box">
              <ul class="changes-list">
                ${eventData.changes.map(change => `<li>${change}</li>`).join('')}
              </ul>
            </div>

            <div class="event-details">
              <h3>${eventData.eventTitle}</h3>
              <p><strong>📅 Date:</strong> ${formatDate(eventData.eventDate)}</p>
              <p><strong>🕒 Time:</strong> ${eventData.eventTime}</p>
              <p><strong>📍 Location:</strong> ${eventData.eventLocation}</p>
              <p><strong>🏢 Organized by:</strong> ${eventData.organizationName}</p>
            </div>

            <p>Please check the event details on our platform for the most current information.</p>

            <div class="footer">
              <p><strong>Best regards,<br>CareConnect Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    logger.email(`Sending event update email to: ${volunteerEmail}`);

    const transporter = createTransporter();
    const result = await transporter.sendMail(mailOptions);
    logger.email(`Event update email sent successfully to: ${volunteerEmail}`);
    return true;

  } catch (error) {
    logger.error(`Failed to send event update email to ${volunteerEmail}:`, error);
    return false;
  }
};

// Send bulk event update emails to multiple volunteers
export const sendBulkEventUpdateEmails = async (
  volunteers: VolunteerData[],
  eventData: EventUpdateData
): Promise<{ sent: number; failed: number; results: Array<{ email: string; success: boolean; error?: string }> }> => {
  const results: Array<{ email: string; success: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  logger.email(`Starting bulk event update emails for "${eventData.eventTitle}" to ${volunteers.length} volunteers`);

  // Send emails with a small delay between each
  for (let i = 0; i < volunteers.length; i++) {
    const volunteer = volunteers[i];

    console.log(`📧 Sending update email ${i + 1}/${volunteers.length} to: ${volunteer.email}`);

    try {
      const success = await sendEventUpdateEmail(volunteer.email, volunteer.name, eventData);
      if (success) {
        sent++;
        results.push({ email: volunteer.email, success: true });
      } else {
        failed++;
        results.push({ email: volunteer.email, success: false, error: 'Failed to send email' });
      }

      // Small delay to avoid overwhelming (only in production)
      if (process.env.NODE_ENV !== 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        email: volunteer.email,
        success: false,
        error: errorMessage
      });
      logger.email(`Failed to send update email to ${volunteer.email}: ${errorMessage}`);
    }
  }

  logger.email(`Bulk event update emails completed: ${sent} sent, ${failed} failed`);

  return { sent, failed, results };
};

// Development mode logging for event updates
const logEventUpdateToTerminal = (
  volunteerEmail: string,
  volunteerName: string,
  eventData: EventUpdateData
): void => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  console.log('\n' + '='.repeat(80));
  console.log('📧 EVENT UPDATE EMAIL - DEVELOPMENT MODE');
  console.log('='.repeat(80));
  console.log(`📧 TO: ${volunteerEmail}`);
  console.log(`👤 VOLUNTEER: ${volunteerName}`);
  console.log(`📅 EVENT: ${eventData.eventTitle}`);
  console.log(`🏢 ORGANIZATION: ${eventData.organizationName}`);
  console.log('='.repeat(80));
  console.log('📝 EMAIL CONTENT:');
  console.log('='.repeat(80));

  console.log(`Subject: Event Updated: ${eventData.eventTitle}\n`);

  console.log(`Dear ${volunteerName},\n`);

  console.log(`An event you registered for has been updated. Here are the changes:\n`);

  eventData.changes.forEach(change => {
    console.log(`• ${change}`);
  });
  console.log('');

  console.log('Updated Event Details:');
  console.log(`• Event: ${eventData.eventTitle}`);
  console.log(`• Date: ${formatDate(eventData.eventDate)}`);
  console.log(`• Time: ${eventData.eventTime}`);
  console.log(`• Location: ${eventData.eventLocation}`);
  console.log(`• Organized by: ${eventData.organizationName}\n`);

  console.log('Please check the event details on our platform for the most current information.\n');

  console.log('Best regards,');
  console.log('CareConnect Team');
  console.log('='.repeat(80) + '\n');
};

// Send bulk event cancellation emails to multiple volunteers
export const sendBulkEventCancellationEmails = async (
  volunteers: VolunteerData[],
  eventData: EventCancellationData
): Promise<{ sent: number; failed: number; results: Array<{ email: string; success: boolean; error?: string }> }> => {
  const results: Array<{ email: string; success: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  logger.email(`Starting bulk event cancellation emails for "${eventData.eventTitle}" to ${volunteers.length} volunteers`);

  // Send emails with a small delay between each
  for (let i = 0; i < volunteers.length; i++) {
    const volunteer = volunteers[i];

    try {
      const success = await sendEventCancellationEmail(volunteer.email, volunteer.name, eventData);
      if (success) {
        sent++;
        results.push({ email: volunteer.email, success: true });
      } else {
        failed++;
        results.push({ email: volunteer.email, success: false, error: 'Failed to send email' });
      }

      // Small delay to avoid overwhelming (only in production)
      if (process.env.NODE_ENV !== 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        email: volunteer.email,
        success: false,
        error: errorMessage
      });
      logger.email(`Failed to send cancellation email to ${volunteer.email}: ${errorMessage}`);
    }
  }

  logger.email(`Bulk event cancellation emails completed: ${sent} sent, ${failed} failed`);
  return { sent, failed, results };
};

export default {
  sendEventCancellationEmail,
  sendBulkEventCancellationEmails,
  sendEventUpdateEmail,
  sendBulkEventUpdateEmails
};
