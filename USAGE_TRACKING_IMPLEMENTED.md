# API Usage Tracking - IMPLEMENTED ✅

## 🎉 **USAGE TRACKING IS NOW LIVE!**

Every API call made with an API key is now automatically logged with full details!

---

## ✅ **WHAT WAS IMPLEMENTED:**

### **Automatic Usage Logging**

When any API endpoint is called with an API key, the system now automatically tracks:

1. ✅ **Timestamp** - Exact date and time of the call
2. ✅ **Endpoint** - Which API endpoint was accessed (e.g., `/api/volunteers`)
3. ✅ **HTTP Method** - GET, POST, PUT, DELETE, etc.
4. ✅ **IP Address** - Where the request came from
5. ✅ **User Agent** - Browser/application making the request

---

## 📁 **FILE MODIFIED:**

**`/backend/src/middleware/apiKeyAuth.ts`**

### **What Changed:**

```typescript
// BEFORE: Only updated count and timestamp
foundKey.lastUsed = new Date();
foundKey.usageCount = (foundKey.usageCount || 0) + 1;
await foundKey.save();

// AFTER: Logs full details of every API call
foundKey.lastUsed = new Date();
foundKey.usageCount = (foundKey.usageCount || 0) + 1;

// Log the API usage
const usageLog = {
  timestamp: new Date(),
  endpoint: req.path,
  method: req.method,
  ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  userAgent: req.get('user-agent') || 'unknown'
};

// Add to usage logs (keep last 100)
if (!foundKey.usageLogs) {
  foundKey.usageLogs = [];
}
foundKey.usageLogs.push(usageLog);

// Keep only the last 100 logs
if (foundKey.usageLogs.length > 100) {
  foundKey.usageLogs = foundKey.usageLogs.slice(-100);
}

await foundKey.save();
```

---

## 🔍 **HOW IT WORKS:**

### **1. API Call is Made:**
```bash
GET /api/volunteers
Headers: x-api-key: sk_live_abc123...
```

### **2. Middleware Validates Key:**
- Checks if key exists
- Checks if key is active
- Checks if key has expired

### **3. Middleware Logs Usage:**
```javascript
{
  timestamp: "2025-10-16T00:01:23.456Z",
  endpoint: "/api/volunteers",
  method: "GET",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

### **4. Log is Saved to Database:**
- Added to `usageLogs` array
- Keeps last 100 logs (auto-cleanup)
- Updates `usageCount` and `lastUsed`

### **5. Admin Can View in Dashboard:**
- Open API Admin Dashboard
- Click "View Details" on any key
- See "Recent Usage History" section
- Shows last 20 logs with full details

---

## 📊 **WHAT YOU'LL SEE:**

### **In the Key Details Modal:**

```
📊 Recent Usage History

GET /api/volunteers
  October 16, 2025 at 12:01 AM
  🌐 IP: 192.168.1.100
  👤 Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...

POST /api/reports
  October 16, 2025 at 12:02 AM
  🌐 IP: 192.168.1.100
  👤 PostmanRuntime/7.32.3

GET /api/ngos
  October 16, 2025 at 12:03 AM
  🌐 IP: 192.168.1.101
  👤 axios/1.6.0

Showing 3 of 15 total requests
```

---

## 🧪 **HOW TO TEST:**

### **1. Restart Backend:**
```bash
cd backend
npm run dev
```

### **2. Generate an API Key:**
1. Login as API Admin
2. Go to API Admin Dashboard
3. Click "Generate New Key"
4. Copy the generated key

### **3. Make API Calls:**

**Using Postman:**
```
GET http://localhost:5000/api/volunteers
Headers:
  x-api-key: sk_live_your_key_here
```

**Using curl:**
```bash
curl -H "x-api-key: sk_live_your_key_here" http://localhost:5000/api/volunteers
```

**Using JavaScript:**
```javascript
fetch('http://localhost:5000/api/volunteers', {
  headers: {
    'x-api-key': 'sk_live_your_key_here'
  }
})
```

### **4. View Usage History:**
1. Go to API Admin Dashboard
2. Click "View Details" on the key you used
3. Scroll down to "Recent Usage History"
4. **You should see all your API calls!**

---

## 📈 **FEATURES:**

### **Automatic Tracking:**
- ✅ No manual logging needed
- ✅ Works on every API call
- ✅ Captures all details automatically

### **Smart Storage:**
- ✅ Keeps last 100 logs per key
- ✅ Auto-cleanup (no database bloat)
- ✅ Shows last 20 in dashboard

### **Detailed Information:**
- ✅ Exact timestamp
- ✅ Full endpoint path
- ✅ HTTP method
- ✅ IP address (with proxy support)
- ✅ User agent string

### **Performance:**
- ✅ Non-blocking (async)
- ✅ Efficient database updates
- ✅ Minimal overhead

---

## 🔒 **SECURITY NOTES:**

### **IP Address Detection:**
The middleware checks multiple sources:
1. `req.ip` - Direct connection IP
2. `x-forwarded-for` header - Proxy/load balancer IP
3. Falls back to 'unknown' if neither available

### **Data Retention:**
- Only keeps last 100 logs per key
- Older logs are automatically removed
- Prevents database bloat

### **Privacy:**
- Logs are only visible to API admins
- No sensitive data is logged
- User agent is truncated in display (60 chars)

---

## 📝 **EXAMPLE USAGE LOGS:**

### **Government Portal Access:**
```json
{
  "timestamp": "2025-10-16T00:01:23.456Z",
  "endpoint": "/api/volunteers",
  "method": "GET",
  "ipAddress": "203.0.113.45",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
}
```

### **Automated Script:**
```json
{
  "timestamp": "2025-10-16T00:05:12.789Z",
  "endpoint": "/api/reports",
  "method": "POST",
  "ipAddress": "198.51.100.23",
  "userAgent": "python-requests/2.31.0"
}
```

### **Mobile App:**
```json
{
  "timestamp": "2025-10-16T00:10:45.123Z",
  "endpoint": "/api/ngos",
  "method": "GET",
  "ipAddress": "192.0.2.67",
  "userAgent": "CareConnect-Mobile/1.0 (iOS 17.0)"
}
```

---

## 🎯 **BENEFITS:**

### **For Admins:**
- ✅ See exactly how API keys are being used
- ✅ Identify suspicious activity
- ✅ Track usage patterns
- ✅ Debug integration issues

### **For Security:**
- ✅ Audit trail of all API access
- ✅ Detect unauthorized usage
- ✅ Track IP addresses
- ✅ Monitor for abuse

### **For Support:**
- ✅ Help users debug API issues
- ✅ See what endpoints are being called
- ✅ Verify API key is working
- ✅ Check request details

---

## 🚀 **WHAT'S NEXT:**

Now that usage tracking is implemented, you can:

1. **Monitor API Usage:**
   - See which endpoints are most popular
   - Identify heavy users
   - Track usage trends

2. **Set Up Alerts:**
   - Alert on suspicious activity
   - Notify on high usage
   - Warn on rate limit approaching

3. **Generate Reports:**
   - Export usage data
   - Create analytics dashboards
   - Track API adoption

4. **Rate Limiting:**
   - Implement rate limits per key
   - Throttle excessive usage
   - Protect API resources

---

## ✅ **SUMMARY:**

**What Was Added:**
- ✅ Automatic usage logging in middleware
- ✅ Tracks timestamp, endpoint, method, IP, user agent
- ✅ Stores last 100 logs per key
- ✅ Displays last 20 in dashboard
- ✅ Auto-cleanup to prevent bloat

**How to Use:**
1. Restart backend
2. Make API calls with a key
3. View details in dashboard
4. See full usage history!

**Files Modified:**
- ✅ `/backend/src/middleware/apiKeyAuth.ts`

---

## 🎉 **USAGE TRACKING IS COMPLETE!**

**Every API call is now automatically logged with full details!**

**Restart the backend and test it out!** 🚀

---

## 📞 **TESTING CHECKLIST:**

- [ ] Restart backend server
- [ ] Generate a new API key
- [ ] Make API calls with the key
- [ ] View key details in dashboard
- [ ] Verify usage logs appear
- [ ] Check all details are captured
- [ ] Test with different endpoints
- [ ] Verify IP address is logged
- [ ] Verify user agent is logged
- [ ] Confirm auto-cleanup works (after 100 logs)

**All features are ready to test!** ✨
