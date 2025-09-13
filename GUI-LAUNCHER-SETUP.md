# CareConnect GUI Launcher Setup Guide

This guide is for team members who already have the CareConnect project set up and just need to add the new professional GUI launcher.

## Prerequisites
- Existing CareConnect project already working
- Python 3.x installed on your system
- psutil package for Python

## Quick Setup Steps

### 1. Install Required Python Package
```bash
pip install psutil
```

### 2. Copy the GUI Launcher File
Copy the `careconnect_launcher.py` file to your CareConnect project root directory (same folder as package.json).

### 3. Create Desktop Shortcut (Windows)

#### Option A: Automatic Setup Script
Run this PowerShell script (save as `setup-gui-launcher.ps1`):

```powershell
# CareConnect GUI Launcher Setup Script
Write-Host "Setting up CareConnect GUI Launcher..." -ForegroundColor Green

# Get the current directory (should be CareConnect project root)
$projectPath = Get-Location
$launcherPath = Join-Path $projectPath "careconnect_launcher.py"

# Check if launcher file exists
if (-not (Test-Path $launcherPath)) {
    Write-Host "Error: careconnect_launcher.py not found in current directory!" -ForegroundColor Red
    Write-Host "Make sure you're running this script from the CareConnect project root." -ForegroundColor Yellow
    exit 1
}

# Check if Python is installed
try {
    python --version | Out-Null
} catch {
    Write-Host "Error: Python not found! Please install Python first." -ForegroundColor Red
    exit 1
}

# Install required package
Write-Host "Installing required Python package..." -ForegroundColor Yellow
pip install psutil

# Create desktop shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "CareConnect GUI Launcher.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "python"
$shortcut.Arguments = "`"$launcherPath`""
$shortcut.WorkingDirectory = $projectPath
$shortcut.Description = "CareConnect Development Environment Launcher"
$shortcut.Save()

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "Desktop shortcut created: CareConnect GUI Launcher" -ForegroundColor Cyan
Write-Host "You can now double-click the shortcut to start the GUI launcher." -ForegroundColor Cyan
```

#### Option B: Manual Desktop Shortcut Creation
1. Right-click on Desktop → New → Shortcut
2. For location, enter: `python "C:\path\to\your\CareConnect\careconnect_launcher.py"`
3. Replace `C:\path\to\your\CareConnect\` with your actual project path
4. Name it: "CareConnect GUI Launcher"
5. Click Finish

### 4. Using the GUI Launcher

1. Double-click the desktop shortcut
2. The GUI will open with Start/Stop buttons for:
   - Frontend server (Vite)
   - Backend server (Node.js)
   - Both servers together
3. Real-time logs and status monitoring
4. Quick access buttons for:
   - Opening VS Code
   - Opening browser to the app

## Features of the GUI Launcher

- **One-click server management**: Start/stop frontend, backend, or both
- **Real-time monitoring**: Live logs with color coding
- **Status indicators**: See if servers are running
- **Quick access**: Launch VS Code and browser directly
- **Professional interface**: Modern, clean design

## Troubleshooting

### If the shortcut doesn't work:
1. Make sure Python is in your system PATH
2. Verify the project path in the shortcut is correct
3. Try running directly from command line first: `python careconnect_launcher.py`

### If psutil installation fails:
```bash
# Try with pip3
pip3 install psutil

# Or with Python module flag
python -m pip install psutil
```

### If servers don't start:
1. Make sure you're in the correct project directory
2. Verify npm dependencies are installed (`npm install` in both root and backend folders)
3. Check that MongoDB is running
4. Ensure .env file is properly configured in backend folder

## File Structure After Setup
```
CareConnect/
├── careconnect_launcher.py    # ← New GUI launcher file
├── package.json
├── backend/
└── src/
```

## Next Steps
After setup, you can use the GUI launcher instead of command line for all development tasks. The old manual startup methods will still work, but the GUI provides a much more professional experience.