import nodemailer from 'nodemailer';

// =============================================================================
// EMAIL CONFIGURATION - FOR TEAMMATES TO UPDATE WHEN SETTING UP
// =============================================================================
// TODO: Replace these with your actual email credentials when deploying
// For development, emails will be logged to terminal instead of sent
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', // TODO: Add your SMTP host
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // TODO: Add your email
    pass: process.env.EMAIL_PASSWORD || 'your-app-password' // TODO: Add your app password
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5
};

// Create transporter (only used in production)
const transporter = nodemailer.createTransport(emailConfig);

// Interface for event cancellation email data
interface EventCancellationData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  organizationName: string;
  customMessage: string; // Custom message from NGO admin
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
  console.log('📧 EVENT CANCELLATION EMAIL - DEVELOPMENT MODE');
  console.log('='.repeat(80));
  console.log(`📧 TO: ${volunteerEmail}`);
  console.log(`👤 VOLUNTEER: ${volunteerName}`);
  console.log(`📅 EVENT: ${eventData.eventTitle}`);
  console.log(`🏢 ORGANIZATION: ${eventData.organizationName}`);
  console.log('='.repeat(80));
  console.log('📝 EMAIL CONTENT:');
  console.log('='.repeat(80));
  
  console.log(`Subject: Event Cancelled: ${eventData.eventTitle}\n`);
  
  console.log(`Dear ${volunteerName},\n`);
  
  console.log(`${eventData.customMessage}\n`);
  
  console.log('Event Details:');
  console.log(`• Event: ${eventData.eventTitle}`);
  console.log(`• Date: ${formatDate(eventData.eventDate)}`);
  console.log(`• Time: ${eventData.eventTime}`);
  console.log(`• Location: ${eventData.eventLocation}`);
  console.log(`• Organized by: ${eventData.organizationName}\n`);
  
  console.log('Please check our platform for other upcoming volunteer opportunities.\n');
  
  console.log('Thank you for your understanding.\n');
  
  console.log('Best regards,');
  console.log('CareConnect Team');
  
  console.log('='.repeat(80));
  console.log('📧 END OF EMAIL');
  console.log('='.repeat(80) + '\n');
};

// Send event cancellation email to a single volunteer
export const sendEventCancellationEmail = async (
  volunteerEmail: string,
  volunteerName: string,
  eventData: EventCancellationData
): Promise<boolean> => {
  try {
    // DEVELOPMENT MODE: Log to terminal instead of sending
    if (process.env.NODE_ENV === 'development' || process.env.EMAIL_DEV_MODE === 'true') {
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
      from: `"CareConnect Support" <${process.env.EMAIL_USER}>`,
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

    console.log(`📧 Attempting to send event cancellation email to: ${volunteerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Event cancellation email sent successfully to: ${volunteerEmail}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send event cancellation email to ${volunteerEmail}:`, error);
    return false;
  }
};

// Send bulk event cancellation emails to multiple volunteers
export const sendBulkEventCancellationEmails = async (
  volunteers: VolunteerData[],
  eventData: EventCancellationData
): Promise<{ sent: number; failed: number; results: Array<{ email: string; success: boolean; error?: string }> }> => {
  const results: Array<{ email: string; success: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  console.log('\n' + '🚀'.repeat(40));
  console.log(`📧 BULK EMAIL SEND STARTED`);
  console.log(`📧 Event: ${eventData.eventTitle}`);
  console.log(`📧 Recipients: ${volunteers.length} volunteers`);
  console.log(`📧 Custom message included: ${eventData.customMessage ? 'Yes' : 'No'}`);
  console.log('🚀'.repeat(40) + '\n');

  // Send emails with a small delay between each
  for (let i = 0; i < volunteers.length; i++) {
    const volunteer = volunteers[i];
    
    console.log(`📧 Sending email ${i + 1}/${volunteers.length} to: ${volunteer.email}`);
    
    try {
      const success = await sendEventCancellationEmail(volunteer.email, volunteer.name, eventData);
      if (success) {
        sent++;
        results.push({ email: volunteer.email, success: true });
        console.log(`✅ Email ${i + 1}/${volunteers.length} sent successfully`);
      } else {
        failed++;
        results.push({ email: volunteer.email, success: false, error: 'Failed to send email' });
        console.log(`❌ Email ${i + 1}/${volunteers.length} failed to send`);
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
      console.log(`❌ Email ${i + 1}/${volunteers.length} failed with error: ${errorMessage}`);
    }
  }

  console.log('\n' + '📊'.repeat(40));
  console.log(`📧 BULK EMAIL SEND COMPLETED`);
  console.log(`✅ Successfully sent: ${sent} emails`);
  console.log(`❌ Failed to send: ${failed} emails`);
  console.log(`📧 Total processed: ${volunteers.length} emails`);
  console.log('📊'.repeat(40) + '\n');

  return { sent, failed, results };
};

export default {
  sendEventCancellationEmail,
  sendBulkEventCancellationEmails
};
