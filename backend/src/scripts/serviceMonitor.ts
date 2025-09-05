#!/usr/bin/env node

import { HealthChecker } from './healthCheck.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MonitorConfig {
  checkInterval: number; // in milliseconds
  maxConsecutiveFailures: number;
  autoRestart: boolean;
  notificationWebhook?: string;
}

class ServiceMonitor {
  private config: MonitorConfig;
  private healthChecker: HealthChecker;
  private consecutiveFailures = 0;
  private isRunning = false;
  
  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      checkInterval: 30000, // 30 seconds
      maxConsecutiveFailures: 3,
      autoRestart: true,
      ...config
    };
    this.healthChecker = new HealthChecker();
  }

  async sendNotification(message: string, isError = false): Promise<void> {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${isError ? '❌ ERROR' : 'ℹ️  INFO'}: ${message}`;
    
    console.log(logMessage);
    
    // If webhook is configured, send notification
    if (this.config.notificationWebhook) {
      try {
        const axios = (await import('axios')).default;
        await axios.post(this.config.notificationWebhook, {
          text: logMessage,
          timestamp
        });
      } catch (error) {
        console.error('Failed to send webhook notification:', error);
      }
    }
  }

  async restartService(): Promise<boolean> {
    try {
      await this.sendNotification('Attempting to restart CareConnect services...');
      
      // Try to restart PM2 processes
      await execAsync('pm2 restart careconnect-dev');
      
      // Wait a bit for the service to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verify the restart worked
      const healthResults = await this.healthChecker.runFullHealthCheck();
      const healthyServices = healthResults.filter(r => r.status === 'healthy').length;
      
      if (healthyServices >= healthResults.length - 1) { // Allow 1 service to be warning
        await this.sendNotification('✅ Service restart successful');
        this.consecutiveFailures = 0;
        return true;
      } else {
        await this.sendNotification('❌ Service restart failed - health check still failing', true);
        return false;
      }
    } catch (error) {
      await this.sendNotification(`❌ Failed to restart service: ${error}`, true);
      return false;
    }
  }

  async performHealthCheck(): Promise<boolean> {
    try {
      const results = await this.healthChecker.runFullHealthCheck();
      const criticalFailures = results.filter(r => 
        r.status === 'unhealthy' && 
        (r.service.includes('API') || r.service.includes('Database'))
      );
      
      if (criticalFailures.length > 0) {
        this.consecutiveFailures++;
        
        await this.sendNotification(
          `Health check failed (${this.consecutiveFailures}/${this.config.maxConsecutiveFailures}): ${criticalFailures.map(f => f.service).join(', ')}`,
          true
        );
        
        if (this.consecutiveFailures >= this.config.maxConsecutiveFailures && this.config.autoRestart) {
          await this.sendNotification('Maximum consecutive failures reached. Attempting auto-restart...');
          return await this.restartService();
        }
        
        return false;
      } else {
        // Reset failure counter on successful check
        if (this.consecutiveFailures > 0) {
          await this.sendNotification('✅ Services recovered');
          this.consecutiveFailures = 0;
        }
        return true;
      }
    } catch (error) {
      this.consecutiveFailures++;
      await this.sendNotification(`Health check error: ${error}`, true);
      return false;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Monitor is already running');
      return;
    }
    
    this.isRunning = true;
    await this.sendNotification(`🎯 CareConnect Service Monitor started (checking every ${this.config.checkInterval/1000}s)`);
    
    const monitor = async (): Promise<void> => {
      if (!this.isRunning) return;
      
      await this.performHealthCheck();
      
      // Schedule next check
      setTimeout(monitor, this.config.checkInterval);
    };
    
    // Start monitoring
    monitor();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.sendNotification('🛑 Service Monitor stopped');
    process.exit(0);
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const config: Partial<MonitorConfig> = {};
  
  // Parse command line arguments
  args.forEach((arg, index) => {
    switch (arg) {
      case '--interval':
        config.checkInterval = parseInt(args[index + 1]) * 1000;
        break;
      case '--max-failures':
        config.maxConsecutiveFailures = parseInt(args[index + 1]);
        break;
      case '--no-restart':
        config.autoRestart = false;
        break;
      case '--webhook':
        config.notificationWebhook = args[index + 1];
        break;
    }
  });
  
  const monitor = new ServiceMonitor(config);
  
  console.log('🎯 Starting CareConnect Service Monitor...');
  console.log('Configuration:', config);
  console.log('Press Ctrl+C to stop monitoring\n');
  
  monitor.start().catch(error => {
    console.error('Monitor failed to start:', error);
    process.exit(1);
  });
}

export { ServiceMonitor };
