module.exports = {
  apps: [
    {
      name: 'careconnect-backend',
      script: 'dist/server.js', // Will use compiled JS for production
      cwd: './',
      instances: 1, // You can increase this for load balancing
      exec_mode: 'fork', // or 'cluster' for multiple instances
      watch: false, // Set to true in development if you want auto-restart on file changes
      max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        MONGODB_URI: 'mongodb://localhost:27017/careconnect',
        FRONTEND_URL: 'http://localhost:5173'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGODB_URI: 'mongodb://localhost:27017/careconnect-prod',
        FRONTEND_URL: 'https://your-domain.com'
      },
      // Logging
      log_file: './logs/app.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart configuration
      min_uptime: '10s', // Minimum uptime before considering the app stable
      max_restarts: 10, // Maximum number of restarts within restart_delay
      restart_delay: 4000, // Delay between restarts (ms)
      
      // Health monitoring
      health_check_url: 'http://localhost:5000/api/health',
      health_check_grace_period: 3000,
      
      // Advanced PM2 features
      autorestart: true, // Auto restart on crash
      ignore_watch: ['node_modules', 'logs'], // Folders to ignore when watching
      
      // Environment variables for different stages
      merge_logs: true,
      combine_logs: true
    },
    
    // Development configuration with TypeScript
    {
      name: 'careconnect-dev',
      script: 'node_modules/.bin/tsx',
      args: 'watch src/server.ts',
      cwd: './',
      watch: false, // tsx already handles file watching
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        MONGODB_URI: 'mongodb://localhost:27017/careconnect',
        FRONTEND_URL: 'http://localhost:5173'
      },
      // Logging for development
      log_file: './logs/dev.log',
      out_file: './logs/dev-out.log',
      error_file: './logs/dev-error.log',
      
      // Development-specific settings
      autorestart: true,
      max_restarts: 15, // More restarts allowed in development
      restart_delay: 2000,
      min_uptime: '5s'
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'your-git-repo.git',
      path: '/var/www/careconnect',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
