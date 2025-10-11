import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CareConnect API',
      version: '1.0.0',
      description: 'Professional API for CareConnect platform - Government Access & NGO Management\n\n## Features\n- **API Versioning**: All endpoints use semantic versioning (/api/v1/)\n- **Rate Limiting**: Tiered limits based on API key permissions\n- **Response Caching**: ETags and Cache-Control headers for performance\n- **Advanced Queries**: Pagination, filtering, sorting, and search\n- **Error Handling**: RFC 7807 Problem Details format\n- **Authentication**: API Key authentication for government access\n- **Monitoring & Logging**: Comprehensive request/response tracking\n\n## Security\n- **HTTPS Enforcement**: HSTS with preload enabled\n- **Clickjacking Protection**: X-Frame-Options DENY\n- **Content Sniffing Protection**: X-Content-Type-Options nosniff\n- **XSS Protection**: X-XSS-Protection enabled\n- **CORS Policy**: Strict origin validation\n- **CSP Headers**: Content Security Policy implemented\n- **Certificate Transparency**: Expect-CT enforcement\n\n## Monitoring\nAccess monitoring endpoints at:\n- `/api/v1/monitoring/metrics` - Performance metrics\n- `/api/v1/monitoring/logs` - Request logs\n- `/api/v1/monitoring/errors` - Error summaries\n- `/api/v1/cache/stats` - Cache statistics\n- `/api/v1/security/headers` - Security configuration\n- `/status` - Public status page with uptime monitoring\n- `/api/v1/incidents` - Incident management',
      contact: {
        name: 'CareConnect Support',
        email: 'support@careconnect.org'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.careconnect.org/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for government access authentication'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for admin authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              example: 'https://api.careconnect.org/errors/validation-error'
            },
            title: {
              type: 'string',
              example: 'Validation Error'
            },
            detail: {
              type: 'string',
              example: 'The request contains invalid data'
            },
            status: {
              type: 'integer',
              example: 400
            },
            instance: {
              type: 'string',
              example: '/api/v1/government/volunteers'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 150 },
                pages: { type: 'integer', example: 15 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false }
              }
            },
            apiVersion: {
              type: 'string',
              example: 'v1'
            }
          }
        },
        Volunteer: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            skills: { type: 'array', items: { type: 'string' }, example: ['teaching', 'medical'] },
            availability: { type: 'string', example: 'weekends' },
            location: { type: 'string', example: 'New York, NY' },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        NGO: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Green Earth Foundation' },
            email: { type: 'string', example: 'contact@greenearth.org' },
            phone: { type: 'string', example: '+1234567890' },
            address: { type: 'string', example: '123 Main St, City, State' },
            description: { type: 'string', example: 'Environmental conservation NGO' },
            website: { type: 'string', example: 'https://greenearth.org' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Campaign: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Clean Water Initiative' },
            description: { type: 'string', example: 'Providing clean water to rural communities' },
            ngoId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            ngoName: { type: 'string', example: 'Green Earth Foundation' },
            goal: { type: 'number', example: 50000 },
            raised: { type: 'number', example: 25000 },
            status: { type: 'string', enum: ['active', 'completed', 'cancelled'], example: 'active' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Event: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Community Health Camp' },
            description: { type: 'string', example: 'Free health checkup and vaccination camp' },
            ngoId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            ngoName: { type: 'string', example: 'Green Earth Foundation' },
            location: { type: 'string', example: 'Community Center, Downtown' },
            date: { type: 'string', format: 'date-time' },
            capacity: { type: 'number', example: 200 },
            registered: { type: 'number', example: 150 },
            status: { type: 'string', enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], example: 'upcoming' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.ts'] // Paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };