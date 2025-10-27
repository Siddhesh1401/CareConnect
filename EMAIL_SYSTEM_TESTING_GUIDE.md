# 📧 Email-Based Government Access System - Testing Guide

**Date:** October 14, 2025  
**Purpose:** Step-by-step testing of the email-based government data access request system

---

## 🎯 Testing Overview

We'll test the complete email workflow:
1. **Email Configuration** - Set up Gmail IMAP access
2. **Send Test Email** - Government sends formatted request email
3. **Backend Server** - Start the CareConnect backend
4. **Email Monitoring** - Trigger email processing via API
5. **Admin Workflow** - Review and approve request
6. **API Key Generation** - Generate secure API key
7. **Email Delivery** - Send API key to government
8. **API Testing** - Test the generated API key

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Gmail account for receiving government requests
- [ ] MongoDB running locally or connection string
- [ ] Node.js and npm installed
- [ ] Backend dependencies installed (`npm install` in backend folder)
- [ ] Frontend dependencies installed (`npm install` in root folder)

---

## 🔧 STEP 1: Gmail IMAP Configuration

### 1.1 Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Follow the steps to enable 2FA

### 1.2 Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **App**: Mail
3. Select **Device**: Other (Custom name)
4. Enter name: "CareConnect Email Monitor"
5. Click **Generate**
6. **COPY THE 16-CHARACTER PASSWORD** (you'll need this)

### 1.3 Configure Backend Environment Variables
Create or edit `backend/.env` file:

```env
# Email Configuration for Government Requests
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=CareConnect Government Access
EMAIL_FROM_ADDRESS=your-email@gmail.com

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/careconnect

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server Port
PORT=5000
```

**✅ Verification:**
- [ ] `.env` file created in `backend/` folder
- [ ] All email variables set correctly
- [ ] App password (16 chars, no spaces) copied correctly

---

## 📨 STEP 2: Send Test Government Email

### 2.1 Email Format
Send an email **TO** your configured Gmail address with:

**Subject:** `Government Data Access Request`

**Body:**
```
Organization: Test Government Agency
Contact Person: John Doe
Email: john.doe@testgov.com
Purpose: Research on volunteer demographics and NGO activities for policy planning
Data Types: volunteers, ngos, campaigns
Justification: Required under Government Data Access Act 2024 for public welfare research
Estimated Requests/Month: 500
Duration: 12 months
API Integration Method: REST API
Data Processing Location: United States
Security Measures: SSL encryption, access controls, secure data storage
Government Level: federal
Department: Department of Social Welfare
Authorized Officials: John Doe, john.doe@testgov.com; Jane Smith, jane.smith@testgov.com
```

### 2.2 Send the Email
- **Option A:** Use your personal email to send to the configured Gmail
- **Option B:** Use Gmail's "Send to myself" feature
- **Option C:** Use another email service

**✅ Verification:**
- [ ] Email sent successfully
- [ ] Email appears in Gmail inbox as **UNREAD**
- [ ] Subject line is exactly: "Government Data Access Request"

---

## 🚀 STEP 3: Start Backend Server

### 3.1 Navigate to Backend Directory
```bash
cd backend
```

### 3.2 Install Dependencies (if not done)
```bash
npm install
```

### 3.3 Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
📧 Email monitoring system ready
```

**✅ Verification:**
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] No TypeScript compilation errors
- [ ] Server listening on http://localhost:5000

**🚨 Common Issues:**
- **MongoDB connection error**: Ensure MongoDB is running
- **Port already in use**: Kill process on port 5000 or change PORT in .env
- **TypeScript errors**: Run `npm run build` to check for compilation issues

---

## 🖥️ STEP 4: Start Frontend Application

### 4.1 Open New Terminal
Keep backend running, open a new terminal window

### 4.2 Navigate to Root Directory
```bash
cd c:\Users\SIDDHESH\Desktop\CareConnect
```

### 4.3 Start Frontend Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

**✅ Verification:**
- [ ] Frontend starts successfully
- [ ] No compilation errors
- [ ] Application accessible at http://localhost:5173

---

## 👨‍💼 STEP 5: Login as Admin

### 5.1 Open Browser
Navigate to: http://localhost:5173

### 5.2 Login with Admin Credentials
- **Email:** Your admin email
- **Password:** Your admin password

**If you don't have admin credentials:**
```bash
# In backend directory, create admin user
npm run create-admin
```

**✅ Verification:**
- [ ] Successfully logged in
- [ ] Redirected to dashboard
- [ ] Admin menu visible

---

## 📧 STEP 6: Access Email Requests Page

### 6.1 Navigate to API Admin Section
1. Click on **Admin** menu (or API Admin)
2. Look for **Email Requests** or **Government Access** section
3. Click on **Email Requests**

**URL should be:** `http://localhost:5173/api-admin/email-requests`

**✅ Verification:**
- [ ] Email Requests page loads
- [ ] "Check for New Emails" button visible
- [ ] Request list visible (may be empty initially)

---

## 🔍 STEP 7: Trigger Email Monitoring

### 7.1 Click "Check for New Emails" Button
This will trigger the backend to:
1. Connect to Gmail via IMAP
2. Search for unread emails with subject "Government Data Access Request"
3. Parse email content
4. Create database records
5. Mark emails as read

### 7.2 View Processing Results
A modal should appear showing:
- **Emails Found:** Number of matching emails
- **Emails Processed:** Successfully parsed emails
- **New Requests:** New database records created
- **Errors:** Any parsing or processing errors

**Expected Result:**
```
✅ Email monitoring completed successfully

Emails Found: 1
Emails Processed: 1
New Requests: 1

Processed Requests:
- Test Government Agency (john.doe@testgov.com)
```

**✅ Verification:**
- [ ] Modal shows success message
- [ ] At least 1 email found and processed
- [ ] New request appears in the list
- [ ] Email marked as read in Gmail

**🚨 Common Issues:**

**Issue: "No emails found"**
- Check email is unread in Gmail
- Verify subject line is exactly: "Government Data Access Request"
- Check EMAIL_USER matches the Gmail account

**Issue: "IMAP connection failed"**
- Verify EMAIL_PASSWORD is the 16-char app password
- Check 2FA is enabled on Gmail account
- Ensure no spaces in app password

**Issue: "Parsing error"**
- Verify email body format matches exactly
- Check all required fields are present
- Ensure no extra characters or formatting

---

## 📋 STEP 8: Review Request Details

### 8.1 View Request in List
The new request should appear with:
- **Organization:** Test Government Agency
- **Contact Person:** John Doe
- **Email:** (actual sender email)
- **Status:** Pending
- **Data Types:** volunteers, ngos, campaigns

### 8.2 Click "Review" Button
This opens the 4-step workflow:
1. **Review Request Details**
2. **Approve & Select Permissions**
3. **Generate API Key**
4. **Send Key via Email**

### 8.3 Review Step 1: Request Details
Review all information:
- Organization details
- Purpose and justification
- Requested data types
- Technical requirements
- Authorized officials

**✅ Verification:**
- [ ] All fields populated correctly
- [ ] Email address is the actual sender (not parsed from body)
- [ ] Data types parsed correctly
- [ ] Request details make sense

---

## ✅ STEP 9: Approve Request & Select Permissions

### 9.1 Click "Next" to Step 2

### 9.2 Select Permissions
Check the permissions you want to grant:
- [ ] **read:volunteers** - Access volunteer data
- [ ] **read:ngos** - Access NGO directory
- [ ] **read:campaigns** - Access campaign information
- [ ] **read:events** - Access event data
- [ ] **read:reports** - Access dashboard statistics

**Recommendation for testing:** Select all permissions

### 9.3 Click "Approve & Continue"

**Expected Result:**
- Request status changes to "Approved"
- Workflow advances to Step 3
- Success message appears

**✅ Verification:**
- [ ] Request approved successfully
- [ ] Permissions saved
- [ ] Workflow on Step 3

---

## 🔑 STEP 10: Generate API Key

### 10.1 Click "Generate API Key" Button

The system will:
1. Create a 70-character cryptographic API key
2. Store it in the database with selected permissions
3. Link it to the access request
4. Display it ONE TIME ONLY

### 10.2 Copy API Key
**IMPORTANT:** This is the ONLY time you'll see this key!

**Expected Format:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5
```
(70 characters, alphanumeric)

### 10.3 Save API Key
Copy and save the API key somewhere safe for testing

**✅ Verification:**
- [ ] API key generated successfully
- [ ] Key is 70 characters long
- [ ] Key copied to clipboard or saved
- [ ] Workflow advances to Step 4

---

## 📤 STEP 11: Send API Key via Email

### 11.1 Review Email Details
Verify:
- **Recipient:** Correct government contact email
- **Organization:** Test Government Agency
- **Permissions:** Shows actual granted permissions (not requested data types)

### 11.2 Click "Send Email" Button

The system will:
1. Compose professional email with API key
2. Include usage instructions
3. Link to government portal
4. Send via configured SMTP

**Expected Email Content:**
```
Subject: CareConnect Government Data Access - API Key

Dear John Doe,

Your data access request has been approved. Here are your API credentials:

Organization: Test Government Agency
API Key: [70-character key]
Permissions: read:volunteers, read:ngos, read:campaigns

Testing Portal: http://localhost:8081
API Documentation: http://localhost:5000/api/docs

Please keep your API key secure and do not share it.
```

**✅ Verification:**
- [ ] Email sent successfully
- [ ] Success message appears
- [ ] Workflow marked as complete
- [ ] Check recipient's email inbox

**🚨 Common Issues:**

**Issue: "Email sending failed"**
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Check internet connection
- Ensure Gmail allows "Less secure app access" or using app password

---

## 🧪 STEP 12: Test API Key

### 12.1 Test with cURL (Command Line)

Open a new terminal and test the API key:

```bash
# Test API Key Connection
curl -X GET "http://localhost:5000/api/v1/government/test" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API key is valid",
  "data": {
    "organization": "Test Government Agency",
    "permissions": ["read:volunteers", "read:ngos", "read:campaigns"],
    "keyStatus": "active"
  }
}
```

### 12.2 Test Volunteer Endpoint
```bash
curl -X GET "http://localhost:5000/api/v1/government/volunteers" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

### 12.3 Test NGO Endpoint
```bash
curl -X GET "http://localhost:5000/api/v1/government/ngos" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

### 12.4 Test Dashboard Stats
```bash
curl -X GET "http://localhost:5000/api/v1/government/dashboard-stats" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

**✅ Verification:**
- [ ] Test endpoint returns success
- [ ] Permissions listed correctly
- [ ] Data endpoints return data (or empty arrays if no data)
- [ ] No authentication errors

---

## 🌐 STEP 13: Test with Government Portal

### 13.1 Navigate to Government Portal
```bash
cd government-portal
npm start
```

**Or double-click:** `government-portal/start.bat`

### 13.2 Open Portal in Browser
Navigate to: http://localhost:8081

### 13.3 Enter API Key
1. Paste your API key in the input field
2. Click "Test Connection"

**Expected Result:**
- ✅ Connection successful
- Organization name displayed
- Permissions listed
- Data fetch buttons enabled

### 13.4 Test Data Endpoints
Click each button:
- **Fetch Volunteers**
- **Fetch NGOs**
- **Fetch Campaigns**
- **Fetch Dashboard Stats**

**✅ Verification:**
- [ ] All endpoints respond successfully
- [ ] Data displayed in portal (or "No data" messages)
- [ ] No errors in browser console
- [ ] Response times reasonable

---

## 📊 STEP 14: Verify in Admin Dashboard

### 14.1 Go Back to Admin Dashboard
Navigate to: http://localhost:5173/api-admin/dashboard

### 14.2 Check API Keys Tab
Verify:
- [ ] New API key appears in list
- [ ] Organization name correct
- [ ] Permissions listed correctly
- [ ] Status: Active
- [ ] Usage count: 0 (or number of test requests)

### 14.3 Check Access Requests Tab
Verify:
- [ ] Request status: Approved
- [ ] API key generated timestamp
- [ ] Reviewed by: Your admin name

---

## 🎉 SUCCESS CRITERIA

### Complete Workflow Tested ✅
- [x] Gmail IMAP configured
- [x] Test email sent and received
- [x] Backend server running
- [x] Email monitoring triggered
- [x] Email parsed successfully
- [x] Request created in database
- [x] Admin reviewed request
- [x] Permissions selected
- [x] API key generated
- [x] Email sent to government
- [x] API key tested successfully
- [x] Government portal tested
- [x] All data endpoints working

---

## 🐛 Troubleshooting Guide

### Email Not Found
**Symptoms:** "No emails found" message
**Solutions:**
1. Check email is **unread** in Gmail
2. Verify subject line exactly: "Government Data Access Request"
3. Confirm EMAIL_USER matches Gmail account
4. Check Gmail inbox (not spam/promotions)

### IMAP Connection Failed
**Symptoms:** "IMAP connection error" or "Authentication failed"
**Solutions:**
1. Verify 2FA enabled on Gmail
2. Generate new app password
3. Copy app password without spaces
4. Check EMAIL_PASSWORD in .env
5. Ensure IMAP enabled in Gmail settings

### Parsing Errors
**Symptoms:** "Failed to parse email" or fields missing
**Solutions:**
1. Check email format matches exactly
2. Ensure all required fields present
3. No extra spaces or special characters
4. Use plain text email (not HTML)

### API Key Not Working
**Symptoms:** "Invalid API key" or "Unauthorized"
**Solutions:**
1. Copy entire 70-character key
2. Check for extra spaces or line breaks
3. Verify key in database (check admin dashboard)
4. Ensure backend server running
5. Check X-API-Key header format

### Email Not Sent
**Symptoms:** "Failed to send email" error
**Solutions:**
1. Verify EMAIL_USER and EMAIL_PASSWORD
2. Check internet connection
3. Ensure Gmail allows app access
4. Check recipient email address valid
5. Review backend logs for SMTP errors

### Database Errors
**Symptoms:** "Database connection failed" or "Cannot save request"
**Solutions:**
1. Ensure MongoDB running
2. Check MONGODB_URI in .env
3. Verify database name correct
4. Check MongoDB logs
5. Restart MongoDB service

---

## 📝 Testing Checklist

### Pre-Testing Setup
- [ ] Gmail account configured
- [ ] 2FA enabled
- [ ] App password generated
- [ ] .env file configured
- [ ] Dependencies installed
- [ ] MongoDB running

### Email System Testing
- [ ] Test email sent
- [ ] Email appears in inbox
- [ ] Email monitoring triggered
- [ ] Email parsed successfully
- [ ] Request created in database
- [ ] Email marked as read

### Admin Workflow Testing
- [ ] Request appears in list
- [ ] Review workflow opens
- [ ] Request details correct
- [ ] Permissions selectable
- [ ] Request approved
- [ ] API key generated
- [ ] Email sent successfully

### API Testing
- [ ] Test endpoint works
- [ ] Volunteers endpoint works
- [ ] NGOs endpoint works
- [ ] Campaigns endpoint works
- [ ] Dashboard stats work
- [ ] Invalid key rejected
- [ ] Missing permission blocked

### Government Portal Testing
- [ ] Portal starts successfully
- [ ] API key connection works
- [ ] All data endpoints work
- [ ] Data displayed correctly
- [ ] Error handling works

### End-to-End Verification
- [ ] Complete workflow tested
- [ ] All components working
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Ready for production

---

## 🚀 Next Steps After Successful Testing

1. **Production Configuration**
   - Use dedicated Gmail account
   - Set up proper SMTP service (SendGrid, AWS SES)
   - Configure production MongoDB
   - Set secure JWT_SECRET

2. **Security Hardening**
   - Enable rate limiting
   - Add IP whitelisting
   - Implement audit logging
   - Set up monitoring alerts

3. **Documentation**
   - Create government onboarding guide
   - Document API endpoints
   - Provide integration examples
   - Set up support channels

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring
   - Enable performance monitoring
   - Create admin alerts

---

## 📞 Support

If you encounter issues during testing:

1. **Check Backend Logs:** Look for error messages in terminal
2. **Check Browser Console:** Look for frontend errors
3. **Review MongoDB:** Verify data is being saved
4. **Test Email Manually:** Send test email to verify Gmail setup
5. **Review Documentation:** Re-read relevant sections

**Common Log Locations:**
- Backend: Terminal running `npm run dev`
- Frontend: Browser Developer Tools → Console
- MongoDB: MongoDB logs or Compass
- Email: Gmail inbox and sent items

---

**Testing Guide Version:** 1.0  
**Last Updated:** October 14, 2025  
**Status:** Ready for Testing 🚀
