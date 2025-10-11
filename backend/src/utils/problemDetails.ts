import { Response } from 'express';

/**
 * RFC 7807 Problem Details for HTTP APIs
 * Standardized error response format for professional APIs
 */

export interface ProblemDetails {
  type: string;           // URI reference identifying the problem type
  title: string;          // Short, human-readable summary of the problem
  detail?: string;        // Human-readable explanation specific to this occurrence
  instance?: string;      // URI reference identifying specific occurrence
  status: number;         // HTTP status code
  code?: string;          // Application-specific error code
  timestamp?: string;     // ISO 8601 timestamp
  path?: string;          // Request path that caused the error
  method?: string;        // HTTP method used
  errors?: Record<string, string[]>; // Validation errors (field -> messages)
  retryAfter?: number;    // Seconds to wait before retrying (for 429/503)
  apiVersion?: string;    // API version
}

/**
 * Standard error codes for consistent error handling
 */
export enum ErrorCode {
  // Authentication & Authorization
  INVALID_API_KEY = 'INVALID_API_KEY',
  EXPIRED_API_KEY = 'EXPIRED_API_KEY',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  MISSING_API_KEY = 'MISSING_API_KEY',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BURST_RATE_EXCEEDED = 'BURST_RATE_EXCEEDED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST_FORMAT = 'INVALID_REQUEST_FORMAT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resource Errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',

  // System Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Business Logic
  INVALID_OPERATION = 'INVALID_OPERATION',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',

  // API Versioning
  UNSUPPORTED_API_VERSION = 'UNSUPPORTED_API_VERSION',
  DEPRECATED_API_VERSION = 'DEPRECATED_API_VERSION'
}

/**
 * Error type definitions
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: string;
  public readonly validationErrors?: Record<string, string[]>;
  public readonly retryAfter?: number;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: string,
    validationErrors?: Record<string, string[]>,
    retryAfter?: number
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.validationErrors = validationErrors;
    this.retryAfter = retryAfter;
  }
}

/**
 * Create standardized problem details response
 */
export const createProblemDetails = (
  error: APIError | Error,
  req: any,
  statusCode?: number
): ProblemDetails => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const apiVersion = req.apiVersion || 'v1';

  // Handle APIError instances
  if (error instanceof APIError) {
    const problem: ProblemDetails = {
      type: `${baseUrl}/errors/${error.code}`,
      title: error.message,
      status: error.statusCode,
      code: error.code,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      apiVersion
    };

    if (error.details) {
      problem.detail = error.details;
    }

    if (error.validationErrors) {
      problem.errors = error.validationErrors;
    }

    if (error.retryAfter) {
      problem.retryAfter = error.retryAfter;
    }

    return problem;
  }

  // Handle generic errors
  const problem: ProblemDetails = {
    type: `${baseUrl}/errors/${ErrorCode.INTERNAL_SERVER_ERROR}`,
    title: 'Internal Server Error',
    status: statusCode || 500,
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    apiVersion
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    problem.detail = error.message;
  }

  return problem;
};

/**
 * Send standardized error response
 */
export const sendErrorResponse = (
  res: Response,
  error: APIError | Error,
  req: any,
  statusCode?: number
): void => {
  const problem = createProblemDetails(error, req, statusCode);

  // Set appropriate headers
  res.set({
    'Content-Type': 'application/problem+json',
    'X-Error-Code': problem.code || 'UNKNOWN_ERROR'
  });

  // Add retry-after header if specified
  if (problem.retryAfter) {
    res.set('Retry-After', problem.retryAfter.toString());
  }

  res.status(problem.status).json(problem);
};

/**
 * Common error factory functions
 */

// Authentication & Authorization Errors
export const createInvalidAPIKeyError = (details?: string) =>
  new APIError('Invalid API key', 401, ErrorCode.INVALID_API_KEY, details);

export const createExpiredAPIKeyError = (details?: string) =>
  new APIError('API key has expired', 401, ErrorCode.EXPIRED_API_KEY, details);

export const createInsufficientPermissionsError = (requiredPermission: string) =>
  new APIError(
    'Insufficient permissions',
    403,
    ErrorCode.INSUFFICIENT_PERMISSIONS,
    `Required permission: ${requiredPermission}`
  );

export const createMissingAPIKeyError = () =>
  new APIError('API key is required', 401, ErrorCode.MISSING_API_KEY);

// Rate Limiting Errors
export const createRateLimitExceededError = (retryAfter: number, tier: string) =>
  new APIError(
    'Rate limit exceeded',
    429,
    ErrorCode.RATE_LIMIT_EXCEEDED,
    `Rate limit exceeded for ${tier} tier`,
    undefined,
    retryAfter
  );

// Validation Errors
export const createValidationError = (validationErrors: Record<string, string[]>) =>
  new APIError(
    'Validation failed',
    400,
    ErrorCode.VALIDATION_ERROR,
    'One or more fields failed validation',
    validationErrors
  );

// Resource Errors
export const createResourceNotFoundError = (resource: string, id?: string) =>
  new APIError(
    `${resource} not found`,
    404,
    ErrorCode.RESOURCE_NOT_FOUND,
    id ? `${resource} with ID ${id} was not found` : `${resource} was not found`
  );

// System Errors
export const createInternalServerError = (details?: string) =>
  new APIError('Internal server error', 500, ErrorCode.INTERNAL_SERVER_ERROR, details);

export const createDatabaseError = (details?: string) =>
  new APIError('Database error', 503, ErrorCode.DATABASE_ERROR, details);

/**
 * Error handling middleware
 */
export const errorHandler = (error: any, req: any, res: any, next: any) => {
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    apiVersion: req.apiVersion,
    timestamp: new Date().toISOString()
  });

  // Handle known API errors
  if (error instanceof APIError) {
    return sendErrorResponse(res, error, req);
  }

  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    const validationErrors: Record<string, string[]> = {};
    Object.keys(error.errors).forEach(key => {
      validationErrors[key] = [error.errors[key].message];
    });
    const validationError = createValidationError(validationErrors);
    return sendErrorResponse(res, validationError, req);
  }

  // Handle mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    const resourceNotFound = createResourceNotFoundError('Resource', error.value);
    return sendErrorResponse(res, resourceNotFound, req);
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const resourceExists = new APIError(
      'Resource already exists',
      409,
      ErrorCode.RESOURCE_ALREADY_EXISTS,
      `${field} already exists`
    );
    return sendErrorResponse(res, resourceExists, req);
  }

  // Default to internal server error
  const internalError = createInternalServerError(
    process.env.NODE_ENV === 'development' ? error.message : undefined
  );
  sendErrorResponse(res, internalError, req);
};