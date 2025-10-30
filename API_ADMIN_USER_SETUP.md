# 🔧 How to Create API Admin User - Setup Guide

**Problem:** Your friend tried to login with `api-admin@careconnect.com` but the user doesn't exist in his database yet.

**Solution:** Run the `createAPIAdmin.ts` script to create the API admin user in his local database.

---

## ✅ Quick Setup (3 Steps)

### Step 1: Open Terminal in Backend Folder

```bash
cd backend
```

Make sure you're in the `/backend` directory where `package.json` is located.

### Step 2: Run the Creation Script

```bash
npm run ts-node src/scripts/createAPIAdmin.ts
```

Or if that doesn't work, try:

```bash
npx ts-node src/scripts/createAPIAdmin.ts
```

### Step 3: Verify Success

You should see output like:
```
✅ API Admin user created successfully
📧 Email: api-admin@careconnect.com
🔑 Password: apiadmin123
⚠️  Please change the password after first login
```

---

## 🔑 Login Credentials (After Script Runs)

**Email:** `api-admin@careconnect.com`  
**Password:** `apiadmin123`

---

## 🧪 Test Login

1. **Go to Frontend:** `http://localhost:5173/login`
2. **Enter Email:** `api-admin@careconnect.com`
3. **Enter Password:** `apiadmin123`
4. **Click Login**
5. **Should Navigate To:** `http://localhost:5173/admin/api-dashboard` ✅

---

## ⚠️ Important Notes

### Database Must Be Running
Before running the script, make sure:
- ✅ MongoDB is running locally (or connection string is correct)
- ✅ Backend `.env` file has correct `MONGODB_URI`
- ✅ Backend can connect to database

Check `.env` in `/backend` folder:
```
MONGODB_URI=mongodb://localhost:27017/careconnect
```

### User Will Be Created Only Once
If script runs twice, it will say:
```
API Admin user already exists
📧 Email: api-admin@careconnect.com
```

This is safe - it won't create duplicates.

### Password Should Be Changed After First Login
The default password `apiadmin123` is just for initial setup. After login, your friend should change it to something secure:
1. Login with default credentials
2. Go to settings/profile
3. Change password to something secure

---

## 🚀 Full Setup Process for Your Friend

```bash
# 1. Navigate to backend folder
cd backend

# 2. Make sure dependencies are installed
npm install

# 3. Create API admin user in database
npm run ts-node src/scripts/createAPIAdmin.ts

# 4. Start backend (if not already running)
npm run dev

# 5. Start frontend (in another terminal)
cd ..
npm run dev
```

Then:
1. Go to `http://localhost:5173/login`
2. Login with:
   - Email: `api-admin@careconnect.com`
   - Password: `apiadmin123`
3. Should redirect to API Admin Dashboard

---

## ✅ What Happens When Script Runs

The script will:
1. ✅ Connect to MongoDB
2. ✅ Check if api_admin user already exists
3. ✅ If not, create new user with:
   - Name: "Government API Admin"
   - Email: "api-admin@careconnect.com"
   - Password: hashed "apiadmin123" (bcrypt encrypted)
   - Role: "api_admin"
   - Verified: true
   - Active: true
   - Status: "active"

---

## 🔍 Troubleshooting

### Error: "Cannot find module"
```
npm install
npm run ts-node src/scripts/createAPIAdmin.ts
```

### Error: "Connection refused" or "MongoDB error"
- Check if MongoDB is running
- Check `.env` file for correct connection string
- Make sure `MONGODB_URI` environment variable is set

### Error: "User already exists"
This is NOT an error - it just means the user was already created. They can login now.

### Error: Other database error
- Check if `.env` file exists in `/backend`
- Make sure all required environment variables are set
- Try restarting the backend service

---

## 📝 Script Details

**File Location:** `backend/src/scripts/createAPIAdmin.ts`

**What It Does:**
1. Loads environment variables from `.env`
2. Connects to MongoDB database
3. Checks if api_admin role user exists
4. If not, creates one with default password
5. Saves to database and prints confirmation

**Default Credentials:**
- Email: `api-admin@careconnect.com`
- Password: `apiadmin123` (plain text, gets hashed before saving)

---

## 🎯 After User is Created

Your friend can:
1. ✅ Login to the system
2. ✅ Access API Admin Dashboard at `/admin/api-dashboard`
3. ✅ Generate API Keys
4. ✅ View API Keys
5. ✅ Edit API Keys (with new Edit button! ✅)
6. ✅ Revoke API Keys
7. ✅ Approve/Reject Access Requests
8. ✅ View Analytics

---

## Summary

**Question:** Does he need to migrate?  
**Answer:** NO migration needed! Just run the script to create the API admin user in his local database.

**Command to Run:**
```bash
cd backend
npm run ts-node src/scripts/createAPIAdmin.ts
```

**That's it!** User will be created and he can login immediately. ✅
