@echo off
echo Installing Python dependency: psutil...
pip install psutil
if %errorlevel% neq 0 (
    echo Failed to install psutil, please install it manually.
)

echo Creating CareConnect Desktop Shortcut...

REM Create the VBScript launcher (no console window)
echo Set objShell = CreateObject^("WScript.Shell"^) > "launch.vbs"
echo objShell.Run "python.exe ""careconnect_launcher.py""", 0, False >> "launch.vbs"

REM Create the batch file
echo @echo off > "CareConnect Launcher.bat"
echo cd /d "%%~dp0" >> "CareConnect Launcher.bat"
echo cscript //nologo launch.vbs >> "CareConnect Launcher.bat"

REM Create desktop shortcut with custom icon
if exist "careconnect_icon.ico" (
    echo Using custom icon: careconnect_icon.ico
    powershell -Command "$shell = New-Object -COM WScript.Shell; $shortcut = $shell.CreateShortcut('%USERPROFILE%\Desktop\CareConnect Launcher.lnk'); $shortcut.TargetPath = '%CD%\launch.vbs'; $shortcut.WorkingDirectory = '%CD%'; $shortcut.IconLocation = '%CD%\careconnect_icon.ico'; $shortcut.Save()"
) else (
    echo Using default system icon
    powershell -Command "$shell = New-Object -COM WScript.Shell; $shortcut = $shell.CreateShortcut('%USERPROFILE%\Desktop\CareConnect Launcher.lnk'); $shortcut.TargetPath = '%CD%\launch.vbs'; $shortcut.WorkingDirectory = '%CD%'; $shortcut.IconLocation = '%SystemRoot%\System32\SHELL32.dll,13'; $shortcut.Save()"
)

echo.
echo ✅ Desktop shortcut created successfully!

echo Clearing icon cache and refreshing desktop...
REM Delete icon cache
del "%LOCALAPPDATA%\IconCache.db" /f /q >nul 2>&1
REM Force system refresh
rundll32.exe user32.dll,UpdatePerUserSystemParameters >nul 2>&1
REM Send F5 to refresh desktop
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{F5}')" >nul 2>&1

echo.
echo 🎉 Setup complete! Your desktop shortcut now shows the custom icon.
echo If icon doesn't appear immediately, press F5 on desktop to refresh.
echo Double-click "CareConnect Launcher" on your desktop to start.
pause