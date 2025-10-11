import { Request } from 'express';

/**
 * Advanced Query Features for API Endpoints
 * Provides pagination, filtering, sorting, and search capabilities
 */

export interface QueryOptions {
  page: number;
  limit: number;
  sort?: string;
  fields?: string;
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number;
    prevPage?: number;
  };
  meta: {
    timestamp: string;
    apiVersion: string;
    query: {
      sort?: string;
      fields?: string;
      search?: string;
      filters?: Record<string, any>;
    };
  };
}

/**
 * Parse query parameters from request
 */
export const parseQueryParams = (req: Request): QueryOptions => {
  const query = req.query;

  // Parse and validate pagination
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50));

  // Parse other options
  const sort = typeof query.sort === 'string' ? query.sort : undefined;
  const fields = typeof query.fields === 'string' ? query.fields : undefined;
  const search = typeof query.search === 'string' ? query.search.trim() : undefined;

  // Process filters
  const filters: Record<string, any> = {};
  Object.keys(query).forEach(key => {
    if (!['page', 'limit', 'sort', 'fields', 'search'].includes(key)) {
      filters[key] = query[key];
    }
  });

  return {
    page,
    limit,
    sort,
    fields,
    search,
    filters: Object.keys(filters).length > 0 ? filters : undefined
  };
};

/**
 * Build MongoDB query from parsed options
 */
export const buildMongoQuery = (options: QueryOptions, baseQuery: any = {}) => {
  const query = { ...baseQuery };
  const { search, filters } = options;

  // Add text search if provided
  if (search) {
    query.$text = { $search: search };
  }

  // Add field filters
  if (filters) {
    Object.keys(filters).forEach(key => {
      const value = filters[key];

      // Handle different filter types
      if (typeof value === 'string') {
        // Check for operators
        if (value.startsWith('>=')) {
          query[key] = { ...query[key], $gte: value.substring(2) };
        } else if (value.startsWith('<=')) {
          query[key] = { ...query[key], $lte: value.substring(2) };
        } else if (value.startsWith('>')) {
          query[key] = { ...query[key], $gt: value.substring(1) };
        } else if (value.startsWith('<')) {
          query[key] = { ...query[key], $lt: value.substring(1) };
        } else if (value.includes(',')) {
          // Multiple values (OR condition)
          query[key] = { ...query[key], $in: value.split(',').map(v => v.trim()) };
        } else if (value.startsWith('!')) {
          // Negation
          query[key] = { ...query[key], $ne: value.substring(1) };
        } else {
          // Exact match
          query[key] = { ...query[key], $eq: value };
        }
      } else {
        query[key] = value;
      }
    });
  }

  return query;
};

/**
 * Build MongoDB sort object
 */
export const buildSortOptions = (sort?: string) => {
  if (!sort) return { createdAt: -1 }; // Default sort

  const sortOptions: Record<string, 1 | -1> = {};

  // Handle multiple sort fields: "name:asc,createdAt:desc"
  sort.split(',').forEach(field => {
    const [key, direction] = field.trim().split(':');
    sortOptions[key] = direction === 'asc' ? 1 : -1;
  });

  return sortOptions;
};

/**
 * Build MongoDB projection (field selection)
 */
export const buildProjection = (fields?: string) => {
  if (!fields) return {};

  const projection: Record<string, 1 | 0> = {};

  // Handle field selection: "name,email,createdAt" or "-password,-__v"
  if (fields.startsWith('-')) {
    // Exclusion: convert to inclusion of all other fields
    // Note: This is a simplified version. In production, you'd want to know all possible fields
    const excludeFields = fields.substring(1).split(',').map(f => f.trim());
    // For now, we'll handle this by setting excluded fields to 0
    excludeFields.forEach(field => {
      projection[field] = 0;
    });
  } else {
    // Inclusion
    fields.split(',').forEach(field => {
      projection[field.trim()] = 1;
    });
  }

  return projection;
};

/**
 * Execute paginated query with all options
 */
export const executePaginatedQuery = async <T>(
  model: any,
  options: QueryOptions,
  baseQuery: any = {},
  populateOptions: any[] = []
): Promise<PaginationResult<T>> => {
  const { page = 1, limit = 50 } = options;

  // Build query components
  const mongoQuery = buildMongoQuery(options, baseQuery);
  const sortOptions = buildSortOptions(options.sort);
  const projection = buildProjection(options.fields);

  // Get total count for pagination
  const total = await model.countDocuments(mongoQuery);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  // Build the query
  let query = model
    .find(mongoQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  // Add projection if specified
  if (Object.keys(projection).length > 0) {
    query = query.select(projection);
  }

  // Add population if specified
  populateOptions.forEach(populate => {
    query = query.populate(populate);
  });

  // Execute query
  const data = await query;

  // Build pagination info
  const pagination = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : undefined,
    prevPage: page > 1 ? page - 1 : undefined
  };

  // Build meta info
  const meta = {
    timestamp: new Date().toISOString(),
    apiVersion: 'v1',
    query: {
      sort: options.sort,
      fields: options.fields,
      search: options.search,
      filters: options.filters
    }
  };

  return {
    data,
    pagination,
    meta
  };
};

/**
 * Validate date range filters
 */
export const validateDateRange = (startDate?: string, endDate?: string) => {
  if (startDate && isNaN(Date.parse(startDate))) {
    throw new Error('Invalid start date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)');
  }
  if (endDate && isNaN(Date.parse(endDate))) {
    throw new Error('Invalid end date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)');
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date cannot be after end date');
  }
};

/**
 * Common filter presets for different data types
 */
export const COMMON_FILTERS = {
  // Date range filters
  dateRange: (field: string, startDate?: string, endDate?: string) => {
    validateDateRange(startDate, endDate);
    const filter: any = {};
    if (startDate) filter.$gte = new Date(startDate);
    if (endDate) filter.$lte = new Date(endDate);
    return { [field]: filter };
  },

  // Status filters
  status: (statuses: string[]) => ({
    status: { $in: statuses }
  }),

  // Location filters
  location: (location: string, radius?: number) => {
    if (radius) {
      // For geospatial queries (if you add location fields)
      return {
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [0, 0] }, // You'd parse location
            $maxDistance: radius * 1000 // Convert to meters
          }
        }
      };
    }
    return { location: new RegExp(location, 'i') };
  },

  // Text search with multiple fields
  multiFieldSearch: (searchTerm: string, fields: string[]) => ({
    $or: fields.map(field => ({
      [field]: new RegExp(searchTerm, 'i')
    }))
  })
};

/**
 * Generate API documentation for query parameters
 */
export const QUERY_PARAM_DOCS = {
  pagination: {
    page: 'Page number (default: 1)',
    limit: 'Items per page (default: 50, max: 100)'
  },
  sorting: {
    sort: 'Sort fields with direction: "name:asc,createdAt:desc"'
  },
  filtering: {
    search: 'Text search across indexed fields',
    fields: 'Comma-separated fields to include/exclude: "name,email" or "-password"',
    custom: 'Field-specific filters: "status=active" or "createdAt>=2024-01-01"'
  },
  examples: {
    pagination: '/api/v1/volunteers?page=2&limit=25',
    sorting: '/api/v1/volunteers?sort=name:asc,createdAt:desc',
    filtering: '/api/v1/volunteers?search=john&status=active',
    combined: '/api/v1/volunteers?page=1&limit=10&sort=name:asc&search=ngo&status=active'
  }
};