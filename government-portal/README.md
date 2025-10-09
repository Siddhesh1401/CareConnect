# CareConnect Government Portal

A **standalone** government portal for testing the CareConnect government data access API endpoints with API key authentication.

## Quick Start

### Option 1: Double-click to start (Windows)
Simply double-click `start.bat` to launch the portal

### Option 2: Command line
```bash
npm start
```
or
```bash
node server.mjs
```

Portal will be available at: `http://localhost:8081`

2. **Get Your API Key:**
   - Open CareConnect admin dashboard
   - Navigate to API Admin → Government Access Requests
   - Generate a new API key for your government organization

3. **Test the Portal:**
   - Open the portal in your browser
   - Enter your API key
   - Click "Test Connection" to verify access
   - Browse available data endpoints

## Available API Endpoints

The government portal can access these CareConnect data endpoints:

- `/api/government/test` - Test API key connection
- `/api/government/volunteers` - Get volunteer statistics
- `/api/government/ngos` - Get NGO information
- `/api/government/campaigns` - Get campaign data
- `/api/government/events` - Get event information
- `/api/government/dashboard-stats` - Get overview statistics

## Security Notes

- API keys are sensitive - do not share or commit them to version control
- Keys are displayed only once during generation
- All requests require the `X-API-Key` header
- This portal is for testing purposes only

## Files

- `index.html` - Government portal interface
- `server.mjs` - Simple HTTP server for the portal  
- `package.json` - Node.js project configuration
- `start.bat` - Windows launcher (double-click to run)
- `README.md` - This documentation

## Deployment

This portal is completely independent and can be:
- Copied to any server or computer
- Deployed to cloud platforms
- Shared with government partners
- Run without the main CareConnect project

Just ensure Node.js is installed and the CareConnect API server is accessible.