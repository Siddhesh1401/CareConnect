# CareConnect GUI Launcher

A minimal development environment manager for CareConnect.

## Features
- 🎛️ Start/Stop both frontend and backend servers
- 🌐 Automatic port detection and browser launch
- 🖥️ Quick actions: Open browser, VS Code, project folder, terminal
- 📊 Real-time log monitoring with clear & cleanup tools
- 🧹 Port cleanup utility to resolve conflicts
- 🎨 Custom icon support (place `careconnect_icon.ico` in this folder)
- 🚀 Clean launch without CMD window interference (uses VBScript wrapper)

## Setup
1. Double-click or run `setup.bat` in this folder.
   - Installs required dependencies (psutil)
   - Creates a desktop shortcut: **CareConnect Launcher**
2. Use the desktop shortcut to launch the GUI.

## Usage
- Click **START BOTH SERVERS** to launch servers in background
- Click **Open Browser** to pick your browser and open the app
- Monitor logs in the System Monitor panel
- Clean ports and restart servers as needed

---
*For advanced setup, see `setup-gui-launcher.ps1` in the project root.*