# CareConnect Auto-Fill Extension - Installation Guide

## 🚀 Quick Setup (2 minutes)

### Step 1: Enable Developer Mode in Chrome
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Toggle ON the "Developer mode" switch in the top-right corner

### Step 2: Load the Extension
1. Click the "Load unpacked" button
2. Navigate to your CareConnect project folder
3. Select the `careconnect-autofill-extension` folder
4. Click "Select Folder"

### Step 3: Pin the Extension (Optional but Recommended)
1. Look for the puzzle piece icon (🧩) in your Chrome toolbar
2. Click it to see all extensions
3. Find "CareConnect Auto-Fill Demo Extension"
4. Click the pin icon to keep it visible in your toolbar

## 🎯 How to Use

### For Create Event Form:
1. Start your CareConnect development server (`npm start`)
2. Login as an NGO admin
3. Navigate to: **NGO Admin → Create → Create Events**
4. Click the 🎯 extension icon in your toolbar
5. Click "Fill Event Demo Data"
6. Watch the magic happen! ✨

### For Other Forms:
- **NGO Registration**: Go to NGO signup → Click "Fill NGO Demo Data"
- **User Profile**: Go to profile edit → Click "Fill Profile Demo Data"
- **Campaign Creation**: Go to campaign form → Click "Fill Campaign Demo Data"

## ✅ Verification

### You'll Know It's Working When:
1. You see a "🎯 Auto-Fill Ready" indicator appear briefly on CareConnect pages
2. The extension popup shows "✅ Create Event page detected" when on the form
3. Clicking "Fill Event Demo Data" fills all 17 form fields automatically
4. Status updates appear in the extension popup

### If Something Goes Wrong:
1. **Check URL**: Make sure you're on `localhost:3000` or your dev URL
2. **Refresh Page**: Sometimes a page refresh helps
3. **Check Console**: Open DevTools (F12) and look for extension messages
4. **Reload Extension**: Go to chrome://extensions/ and click the reload button

## 🎨 What Gets Filled

### Create Event Form (All 17 Fields):
- ✅ Event Title: "Beach Cleanup Drive - Marine Conservation"
- ✅ Description: Detailed environmental event description
- ✅ Category: Environment
- ✅ Date: November 15, 2025 (future date)
- ✅ Start Time: 08:00
- ✅ End Time: 12:00
- ✅ Address: "Juhu Beach, Near Hotel Sun-n-Sand"
- ✅ Area: "Juhu"
- ✅ City: "Mumbai"
- ✅ State: "Maharashtra"
- ✅ Pin Code: "400049"
- ✅ Landmark: "Opposite Juhu Police Station"
- ✅ Capacity: 50
- ✅ Requirements: Detailed volunteer requirements
- ✅ What to Expect: Event expectations description
- ✅ Tags: "environment, cleanup, marine conservation, beach, community"

## 🛡️ Safety Notes

- ✅ **Safe to Use**: Extension doesn't modify your CareConnect code
- ✅ **Local Only**: Only works on development URLs (localhost)
- ✅ **No Data Risk**: Uses only demo/test data
- ✅ **Reversible**: Refresh page to clear filled data
- ✅ **Privacy Safe**: No data collection or external communication

## 🔧 Troubleshooting

### Extension Icon Not Visible:
- Look for the puzzle piece icon (🧩) and pin the extension

### "Not on CareConnect" Error:
- Ensure you're on a localhost URL (localhost:3000)
- Extension only works on development environments

### Form Not Filling:
- Make sure you're on the correct page (Create Event form)
- Try refreshing the page and clicking the extension again
- Check that your form field names match the expected selectors

### Extension Won't Load:
- Ensure Developer Mode is enabled in chrome://extensions/
- Try reloading the extension
- Check for any error messages in the extension details

## 🎉 You're All Set!

The extension is now ready to make your CareConnect development and testing much faster and easier! No more manually typing demo data into forms. 🚀

## 💡 Pro Tips

1. **Test Different Scenarios**: Use the auto-filled data as a base and modify specific fields
2. **Presentation Ready**: Perfect for demos and presentations
3. **Quick Testing**: Rapidly test form validation and submission workflows
4. **Multiple Events**: Use the extension multiple times with slight modifications for different test events

Happy coding! 🎯