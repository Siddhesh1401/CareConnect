@echo off
echo Creating CareConnect Desktop Shortcut...

REM Create the batch file
echo @echo off > "CareConnect Launcher.bat"
echo cd /d "%%~dp0" >> "CareConnect Launcher.bat"
echo python careconnect_launcher.py >> "CareConnect Launcher.bat"

REM Create desktop shortcut
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%USERPROFILE%\Desktop\CareConnect Launcher.lnk');$s.TargetPath='%~dp0CareConnect Launcher.bat';$s.WorkingDirectory='%~dp0';$s.IconLocation='%SystemRoot%\System32\SHELL32.dll,13';$s.Save()"

echo.
echo ✅ Desktop shortcut created successfully!
echo Double-click "CareConnect Launcher" on your desktop to start.
pause