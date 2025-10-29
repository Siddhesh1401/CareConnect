# ⚡ Quick Reference - Environment Variables

## 🎯 One-Page Cheat Sheet

### Backend Configuration
```bash
# File: backend/.env (DO NOT commit)

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=CareConnect Platform
EMAIL_FROM_ADDRESS=your-email@gmail.com
ADMIN_EMAIL=your-email@gmail.com
EMAIL_DEV_MODE=false

# Database
MONGODB_URI=mongodb://localhost:27017/careconnect
DB_NAME=careconnect

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Features
EMAIL_VERIFICATION_ENABLED=true
NGO_AUTO_APPROVAL=false
```

### Frontend Configuration
```bash
# File: .env (DO NOT commit)

VITE_GOVERNMENT_EMAIL=your-email@gmail.com
VITE_API_URL=http://localhost:5000
```

---

## 🔄 Changing Email Address

### Step 1: Generate New Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character app password

### Step 2: Update Backend
```bash
# Edit: backend/.env
EMAIL_USER=new-email@gmail.com
EMAIL_PASSWORD=<16-char-app-password>
EMAIL_FROM_ADDRESS=new-email@gmail.com
ADMIN_EMAIL=new-email@gmail.com
```

### Step 3: Update Frontend
```bash
# Edit: .env
VITE_GOVERNMENT_EMAIL=new-email@gmail.com
```

### Step 4: Restart Applications
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Step 5: Test
- Send a test email from your app
- Verify it arrives from the new email address
- Check that recipients can reply

---

## 🚀 Setting Up New Environment

### Local Development
```bash
# 1. Clone repo
git clone <repo-url>
cd CareConnect

# 2. Copy example files
cp backend/.env.example backend/.env
cp .env.example .env

# 3. Edit .env files with your values
# - Update EMAIL_USER and EMAIL_PASSWORD
# - Update MONGODB_URI
# - Set JWT_SECRET

# 4. Install dependencies
npm install
cd backend && npm install && cd ..

# 5. Start apps
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

### Production Deployment
```bash
# 1. Create .env file (DO NOT commit)
# 2. Set all required variables
# 3. Deploy code
# 4. Use environment variables from deployment platform:
#    - AWS Lambda: Environment variables
#    - Heroku: Config vars
#    - Docker: ENV in Dockerfile or .env
#    - Kubernetes: Secrets/ConfigMap

# Example for Heroku:
heroku config:set EMAIL_USER=prod-email@gmail.com
heroku config:set EMAIL_PASSWORD=prod-app-password
heroku config:set MONGODB_URI=<production-db-url>
```

---

## ✅ Validation Rules

### Required Variables (App won't start without these)
- ✅ `MONGODB_URI` - Database connection
- ✅ `JWT_SECRET` - Authentication secret
- ✅ `EMAIL_USER` - Email account username
- ✅ `EMAIL_PASSWORD` - Email account password

### Optional Variables (Have defaults)
- PORT (default: 5000)
- NODE_ENV (default: development)
- EMAIL_HOST (default: smtp.gmail.com)
- EMAIL_PORT (default: 587)

### Frontend Variables
- VITE_GOVERNMENT_EMAIL (used for contact email)
- VITE_API_URL (backend URL)

---

## 🔐 Security Reminders

```
✅ DO:
- Keep .env files local
- Use strong, unique passwords
- Rotate credentials periodically
- Use different credentials for dev/prod
- Document required variables in .env.example
- Validate env vars on startup

❌ DON'T:
- Commit .env files
- Share .env via email/Slack
- Hardcode secrets in code
- Use same password across environments
- Leave .env files in repo
- Ignore validation errors
```

---

## 🐛 Troubleshooting

### "Missing required environment variables"
```
Solution: Add missing variables to backend/.env
Run: npm run dev (after updating .env)
```

### "EAUTH: Invalid login on Gmail"
```
Solution: 
1. Verify EMAIL_USER is correct
2. Verify EMAIL_PASSWORD is 16-char app password (not Gmail password)
3. Enable "Less secure app access" if not using app password
4. Check Gmail is not blocking login attempts
```

### "Emails not sending"
```
Solution:
1. Verify EMAIL_DEV_MODE=false
2. Check EMAIL_USER and EMAIL_PASSWORD in .env
3. Verify SMTP credentials work with telnet:
   telnet smtp.gmail.com 587
4. Check email logs in server console
```

### Frontend not getting email from .env
```
Solution:
1. Variable must start with VITE_ to be exposed
2. Correct format: VITE_GOVERNMENT_EMAIL
3. Access with: import.meta.env.VITE_GOVERNMENT_EMAIL
4. Restart frontend dev server after .env change
```

---

## 📋 Environment Variables Used in Code

| Variable | Location | Purpose |
|----------|----------|---------|
| `EMAIL_USER` | authController, adminController, documentController, emailMonitor, apiAdminController | Email account for sending emails |
| `EMAIL_PASSWORD` | authController, adminController, documentController | Password for email account |
| `EMAIL_HOST` | authController, adminController, documentController, emailService | SMTP server address |
| `EMAIL_PORT` | authController, adminController, documentController, emailService | SMTP server port |
| `EMAIL_FROM_NAME` | emailService, authController | Display name for emails |
| `EMAIL_FROM_ADDRESS` | emailService | Display email address |
| `ADMIN_EMAIL` | (reserved for admin features) | Admin contact email |
| `EMAIL_DEV_MODE` | emailService, authController, adminController | Log emails instead of sending |
| `VITE_GOVERNMENT_EMAIL` | GovernmentAccessPage.tsx | Government contact email |
| `VITE_API_URL` | (reserved for API config) | Backend API URL |
| `MONGODB_URI` | database.ts | Database connection string |
| `JWT_SECRET` | auth middleware | JWT signing secret |
| `PORT` | server.ts | Server port |
| `NODE_ENV` | various | Environment mode |

---

## 🎓 Common Tasks

### Task: Use Different Email for Development
```bash
# backend/.env
EMAIL_USER=dev-email@gmail.com
EMAIL_PASSWORD=dev-app-password
EMAIL_DEV_MODE=true  # Log emails instead of sending
```

### Task: Use Different Database for Development
```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/careconnect-dev
```

### Task: Send Real Emails (Production Mode)
```bash
# backend/.env
EMAIL_DEV_MODE=false
# Must have valid EMAIL_USER and EMAIL_PASSWORD
```

### Task: Test Email Without Sending
```bash
# backend/.env
EMAIL_DEV_MODE=true
# App will log emails to console instead of sending
# Check terminal output for email content
```

---

## 📞 Getting Help

**For security questions:**
→ See: `SECURITY_BEST_PRACTICES.md`

**For implementation details:**
→ See: `SECURITY_FIX_COMPLETE.md`

**For visual overview:**
→ See: `SECURITY_FIX_VISUAL_SUMMARY.md`

**For troubleshooting:**
→ Check this document or console errors

---

**Last Updated:** October 2025
**Status:** ✅ All systems secure

