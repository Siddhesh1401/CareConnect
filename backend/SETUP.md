# CareConnect Backend Setup

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Gmail account for email functionality

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file in the backend root:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/careconnect
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (use your own Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

3. **Gmail App Password Setup:**
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate an "App Password" for email
   - Use that password in EMAIL_PASSWORD

4. **Start the backend:**
   ```bash
   npm run dev
   ```

5. **Verify it's working:**
   - Backend should run on: `http://localhost:5000`
   - Check: `http://localhost:5000/api/health`

## Features Available
- ✅ User Authentication (Volunteers, NGO Admins, Admins)
- ✅ Email Verification for Volunteers
- ✅ NGO Document Approval System
- ✅ Password Reset with Email Codes
- ✅ Real Email Notifications
- ✅ Admin Dashboard for NGO Management

## Database Collections
The app will automatically create these collections:
- `users` - All user data (volunteers, NGOs, admins)
- `sessions` - User sessions

## API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code
- `GET /api/admin/ngo-requests` - Get NGO approval requests
- `POST /api/admin/approve-document` - Approve NGO documents
- And many more...

## Need Help?
Contact [Your Name] if you have any setup issues!
