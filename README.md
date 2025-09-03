# 🤝 CareConnect - Connecting Hearts, Changing Lives

![CareConnect Logo](https://via.placeholder.com/800x200/667eea/ffffff?text=CareConnect+Platform)

A comprehensive platform connecting volunteers with NGOs to create meaningful social impact through organized community service and charitable activities.

## 🌟 Features

### 👥 User Management
- **Multi-role Authentication**: Volunteers, NGO Admins, and System Admins
- **Email Verification**: Secure account verification for volunteers
- **Password Reset**: Code-based password recovery system
- **Profile Management**: Comprehensive user profiles with skills and interests

### 🏢 NGO Management
- **NGO Registration**: Complete organizational onboarding
- **Document Verification**: Upload and verify legal documents
- **Admin Approval System**: Multi-step verification process
- **Professional Email Notifications**: Real-time status updates

### 📧 Email System
- **Real Email Integration**: Gmail SMTP with professional templates
- **Verification Codes**: 6-digit codes for password reset
- **Approval Notifications**: Automated NGO approval emails
- **Rejection Notifications**: Document rejection with revision instructions

### 🛡️ Security Features
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse
- **File Upload Security**: Secure document handling
- **Input Validation**: Comprehensive data validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Gmail account for email functionality

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# (See TEAM-EMAIL-SETUP.md for email setup)

# Start backend server
npm run dev
```

### Frontend Setup
```bash
# Navigate to root directory (where package.json is)
cd ../

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 📁 Project Structure

```
CareConnect/
├── 📁 backend/                 # Backend API server
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # API route handlers
│   │   ├── 📁 models/         # Database models
│   │   ├── 📁 routes/         # API routes
│   │   ├── 📁 middleware/     # Custom middleware
│   │   └── 📁 utils/          # Utility functions
│   ├── 📁 uploads/            # File uploads storage
│   ├── .env.example           # Environment template
│   └── package.json
├── 📁 src/                    # Frontend React app
│   ├── 📁 components/         # Reusable components
│   ├── 📁 pages/             # Page components
│   ├── 📁 contexts/          # React contexts
│   └── 📁 types/             # TypeScript types
├── 📁 public/                # Static assets
└── README.md                 # This file
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **TypeScript** - Type-safe development
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory with these variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/careconnect

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email (Use your team platform email)
EMAIL_USER=careconnect.platform@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM_NAME=CareConnect Platform
```

See `TEAM-EMAIL-SETUP.md` for detailed email configuration.

## 📧 Email Setup

1. Create a team platform email (e.g., `careconnect.platform@gmail.com`)
2. Enable 2-factor authentication
3. Generate Gmail App Password
4. Update `.env` with credentials
5. Share credentials securely with team

See `backend/TEAM-EMAIL-SETUP.md` for complete instructions.

## 🎭 User Roles

### 👨‍💼 System Admin
- Approve/reject NGO registrations
- Manage user accounts
- System configuration
- View analytics and logs

### 🏢 NGO Admin
- Manage organization profile
- Create and manage events
- Manage campaigns
- Coordinate with volunteers

### 🙋‍♀️ Volunteer
- Browse and join events
- Track volunteering hours
- Earn achievements and points
- Connect with NGOs

## 🔐 Security

- **Password Requirements**: Minimum 6 characters
- **Email Verification**: Required for volunteers
- **Document Verification**: Required for NGOs
- **Rate Limiting**: 100 requests per 15 minutes
- **File Upload Limits**: 5MB maximum
- **JWT Expiration**: 7 days

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm test
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code

### Admin Endpoints
- `GET /api/admin/ngo-requests` - Get NGO approval requests
- `POST /api/admin/approve-document` - Approve NGO document
- `POST /api/admin/reject-document` - Reject NGO document

See individual route files for complete API documentation.

## 🤝 Contributing

### For Team Members

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CareConnect
   ```

2. **Create your feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Setup your environment**
   - Copy `backend/.env.example` to `backend/.env`
   - Add team platform email credentials
   - Install dependencies for both frontend and backend

4. **Make your changes**
   - Follow existing code patterns
   - Add comments for complex logic
   - Test your changes thoroughly

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Describe your changes
   - Request review from team members

### Development Guidelines

- **Code Style**: Use TypeScript for type safety
- **Commits**: Use descriptive commit messages
- **Testing**: Test features before committing
- **Documentation**: Update README for new features

## 🚀 Deployment

### Backend Deployment
- Set production environment variables
- Use MongoDB Atlas for database
- Configure email service
- Set up proper logging

### Frontend Deployment
- Build production bundle: `npm run build`
- Deploy to hosting service (Vercel, Netlify, etc.)
- Update API endpoints for production

## 📊 Project Status

- ✅ **Authentication System** - Complete
- ✅ **Email Verification** - Complete
- ✅ **NGO Approval Workflow** - Complete
- ✅ **Password Reset** - Complete
- ✅ **Admin Dashboard** - Complete
- ✅ **Document Management** - Complete
- 🔄 **Event Management** - In Progress
- 🔄 **Volunteer Matching** - Planned
- 🔄 **Analytics Dashboard** - Planned

## 👥 Team

- **[Your Name]** - Project Lead & Backend Developer
- **[Team Member 2]** - Frontend Developer
- **[Team Member 3]** - UI/UX Designer
- **[Team Member 4]** - Full Stack Developer

## 📞 Support

For setup issues or questions:
- Check the documentation in `backend/SETUP.md`
- Review email setup in `backend/TEAM-EMAIL-SETUP.md`
- Contact team lead for access issues

## 📄 License

This project is developed for educational purposes as a group project.

---

**CareConnect** - Connecting Hearts, Changing Lives 💙
