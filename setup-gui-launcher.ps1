# CareConnect GUI Launcher Setup Script
# Run this script from your CareConnect project root directory

Write-Host "🚀 Setting up CareConnect GUI Launcher..." -ForegroundColor Green
Write-Host ""

# Get the current directory (should be CareConnect project root)
$projectPath = Get-Location
$launcherPath = Join-Path $projectPath "careconnect_launcher.py"

# Check if we're in the right directory
$packageJsonPath = Join-Path $projectPath "package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "❌ Error: package.json not found in current directory!" -ForegroundColor Red
    Write-Host "Make sure you're running this script from the CareConnect project root." -ForegroundColor Yellow
    Write-Host "Current directory: $projectPath" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if launcher file exists
if (-not (Test-Path $launcherPath)) {
    Write-Host "❌ Error: careconnect_launcher.py not found in current directory!" -ForegroundColor Red
    Write-Host "Make sure the careconnect_launcher.py file is in your project root." -ForegroundColor Yellow
    Write-Host "Expected location: $launcherPath" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if Python is installed
Write-Host "🔍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Python not found!" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org first." -ForegroundColor Yellow
    pause
    exit 1
}

# Install required package
Write-Host ""
Write-Host "📦 Installing required Python package (psutil)..." -ForegroundColor Yellow
try {
    pip install psutil
    Write-Host "✅ psutil installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Failed to install psutil with pip. Trying pip3..." -ForegroundColor Yellow
    try {
        pip3 install psutil
        Write-Host "✅ psutil installed successfully with pip3!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: Could not install psutil." -ForegroundColor Red
        Write-Host "Try running: python -m pip install psutil" -ForegroundColor Yellow
        pause
        exit 1
    }
}

# Create desktop shortcut
Write-Host ""
Write-Host "🔗 Creating desktop shortcut..." -ForegroundColor Yellow

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "CareConnect GUI Launcher.lnk"

try {
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "python"
    $shortcut.Arguments = "`"$launcherPath`""
    $shortcut.WorkingDirectory = $projectPath
    $shortcut.Description = "CareConnect Development Environment Launcher"
    $shortcut.IconLocation = "python.exe,0"
    $shortcut.Save()
    
    Write-Host "✅ Desktop shortcut created successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not create desktop shortcut automatically." -ForegroundColor Yellow
    Write-Host "You can create it manually later." -ForegroundColor Yellow
}

# Test the launcher
Write-Host ""
Write-Host "🧪 Testing the GUI launcher..." -ForegroundColor Yellow
Write-Host "Starting the launcher in test mode..."

try {
    # Start the launcher in background for a quick test
    $testProcess = Start-Process python -ArgumentList "`"$launcherPath`"" -WindowStyle Hidden -PassThru
    Start-Sleep 2
    
    if ($testProcess -and !$testProcess.HasExited) {
        $testProcess.Kill()
        Write-Host "✅ GUI launcher test successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: GUI launcher might have issues." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: Could not test GUI launcher automatically." -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green -BackgroundColor DarkBlue
Write-Host ""
Write-Host "What was installed:" -ForegroundColor Cyan
Write-Host "  ✓ Python package: psutil" -ForegroundColor White
Write-Host "  ✓ Desktop shortcut: CareConnect GUI Launcher" -ForegroundColor White
Write-Host ""
Write-Host "How to use:" -ForegroundColor Cyan
Write-Host "  1. Double-click 'CareConnect GUI Launcher' on your desktop" -ForegroundColor White
Write-Host "  2. Use the GUI to start/stop servers instead of command line" -ForegroundColor White
Write-Host "  3. Enjoy the professional development experience!" -ForegroundColor White
Write-Host ""
Write-Host "Files in your project:" -ForegroundColor Cyan
Write-Host "  • careconnect_launcher.py (main GUI application)" -ForegroundColor White
Write-Host "  • GUI-LAUNCHER-SETUP.md (this setup guide)" -ForegroundColor White
Write-Host ""

# Offer to launch immediately
$launch = Read-Host "Would you like to launch the GUI now? (y/n)"
if ($launch -eq "y" -or $launch -eq "Y" -or $launch -eq "yes") {
    Write-Host ""
    Write-Host "🚀 Launching CareConnect GUI..." -ForegroundColor Green
    python "$launcherPath"
}

Write-Host ""
Write-Host "Setup script completed. Press any key to exit..." -ForegroundColor Gray
pause