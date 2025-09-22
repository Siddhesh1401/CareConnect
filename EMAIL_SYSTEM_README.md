# CareConnect - Email Verification & Notification System

## Overview 1
This document outlines the comprehensive email functionality implemented in CareConnect, including email verification for users and automated notifications for NGO status updates.

## Features Implemented

### 1. Email Verification System
- **Automatic Email Verification**: All new users (volunteers, NGOs, admins) receive verification emails upon registration
- **Verification Codes**: 6-digit numeric codes with 10-minute expiration
- **Rate Limiting**: Maximum 5 verification attempts per user
- **Resend Functionality**: Users can request new verification codes with 2-minute cooldown
- **Beautiful Email Templates**: HTML-styled emails with CareConnect branding

### 2. NGO Status Notifications
- **Approval Emails**: Automatically sent when admin approves NGO registration
- **Rejection Emails**: Sent with specific reasons when NGO is rejected
- **Admin Alerts**: Admins receive notifications when new NGOs register

### 3. Enhanced Admin UI
- **Tab-Based Interface**: Beautiful tab design replacing dropdown filters
- **Status Cards**: Interactive statistics cards showing counts for each status
- **Visual Feedback**: Hover effects, gradient buttons, and smooth transitions

## Email Service Configuration

### Environment Variables
Add these to your `.env` file in the backend directory:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=CareConnect
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

### Gmail Setup Instructions
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Select Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### Alternative Email Providers
The system supports any SMTP provider. Update the configuration accordingly:

**Outlook/Hotmail:**
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Yahoo:**
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## API Endpoints

### Email Verification
- `POST /api/auth/send-verification-email` - Send verification email
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-verification-code` - Resend verification code

### Request/Response Examples

**Send Verification Email:**
```json
POST /api/auth/send-verification-email
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Verification email sent successfully",
  "data": {
    "attemptsRemaining": 4
  }
}
```

**Verify Email:**
```json
POST /api/auth/verify-email
{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "isEmailVerified": true
  }
}
```

## Frontend Components

### EmailVerificationPage
- **Location**: `src/pages/auth/EmailVerificationPage.tsx`
- **Route**: `/verify-email`
- **Features**:
  - Email input and verification code input
  - Automatic redirect after successful signup
  - Resend functionality with cooldown
  - Success/error message handling
  - Responsive design with beautiful UI

### Integration with Signup Flow
1. User completes registration form
2. User is automatically redirected to `/verify-email?email=user@example.com`
3. Verification email is sent during registration
4. User enters code and verifies email
5. Successful verification redirects to login page

## Database Schema Updates

### User Model Enhancements
New fields added to User schema:
```typescript
isEmailVerified: boolean;           // Default: false
emailVerificationCode?: string;     // 6-digit code
emailVerificationExpires?: Date;    // 10-minute expiration
emailVerificationAttempts: number;  // Default: 0, Max: 5
```

## Email Templates

### 1. Email Verification Template
- Professional design with CareConnect branding
- Clear verification code display
- Expiration time information
- Contact support information

### 2. NGO Status Update Templates
- **Approval**: Congratulatory message with next steps
- **Rejection**: Professional rejection with specific reasons
- CareConnect branding and support information

### 3. Admin Notification Template
- New NGO registration alerts
- Organization details and review links
- Professional formatting for admin dashboard

## Security Features

### Rate Limiting
- Maximum 5 verification attempts per user
- 2-minute cooldown between resend requests
- Automatic lockout after maximum attempts

### Code Security
- 6-digit numeric codes only
- 10-minute expiration time
- Cryptographically secure random generation
- Single-use codes (invalidated after verification)

### Email Security
- SMTP authentication required
- TLS encryption for email transmission
- Environment variable protection for credentials

## Development Setup

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install nodemailer @types/nodemailer
   ```

2. **Configure Environment:**
   - Copy email configuration to `.env`
   - Set up Gmail App Password or alternative SMTP

3. **Database Migration:**
   - Existing users will have `isEmailVerified: false` by default
   - New registrations automatically include email verification fields

4. **Frontend Route:**
   - Email verification page is automatically included in routing
   - No additional configuration needed

## Testing

### Email Service Testing
```bash
# Test email sending (replace with your email)
curl -X POST http://localhost:5000/api/auth/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Email Verification Testing
```bash
# Test email verification
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

## Production Considerations

### Email Service Provider
- Consider using services like SendGrid, Mailgun, or AWS SES for production
- Higher reliability and delivery rates
- Better analytics and monitoring

### Environment Security
- Never commit email credentials to version control
- Use secure environment variable management
- Rotate email passwords regularly

### Performance
- Email sending is non-blocking (async)
- Failed email sends don't interrupt user registration
- Proper error logging and monitoring

## Troubleshooting

### Common Issues

1. **Email Not Sending:**
   - Check SMTP credentials in `.env`
   - Verify App Password if using Gmail
   - Check firewall settings for SMTP port

2. **Gmail Authentication:**
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check "Less Secure Apps" if not using App Password

3. **Email in Spam:**
   - Consider using verified domain
   - Add SPF/DKIM records for production
   - Use reputable email service provider

### Logs
Email operations are logged with the following format:
```
📧 Verification email sent to: user@example.com
📧 Approval email sent to NGO: ngo@example.com
📧 Admin notification sent for new NGO: ngo@example.com
```

## Future Enhancements

### Planned Features
- Email templates customization via admin panel
- Bulk email functionality for newsletters
- Email analytics and delivery tracking
- SMS verification as backup option
- Integration with email marketing tools

### Performance Improvements
- Email queue system for high volume
- Template caching and optimization
- Delivery retry mechanism
- Bounce handling and cleanup

---

This comprehensive email system enhances user experience and provides professional communication throughout the CareConnect platform.
