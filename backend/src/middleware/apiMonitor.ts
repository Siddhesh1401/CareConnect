import { Request, Response, NextFunction } from 'express';
import { APIKeyRequest } from './apiKeyAuth.js';

// Request logging interface
interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  apiKey?: string;
  userId?: string;
  responseTime?: number;
  statusCode?: number;
  contentLength?: number;
  error?: string;
  cacheStatus?: string;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
}

// Performance metrics interface
interface PerformanceMetrics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    averageTime: number;
  }>;
  statusCodes: Record<number, number>;
}

// In-memory storage for logs and metrics (can be replaced with database/external service)
class APIMonitor {
  private logs: RequestLog[] = [];
  private maxLogs = 10000; // Keep last 10k logs
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    topEndpoints: [],
    statusCodes: {}
  };

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log a request
  logRequest(log: Omit<RequestLog, 'id' | 'timestamp'>): void {
    const requestLog: RequestLog = {
      id: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      ...log
    };

    this.logs.push(requestLog);

    // Maintain log limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Update metrics
    this.updateMetrics(requestLog);
  }

  // Update performance metrics
  private updateMetrics(log: RequestLog): void {
    this.metrics.totalRequests++;

    // Update status codes
    if (log.statusCode) {
      this.metrics.statusCodes[log.statusCode] = (this.metrics.statusCodes[log.statusCode] || 0) + 1;
    }

    // Update response time average
    if (log.responseTime) {
      const currentAvg = this.metrics.averageResponseTime;
      const newCount = this.metrics.totalRequests;
      this.metrics.averageResponseTime = ((currentAvg * (newCount - 1)) + log.responseTime) / newCount;
    }

    // Update error rate
    const errorCodes = Object.keys(this.metrics.statusCodes)
      .filter(code => parseInt(code) >= 400)
      .reduce((sum, code) => sum + this.metrics.statusCodes[parseInt(code)], 0);
    this.metrics.errorRate = (errorCodes / this.metrics.totalRequests) * 100;

    // Update cache hit rate
    if (log.cacheStatus) {
      const cacheHits = this.logs.filter(l => l.cacheStatus === 'HIT').length;
      this.metrics.cacheHitRate = (cacheHits / this.metrics.totalRequests) * 100;
    }

    // Update top endpoints
    this.updateTopEndpoints(log);
  }

  // Update top endpoints metrics
  private updateTopEndpoints(log: RequestLog): void {
    const endpoint = `${log.method} ${log.url.split('?')[0]}`; // Remove query params
    const existing = this.metrics.topEndpoints.find(e => e.endpoint === endpoint);

    if (existing) {
      existing.count++;
      if (log.responseTime) {
        existing.averageTime = ((existing.averageTime * (existing.count - 1)) + log.responseTime) / existing.count;
      }
    } else {
      this.metrics.topEndpoints.push({
        endpoint,
        count: 1,
        averageTime: log.responseTime || 0
      });
    }

    // Keep only top 10 endpoints
    this.metrics.topEndpoints.sort((a, b) => b.count - a.count);
    this.metrics.topEndpoints = this.metrics.topEndpoints.slice(0, 10);
  }

  // Get logs with optional filtering
  getLogs(options: {
    limit?: number;
    offset?: number;
    statusCode?: number;
    method?: string;
    apiKey?: string;
    startDate?: string;
    endDate?: string;
  } = {}): RequestLog[] {
    let filteredLogs = [...this.logs];

    if (options.statusCode) {
      filteredLogs = filteredLogs.filter(log => log.statusCode === options.statusCode);
    }

    if (options.method) {
      filteredLogs = filteredLogs.filter(log => log.method === options.method);
    }

    if (options.apiKey) {
      filteredLogs = filteredLogs.filter(log => log.apiKey === options.apiKey);
    }

    if (options.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= options.endDate!);
    }

    // Sort by timestamp descending (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const offset = options.offset || 0;
    const limit = options.limit || 100;

    return filteredLogs.slice(offset, offset + limit);
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get error summary
  getErrorSummary(): {
    totalErrors: number;
    errorsByCode: Record<number, number>;
    recentErrors: RequestLog[];
  } {
    const errorLogs = this.logs.filter(log => log.statusCode && log.statusCode >= 400);
    const errorsByCode: Record<number, number> = {};

    errorLogs.forEach(log => {
      if (log.statusCode) {
        errorsByCode[log.statusCode] = (errorsByCode[log.statusCode] || 0) + 1;
      }
    });

    return {
      totalErrors: errorLogs.length,
      errorsByCode,
      recentErrors: errorLogs.slice(-10) // Last 10 errors
    };
  }

  // Clear logs (for testing/admin purposes)
  clearLogs(): void {
    this.logs = [];
    this.resetMetrics();
  }

  // Reset metrics
  private resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      topEndpoints: [],
      statusCodes: {}
    };
  }
}

// Export singleton instance
export const apiMonitor = new APIMonitor();

// Middleware for request logging and monitoring
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = apiMonitor['generateRequestId']();

  // Add request ID to response headers
  res.set('X-Request-ID', requestId);

  // Log when response is finished
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const apiKey = (req as APIKeyRequest).apiKey?.name;
    const cacheStatus = res.get('X-Cache-Status');

    apiMonitor.logRequest({
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      apiKey,
      responseTime,
      statusCode: res.statusCode,
      contentLength: parseInt(res.get('Content-Length') || '0'),
      cacheStatus: cacheStatus || undefined,
      rateLimitRemaining: parseInt(res.get('X-RateLimit-Remaining') || '0'),
      rateLimitReset: res.get('X-RateLimit-Reset') || undefined
    });
  });

  // Log errors
  res.on('error', (error) => {
    apiMonitor.logRequest({
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      error: error.message,
      statusCode: 500
    });
  });

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  apiMonitor.logRequest({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    error: error.message,
    statusCode: res.statusCode || 500
  });

  next(error);
};