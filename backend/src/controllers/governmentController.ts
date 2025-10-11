import { Response } from 'express';
import { APIKeyRequest } from '../middleware/apiKeyAuth.js';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Event from '../models/Event.js';
import Community from '../models/Community.js';
import { createInternalServerError, createResourceNotFoundError } from '../utils/problemDetails.js';
import { parseQueryParams, executePaginatedQuery, COMMON_FILTERS } from '../utils/queryUtils.js';

/**
 * @swagger
 * /government/test:
 *   get:
 *     summary: Test API key connection and permissions
 *     description: Validates the provided API key and returns information about the key's permissions and usage
 *     tags: [Government API]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: API key is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "API key is valid and active"
 *                 keyInfo:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Government Health Department"
 *                     organization:
 *                       type: string
 *                       example: "Government Agency"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["read:volunteers", "read:reports"]
 *                     lastUsed:
 *                       type: string
 *                       format: date-time
 *                     usageCount:
 *                       type: integer
 *                       example: 5
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                 apiVersion:
 *                   type: string
 *                   example: "v1"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/schemas/Error'
 */
// Test API key connection
export const testConnection = async (req: APIKeyRequest, res: Response) => {
  try {
    const apiKey = req.apiKey;
    
    res.status(200).json({
      success: true,
      message: 'API key is valid and active',
      keyInfo: {
        name: apiKey.name,
        organization: apiKey.createdBy?.organization || 'Government Agency',
        permissions: apiKey.permissions,
        lastUsed: apiKey.lastUsed,
        usageCount: apiKey.usageCount,
        expiresAt: apiKey.expiresAt
      },
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test connection:', error);
    throw createInternalServerError('Failed to test connection');
  }
};

// Get volunteers data (requires read:volunteers permission)
/**
 * @swagger
 * /government/volunteers:
 *   get:
 *     summary: Get paginated list of volunteers
 *     description: Retrieves a paginated list of active volunteers with advanced filtering, sorting, and search capabilities
 *     tags: [Government API, Volunteers]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, -name, -createdAt, -updatedAt]
 *           default: createdAt
 *         description: Sort field (prefix with - for descending)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, email, or skills
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by skills (comma-separated)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *         description: Filter by availability
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Volunteer'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/schemas/Error'
 */
export const getVolunteers = async (req: APIKeyRequest, res: Response) => {
  try {
    // Parse query parameters with advanced features
    const queryOptions = parseQueryParams(req);

    // Base query for volunteers
    const baseQuery = {
      role: 'volunteer',
      isActive: true
    };

    // Execute paginated query with all features
    const result = await executePaginatedQuery(
      User,
      queryOptions,
      baseQuery,
      [] // No population needed for volunteers
    );

    console.log(`✅ Found ${result.data.length} volunteers with advanced query features`);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    throw createInternalServerError('Failed to fetch volunteers');
  }
};

// Get NGOs/Communities data (requires read:ngos permission)
/**
 * @swagger
 * /government/ngos:
 *   get:
 *     summary: Get paginated list of NGOs/Communities
 *     description: Retrieves a paginated list of active NGOs and communities with advanced filtering, sorting, and search capabilities
 *     tags: [Government API, NGOs]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, -name, -createdAt, -updatedAt]
 *           default: createdAt
 *         description: Sort field (prefix with - for descending)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, description, or location
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NGO'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/schemas/Error'
 */
export const getNGOs = async (req: APIKeyRequest, res: Response) => {
  try {
    // Parse query parameters with advanced features
    const queryOptions = parseQueryParams(req);

    // Base query for communities (NGOs)
    const baseQuery = {
      isActive: true // Only active communities
    };

    // Execute paginated query with all features
    const result = await executePaginatedQuery(
      Community,
      queryOptions,
      baseQuery,
      [] // No population needed
    );

    console.log(`✅ Found ${result.data.length} communities with advanced query features`);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw createInternalServerError('Failed to fetch communities');
  }
};

// Get campaigns data (requires read:campaigns permission)
/**
 * @swagger
 * /government/campaigns:
 *   get:
 *     summary: Get paginated list of active campaigns
 *     description: Retrieves a paginated list of active fundraising campaigns with advanced filtering, sorting, and search capabilities
 *     tags: [Government API, Campaigns]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [title, goal, raised, createdAt, -title, -goal, -raised, -createdAt]
 *           default: createdAt
 *         description: Sort field (prefix with - for descending)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title or description
 *       - in: query
 *         name: ngoId
 *         schema:
 *           type: string
 *         description: Filter by NGO ID
 *       - in: query
 *         name: minGoal
 *         schema:
 *           type: number
 *         description: Filter campaigns with goal amount greater than or equal to this value
 *       - in: query
 *         name: maxGoal
 *         schema:
 *           type: number
 *         description: Filter campaigns with goal amount less than or equal to this value
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Campaign'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/schemas/Error'
 */
export const getCampaigns = async (req: APIKeyRequest, res: Response) => {
  try {
    // Parse query parameters with advanced features
    const queryOptions = parseQueryParams(req);

    // Base query for active campaigns
    const baseQuery = {
      status: 'active',
      isActive: true
    };

    // Execute paginated query with population
    const result = await executePaginatedQuery(
      Campaign,
      queryOptions,
      baseQuery,
      [
        { path: 'createdBy', select: 'name organization' }
      ]
    );

    console.log(`✅ Found ${result.data.length} campaigns with advanced query features`);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw createInternalServerError('Failed to fetch campaigns');
  }
};

// Get events data (requires read:events permission)
/**
 * @swagger
 * /government/events:
 *   get:
 *     summary: Get paginated list of upcoming events
 *     description: Retrieves a paginated list of upcoming events with advanced filtering, sorting, and search capabilities
 *     tags: [Government API, Events]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [title, date, capacity, createdAt, -title, -date, -capacity, -createdAt]
 *           default: date
 *         description: Sort field (prefix with - for descending)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title or description
 *       - in: query
 *         name: ngoId
 *         schema:
 *           type: string
 *         description: Filter by NGO ID
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events starting from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events ending before this date
 *       - in: query
 *         name: minCapacity
 *         schema:
 *           type: integer
 *         description: Filter events with minimum capacity
 *       - in: query
 *         name: maxCapacity
 *         schema:
 *           type: integer
 *         description: Filter events with maximum capacity
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/schemas/Error'
 */
export const getEvents = async (req: APIKeyRequest, res: Response) => {
  try {
    // Parse query parameters with advanced features
    const queryOptions = parseQueryParams(req);

    // Base query for upcoming events
    const baseQuery = {
      status: 'upcoming',
      isActive: true,
      date: { $gte: new Date() }
    };

    // Execute paginated query with population
    const result = await executePaginatedQuery(
      Event,
      queryOptions,
      baseQuery,
      [
        { path: 'createdBy', select: 'name organization' }
      ]
    );

    console.log(`✅ Found ${result.data.length} events with advanced query features`);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    throw createInternalServerError('Failed to fetch events');
  }
};

// Get dashboard statistics (requires read:reports permission)
export const getDashboardStats = async (req: APIKeyRequest, res: Response) => {
  try {
    const [
      totalVolunteers,
      totalCommunities,
      activeCampaigns,
      upcomingEvents,
      totalDonations
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      Community.countDocuments({ isActive: true }),
      Campaign.countDocuments({ status: 'active', isActive: true }),
      Event.countDocuments({ 
        status: 'upcoming', 
        isActive: true, 
        date: { $gte: new Date() } 
      }),
      Campaign.aggregate([
        { $match: { status: 'active', isActive: true } },
        { $group: { _id: null, total: { $sum: '$raised' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        volunteers: totalVolunteers,
        communities: totalCommunities,
        activeCampaigns,
        upcomingEvents,
        totalDonations: totalDonations[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};