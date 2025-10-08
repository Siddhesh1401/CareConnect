# CareConnect Auto-Fill Extension

A Chrome browser extension that automatically fills CareConnect forms with demo data for testing and presentations.

## 🎯 Features

- **Create Event Form**: Auto-fills all 17 fields in the NGO Create Event page
- **NGO Registration**: Fills NGO signup forms with realistic demo data
- **Profile Forms**: Populates user profile forms
- **Campaign Forms**: Auto-completes campaign creation forms
- **Visual Feedback**: Shows filling progress and completion status
- **Non-Invasive**: Doesn't modify any existing CareConnect code

## 📋 Supported Forms

### Create Event Form (17 fields):
- ✅ Event Title, Description, Category
- ✅ Date, Start Time, End Time
- ✅ Complete Location (Address, Area, City, State, Pin Code, Landmark)
- ✅ Capacity, Requirements, What to Expect, Tags

### Additional Forms:
- 🏢 NGO Registration
- 👤 User Profiles
- 🎯 Campaign Creation

## 🚀 Installation

### Method 1: Developer Mode (Recommended)
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `careconnect-autofill-extension` folder
5. Extension will appear in your toolbar

### Method 2: CRX Package
1. Package the extension as .crx file
2. Drag and drop the .crx file onto `chrome://extensions/`

## 📖 Usage

1. **Navigate** to any CareConnect form page (localhost:3000 or your development URL)
2. **Click** the extension icon (🎯) in your browser toolbar
3. **Select** the appropriate form type from the popup
4. **Watch** as the form gets filled automatically with demo data
5. **Review** and submit the form as needed

### Specific Pages:
- **Create Event**: Go to `NGO Admin → Create → Create Events` and click "Fill Event Demo Data"
- **NGO Registration**: Go to NGO signup page and click "Fill NGO Demo Data"
- **Profile**: Go to profile edit page and click "Fill Profile Demo Data"
- **Campaign**: Go to campaign creation page and click "Fill Campaign Demo Data"

## 🎨 Demo Data Examples

### Event Demo Data:
- **Title**: "Beach Cleanup Drive - Marine Conservation"
- **Description**: Detailed environmental event description
- **Category**: Environment
- **Location**: Juhu Beach, Mumbai, Maharashtra
- **Capacity**: 50 volunteers
- **Date**: Future date (November 15, 2025)
- **Time**: 8:00 AM - 12:00 PM

### NGO Demo Data:
- **Organization**: "Green Earth Foundation"
- **Focus**: Environmental conservation
- **Location**: Mumbai, Maharashtra
- **Registration**: Valid NGO registration number

## 🛡️ Safety Features

- ✅ **No Code Modification**: Extension doesn't change any CareConnect source code
- ✅ **Local Only**: Only works on localhost/development URLs
- ✅ **Visual Indicators**: Shows when extension is active
- ✅ **Reversible**: Can refresh page to clear filled data
- ✅ **Non-Persistent**: Doesn't store personal data

## 🔧 Technical Details

### Architecture:
- **Manifest V3**: Latest Chrome extension standard
- **Content Scripts**: Inject form-filling logic into pages
- **Popup Interface**: User-friendly control panel
- **No External Dependencies**: Pure JavaScript/HTML/CSS

### Supported URLs:
- `http://localhost:*/*`
- `https://localhost:*/*`
- `http://127.0.0.1:*/*`
- `https://127.0.0.1:*/*`

### File Structure:
```
careconnect-autofill-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Popup logic and communication
├── content.js             # Form filling logic
├── styles.css             # Visual styling
├── icons/                 # Extension icons
└── README.md              # This file
```

## 🎯 Form Field Mapping

### Create Event Form Selectors:
```javascript
{
  title: 'input[name="title"]',
  description: 'textarea[name="description"]',
  category: 'select[name="category"]',
  date: 'input[name="date"]',
  startTime: 'input[name="startTime"]',
  endTime: 'input[name="endTime"]',
  address: 'input[name="location.address"]',
  area: 'input[name="location.area"]',
  city: 'input[name="location.city"]',
  state: 'select[name="location.state"]',
  pinCode: 'input[name="location.pinCode"]',
  landmark: 'input[name="location.landmark"]',
  capacity: 'input[name="capacity"]',
  requirements: 'textarea[name="requirements"]',
  whatToExpect: 'textarea[name="whatToExpect"]',
  tags: 'input[name="tags"]'
}
```

## 🔍 Troubleshooting

### Extension Not Working:
1. Check if you're on a CareConnect page (localhost URL)
2. Refresh the page and try again
3. Check Chrome DevTools Console for error messages
4. Ensure Developer Mode is enabled in chrome://extensions/

### Form Not Filling:
1. Verify you're on the correct form page
2. Check if form field names match the selectors
3. Try refreshing the page and loading the extension again

### Popup Not Opening:
1. Check if extension is enabled in chrome://extensions/
2. Try clicking the extension icon in the toolbar
3. Pin the extension for easier access

## 🛠️ Development

### Adding New Forms:
1. Add demo data object in `content.js`
2. Create new fill function
3. Add message handler for the new action
4. Update popup.html and popup.js with new button

### Modifying Demo Data:
1. Edit the demo data objects in `content.js`
2. Ensure data matches the expected form validation
3. Test on actual forms to verify compatibility

## 📝 License

This extension is created for CareConnect development and testing purposes only.

## ⚠️ Important Notes

- **Development Only**: Intended for development/testing environments
- **Demo Data**: All data is fictional and for demonstration purposes
- **No Production Use**: Not recommended for production environments
- **Local Testing**: Only works with localhost URLs
- **No Data Storage**: Extension doesn't store or transmit user data

## 🎉 Happy Testing!

This extension will make your CareConnect development and presentation process much smoother by eliminating repetitive form filling! 🚀