# 🧪 CareConnect - Complete Testing Guide
**Date:** October 30, 2025  
**Purpose:** Vigorous end-to-end testing of entire application

---

## 📋 PRE-TESTING SETUP

### 1. Clean Database (You'll do this)
Keep only:
- `admin@careconnect.com` (System Admin)
- `api-admin@careconnect.com` (API Admin)

Delete all:
- Volunteers
- NGOs
- Events
- Campaigns
- Communities
- Stories
- API Keys
- Access Requests
- Messages
- Notifications

### 2. Start All Servers
```powershell
# Terminal 1 - Backend
cd backend
npm run dev
# Wait for: "MongoDB connected" & "Server running on port 5000"

# Terminal 2 - Frontend
npm run dev
# Wait for: "Local: http://localhost:5173/"

# Terminal 3 - Government Portal (Optional - for API testing)
cd government-portal
node server.mjs
# Wait for: "Government Portal running on port 3000"
```

---

## 🎯 TESTING PHASES

---

## PHASE 1: AUTHENTICATION & USER REGISTRATION ✅

### Test 1.1: Volunteer Registration Flow
**URL:** http://localhost:5173/signup

1. **Fill Registration Form:**
   - Name: `John Volunteer`
   - Email: `john.volunteer@test.com`
   - Password: `Test@123`
   - Role: Select `Volunteer`
   - Skills: `Teaching, Cooking, First Aid`
   - Interests: `Education, Health, Environment`

2. **Submit & Verify:**
   - ✅ Registration success message
   - ✅ Redirected to email verification page
   - ✅ Check inbox for 6-digit verification code

3. **Email Verification:**
   - Enter 6-digit code from email
   - ✅ "Email verified successfully" message
   - ✅ Redirected to volunteer dashboard

4. **Test Dashboard Access:**
   - ✅ See volunteer dashboard
   - ✅ Profile shows correct name and email
   - ✅ Navigation menu has: Dashboard, Events, Communities, Stories, etc.

---

### Test 1.2: NGO Registration Flow
**URL:** http://localhost:5173/signup

1. **Fill NGO Registration:**
   - Organization Name: `Green Earth Foundation`
   - Email: `contact@greenearth.org`
   - Password: `Test@123`
   - Role: Select `NGO Admin`
   - Phone: `+1234567890`
   - Address: `123 Eco Street, Green City`
   - Description: `Environmental conservation NGO working on reforestation`
   - Registration Number: `NGO-2025-001`
   - Upload Documents: (Upload any PDF/image as registration certificate)

2. **Submit & Check Status:**
   - ✅ Registration success message
   - ✅ Redirected to "Pending Approval" page
   - ✅ Message: "Your NGO registration is under review"

3. **Logout** (to test admin approval later)

---

### Test 1.3: Create More Test Users

**Create 3 more Volunteers:**
1. `Alice Smith` - alice.smith@test.com
2. `Bob Johnson` - bob.johnson@test.com  
3. `Carol Davis` - carol.davis@test.com

**Create 2 more NGOs:**
1. `Hope Foundation` - hope@foundation.org
2. `Youth Empowerment Org` - admin@youthempower.org

---

### Test 1.4: Login & Logout
1. **Logout** from current account
2. **Login as John Volunteer:**
   - Email: john.volunteer@test.com
   - Password: Test@123
   - ✅ Redirects to volunteer dashboard
3. **Logout**
4. **Test "Forgot Password":**
   - Click "Forgot Password"
   - Enter email: john.volunteer@test.com
   - ✅ Check email for reset code
   - Enter 6-digit code
   - Set new password
   - ✅ Login with new password works

---

## PHASE 2: ADMIN PANEL - NGO APPROVAL ✅

### Test 2.1: Admin Login & NGO Approval
**URL:** http://localhost:5173/login

1. **Login as Admin:**
   - Email: `admin@careconnect.com`
   - Password: `admin123`
   - ✅ Redirected to admin dashboard

2. **Navigate to NGO Requests:**
   - Click "NGO Requests" in sidebar
   - ✅ See 3 pending NGO requests

3. **Approve First NGO (Green Earth Foundation):**
   - Click "Review" button
   - ✅ See NGO details, documents
   - Click "Approve NGO"
   - ✅ Success message
   - ✅ Check email sent to contact@greenearth.org
   - ✅ Status changes to "Approved"

4. **Reject Second NGO (Hope Foundation):**
   - Click "Review"
   - Click "Reject NGO"
   - Enter reason: "Missing required documents"
   - ✅ Success message
   - ✅ Email sent with rejection reason
   - ✅ Status changes to "Rejected"

5. **Keep Third NGO Pending** (for later testing)

---

### Test 2.2: NGO Access After Approval
1. **Logout from Admin**
2. **Login as Green Earth Foundation:**
   - Email: contact@greenearth.org
   - Password: Test@123
   - ✅ Redirected to NGO Dashboard
   - ✅ Can access all NGO features

3. **Test Rejected NGO:**
   - Logout
   - Login as Hope Foundation: hope@foundation.org
   - ✅ Redirected to "Resubmit Documents" page
   - ✅ Can upload new documents and resubmit

---

## PHASE 3: NGO FEATURES - EVENTS MANAGEMENT ✅

### Test 3.1: Create Event (as Green Earth Foundation)
**Login:** contact@greenearth.org

1. **Navigate to Events:**
   - Click "Events" in sidebar
   - Click "Create Event"

2. **Fill Event Details:**
   - Title: `Beach Cleanup Drive`
   - Description: `Join us to clean Mumbai beaches and protect marine life`
   - Category: `Environment`
   - Location: `Juhu Beach, Mumbai`
   - Date: (Select tomorrow's date)
   - Time: `09:00 AM`
   - Duration: `4 hours`
   - Max Volunteers: `50`
   - Required Skills: `None - All welcome`
   - Upload Image (optional)

3. **Submit Event:**
   - Click "Create Event"
   - ✅ Success message
   - ✅ Event appears in events list
   - ✅ Status: "Active"

4. **Create 2 More Events:**
   - `Tree Plantation Drive` (Category: Environment, 100 volunteers)
   - `Environmental Awareness Workshop` (Category: Education, 30 volunteers)

---

### Test 3.2: Edit Event
1. Go to "Events" → Click "Edit" on Beach Cleanup
2. Change max volunteers to `75`
3. Update description
4. ✅ Save changes successfully

---

### Test 3.3: View Event Analytics
1. Click "Events Analytics" in sidebar
2. ✅ See event statistics dashboard
3. ✅ View charts and metrics

---

## PHASE 4: VOLUNTEER - EVENT REGISTRATION ✅

### Test 4.1: Browse & Register for Events
**Login:** john.volunteer@test.com

1. **Go to Events Page:**
   - Click "Events" in menu
   - ✅ See all 3 events created by Green Earth Foundation

2. **View Event Details:**
   - Click on "Beach Cleanup Drive"
   - ✅ See full event details
   - ✅ See NGO information
   - ✅ See available slots (75/75)

3. **Register for Event:**
   - Click "Register for Event"
   - ✅ Confirmation dialog appears
   - Confirm registration
   - ✅ Success message
   - ✅ Button changes to "Cancel Registration"
   - ✅ Available slots: 74/75

4. **Register for 2 More Events:**
   - Register for Tree Plantation Drive
   - Register for Environmental Awareness Workshop

---

### Test 4.2: View Registered Events in Dashboard
1. Go to "Dashboard"
2. ✅ See "Upcoming Events" section
3. ✅ All 3 registered events appear
4. ✅ Can cancel registration from dashboard

---

### Test 4.3: Multiple Volunteers Register
1. Login as Alice Smith (alice.smith@test.com)
   - Register for Beach Cleanup
2. Login as Bob Johnson (bob.johnson@test.com)
   - Register for Beach Cleanup
3. Login as Carol Davis (carol.davis@test.com)
   - Register for all 3 events

---

### Test 4.4: NGO View Event Volunteers
**Login:** contact@greenearth.org

1. Go to Events → Beach Cleanup → "View Volunteers"
2. ✅ See list of 4 registered volunteers:
   - John Volunteer
   - Alice Smith
   - Bob Johnson
   - Carol Davis
3. ✅ Can export volunteer list
4. ✅ Can see volunteer contact info

---

## PHASE 5: NGO FEATURES - CAMPAIGNS ✅

### Test 5.1: Create Campaign
**Login:** contact@greenearth.org

1. **Navigate to Campaigns:**
   - Click "Campaigns" in sidebar
   - Click "Create Campaign"

2. **Fill Campaign Details:**
   - Title: `Plant 10,000 Trees Campaign`
   - Description: `Help us plant 10,000 trees across Mumbai by December 2025`
   - Goal Type: `Trees Planted`
   - Target: `10000`
   - Start Date: Today
   - End Date: (2 months from now)
   - Upload Campaign Image

3. **Submit:**
   - ✅ Campaign created
   - ✅ Appears in campaigns list
   - ✅ Shows progress: 0/10000

4. **Create Another Campaign:**
   - `Ocean Cleanup Initiative` (Target: 5000 kg plastic collected)

---

### Test 5.2: View Campaign Details
**As Volunteer:** john.volunteer@test.com

1. Go to "Campaigns" page
2. ✅ See both campaigns
3. Click on "Plant 10,000 Trees"
4. ✅ See campaign details
5. ✅ See progress bar
6. ✅ See associated events
7. ✅ Can share campaign

---

### Test 5.3: Campaign Analytics
**Login:** contact@greenearth.org

1. Go to Campaigns → Analytics
2. ✅ View campaign performance
3. ✅ See engagement metrics

---

## PHASE 6: COMMUNITY FEATURES ✅

### Test 6.1: NGO Creates Community
**Login:** contact@greenearth.org

1. **Go to Community Page:**
   - Click "Community" in menu
   - Click "Create Community"

2. **Create Community:**
   - Name: `Eco Warriors Mumbai`
   - Description: `Community for environmental activists in Mumbai`
   - Category: `Environment`
   - Privacy: `Public`
   - Upload Cover Image

3. **Submit:**
   - ✅ Community created
   - ✅ NGO is owner
   - ✅ Appears in "My Owned Communities"

---

### Test 6.2: Volunteer Joins Community
**Login:** john.volunteer@test.com

1. Go to Community → Browse All
2. Find "Eco Warriors Mumbai"
3. Click "Join Community"
4. ✅ Success message
5. ✅ Community appears in "My Joined Communities"

---

### Test 6.3: Create Post in Community
**Login:** john.volunteer@test.com

1. Go to "Eco Warriors Mumbai" community
2. Click "Create Post"
3. Fill post:
   - Title: `Beach Cleanup Photos`
   - Content: `Here are some photos from last weekend's cleanup`
   - Upload images (optional)
4. Post
5. ✅ Post appears in community feed

---

### Test 6.4: Comment on Post
**Login:** alice.smith@test.com

1. Join "Eco Warriors Mumbai"
2. View "Beach Cleanup Photos" post
3. Add comment: `Great work everyone!`
4. ✅ Comment posted
5. **Test as John:** Reply to comment
6. ✅ Reply appears

---

### Test 6.5: NGO Broadcast Message
**Login:** contact@greenearth.org

1. Go to Community → "Eco Warriors Mumbai"
2. Click "Broadcast Message"
3. Write: `Important: Next tree plantation on Sunday at 7 AM`
4. Send
5. ✅ All members receive notification

**Verify as Volunteer:**
1. Login as john.volunteer@test.com
2. ✅ See notification bell
3. ✅ See broadcast message

---

## PHASE 7: STORIES & ACHIEVEMENTS ✅

### Test 7.1: Volunteer Creates Story
**Login:** john.volunteer@test.com

1. **Go to Stories:**
   - Click "Stories" in menu
   - Click "Create Story"

2. **Write Story:**
   - Title: `My First Beach Cleanup Experience`
   - Content: `I participated in my first beach cleanup and it was amazing! We collected over 200kg of plastic...`
   - Category: `Environment`
   - Upload Photos (optional)

3. **Submit:**
   - ✅ Story published
   - ✅ Appears in stories feed

---

### Test 7.2: NGO Creates Success Story
**Login:** contact@greenearth.org

1. Create Story:
   - Title: `Green Earth Foundation - 5 Years of Impact`
   - Content: Describe NGO's achievements
   - Category: `Success Stories`

2. ✅ Story published

---

### Test 7.3: Read & Interact with Stories
**As Any User:**

1. Browse stories
2. Click on a story to read
3. Like story (heart icon)
4. ✅ Like count increases
5. Add comment on story
6. ✅ Comment appears

---

## PHASE 8: NOTIFICATIONS SYSTEM ✅

### Test 8.1: Check Notifications
**Login:** john.volunteer@test.com

1. **Click Notification Bell:**
   - ✅ See dropdown with notifications
   - ✅ See event registration confirmations
   - ✅ See community broadcast messages
   - ✅ See new event announcements

2. **Click "View All Notifications":**
   - ✅ Go to notifications page
   - ✅ See all notifications grouped by type
   - ✅ Can mark as read
   - ✅ Can delete notifications

---

## PHASE 9: PROFILE & SETTINGS ✅

### Test 9.1: Volunteer Profile
**Login:** john.volunteer@test.com

1. **Go to Profile:**
   - Click profile icon → "My Profile"

2. **Check Profile Shows:**
   - ✅ Name, email, join date
   - ✅ Skills and interests
   - ✅ Volunteer points/badges
   - ✅ Events attended count
   - ✅ Communities joined count
   - ✅ Stories written count

3. **Edit Profile:**
   - Click "Edit Profile"
   - Update bio, skills
   - Upload profile picture
   - ✅ Save successfully

---

### Test 9.2: NGO Profile
**Login:** contact@greenearth.org

1. **Go to NGO Profile Edit:**
   - Click "Profile" → "Edit Profile"

2. **Update NGO Info:**
   - Change description
   - Update contact info
   - Upload new logo
   - ✅ Save successfully

3. **View Public NGO Profile:**
   - Go to "NGOs" page
   - Click on "Green Earth Foundation"
   - ✅ See public profile with all events and campaigns
   - ✅ See follower count
   - ✅ Can follow NGO as volunteer

---

## PHASE 10: ADMIN DASHBOARD - USER MANAGEMENT ✅

### Test 10.1: View All Users
**Login:** admin@careconnect.com

1. **Go to User Management:**
   - Click "User Management" in sidebar

2. **Check User List:**
   - ✅ See all volunteers (4 total)
   - ✅ See all NGOs (3 total)
   - ✅ Filter by role
   - ✅ Search by name/email

---

### Test 10.2: Manage Users
1. **Deactivate User:**
   - Find Carol Davis
   - Click "Deactivate"
   - ✅ User status: Inactive
   - **Verify:** Carol cannot login

2. **Reactivate User:**
   - Click "Activate"
   - ✅ User status: Active
   - **Verify:** Carol can login again

3. **Delete User (Test only):**
   - Create a dummy user
   - Delete the dummy user
   - ✅ User removed from system

---

### Test 10.3: View Volunteer Analytics
1. Go to "Volunteer Analytics"
2. ✅ See charts:
   - Total volunteers over time
   - Event participation rates
   - Skill distribution
   - Top performers
3. ✅ Can filter by date range

---

### Test 10.4: View Admin Reports
1. Go to "Reports"
2. ✅ Generate reports for:
   - User registrations
   - Event attendance
   - Campaign progress
   - Community engagement
3. ✅ Can export as PDF/CSV

---

### Test 10.5: System Settings
1. Go to "Settings"
2. Test changing:
   - ✅ Email notification settings
   - ✅ User registration approval (auto/manual)
   - ✅ System maintenance mode
3. ✅ Changes saved

---

### Test 10.6: Activity Logs
1. Go to "Activity Logs"
2. ✅ See all system activities:
   - User logins
   - NGO approvals
   - Event creations
   - Campaign updates
3. ✅ Can filter by action type
4. ✅ Can search by user

---

### Test 10.7: Admin Messages/Broadcasts
1. Go to "Messages"
2. Send broadcast to all volunteers:
   - Message: `Platform maintenance scheduled for Saturday`
3. ✅ Message sent
4. **Verify as Volunteer:** See notification

---

## PHASE 11: API ADMIN PANEL ✅

### Test 11.1: API Admin Login
**URL:** http://localhost:5173/login

1. **Login as API Admin:**
   - Email: `api-admin@careconnect.com`
   - Password: `apiadmin123`
   - ✅ Redirected to API Admin Dashboard

2. **Check Dashboard:**
   - ✅ See overview stats
   - ✅ Active API Keys count
   - ✅ Pending Requests count
   - ✅ Total API Calls count

---

### Test 11.2: Email Request Testing
**Send Email to Your Gmail** (configured in backend .env)

**Subject:** `Government Data Access Request`

**Body:**
```
Organization: Test Government Department
Contact Person: Jane Doe
Email: jane.doe@testgov.com
Purpose: Policy research
Data Types: volunteers, events
Justification: Required for government analysis
Estimated Requests/Month: 100
Duration: 6 months
```

---

### Test 11.3: Process Email Request
**Login:** api-admin@careconnect.com

1. **Go to Email Requests:**
   - Click "Email Requests" tab

2. **Click "Check for New Emails":**
   - ✅ Processing modal appears
   - ✅ Finds 1 new email
   - ✅ Parses email successfully
   - ✅ Creates access request

3. **Review Request:**
   - Click "Review" on new request
   - ✅ Step 1: See all parsed details
   - Click "Next"

4. **Select Permissions:**
   - ✅ Step 2: Checkboxes for permissions
   - Select: read:volunteers, read:events
   - Click "Approve & Continue"

5. **Generate API Key:**
   - ✅ Step 3: Generate API Key button
   - Click "Generate API Key"
   - ✅ See 70-character API key
   - **COPY THE KEY!**
   - Click "Next"

6. **Send Email:**
   - ✅ Step 4: Email preview
   - Click "Send Email"
   - ✅ Success message
   - ✅ Email sent to jane.doe@testgov.com

---

### Test 11.4: Manage API Keys
1. **Go to API Keys Tab:**
   - ✅ See generated API key in list

2. **View Details:**
   - Click "View Details"
   - ✅ See full key info
   - ✅ See usage history
   - ✅ See permissions

3. **Edit Key:**
   - Click "Edit"
   - Change permissions
   - Update expiration date
   - ✅ Save changes

4. **Revoke Key:**
   - Click "Revoke"
   - ✅ Confirm revocation
   - ✅ Status: Revoked
   - ✅ Key no longer works

---

### Test 11.5: Test API with Government Portal
**If you have the key:**

1. **Start Government Portal:**
   ```powershell
   cd government-portal
   node server.mjs
   ```

2. **Open:** http://localhost:3000

3. **Enter API Key** (the one you copied)

4. **Test Data Fetch:**
   - Click "Get Volunteers Data"
   - ✅ See volunteer list
   - Click "Get Events Data"
   - ✅ See events list

5. **Test Invalid Key:**
   - Enter wrong key
   - ✅ Error: "Invalid API Key"

6. **Test Revoked Key:**
   - Use revoked key
   - ✅ Error: "API Key has been revoked"

---

## PHASE 12: EDGE CASES & ERROR HANDLING ✅

### Test 12.1: Form Validation
1. **Try invalid registrations:**
   - ✅ Weak password → Error message
   - ✅ Invalid email format → Error
   - ✅ Empty required fields → Error
   - ✅ Password mismatch → Error

---

### Test 12.2: Duplicate Registrations
1. **Try registering with existing email:**
   - ✅ Error: "Email already exists"

---

### Test 12.3: Event Registration Limits
1. **As NGO:** Set max volunteers to 2
2. **Register 3 volunteers:**
   - First 2: ✅ Success
   - Third: ✅ Error: "Event is full"

---

### Test 12.4: Authorization Tests
1. **Volunteer tries to access NGO dashboard:**
   - ✅ Redirected to login

2. **Non-admin tries admin panel:**
   - ✅ Redirected to login

3. **Try editing other user's content:**
   - ✅ Error or hidden edit button

---

### Test 12.5: Past Event Registration
1. **Create event with past date:**
   - ✅ Shows as "Completed"
   - ✅ Cannot register

---

### Test 12.6: File Upload Limits
1. **Try uploading large file (>5MB):**
   - ✅ Error: "File too large"

2. **Try wrong file type:**
   - ✅ Error: "Invalid file type"

---

## PHASE 13: PERFORMANCE & LOAD TESTING ✅

### Test 13.1: Create Bulk Data
**Create via multiple accounts:**
- 20+ Events
- 10+ Campaigns  
- 5+ Communities
- 50+ Stories
- 100+ Community posts

---

### Test 13.2: Pagination Testing
1. **Events page with 20+ events:**
   - ✅ Pagination works
   - ✅ Can navigate pages
   - ✅ Load time acceptable

2. **Stories page:**
   - ✅ Infinite scroll works
   - ✅ No performance issues

---

### Test 13.3: Search & Filter
1. **Search events:**
   - Search by keyword
   - ✅ Results accurate
   - Filter by category
   - ✅ Filter works
   - Filter by date range
   - ✅ Filter works

2. **Search stories:**
   - ✅ Search works across title/content

---

## PHASE 14: MOBILE RESPONSIVENESS ✅

### Test 14.1: Resize Browser
1. **Open DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M)
3. **Test on different sizes:**
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

### Test 14.2: Check All Pages
For each page, verify:
- ✅ No horizontal scroll
- ✅ Buttons clickable
- ✅ Forms usable
- ✅ Images responsive
- ✅ Navigation menu works (hamburger on mobile)

---

## PHASE 15: CROSS-BROWSER TESTING ✅

### Test on Multiple Browsers:
1. **Chrome** - Primary testing
2. **Firefox** - Check compatibility
3. **Edge** - Check compatibility
4. **Safari** (if available) - Check compatibility

**Test these pages in each:**
- Login/Signup
- Dashboard
- Events page
- Community page
- Admin panel

---

## PHASE 16: SECURITY TESTING ✅

### Test 16.1: JWT Token Testing
1. **Login and get token** (check browser DevTools → Application → Local Storage)
2. **Copy token**
3. **Logout**
4. **Clear localStorage**
5. **Try API call with old token:**
   - ✅ Should be rejected

---

### Test 16.2: SQL Injection Prevention
1. **Try malicious inputs in forms:**
   - Email: `admin'--`
   - Password: `' OR '1'='1`
   - ✅ Should be sanitized/rejected

---

### Test 16.3: XSS Prevention
1. **Try script injection in posts:**
   - Content: `<script>alert('XSS')</script>`
   - ✅ Should be escaped/sanitized

---

### Test 16.4: Rate Limiting
1. **Make multiple rapid login attempts:**
   - ✅ After 5 failed attempts: "Too many attempts, try later"

---

## PHASE 17: ADDITIONAL FEATURES ✅

### Test 17.1: Report System
**Test reporting inappropriate content:**

1. **Report a Story (as volunteer):**
   - Go to Stories page
   - Find any story
   - Click "Report" (flag icon)
   - ✅ Report modal opens
   - Select reason: "Inappropriate content"
   - Add description: "Contains offensive language"
   - ✅ Submit report successfully

2. **Report an Event:**
   - Browse events
   - Click report on event
   - Select reason
   - ✅ Report submitted

3. **Report a Community Post:**
   - Go to community
   - Find a post
   - Click report
   - ✅ Report submitted

4. **Admin View Reports:**
   - Login as admin@careconnect.com
   - Go to "Reports" section
   - ✅ See all submitted reports
   - ✅ Can filter by type (story, event, community)
   - ✅ Can update status (pending/reviewed/resolved)
   - ✅ Can delete report

---

### Test 17.2: ChatBot & Support
**Test the AI ChatBot:**

1. **Open ChatBot (on homepage):**
   - ✅ See chat icon in bottom-right
   - Click to open
   - ✅ Welcome message appears

2. **Test Quick Replies:**
   - ✅ See quick reply buttons
   - Click "Find Events"
   - ✅ Bot provides event information

3. **Test FAQ:**
   - Ask: "How do I become a volunteer?"
   - ✅ Bot provides relevant answer
   - Ask: "How do I make a donation?"
   - ✅ Bot provides donation info

4. **Test Contact Support:**
   - In chatbot, request to contact support
   - Fill form:
     - Name: Test User
     - Email: test@example.com
     - Message: Need help with registration
   - ✅ Message sent to admin
   - ✅ Success confirmation

5. **Admin View Support Messages:**
   - Login as admin
   - Go to "Messages"
   - ✅ See support message from chatbot
   - ✅ Can reply to user

---

### Test 17.3: Government Access Request (Public Form)
**Test the government access request form:**

1. **Go to Government Access Page:**
   - URL: http://localhost:5173/government-access
   - ✅ See two tabs: "Online Form" and "Email Submission"

2. **Test Online Form:**
   - Fill all fields:
     - Organization: Test Gov Agency
     - Contact: John Doe
     - Email: john@gov.com
     - Purpose: Policy research
     - Data Types: volunteers, events
     - Justification: Required by law
     - Requests/Month: 100
     - Duration: 12 months
   - ✅ Submit form
   - ✅ Success message
   - ✅ Request appears in API Admin panel

3. **Test Email Template:**
   - Click "Email Submission" tab
   - ✅ See email template
   - Click "Compose Email" button
   - ✅ Opens Gmail with pre-filled template

---

### Test 17.4: About Page
**Test the about page content:**

1. **Navigate to About:**
   - Click "About" in header
   - ✅ See company mission/vision
   - ✅ See statistics (volunteers, NGOs, events)
   - ✅ See team members
   - ✅ See company values
   - ✅ See milestone timeline
   - ✅ All sections load properly

---

### Test 17.5: NGO Follow Feature
**Test following NGOs:**

1. **As Volunteer (john.volunteer@test.com):**
   - Go to NGOs page
   - Click on "Green Earth Foundation"
   - ✅ See "Follow" button
   - Click "Follow"
   - ✅ Button changes to "Following"
   - ✅ Follower count increases

2. **Unfollow NGO:**
   - Click "Following" button
   - ✅ Confirmation dialog
   - Confirm unfollow
   - ✅ Button changes back to "Follow"
   - ✅ Follower count decreases

3. **View Followed NGOs:**
   - Go to volunteer dashboard
   - ✅ See section showing followed NGOs
   - ✅ Get notified about their new events

---

### Test 17.6: Volunteer Points & Achievements
**Test gamification features:**

1. **Check Volunteer Profile:**
   - Login as john.volunteer@test.com
   - Go to Profile
   - ✅ See total points earned
   - ✅ See badges/achievements section
   - ✅ See progress bars for next achievement

2. **Earn Points:**
   - Complete event registration: +10 points
   - Attend event (mark as attended): +50 points
   - Create story: +20 points
   - ✅ Points increase automatically

3. **Unlock Badges:**
   - After 5 events: ✅ "Active Volunteer" badge
   - After 10 events: ✅ "Super Volunteer" badge
   - After first story: ✅ "Storyteller" badge

---

### Test 17.7: Calendar & Event Scheduling
**Test calendar features in NGO dashboard:**

1. **Login as NGO (contact@greenearth.org):**
   - Go to NGO Dashboard
   - ✅ See calendar widget showing upcoming events
   - ✅ Click on date with event
   - ✅ See event details popup
   - ✅ Can navigate months

2. **Schedule Event from Calendar:**
   - Click on future date
   - ✅ "Create Event" option appears
   - ✅ Date pre-filled in event form

---

### Test 17.8: Search Functionality
**Test global search:**

1. **Search Events:**
   - Go to Events page
   - Use search bar: "Beach"
   - ✅ Shows events matching "Beach"
   - Filter by category: Environment
   - ✅ Results filtered
   - Filter by date range
   - ✅ Results filtered by date

2. **Search NGOs:**
   - Go to NGOs page
   - Search: "Green Earth"
   - ✅ Shows matching NGO
   - Filter by location
   - ✅ Results filtered

3. **Search Stories:**
   - Go to Stories page
   - Search: "cleanup"
   - ✅ Shows matching stories
   - Filter by category
   - ✅ Results filtered

---

### Test 17.9: File Upload & Document Management
**Test file uploads across system:**

1. **NGO Document Upload:**
   - During NGO registration
   - Upload PDF (registration certificate)
   - ✅ File uploaded successfully
   - ✅ Can preview document
   - ✅ Admin can download document

2. **Event Image Upload:**
   - Create event as NGO
   - Upload event banner image
   - ✅ Image uploads and displays
   - ✅ Image appears in event listing

3. **Profile Picture Upload:**
   - Go to profile edit
   - Upload profile picture
   - ✅ Image uploaded
   - ✅ Cropping/preview works
   - ✅ Saved successfully

4. **Story Image Upload:**
   - Create story
   - Upload multiple images
   - ✅ Images uploaded
   - ✅ Images display in story

---

### Test 17.10: Demo Mode
**Test demo credentials:**

1. **Go to Demo Page:**
   - URL: http://localhost:5173/demo
   - ✅ See demo credentials listed
   - ✅ Quick login buttons for each role

2. **Quick Login Test:**
   - Click "Login as Volunteer Demo"
   - ✅ Automatically logs in
   - ✅ Redirects to volunteer dashboard
   - Logout and try other demo accounts
   - ✅ All demo logins work

---

### Test 17.11: Export & Download Features
**Test data export functionality:**

1. **Export Volunteer List (as NGO):**
   - Go to event volunteers page
   - Click "Export CSV"
   - ✅ Downloads CSV file
   - ✅ File contains correct data

2. **Export Reports (as Admin):**
   - Go to Admin Reports
   - Select date range
   - Click "Export PDF"
   - ✅ Generates and downloads PDF report

3. **Export Analytics (as Admin):**
   - Go to Analytics page
   - Click "Export Data"
   - ✅ Downloads Excel/CSV file

---

### Test 17.12: Email Notifications
**Verify all email notifications work:**

1. **Volunteer Emails:**
   - ✅ Registration verification code
   - ✅ Event registration confirmation
   - ✅ Event reminder (24h before)
   - ✅ Event cancellation notice
   - ✅ Campaign updates
   - ✅ Community broadcast messages
   - ✅ Password reset code

2. **NGO Emails:**
   - ✅ Approval notification
   - ✅ Rejection notification (with reason)
   - ✅ New volunteer registration
   - ✅ Event full notification
   - ✅ Document resubmission request

3. **Admin Emails:**
   - ✅ New NGO registration
   - ✅ Support message from chatbot
   - ✅ Report submissions

---

## PHASE 18: DASHBOARD-SPECIFIC FEATURES ✅

### Test 18.1: Volunteer Dashboard Features
**Login:** john.volunteer@test.com

1. **Dashboard Stats:**
   - ✅ Total volunteer hours
   - ✅ Events joined count
   - ✅ Completed events count
   - ✅ Upcoming events count
   - ✅ Total points earned

2. **Recent Activity:**
   - ✅ See recent event registrations
   - ✅ See completed events
   - ✅ Quick actions available

3. **Upcoming Events Widget:**
   - ✅ Shows next 5 events
   - ✅ Can cancel registration directly
   - ✅ Can view event details

4. **Achievements Display:**
   - ✅ Shows unlocked badges
   - ✅ Shows locked badges (grayed out)
   - ✅ Progress indicators

---

### Test 18.2: NGO Dashboard Features
**Login:** contact@greenearth.org

1. **Dashboard Stats:**
   - ✅ Total volunteers engaged
   - ✅ Active events count
   - ✅ Total events count
   - ✅ Upcoming events count
   - ✅ Impact score
   - ✅ Follower count

2. **Charts & Analytics:**
   - ✅ Volunteer growth chart (line chart)
   - ✅ Event participation chart (bar chart)
   - ✅ Category distribution (pie chart)

3. **Quick Actions:**
   - ✅ "Create Event" button
   - ✅ "Create Campaign" button
   - ✅ "Broadcast Message" button
   - ✅ Navigate to analytics

4. **Recent Volunteers Widget:**
   - ✅ Shows newest volunteers
   - ✅ Shows volunteer details
   - ✅ Can view volunteer profile

5. **Calendar Integration:**
   - ✅ Calendar shows event dates
   - ✅ Highlighted dates for events
   - ✅ Click date to see events

---

### Test 18.3: Admin Dashboard Features
**Login:** admin@careconnect.com

1. **System Overview:**
   - ✅ Total users count
   - ✅ Total NGOs count
   - ✅ Total volunteers count
   - ✅ Pending NGO requests
   - ✅ Active events count
   - ✅ Total campaigns count

2. **Charts:**
   - ✅ User registration trends
   - ✅ Event participation rates
   - ✅ NGO approval timeline
   - ✅ System activity logs graph

3. **Quick Actions:**
   - ✅ Review pending NGOs
   - ✅ View reports
   - ✅ Manage users
   - ✅ System settings

4. **Recent Activity Feed:**
   - ✅ Latest user registrations
   - ✅ Latest NGO applications
   - ✅ Latest events created
   - ✅ Latest reports submitted

---

## 🎯 FINAL CHECKLIST

### All User Flows Working:
- ✅ Volunteer registration → verification → dashboard
- ✅ NGO registration → approval → dashboard
- ✅ Admin review → approve/reject NGOs
- ✅ Event creation → registration → attendance
- ✅ Campaign creation → tracking → analytics
- ✅ Community creation → join → post → comment
- ✅ Story creation → publishing → interaction
- ✅ API request → approval → key generation → usage

### All Features Tested:
- ✅ Authentication (login/logout/forgot password)
- ✅ Email verification system
- ✅ NGO approval workflow
- ✅ Events management
- ✅ Campaigns tracking
- ✅ Community forums
- ✅ Stories/blogs
- ✅ Notifications
- ✅ Profile management
- ✅ Admin dashboard
- ✅ User management
- ✅ Analytics & reports
- ✅ API Admin panel
- ✅ Government API access
- ✅ Broadcasting system
- ✅ **Report system (for inappropriate content)**
- ✅ **ChatBot & support messaging**
- ✅ **Government access request form**
- ✅ **About page**
- ✅ **NGO follow/unfollow feature**
- ✅ **Volunteer points & achievements (gamification)**
- ✅ **Calendar & event scheduling**
- ✅ **Global search functionality**
- ✅ **File uploads & document management**
- ✅ **Demo mode with quick login**
- ✅ **Export/download features (CSV, PDF)**
- ✅ **Email notifications (all types)**
- ✅ **Dashboard widgets & analytics charts**

### All Roles Tested:
- ✅ Volunteer (4 test users)
- ✅ NGO Admin (3 test NGOs)
- ✅ System Admin (1 admin)
- ✅ API Admin (1 API admin)

### Error Handling:
- ✅ Form validations
- ✅ Authorization checks
- ✅ 404 pages
- ✅ Network errors
- ✅ File upload errors

### Performance:
- ✅ Page load times
- ✅ Large data sets
- ✅ Concurrent users
- ✅ Database queries

### UI/UX:
- ✅ Responsive design
- ✅ Browser compatibility
- ✅ Accessibility
- ✅ Loading states
- ✅ Success/error messages

---

## 🐛 BUG TRACKING TEMPLATE

**When you find a bug, note:**

1. **Bug Description:** 
2. **Steps to Reproduce:**
3. **Expected Result:**
4. **Actual Result:**
5. **User Role:**
6. **Page/Feature:**
7. **Browser:**
8. **Screenshot:** (if applicable)

---

## 📊 TEST RESULTS SUMMARY

Fill after testing:

- **Total Features Tested:** ___
- **Passed:** ___
- **Failed:** ___
- **Bugs Found:** ___
- **Critical Issues:** ___
- **Testing Duration:** ___

---

## 🚀 GOOD LUCK WITH TESTING!

Take your time with each phase. Test thoroughly. Note every bug. Your app will be rock solid! 💪
