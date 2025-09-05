#!/usr/bin/env node

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'warning';
  message: string;
  timestamp: string;
  responseTime?: number;
  details?: any;
}

class HealthChecker {
  private baseUrl: string;
  private timeout: number;
  
  constructor(baseUrl = 'http://localhost:5000', timeout = 5000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async checkEndpoint(path: string, service: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${this.baseUrl}${path}`, {
        timeout: this.timeout,
        validateStatus: (status) => status < 500 // Accept 4xx as "healthy" but note the issue
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.status >= 200 && response.status < 300) {
        return {
          service,
          status: 'healthy',
          message: `${service} is responding normally`,
          timestamp: new Date().toISOString(),
          responseTime,
          details: response.data
        };
      } else {
        return {
          service,
          status: 'warning',
          message: `${service} returned status ${response.status}`,
          timestamp: new Date().toISOString(),
          responseTime,
          details: response.data
        };
      }
    } catch (error) {
      return {
        service,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      };
    }
  }

  async checkPM2Status(): Promise<HealthCheckResult> {
    try {
      const { stdout } = await execAsync('pm2 jlist');
      const processes = JSON.parse(stdout);
      
      const careConnectProcesses = processes.filter((p: any) => 
        p.name.includes('careconnect')
      );
      
      if (careConnectProcesses.length === 0) {
        return {
          service: 'PM2 Process',
          status: 'unhealthy',
          message: 'No CareConnect processes found in PM2',
          timestamp: new Date().toISOString()
        };
      }
      
      const runningProcesses = careConnectProcesses.filter((p: any) => 
        p.pm2_env.status === 'online'
      );
      
      if (runningProcesses.length === careConnectProcesses.length) {
        return {
          service: 'PM2 Process',
          status: 'healthy',
          message: `All ${runningProcesses.length} CareConnect processes are online`,
          timestamp: new Date().toISOString(),
          details: runningProcesses.map((p: any) => ({
            name: p.name,
            status: p.pm2_env.status,
            uptime: p.pm2_env.pm_uptime,
            memory: p.monit.memory,
            cpu: p.monit.cpu
          }))
        };
      } else {
        return {
          service: 'PM2 Process',
          status: 'warning',
          message: `${runningProcesses.length}/${careConnectProcesses.length} processes are online`,
          timestamp: new Date().toISOString(),
          details: careConnectProcesses.map((p: any) => ({
            name: p.name,
            status: p.pm2_env.status,
            uptime: p.pm2_env.pm_uptime
          }))
        };
      }
    } catch (error) {
      return {
        service: 'PM2 Process',
        status: 'unhealthy',
        message: 'Failed to check PM2 status: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString()
      };
    }
  }

  async runFullHealthCheck(): Promise<HealthCheckResult[]> {
    console.log('🏥 Running CareConnect Health Check...\n');
    
    const checks = await Promise.all([
      this.checkEndpoint('/api/health', 'API Health'),
      this.checkEndpoint('/api/ping', 'API Ping'),
      this.checkEndpoint('/api/health/db', 'Database'),
      this.checkPM2Status()
    ]);
    
    return checks;
  }

  printResults(results: HealthCheckResult[]): void {
    console.log('📊 Health Check Results:');
    console.log('=' .repeat(60));
    
    results.forEach(result => {
      const statusIcon = {
        'healthy': '✅',
        'warning': '⚠️',
        'unhealthy': '❌'
      }[result.status];
      
      console.log(`${statusIcon} ${result.service}: ${result.status.toUpperCase()}`);
      console.log(`   Message: ${result.message}`);
      if (result.responseTime) {
        console.log(`   Response Time: ${result.responseTime}ms`);
      }
      console.log(`   Timestamp: ${result.timestamp}`);
      console.log('');
    });
    
    const healthyCount = results.filter(r => r.status === 'healthy').length;
    const totalCount = results.length;
    
    console.log(`Overall Status: ${healthyCount}/${totalCount} checks passed`);
    
    if (healthyCount === totalCount) {
      console.log('🎉 All systems are healthy!');
      process.exit(0);
    } else {
      console.log('⚠️  Some issues detected. Please review the results above.');
      process.exit(1);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new HealthChecker();
  
  checker.runFullHealthCheck()
    .then(results => checker.printResults(results))
    .catch(error => {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    });
}

export { HealthChecker };
