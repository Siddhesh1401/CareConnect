import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, simpledialog
import subprocess
import threading
import time
import psutil
import re
import sys
import os
import webbrowser
from pathlib import Path
from datetime import datetime

class ProfessionalCareConnectLauncher:
    def __init__(self):
        # Professional color scheme
        self.colors = {
            'primary': '#2563eb',      # Professional blue
            'secondary': '#7c3aed',    # Professional purple
            'success': '#059669',      # Professional green
            'danger': '#dc2626',       # Professional red
            'warning': '#d97706',      # Professional orange
            'info': '#0891b2',         # Professional cyan
            'background': '#f8fafc',   # Light background
            'surface': '#ffffff',      # White surface
            'card': '#1e293b',         # Card background
            'border': '#e2e8f0',       # Light border
            'text': '#334155',         # Text color
            'text_light': '#64748b',   # Light text
            'white': '#ffffff',
            'accent': '#3b82f6',       # Accent blue
        }

        self.root = tk.Tk()
        self.root.title("CareConnect Development Suite")
        
        # Start maximized with professional styling
        self.root.state('zoomed')
        self.root.resizable(True, True)
        self.root.configure(bg=self.colors['background'])
        
        # Server process tracking
        self.frontend_process = None
        self.backend_process = None
        self.both_servers_process = None
        self.servers_running = False
        self.detected_frontend_port = None  # Store detected port
        self.detected_backend_port = 5000   # Default backend port
        
        # Project paths
        self.project_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.backend_path = os.path.join(self.project_path, "backend")
        
        # Browser options
        self.browser_options = {
            'Default Browser': '',
            'Google Chrome': 'chrome',
            'Mozilla Firefox': 'firefox',
            'Microsoft Edge': 'edge',
            'Opera': 'opera',
            'Brave Browser': 'brave',
            'Safari': 'safari'
        }
        
        # Status variables
        self.frontend_status = tk.StringVar(value="●")
        self.backend_status = tk.StringVar(value="●")
        
        # Create the professional UI
        self.create_professional_ui()
        
        # Start monitoring
        self.monitor_servers()
        
        # Handle window closing
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
        # Bind F11 key to toggle maximized state
        self.root.bind('<F11>', lambda e: self.toggle_maximized())

    def create_professional_ui(self):
        """Create the professional user interface"""
        # Main container with professional styling
        main_container = tk.Frame(self.root, bg=self.colors['background'], padx=30, pady=30)
        main_container.pack(fill=tk.BOTH, expand=True)

        # Professional header
        self.create_professional_header(main_container)

        # Content area with clean layout
        content_frame = tk.Frame(main_container, bg=self.colors['background'])
        content_frame.pack(fill=tk.BOTH, expand=True, pady=(25, 0))

        # Three-column layout for better organization
        left_panel = tk.Frame(content_frame, bg=self.colors['background'], width=350)
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))
        left_panel.pack_propagate(False)
        
        center_panel = tk.Frame(content_frame, bg=self.colors['background'], width=300)
        center_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))
        center_panel.pack_propagate(False)
        
        right_panel = tk.Frame(content_frame, bg=self.colors['background'])
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Create professional sections
        self.create_server_control_panel(left_panel)
        self.create_quick_actions_panel(center_panel)
        self.create_system_monitor_panel(right_panel)

    def create_professional_header(self, parent):
        """Create a clean professional header"""
        header_frame = tk.Frame(parent, bg=self.colors['surface'], relief='solid', bd=1)
        header_frame.pack(fill=tk.X, pady=(0, 25))
        
        # Header content with proper padding
        header_content = tk.Frame(header_frame, bg=self.colors['surface'], padx=25, pady=20)
        header_content.pack(fill=tk.X)
        
        # Title section
        title_frame = tk.Frame(header_content, bg=self.colors['surface'])
        title_frame.pack(fill=tk.X)
        
        # Main title
        title_label = tk.Label(title_frame, text="CareConnect Development Suite",
                              font=('Segoe UI', 24, 'bold'), fg=self.colors['text'],
                              bg=self.colors['surface'])
        title_label.pack(anchor=tk.W)
        
        # Subtitle
        subtitle_label = tk.Label(title_frame, text="Professional Development Environment Manager",
                                 font=('Segoe UI', 12), fg=self.colors['text_light'],
                                 bg=self.colors['surface'])
        subtitle_label.pack(anchor=tk.W, pady=(5, 0))
        
        # Status bar
        status_frame = tk.Frame(header_content, bg=self.colors['surface'])
        status_frame.pack(fill=tk.X, pady=(20, 0))
        
        # Left side - Status indicators
        status_left = tk.Frame(status_frame, bg=self.colors['surface'])
        status_left.pack(side=tk.LEFT)
        
        # Frontend status
        frontend_frame = tk.Frame(status_left, bg=self.colors['surface'])
        frontend_frame.pack(side=tk.LEFT, padx=(0, 40))
        
        tk.Label(frontend_frame, text="Frontend", font=('Segoe UI', 11, 'bold'),
                fg=self.colors['text'], bg=self.colors['surface']).pack(side=tk.LEFT)
        self.frontend_indicator = tk.Label(frontend_frame, textvariable=self.frontend_status,
                                         fg=self.colors['danger'], font=('Segoe UI', 14, 'bold'),
                                         bg=self.colors['surface'])
        self.frontend_indicator.pack(side=tk.LEFT, padx=(10, 0))
        
        # Backend status
        backend_frame = tk.Frame(status_left, bg=self.colors['surface'])
        backend_frame.pack(side=tk.LEFT)
        
        tk.Label(backend_frame, text="Backend", font=('Segoe UI', 11, 'bold'),
                fg=self.colors['text'], bg=self.colors['surface']).pack(side=tk.LEFT)
        self.backend_indicator = tk.Label(backend_frame, textvariable=self.backend_status,
                                        fg=self.colors['danger'], font=('Segoe UI', 14, 'bold'),
                                        bg=self.colors['surface'])
        self.backend_indicator.pack(side=tk.LEFT, padx=(10, 0))

    def create_server_control_panel(self, parent):
        """Create professional server control panel"""
        # Panel frame
        panel_frame = tk.Frame(parent, bg=self.colors['surface'], relief='solid', bd=1)
        panel_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Panel header
        header = tk.Frame(panel_frame, bg=self.colors['primary'], height=40)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        
        tk.Label(header, text="Server Management", font=('Segoe UI', 12, 'bold'),
                fg='white', bg=self.colors['primary']).pack(expand=True)
        
        # Panel content
        content = tk.Frame(panel_frame, bg=self.colors['surface'], padx=20, pady=20)
        content.pack(fill=tk.X)
        
        # Main action buttons
        self.start_both_btn = tk.Button(content, text="▶ START BOTH SERVERS",
                                       command=self.start_both_servers,
                                       font=('Segoe UI', 11, 'bold'),
                                       bg=self.colors['success'], fg='white',
                                       relief='flat', borderwidth=0,
                                       padx=20, pady=12, cursor='hand2')
        self.start_both_btn.pack(fill=tk.X, pady=(0, 10))
        
        self.stop_all_btn = tk.Button(content, text="⏹ STOP ALL SERVERS",
                                     command=self.stop_both_servers,
                                     font=('Segoe UI', 11, 'bold'),
                                     bg=self.colors['danger'], fg='white',
                                     relief='flat', borderwidth=0,
                                     padx=20, pady=12, cursor='hand2')
        self.stop_all_btn.pack(fill=tk.X, pady=(0, 15))
        
        # Individual controls
        controls_frame = tk.Frame(content, bg=self.colors['surface'])
        controls_frame.pack(fill=tk.X)
        
        # Frontend controls
        frontend_row = tk.Frame(controls_frame, bg=self.colors['surface'])
        frontend_row.pack(fill=tk.X, pady=(0, 8))
        
        self.start_frontend_btn = tk.Button(frontend_row, text="Start Frontend",
                                           command=self.start_frontend,
                                           font=('Segoe UI', 10),
                                           bg=self.colors['info'], fg='white',
                                           relief='flat', borderwidth=0,
                                           padx=15, pady=8, cursor='hand2')
        self.start_frontend_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        
        # Backend controls
        backend_row = tk.Frame(controls_frame, bg=self.colors['surface'])
        backend_row.pack(fill=tk.X, pady=(0, 8))
        
        self.start_backend_btn = tk.Button(backend_row, text="Start Backend",
                                          command=self.start_backend,
                                          font=('Segoe UI', 10),
                                          bg=self.colors['secondary'], fg='white',
                                          relief='flat', borderwidth=0,
                                          padx=15, pady=8, cursor='hand2')
        self.start_backend_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        
        # Restart all
        self.restart_btn = tk.Button(content, text="🔄 RESTART ALL",
                                    command=self.restart_all_servers,
                                    font=('Segoe UI', 10, 'bold'),
                                    bg=self.colors['warning'], fg='white',
                                    relief='flat', borderwidth=0,
                                    padx=20, pady=10, cursor='hand2')
        self.restart_btn.pack(fill=tk.X, pady=(10, 0))
        
        # Clean ports button
        self.clean_ports_btn = tk.Button(content, text="🧹 CLEAN PORTS",
                                        command=self.cleanup_port_processes,
                                        font=('Segoe UI', 9),
                                        bg=self.colors['text_light'], fg='white',
                                        relief='flat', borderwidth=0,
                                        padx=20, pady=8, cursor='hand2')
        self.clean_ports_btn.pack(fill=tk.X, pady=(5, 0))

    def create_quick_actions_panel(self, parent):
        """Create professional quick actions panel"""
        panel_frame = tk.Frame(parent, bg=self.colors['surface'], relief='solid', bd=1)
        panel_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Panel header
        header = tk.Frame(panel_frame, bg=self.colors['info'], height=40)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        
        tk.Label(header, text="Quick Actions", font=('Segoe UI', 12, 'bold'),
                fg='white', bg=self.colors['info']).pack(expand=True)
        
        # Panel content
        content = tk.Frame(panel_frame, bg=self.colors['surface'], padx=20, pady=20)
        content.pack(fill=tk.X)
        
        # Quick action buttons
        self.browser_btn = tk.Button(content, text="🌐 Open Browser",
                                    command=self.open_browser,
                                    font=('Segoe UI', 11),
                                    bg=self.colors['info'], fg='white',
                                    relief='flat', borderwidth=0,
                                    padx=20, pady=12, cursor='hand2')
        self.browser_btn.pack(fill=tk.X, pady=(0, 8))
        
        self.vscode_btn = tk.Button(content, text="💻 Open VS Code",
                                   command=self.open_vscode,
                                   font=('Segoe UI', 11),
                                   bg=self.colors['secondary'], fg='white',
                                   relief='flat', borderwidth=0,
                                   padx=20, pady=12, cursor='hand2')
        self.vscode_btn.pack(fill=tk.X, pady=(0, 8))
        
        self.folder_btn = tk.Button(content, text="📁 Open Folder",
                                   command=self.open_folder,
                                   font=('Segoe UI', 11),
                                   bg=self.colors['warning'], fg='white',
                                   relief='flat', borderwidth=0,
                                   padx=20, pady=12, cursor='hand2')
        self.folder_btn.pack(fill=tk.X, pady=(0, 8))
        
        self.terminal_btn = tk.Button(content, text="🖥️ Open Terminal",
                                     command=self.open_terminal,
                                     font=('Segoe UI', 11),
                                     bg=self.colors['success'], fg='white',
                                     relief='flat', borderwidth=0,
                                     padx=20, pady=12, cursor='hand2')
        self.terminal_btn.pack(fill=tk.X)

    def create_system_monitor_panel(self, parent):
        """Create professional system monitor panel"""
        panel_frame = tk.Frame(parent, bg=self.colors['surface'], relief='solid', bd=1)
        panel_frame.pack(fill=tk.BOTH, expand=True)
        
        # Panel header
        header = tk.Frame(panel_frame, bg=self.colors['accent'])
        header.pack(fill=tk.X)
        
        header_content = tk.Frame(header, bg=self.colors['accent'])
        header_content.pack(fill=tk.X, padx=20, pady=12)
        
        tk.Label(header_content, text="System Monitor", font=('Segoe UI', 12, 'bold'),
                fg='white', bg=self.colors['accent']).pack(side=tk.LEFT)
        
        # Clear logs button
        clear_btn = tk.Button(header_content, text="Clear Logs",
                             command=self.clear_logs,
                             font=('Segoe UI', 9),
                             bg=self.colors['danger'], fg='white',
                             relief='flat', borderwidth=0,
                             padx=12, pady=6, cursor='hand2')
        clear_btn.pack(side=tk.RIGHT)
        
        # Log content
        log_frame = tk.Frame(panel_frame, bg=self.colors['surface'], padx=15, pady=15)
        log_frame.pack(fill=tk.BOTH, expand=True)
        
        # Log text area with professional styling
        self.log_text = scrolledtext.ScrolledText(log_frame,
                                                 font=('Consolas', 10),
                                                 bg='#1e1e1e', fg='#d4d4d4',
                                                 insertbackground='white',
                                                 relief='flat', borderwidth=0,
                                                 wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # Configure log colors for different message types
        self.log_text.tag_configure("success", foreground="#4ade80")
        self.log_text.tag_configure("error", foreground="#f87171")
        self.log_text.tag_configure("info", foreground="#60a5fa")
        self.log_text.tag_configure("warning", foreground="#fbbf24")
        self.log_text.tag_configure("timestamp", foreground="#94a3b8")

    # Server control methods
    def start_both_servers(self):
        """Start both frontend and backend servers"""
        self.log_message("Starting both servers...", "info")
        try:
            # Use the concurrently script from package.json - run in background
            self.log_message("Using concurrently to start both servers...", "info")
            self.both_servers_process = subprocess.Popen(
                ["cmd", "/c", "npm", "run", "dev"],
                cwd=self.project_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NO_WINDOW  # Run in background
            )
            self.log_message("Both servers started successfully", "success")
            
            # Start a thread to monitor output
            threading.Thread(target=self.monitor_process_output, 
                           args=(self.both_servers_process, "Both Servers"), 
                           daemon=True).start()
            
        except Exception as e:
            self.log_message(f"Failed to start both servers, trying individually: {str(e)}", "warning")
            # Fallback to starting individually
            self.start_frontend()
            time.sleep(1)
            self.start_backend()

    def start_frontend(self):
        """Start the frontend development server"""
        if self.frontend_process and self.frontend_process.poll() is None:
            self.log_message("Frontend server already running", "warning")
            return

        try:
            self.log_message("Starting frontend server...", "info")
            # Run in background without separate window
            self.frontend_process = subprocess.Popen(
                ["cmd", "/c", "npm", "run", "dev:frontend"],
                cwd=self.project_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NO_WINDOW  # Run in background
            )
            self.log_message("Frontend server started successfully", "success")
            
            # Start a thread to monitor output
            threading.Thread(target=self.monitor_process_output, 
                           args=(self.frontend_process, "Frontend"), 
                           daemon=True).start()
            
        except Exception as e:
            self.log_message(f"Failed to start frontend: {str(e)}", "error")

    def start_backend(self):
        """Start the backend server"""
        if self.backend_process and self.backend_process.poll() is None:
            self.log_message("Backend server already running", "warning")
            return

        try:
            self.log_message("Starting backend server...", "info")
            # Run in background without separate window
            self.backend_process = subprocess.Popen(
                ["cmd", "/c", "npm", "run", "dev"],
                cwd=self.backend_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NO_WINDOW  # Run in background
            )
            self.log_message("Backend server started successfully", "success")
            
            # Start a thread to monitor output
            threading.Thread(target=self.monitor_process_output, 
                           args=(self.backend_process, "Backend"), 
                           daemon=True).start()
            
        except Exception as e:
            self.log_message(f"Failed to start backend: {str(e)}", "error")

    def stop_both_servers(self):
        """Stop both servers"""
        self.log_message("Stopping all servers...", "info")
        
        # Stop the combined process if it exists
        if self.both_servers_process:
            try:
                # Try graceful termination first
                self.both_servers_process.terminate()
                # Wait a bit for graceful shutdown
                try:
                    self.both_servers_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # Force kill if graceful shutdown fails
                    self.both_servers_process.kill()
                self.both_servers_process = None
                self.log_message("Combined server process stopped", "success")
            except Exception as e:
                self.log_message(f"Error stopping combined process: {str(e)}", "error")
        
        # Stop individual processes if they exist
        if self.frontend_process:
            try:
                self.frontend_process.terminate()
                try:
                    self.frontend_process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    self.frontend_process.kill()
                self.frontend_process = None
                self.log_message("Frontend server stopped", "success")
            except Exception as e:
                self.log_message(f"Error stopping frontend: {str(e)}", "error")
        
        if self.backend_process:
            try:
                self.backend_process.terminate()
                try:
                    self.backend_process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    self.backend_process.kill()
                self.backend_process = None
                self.log_message("Backend server stopped", "success")
            except Exception as e:
                self.log_message(f"Error stopping backend: {str(e)}", "error")
        
        # Kill any remaining node processes on common ports
        self.cleanup_port_processes()

    def cleanup_port_processes(self):
        """Clean up any remaining processes on development ports"""
        try:
            ports_to_clean = [5000, 5173, 5174, 5175, 5176, 5177, 3000]
            for port in ports_to_clean:
                for conn in psutil.net_connections():
                    if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
                        try:
                            process = psutil.Process(conn.pid)
                            if 'node' in process.name().lower() or 'npm' in process.name().lower():
                                process.terminate()
                                self.log_message(f"Cleaned up process on port {port}", "info")
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            pass
        except Exception as e:
            self.log_message(f"Error during port cleanup: {str(e)}", "warning")

    def monitor_process_output(self, process, name):
        """Monitor process output and log it"""
        try:
            while process.poll() is None:
                output = process.stdout.readline()
                if output:
                    line = output.decode().strip()
                    if line:
                        self.log_message(f"[{name}] {line}", "info")
                        
                        # Parse frontend port from Vite output - improved regex
                        if "Local:" in line and "localhost:" in line:
                            import re
                            self.log_message(f"DEBUG: Processing Vite line: {line}", "info")

                            # Match various Vite output formats
                            port_patterns = [
                                r'localhost:(\d+)',  # Basic format
                                r'localhost:(?:\[1m)?(\d+)(?:\[22m)?',  # Colored format
                                r'http://localhost:(\d+)',  # Full URL format
                            ]

                            for pattern in port_patterns:
                                port_match = re.search(pattern, line)
                                if port_match:
                                    detected_port = int(port_match.group(1))
                                    self.log_message(f"DEBUG: Regex matched port {detected_port} using pattern: {pattern}", "info")

                                    # Always update for Vite ports (they take priority)
                                    if detected_port in [5173, 5174, 5175, 5176, 5177]:
                                        self.detected_frontend_port = detected_port
                                        self.log_message(f"Detected Vite frontend port: {self.detected_frontend_port}", "success")
                                        break
                                    else:
                                        self.log_message(f"DEBUG: Port {detected_port} is not a Vite port, ignoring", "info")
                        
                        # Parse backend port from server output
                        elif "Server running on http://localhost:" in line:
                            import re
                            port_match = re.search(r'http://localhost:(\d+)', line)
                            if port_match:
                                self.detected_backend_port = int(port_match.group(1))
                                self.log_message(f"Detected backend port: {self.detected_backend_port}", "success")
                        
                        # Handle port conflicts
                        elif "EADDRINUSE" in line or "address already in use" in line:
                            self.log_message(f"Port conflict detected in {name}", "error")
                            
                time.sleep(0.1)
        except Exception as e:
            self.log_message(f"Error monitoring {name}: {str(e)}", "error")

    def restart_all_servers(self):
        """Restart all servers"""
        self.log_message("Restarting all servers...", "info")
        self.stop_both_servers()
        time.sleep(2)
        self.start_both_servers()

    # Quick action methods
    def open_browser(self):
        """Open browser selection dialog"""
        try:
            # Show browser selection dialog (handles everything internally)
            self.show_browser_selection_dialog()
        except Exception as e:
            self.log_message(f"Error opening browser dialog: {str(e)}", "error")

    def get_frontend_url(self):
        """Detect which port the frontend server is actually running on"""
        self.log_message(f"DEBUG: Current detected_frontend_port = {self.detected_frontend_port}", "info")

        # Reset port detection if it's not a Vite port (to allow Vite detection to work)
        if self.detected_frontend_port and self.detected_frontend_port not in [5173, 5174, 5175, 5176, 5177]:
            self.log_message(f"DEBUG: Resetting non-Vite port {self.detected_frontend_port} to allow Vite detection", "info")
            self.detected_frontend_port = None

        # First priority: use detected port from server logs (most reliable)
        if self.detected_frontend_port:
            self.log_message(f"Using detected frontend port from Vite logs: {self.detected_frontend_port}", "info")
            return f"http://localhost:{self.detected_frontend_port}"

        # Wait a moment for server logs to be processed
        import time
        time.sleep(0.5)

        # Check again after waiting
        if self.detected_frontend_port:
            self.log_message(f"Using detected frontend port after wait: {self.detected_frontend_port}", "info")
            return f"http://localhost:{self.detected_frontend_port}"

        # Second priority: scan for Vite-specific ports first (5173-5177 are common Vite ports)
        self.log_message("Scanning for Vite frontend ports (5173-5177)...", "info")
        vite_ports = [5173, 5174, 5175, 5176, 5177]  # Vite default ports

        for port in vite_ports:
            if self.is_port_in_use(port):
                self.log_message(f"Found Vite server on port: {port}", "success")
                self.detected_frontend_port = port  # Cache the detected port
                return f"http://localhost:{port}"

        # Third priority: check other common development ports
        self.log_message("Checking other development ports (3000, 8080)...", "info")
        other_dev_ports = [3000, 3001, 8080, 4000]
        for port in other_dev_ports:
            if self.is_port_in_use(port):
                self.log_message(f"Found active development port: {port}", "info")
                self.detected_frontend_port = port  # Cache the detected port
                return f"http://localhost:{port}"

        # Final fallback: default Vite port
        self.log_message("No active frontend port found, using Vite default 5173", "warning")
        return "http://localhost:5173"

    def show_browser_selection_dialog(self):
        """Show enhanced browser selection dialog with icons and better styling"""
        dialog = tk.Toplevel(self.root)
        dialog.title("Select Browser")
        dialog.geometry("700x600")  # Increased size for 2-column layout
        dialog.configure(bg=self.colors['surface'])
        dialog.resizable(False, False)

        # Center the dialog on screen
        dialog.transient(self.root)
        dialog.grab_set()

        # Center the dialog window
        dialog.update_idletasks()
        width = dialog.winfo_width()
        height = dialog.winfo_height()
        x = (dialog.winfo_screenwidth() // 2) - (width // 2)
        y = (dialog.winfo_screenheight() // 2) - (height // 2)
        dialog.geometry(f'+{x}+{y}')

        # Main container with padding
        main_frame = tk.Frame(dialog, bg=self.colors['surface'], padx=30, pady=25)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Header section
        header_frame = tk.Frame(main_frame, bg=self.colors['surface'])
        header_frame.pack(fill=tk.X, pady=(0, 25))

        # Icon and title
        title_frame = tk.Frame(header_frame, bg=self.colors['surface'])
        title_frame.pack()

        # Browser icon (using emoji)
        icon_label = tk.Label(title_frame, text="🌐", font=('Segoe UI', 32),
                             bg=self.colors['surface'])
        icon_label.pack(side=tk.LEFT, padx=(0, 15))

        # Title and subtitle
        text_frame = tk.Frame(title_frame, bg=self.colors['surface'])
        text_frame.pack(side=tk.LEFT)

        title_label = tk.Label(text_frame, text="Choose Your Browser",
                              font=('Segoe UI', 18, 'bold'),
                              fg=self.colors['text'], bg=self.colors['surface'])
        title_label.pack(anchor=tk.W)

        subtitle_label = tk.Label(text_frame, text="Click on any browser to open CareConnect immediately",
                                 font=('Segoe UI', 11),
                                 fg=self.colors['text_light'], bg=self.colors['surface'])
        subtitle_label.pack(anchor=tk.W, pady=(3, 0))

        # Browser options with enhanced styling
        browser_var = tk.StringVar(value="Default Browser")

        browsers = [
            {"name": "Default Browser", "icon": "🏠", "description": "Use system default browser"},
            {"name": "Google Chrome", "icon": "🔵", "description": "Fast and reliable browsing"},
            {"name": "Mozilla Firefox", "icon": "🦊", "description": "Privacy-focused browser"},
            {"name": "Microsoft Edge", "icon": "💙", "description": "Modern Windows browser"},
            {"name": "Opera", "icon": "🔴", "description": "Feature-rich browser"},
            {"name": "Brave Browser", "icon": "🛡️", "description": "Privacy and speed focused"}
        ]

        # Options container with 2-column layout
        options_frame = tk.Frame(main_frame, bg=self.colors['surface'])
        options_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 25))

        # Create two columns
        left_column = tk.Frame(options_frame, bg=self.colors['surface'])
        left_column.pack(side=tk.LEFT, fill=tk.Y, expand=True, padx=(0, 15))

        right_column = tk.Frame(options_frame, bg=self.colors['surface'])
        right_column.pack(side=tk.RIGHT, fill=tk.Y, expand=True, padx=(15, 0))

        # Split browsers into two columns (3 each)
        left_browsers = browsers[:3]
        right_browsers = browsers[3:]

        # Get the frontend URL for browser opening
        url = self.get_frontend_url()

        # Function to open selected browser
        def open_selected_browser(browser_name):
            if browser_name == "Default Browser":
                webbrowser.open(url)
                self.log_message(f"Opening {url} in default browser", "success")
            else:
                # Try to open with specific browser
                browser_commands = {
                    'Google Chrome': [
                        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
                        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
                        'chrome'
                    ],
                    'Mozilla Firefox': [
                        r'C:\Program Files\Mozilla Firefox\firefox.exe',
                        r'C:\Program Files (x86)\Mozilla Firefox\firefox.exe',
                        'firefox'
                    ],
                    'Microsoft Edge': [
                        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
                        r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
                        'msedge'
                    ],
                    'Opera': [
                        f'C:\\Users\\{os.getenv("USERNAME")}\\AppData\\Local\\Programs\\Opera\\opera.exe',
                        r'C:\Program Files\Opera\opera.exe',
                        r'C:\Program Files (x86)\Opera\opera.exe',
                        'opera'
                    ],
                    'Brave Browser': [
                        r'C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe',
                        r'C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe',
                        'brave'
                    ]
                }

                browser_paths = browser_commands.get(browser_name, [])
                browser_opened = False

                for browser_path in browser_paths:
                    try:
                        if os.path.exists(browser_path):
                            subprocess.Popen([browser_path, url])
                            browser_opened = True
                            self.log_message(f"Opening {url} in {browser_name}", "success")
                            break
                    except Exception as e:
                        continue

                if not browser_opened:
                    # Try shell execution as fallback
                    try:
                        # For Opera, try additional paths
                        if browser_name == "Opera":
                            opera_paths = [
                                f'C:\\Users\\{os.getenv("USERNAME")}\\AppData\\Local\\Programs\\Opera\\launcher.exe',
                                f'C:\\Users\\{os.getenv("USERNAME")}\\AppData\\Local\\Programs\\Opera GX\\opera.exe'
                            ]
                            for opera_path in opera_paths:
                                if os.path.exists(opera_path):
                                    subprocess.Popen([opera_path, url])
                                    browser_opened = True
                                    self.log_message(f"Opening {url} in {browser_name}", "success")
                                    break

                        if not browser_opened:
                            # Final fallback: try to open via registry/shell association
                            webbrowser.get().open(url)
                            browser_opened = True
                            self.log_message(f"Opening {url} in {browser_name} (via system)", "success")
                    except:
                        pass

                if not browser_opened:
                    # Ultimate fallback to default browser
                    webbrowser.open(url)
                    self.log_message(f"Could not find {browser_name}, opened in default browser", "warning")

            self.log_message("If the page doesn't load, make sure the frontend server is running", "info")

        # Function to create browser option
        def create_browser_option(parent, browser):
            # Browser option frame
            option_frame = tk.Frame(parent, bg=self.colors['background'],
                                   relief='solid', bd=1, padx=15, pady=12, cursor='hand2')
            option_frame.pack(fill=tk.X, pady=(0, 10))

            # Make the entire frame clickable
            def on_browser_click():
                # Set the selected browser
                browser_var.set(browser["name"])
                # Open the browser immediately
                open_selected_browser(browser["name"])
                # Close the dialog
                dialog.destroy()

            # Bind click event to the entire frame
            option_frame.bind('<Button-1>', lambda e: on_browser_click())

            # Radio button and content
            radio_frame = tk.Frame(option_frame, bg=self.colors['background'])
            radio_frame.pack(fill=tk.X)

            # Radio button
            radio = tk.Radiobutton(radio_frame, variable=browser_var, value=browser["name"],
                                  bg=self.colors['background'], selectcolor=self.colors['primary'],
                                  activebackground=self.colors['background'],
                                  command=lambda: on_browser_click())
            radio.pack(side=tk.LEFT, padx=(0, 15))

            # Browser icon
            icon_label = tk.Label(radio_frame, text=browser["icon"], font=('Segoe UI', 20),
                                 bg=self.colors['background'], cursor='hand2')
            icon_label.pack(side=tk.LEFT, padx=(0, 12))
            icon_label.bind('<Button-1>', lambda e: on_browser_click())

            # Browser info
            info_frame = tk.Frame(radio_frame, bg=self.colors['background'], cursor='hand2')
            info_frame.pack(side=tk.LEFT, fill=tk.X, expand=True)
            info_frame.bind('<Button-1>', lambda e: on_browser_click())

            # Browser name
            name_label = tk.Label(info_frame, text=browser["name"],
                                 font=('Segoe UI', 12, 'bold'),
                                 fg=self.colors['text'], bg=self.colors['background'], cursor='hand2')
            name_label.pack(anchor=tk.W)
            name_label.bind('<Button-1>', lambda e: on_browser_click())

            # Browser description
            desc_label = tk.Label(info_frame, text=browser["description"],
                                 font=('Segoe UI', 10),
                                 fg=self.colors['text_light'], bg=self.colors['background'], cursor='hand2')
            desc_label.pack(anchor=tk.W, pady=(2, 0))
            desc_label.bind('<Button-1>', lambda e: on_browser_click())

        # Create browser options in left column
        for browser in left_browsers:
            create_browser_option(left_column, browser)

        # Create browser options in right column
        for browser in right_browsers:
            create_browser_option(right_column, browser)

        # Footer with buttons
        footer_frame = tk.Frame(main_frame, bg=self.colors['surface'])
        footer_frame.pack(fill=tk.X, pady=(15, 0))

        # Separator line
        separator = tk.Frame(footer_frame, height=1, bg=self.colors['text_light'])
        separator.pack(fill=tk.X, pady=(0, 20))

        # Instructions text
        instructions_label = tk.Label(footer_frame, text="💡 Click on any browser above to open CareConnect",
                                     font=('Segoe UI', 10),
                                     fg=self.colors['text_light'], bg=self.colors['surface'])
        instructions_label.pack(pady=(0, 15))

        # Button container
        button_frame = tk.Frame(footer_frame, bg=self.colors['surface'])
        button_frame.pack()

        result = {'choice': None}

        def on_cancel():
            result['choice'] = None
            dialog.destroy()

        # Cancel button (centered)
        cancel_btn = tk.Button(button_frame, text="❌ Cancel",
                              command=on_cancel,
                              font=('Segoe UI', 11),
                              bg=self.colors['text_light'], fg='white',
                              relief='flat', borderwidth=0,
                              padx=25, pady=10, cursor='hand2')
        cancel_btn.pack()

        # Bind Escape key to cancel
        dialog.bind('<Escape>', lambda e: on_cancel())

        # Focus on cancel button
        cancel_btn.focus_set()

        # Wait for dialog to close
        dialog.wait_window()
        return result['choice']

    def open_vscode(self):
        """Open VS Code in the current project"""
        try:
            # Try different methods to open VS Code
            vscode_opened = False
            
            # Method 1: Try 'code' command (if in PATH)
            try:
                subprocess.Popen(["code", "."], cwd=self.project_path)
                vscode_opened = True
                self.log_message("Opening VS Code...", "success")
            except:
                pass
            
            if not vscode_opened:
                # Method 2: Try common VS Code installation paths
                vscode_paths = [
                    r"C:\Users\{}\AppData\Local\Programs\Microsoft VS Code\Code.exe".format(os.getenv("USERNAME")),
                    r"C:\Program Files\Microsoft VS Code\Code.exe",
                    r"C:\Program Files (x86)\Microsoft VS Code\Code.exe",
                    r"C:\Program Files\Microsoft VS Code\bin\code.cmd",
                    r"C:\Program Files (x86)\Microsoft VS Code\bin\code.cmd"
                ]
                
                for vscode_path in vscode_paths:
                    if os.path.exists(vscode_path):
                        try:
                            subprocess.Popen([vscode_path, "."], cwd=self.project_path)
                            vscode_opened = True
                            self.log_message("Opening VS Code...", "success")
                            break
                        except Exception as e:
                            continue
                
                if not vscode_opened:
                    # Method 3: Try to open via Windows start command
                    try:
                        subprocess.Popen(["cmd", "/c", "start", "code", "."], cwd=self.project_path)
                        vscode_opened = True
                        self.log_message("Opening VS Code...", "success")
                    except:
                        pass
                
                if not vscode_opened:
                    # Method 4: Check if VS Code is installed via registry (advanced)
                    try:
                        import winreg
                        key = winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, r"vscode\shell\open\command")
                        vscode_cmd = winreg.QueryValue(key, None)
                        if vscode_cmd:
                            # Extract the executable path from the command
                            exe_path = vscode_cmd.split('"')[1] if '"' in vscode_cmd else vscode_cmd.split()[0]
                            if os.path.exists(exe_path):
                                subprocess.Popen([exe_path, "."], cwd=self.project_path)
                                vscode_opened = True
                                self.log_message("Opening VS Code...", "success")
                    except:
                        pass
            
            if not vscode_opened:
                # If all methods fail, show helpful error message
                error_msg = ("VS Code not found. Please:\n"
                            "1. Install VS Code from https://code.visualstudio.com\n"
                            "2. Make sure 'code' command is in PATH\n"
                            "3. Or use 'Open Folder' to open in File Explorer")
                self.show_custom_message_dialog("VS Code Not Found", error_msg, "warning")
                self.log_message("VS Code not found - see popup for installation instructions", "warning")
                
        except Exception as e:
            self.log_message(f"Error opening VS Code: {str(e)}", "error")
            # Show user-friendly error message
            error_msg = f"Could not open VS Code:\n{str(e)}\n\nTry installing VS Code or check if it's in your PATH."
            self.show_custom_message_dialog("VS Code Error", error_msg, "error")

    def open_folder(self):
        """Open the project folder in Windows Explorer"""
        try:
            subprocess.run(['explorer', self.project_path], check=True)
            self.log_message("Opening project folder...", "success")
        except Exception as e:
            self.log_message(f"Error opening folder: {str(e)}", "error")

    def open_terminal(self):
        """Open PowerShell terminal in project directory"""
        try:
            subprocess.run(['powershell', '-NoExit', '-Command', f'cd "{self.project_path}"'], check=True)
            self.log_message("Opening PowerShell terminal...", "success")
        except Exception as e:
            self.log_message(f"Error opening terminal: {str(e)}", "error")

    # Utility methods
    def log_message(self, message, level="info"):
        """Add a message to the log with color coding"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        self.log_text.insert(tk.END, f"[{timestamp}] ", "timestamp")
        self.log_text.insert(tk.END, f"{message}\n", level)
        self.log_text.see(tk.END)
        self.root.update_idletasks()

    def clear_logs(self):
        """Clear the log text area"""
        self.log_text.delete(1.0, tk.END)
        self.log_message("Logs cleared", "info")

    def is_port_in_use(self, port):
        """Check if a port is in use"""
        try:
            for conn in psutil.net_connections():
                if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
                    return True
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            # Fallback: try to connect to the port
            import socket
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                return result == 0
            except:
                pass
        return False

    def update_status_indicators(self):
        """Update server status indicators"""
        frontend_running = self.is_port_in_use(5173) or self.is_port_in_use(5174)
        backend_running = self.is_port_in_use(5000)
        
        # Update frontend indicator
        if frontend_running:
            self.frontend_indicator.config(fg=self.colors['success'])
            self.frontend_status.set("●")
        else:
            self.frontend_indicator.config(fg=self.colors['danger'])
            self.frontend_status.set("●")
        
        # Update backend indicator
        if backend_running:
            self.backend_indicator.config(fg=self.colors['success'])
            self.backend_status.set("●")
        else:
            self.backend_indicator.config(fg=self.colors['danger'])
            self.backend_status.set("●")

    def monitor_servers(self):
        """Monitor server status periodically"""
        def monitor():
            while True:
                self.update_status_indicators()
                time.sleep(2)
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()

    def toggle_maximized(self):
        """Toggle maximized state"""
        if self.root.state() == 'zoomed':
            self.root.state('normal')
        else:
            self.root.state('zoomed')

    def on_closing(self):
        """Handle window closing"""
        # Create custom confirmation dialog instead of basic messagebox
        result = self.show_custom_confirmation_dialog(
            "Exit CareConnect Launcher",
            "Are you sure you want to quit?\n\nThis will stop all running servers and close the application.",
            "Exit",
            "Cancel"
        )
        if result:
            self.stop_both_servers()
            self.root.destroy()

    def show_custom_confirmation_dialog(self, title, message, confirm_text="Yes", cancel_text="No"):
        """Show a custom confirmation dialog with professional styling"""
        # Create dialog window
        dialog = tk.Toplevel(self.root)
        dialog.title(title)
        dialog.geometry("500x220")  # Made slightly larger for better button spacing
        dialog.resizable(False, False)
        dialog.configure(bg=self.colors['background'])
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center the dialog
        dialog.geometry("+{}+{}".format(
            self.root.winfo_x() + (self.root.winfo_width() // 2) - 250,  # Adjusted for new width
            self.root.winfo_y() + (self.root.winfo_height() // 2) - 110  # Adjusted for new height
        ))
        
        # Main container
        main_frame = tk.Frame(dialog, bg=self.colors['background'], padx=30, pady=30)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title label
        title_label = tk.Label(main_frame, text=title, 
                              font=("Segoe UI", 14, "bold"),
                              fg=self.colors['text'],
                              bg=self.colors['background'])
        title_label.pack(pady=(0, 15))
        
        # Message label
        message_label = tk.Label(main_frame, text=message,
                                font=("Segoe UI", 10),
                                fg=self.colors['text_light'],
                                bg=self.colors['background'],
                                justify=tk.LEFT)
        message_label.pack(pady=(0, 25))
        
        # Button frame
        button_frame = tk.Frame(main_frame, bg=self.colors['background'])
        button_frame.pack(fill=tk.X)
        
        # Result variable
        result = [False]  # Use list to modify from inner function
        
        def on_confirm():
            result[0] = True
            dialog.destroy()
        
        def on_cancel():
            result[0] = False
            dialog.destroy()
        
        # Cancel button (left)
        cancel_btn = tk.Button(button_frame, text=cancel_text,
                              font=("Segoe UI", 11, "bold"),  # Slightly larger font
                              bg=self.colors['surface'],
                              fg=self.colors['text'],
                              relief=tk.FLAT,
                              padx=25, pady=12,  # Increased padding for larger buttons
                              borderwidth=2,
                              activebackground=self.colors['border'],
                              activeforeground=self.colors['text'],
                              cursor="hand2",  # Hand cursor on hover
                              command=on_cancel)
        cancel_btn.pack(side=tk.LEFT, padx=(0, 15))  # More space between buttons
        
        # Confirm button (right)
        confirm_btn = tk.Button(button_frame, text=confirm_text,
                               font=("Segoe UI", 11, "bold"),  # Slightly larger font
                               bg=self.colors['danger'],
                               fg=self.colors['white'],
                               relief=tk.FLAT,
                               padx=25, pady=12,  # Increased padding for larger buttons
                               borderwidth=2,
                               activebackground=self.colors['warning'],
                               activeforeground=self.colors['white'],
                               cursor="hand2",  # Hand cursor on hover
                               command=on_confirm)
        confirm_btn.pack(side=tk.RIGHT)
        
        # Bind Enter key to confirm, Escape to cancel
        dialog.bind('<Return>', lambda e: on_confirm())
        dialog.bind('<Escape>', lambda e: on_cancel())
        
        # Focus on cancel button by default
        cancel_btn.focus_set()
        
        # Wait for dialog to close
        dialog.wait_window()
        
        return result[0]

    def show_custom_message_dialog(self, title, message, dialog_type="info", button_text="OK"):
        """Show a custom message dialog with professional styling"""
        # Create dialog window
        dialog = tk.Toplevel(self.root)
        dialog.title(title)
        dialog.geometry("500x220")  # Made slightly larger for better button spacing
        dialog.resizable(False, False)
        dialog.configure(bg=self.colors['background'])
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center the dialog
        dialog.geometry("+{}+{}".format(
            self.root.winfo_x() + (self.root.winfo_width() // 2) - 250,  # Adjusted for new width
            self.root.winfo_y() + (self.root.winfo_height() // 2) - 110  # Adjusted for new height
        ))
        
        # Main container
        main_frame = tk.Frame(dialog, bg=self.colors['background'], padx=30, pady=30)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Icon and title frame
        header_frame = tk.Frame(main_frame, bg=self.colors['background'])
        header_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Icon based on dialog type
        icon_text = ""
        icon_color = self.colors['info']
        if dialog_type == "warning":
            icon_text = "⚠"
            icon_color = self.colors['warning']
        elif dialog_type == "error":
            icon_text = "❌"
            icon_color = self.colors['danger']
        elif dialog_type == "success":
            icon_text = "✅"
            icon_color = self.colors['success']
        else:
            icon_text = "ℹ"
            icon_color = self.colors['info']
        
        icon_label = tk.Label(header_frame, text=icon_text,
                             font=("Segoe UI", 20),
                             fg=icon_color,
                             bg=self.colors['background'])
        icon_label.pack(side=tk.LEFT, padx=(0, 15))
        
        # Title label
        title_label = tk.Label(header_frame, text=title, 
                              font=("Segoe UI", 14, "bold"),
                              fg=self.colors['text'],
                              bg=self.colors['background'])
        title_label.pack(side=tk.LEFT)
        
        # Message label
        message_label = tk.Label(main_frame, text=message,
                                font=("Segoe UI", 10),
                                fg=self.colors['text_light'],
                                bg=self.colors['background'],
                                justify=tk.LEFT)
        message_label.pack(pady=(0, 25))
        
        # Button frame
        button_frame = tk.Frame(main_frame, bg=self.colors['background'])
        button_frame.pack(fill=tk.X)
        
        def on_ok():
            dialog.destroy()
        
        # OK button
        ok_btn = tk.Button(button_frame, text=button_text,
                          font=("Segoe UI", 11, "bold"),  # Slightly larger font
                          bg=self.colors['primary'],
                          fg=self.colors['white'],
                          relief=tk.FLAT,
                          padx=30, pady=12,  # Increased padding for larger button
                          borderwidth=2,
                          activebackground=self.colors['accent'],
                          activeforeground=self.colors['white'],
                          cursor="hand2",  # Hand cursor on hover
                          command=on_ok)
        ok_btn.pack(side=tk.RIGHT)
        
        # Bind Enter and Escape keys
        dialog.bind('<Return>', lambda e: on_ok())
        dialog.bind('<Escape>', lambda e: on_ok())
        
        # Focus on OK button
        ok_btn.focus_set()
        
        # Wait for dialog to close
        dialog.wait_window()

    def run(self):
        """Start the application"""
        self.log_message("CareConnect Professional Launcher started", "success")
        self.log_message(f"Project path: {self.project_path}", "info")
        self.root.mainloop()

if __name__ == "__main__":
    app = ProfessionalCareConnectLauncher()
    app.run()