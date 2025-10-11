import { Request, Response, NextFunction } from 'express';

/**
 * API Versioning Middleware
 * Handles API versioning, deprecation warnings, and version routing
 */

// Current API version
export const CURRENT_API_VERSION = 'v1';

// Supported API versions
export const SUPPORTED_VERSIONS = ['v1'];

// Deprecated versions (with deprecation dates)
export const DEPRECATED_VERSIONS: Record<string, string> = {
  // 'v0': '2025-12-31' // Example: v0 deprecated by end of 2025
};

/**
 * Middleware to handle API versioning
 * Adds version information to request object and sets deprecation headers
 */
export const apiVersioning = (req: Request, res: Response, next: NextFunction) => {
  // Extract version from URL path (e.g., /api/v1/government -> v1)
  const pathParts = req.path.split('/');
  const versionIndex = pathParts.findIndex(part => part.startsWith('v') && /^\d+$/.test(part.substring(1)));

  if (versionIndex !== -1) {
    const version = pathParts[versionIndex];
    (req as any).apiVersion = version;

    // Check if version is deprecated
    if (DEPRECATED_VERSIONS[version]) {
      const deprecationDate = DEPRECATED_VERSIONS[version];

      // Set deprecation headers
      res.set({
        'Deprecation': 'true',
        'Sunset': deprecationDate,
        'Link': `</api/${CURRENT_API_VERSION}>; rel="successor-version"; type="application/json"`
      });

      // Add deprecation warning to response
      const originalJson = res.json;
      res.json = function(data: any) {
        if (typeof data === 'object' && data !== null) {
          data._deprecation = {
            version,
            message: `API version ${version} is deprecated. Please migrate to ${CURRENT_API_VERSION} by ${deprecationDate}`,
            successorVersion: CURRENT_API_VERSION,
            documentation: `/api/docs/${CURRENT_API_VERSION}`
          };
        }
        return originalJson.call(this, data);
      };
    }

    // Add version info to response headers
    res.set({
      'X-API-Version': version,
      'X-API-Current-Version': CURRENT_API_VERSION
    });
  }

  next();
};

/**
 * Middleware to enforce minimum API version
 * Redirects old versions to current version
 */
export const enforceMinimumVersion = (req: Request, res: Response, next: NextFunction): void => {
  const version = (req as any).apiVersion;

  if (version && DEPRECATED_VERSIONS[version]) {
    // For deprecated versions, redirect to current version
    res.status(410).json({
      error: 'API Version Deprecated',
      message: `API version ${version} is no longer supported. Please use ${CURRENT_API_VERSION}`,
      successorVersion: CURRENT_API_VERSION,
      migrationGuide: `/api/docs/migration/${version}-to-${CURRENT_API_VERSION}`,
      deprecatedAt: DEPRECATED_VERSIONS[version]
    });
    return;
  }

  next();
};

/**
 * Version-aware route helper
 * Creates routes that work with versioning
 */
export const createVersionedRoute = (version: string, routePath: string) => {
  return `/api/${version}${routePath}`;
};

/**
 * Get versioned route for current version
 */
export const getCurrentVersionedRoute = (routePath: string) => {
  return createVersionedRoute(CURRENT_API_VERSION, routePath);
};

/**
 * API Version information endpoint response
 */
export const getVersionInfo = () => {
  return {
    currentVersion: CURRENT_API_VERSION,
    supportedVersions: SUPPORTED_VERSIONS,
    deprecatedVersions: Object.keys(DEPRECATED_VERSIONS).map(version => ({
      version,
      deprecatedAt: DEPRECATED_VERSIONS[version],
      successorVersion: CURRENT_API_VERSION
    })),
    versioningStrategy: 'URL Path Versioning',
    example: '/api/v1/government/volunteers',
    documentation: `/api/docs/${CURRENT_API_VERSION}`
  };
};