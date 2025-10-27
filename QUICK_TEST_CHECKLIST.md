# 📋 Quick Email System Testing Checklist

## ✅ Manual Testing Steps

### 1️⃣ **Start Servers** (You do this)
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Wait for: "Server running on port 5000" and "MongoDB connected"

# Terminal 2 - Frontend
cd c:\Users\SIDDHESH\Desktop\CareConnect
npm run dev
# Wait for: "Local: http://localhost:5173/"
```

---

### 2️⃣ **Send Test Email**

**Send TO:** Your configured Gmail address (from EMAIL_USER in .env)

**Subject:** `Government Data Access Request`

**Body (copy exactly):**
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

**✅ Verify:** Email appears in Gmail inbox as **UNREAD**

---

### 3️⃣ **Login to Admin Panel**

1. Open: http://localhost:5173
2. Login with admin credentials
3. Navigate to: **API Admin** → **Email Requests**

---

### 4️⃣ **Trigger Email Monitoring**

1. Click **"Check for New Emails"** button
2. Wait for processing modal
3. **Expected Result:**
   - ✅ Emails Found: 1
   - ✅ Emails Processed: 1
   - ✅ New Requests: 1
   - ✅ Shows: "Test Government Agency"

---

### 5️⃣ **Review & Approve Request**

1. Click **"Review"** on the new request
2. **Step 1:** Review details → Click "Next"
3. **Step 2:** Select permissions:
   - ☑️ read:volunteers
   - ☑️ read:ngos
   - ☑️ read:campaigns
   - ☑️ read:events
   - ☑️ read:reports
4. Click **"Approve & Continue"**

---

### 6️⃣ **Generate API Key**

1. **Step 3:** Click **"Generate API Key"**
2. **COPY THE KEY** (70 characters) - shown only once!
3. Save it somewhere (notepad)
4. Click **"Next"**

---

### 7️⃣ **Send Email to Government**

1. **Step 4:** Review email details
2. Click **"Send Email"**
3. **✅ Verify:** Success message appears
4. **Check:** Recipient's email inbox for API key

---

### 8️⃣ **Test API Key with cURL**

Open PowerShell and test (replace YOUR_API_KEY):

```powershell
# Test connection
curl -X GET "http://localhost:5000/api/v1/government/test" -H "X-API-Key: YOUR_API_KEY"

# Test volunteers endpoint
curl -X GET "http://localhost:5000/api/v1/government/volunteers" -H "X-API-Key: YOUR_API_KEY"

# Test NGOs endpoint
curl -X GET "http://localhost:5000/api/v1/government/ngos" -H "X-API-Key: YOUR_API_KEY"

# Test dashboard stats
curl -X GET "http://localhost:5000/api/v1/government/dashboard-stats" -H "X-API-Key: YOUR_API_KEY"
```

**Expected:** JSON responses with data or empty arrays

---

### 9️⃣ **Test in Government Portal**

```bash
# Terminal 3
cd government-portal
npm start
# Or double-click: start.bat
```

1. Open: http://localhost:8081
2. Paste your API key
3. Click **"Test Connection"**
4. **✅ Verify:** Green success, shows organization & permissions
5. Click **"Fetch Volunteers"**, **"Fetch NGOs"**, etc.

---

## 🎯 Success Criteria

- [x] Email sent and received
- [x] Email monitoring found and parsed email
- [x] Request created in database
- [x] Request approved with permissions
- [x] API key generated (70 chars)
- [x] Email sent to government contact
- [x] API key works in cURL tests
- [x] Government portal connection successful
- [x] All data endpoints return responses

---

## 🐛 Quick Troubleshooting

**Email not found?**
- Check email is UNREAD
- Subject must be exactly: "Government Data Access Request"

**IMAP error?**
- Check EMAIL_PASSWORD is app password (16 chars)
- Verify 2FA enabled on Gmail

**API key invalid?**
- Copy entire 70-character key (no spaces)
- Check backend server is running

**No data returned?**
- Normal if database is empty
- Check MongoDB has volunteer/NGO data

---

## 📝 Notes Section

**API Key Generated:**
```
[Paste your 70-char API key here for reference]
```

**Test Results:**
- Email monitoring: ___________
- Request approval: ___________
- API key generation: ___________
- Email delivery: ___________
- cURL tests: ___________
- Portal tests: ___________

---

**Ready to test!** 🚀

Start with Step 1 (starting servers) and work through each step.
Let me know if you hit any issues!
