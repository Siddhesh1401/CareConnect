import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Simple in-memory cache (can be replaced with Redis for production)
interface CacheEntry {
  data: any;
  etag: string;
  lastModified: string;
  expiresAt: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 300000; // 5 minutes in milliseconds

  // Generate ETag from response data
  private generateETag(data: any): string {
    const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    return `"${hash}"`;
  }

  // Get cache key from request
  private getCacheKey(req: Request): string {
    // Include query parameters and API key in cache key for proper isolation
    const apiKey = req.headers['x-api-key'] || 'anonymous';
    const queryString = new URLSearchParams(req.query as any).toString();
    return `${req.method}:${req.originalUrl}:${apiKey}:${queryString}`;
  }

  // Check if request should be cached
  shouldCache(req: Request): boolean {
    // Only cache GET requests
    if (req.method !== 'GET') return false;

    // Don't cache requests with sensitive data
    if (req.path.includes('/auth/') || req.path.includes('/admin/')) return false;

    // Cache government API endpoints
    if (req.path.includes('/api/v1/government/')) return true;

    return false;
  }

  // Get cached response
  get(req: Request): CacheEntry | null {
    const key = this.getCacheKey(req);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if cache entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  // Set cached response
  set(req: Request, res: Response, data: any, ttl?: number): void {
    const key = this.getCacheKey(req);
    const etag = this.generateETag(data);
    const lastModified = new Date().toUTCString();
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    const entry: CacheEntry = {
      data,
      etag,
      lastModified,
      expiresAt
    };

    this.cache.set(key, entry);

    // Set cache headers on response
    res.set({
      'ETag': etag,
      'Last-Modified': lastModified,
      'Cache-Control': `public, max-age=${Math.floor((ttl || this.defaultTTL) / 1000)}`
    });
  }

  // Handle conditional requests (If-None-Match, If-Modified-Since)
  handleConditionalRequest(req: Request, res: Response, entry: CacheEntry): boolean {
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];

    // Check ETag
    if (ifNoneMatch && ifNoneMatch === entry.etag) {
      res.status(304).end();
      return true;
    }

    // Check Last-Modified
    if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(entry.lastModified)) {
      res.status(304).end();
      return true;
    }

    return false;
  }

  // Clear cache for a specific pattern
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const responseCache = new ResponseCache();

// Middleware function for caching responses
export const cacheMiddleware = (ttl?: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if not a cacheable request
    if (!responseCache.shouldCache(req)) {
      return next();
    }

    // Check for cached response
    const cached = responseCache.get(req);
    if (cached) {
      // Handle conditional requests
      if (responseCache.handleConditionalRequest(req, res, cached)) {
        return; // 304 response sent
      }

      // Return cached data
      res.set({
        'ETag': cached.etag,
        'Last-Modified': cached.lastModified,
        'Cache-Control': `public, max-age=${Math.floor((cached.expiresAt - Date.now()) / 1000)}`,
        'X-Cache-Status': 'HIT'
      });
      return res.json(cached.data);
    }

    // Intercept the response to cache it
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      // Cache the response
      responseCache.set(req, res, data, ttl);

      // Add cache status header
      res.set('X-Cache-Status', 'MISS');

      // Return original response
      return originalJson(data);
    };

    next();
  };
};

// Cache invalidation helpers
export const invalidateCache = (pattern?: string) => {
  responseCache.clear(pattern);
};

// Cache statistics endpoint
export const getCacheStats = () => {
  return responseCache.getStats();
};