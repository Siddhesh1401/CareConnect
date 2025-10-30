# API Admin Quick Login Button - Implementation Guide

## Overview
Added a highlighted **"API Admin"** button to the Admin Panel header that allows quick switching between Admin and API Admin roles.

## Features

### Button Appearance
- **Location**: Desktop header - next to the Messages button
- **Color**: Gradient from amber to orange (bright, eye-catching)
- **Icon**: Zap icon (⚡) for quick action indicator
- **Style**: Bold, highlighted with shadow effects
- **Mobile**: Full-width button in mobile menu as "Switch to API Admin"

### Functionality
When clicked, the button:
1. **Logs out** the current System Admin user
2. **Automatically logs in** with API Admin credentials:
   - Email: `api-admin@careconnect.com`
   - Password: `apiadmin123`
3. **Redirects** to the API Admin Dashboard (`/admin/api-dashboard`)
4. **Refreshes** the page to apply new role and permissions

### Visual Feedback
- Shows a **loading spinner** while processing (Loader icon + "Loading..." text)
- Button is **disabled** during the login process
- Smooth transitions and hover effects

## Testing Steps

### Desktop Testing
1. Navigate to the Admin Panel (`/admin/dashboard`)
2. Look for the **glowing amber/orange "API Admin"** button in the header (right side, next to Messages)
3. Click the button
4. Watch the loading spinner
5. Verify automatic redirect to API Admin Dashboard
6. Confirm you're now logged in as "API Admin"

### Mobile Testing
1. Open Admin Panel on mobile device
2. Open the mobile menu (hamburger icon)
3. Scroll down to find **"Switch to API Admin"** button (bright orange gradient)
4. Click it
5. Verify redirect to API Admin Dashboard

### Return to Admin
1. From API Admin Dashboard, open the profile menu (top-right)
2. Click "Sign Out"
3. Manually log back in as a System Admin user
4. The "API Admin" button will reappear in the header

## File Changes
- **File**: `src/components/layout/AdminHeader.tsx`
- **Changes**:
  - Added `useNavigate` hook from react-router-dom
  - Added `Zap` and `Loader` icons from lucide-react
  - Added `axios` for direct API calls
  - Added state: `isApiLoginLoading`
  - Added function: `handleQuickApiLogin()`
  - Added button in desktop nav (after Messages)
  - Added button in mobile nav

## Technical Details

### API Credentials Used
```
Email: api-admin@careconnect.com
Password: apiadmin123
```

### Login Endpoint
```
POST {BASE_URL}/api/v1/auth/login
```

### Flow Diagram
```
User clicks "API Admin" button
    ↓
setIsApiLoginLoading(true) - Button shows spinner
    ↓
logout() - Current user session ends
    ↓
axios.post() - Login with API admin credentials
    ↓
Save token & user to localStorage
    ↓
Navigate to /admin/api-dashboard
    ↓
window.location.reload() - Full page refresh
    ↓
API Admin Dashboard loads with new user context
```

## Styling Details
- Button uses Tailwind classes for gradient: `bg-gradient-to-r from-amber-500 to-orange-500`
- Hover state: `hover:from-amber-600 hover:to-orange-600`
- Shadow effects: `shadow-lg hover:shadow-xl`
- Responsive: Hidden on mobile (shown in menu instead)
- Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`

## Environment Variables
The button uses:
- `import.meta.env.VITE_API_URL` - Backend API URL (fallback to `http://localhost:5000`)

Make sure your `.env.local` includes:
```
VITE_API_URL=http://localhost:5000
```

## Troubleshooting

### Button doesn't appear
- Check if you're on the Admin Dashboard
- Ensure you're logged in as a System Admin
- Check browser console for errors

### Login fails
- Verify API server is running on `http://localhost:5000`
- Check that API admin account exists with correct credentials
- Check browser console for error messages

### Doesn't redirect to API Dashboard
- Check if `/admin/api-dashboard` route exists
- Verify Redux/Context state updates correctly
- Check browser console for navigation errors

### Token not persisting
- Ensure localStorage is enabled in browser
- Check if token is saved correctly in localStorage
- Verify token format is correct

## Future Enhancements
1. Add a confirmation modal before switching
2. Add keyboard shortcut (e.g., Ctrl+Shift+A)
3. Add reverse button in API Admin header to switch back
4. Add toast notification for successful switch
5. Remember last used role preference
