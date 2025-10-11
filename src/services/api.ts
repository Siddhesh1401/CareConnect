import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();
const requestTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// Request queue for throttling concurrent requests
const requestQueue: Array<() => Promise<any>> = [];
const MAX_CONCURRENT_REQUESTS = 5; // Limit concurrent requests
let activeRequests = 0;

// Process request queue
const processQueue = async () => {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return;
  }

  activeRequests++;
  const requestFn = requestQueue.shift();
  if (requestFn) {
    try {
      await requestFn();
    } catch (error) {
      console.error('Request queue error:', error);
    } finally {
      activeRequests--;
      // Process next request in queue
      setTimeout(processQueue, 100); // Small delay to prevent immediate queue processing
    }
  }
};

// Add request to queue (commented out - not used)
/*
export const queueRequest = (requestFn: () => Promise<any>): Promise<any> => {
  return new Promise((resolve, reject) => {
    const wrappedRequest = async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    requestQueue.push(wrappedRequest);
    processQueue();
  });
};
*/

// Helper function to create request key for deduplication
const createRequestKey = (config: any) => {
  return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`;
};

// Cleanup function for stuck requests
const cleanupStuckRequest = (requestKey: string) => {
  console.log(`🧹 Cleaning up stuck request: ${requestKey}`);
  pendingRequests.delete(requestKey);
  if (requestTimeouts.has(requestKey)) {
    clearTimeout(requestTimeouts.get(requestKey)!);
    requestTimeouts.delete(requestKey);
    console.log(`⏰ Timeout cleared for request: ${requestKey}`);
  }
};

// Enhanced API with cancellation support
export const createCancellableRequest = (requestFn: Function) => {
  return async (signal?: AbortSignal) => {
    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    const result = await requestFn();
    return result;
  };
};

// Helper function to get full image URL
export const getFullImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, prepend the backend URL
  if (imagePath.startsWith('/uploads')) {
    return `http://localhost:5000${imagePath}`;
  }
  
  // Otherwise, return as is (for fallback images like picsum)
  return imagePath;
};

// Helper function to get profile picture URL - returns default avatar if no profile picture  
export const getProfilePictureUrl = (profilePicture: string | undefined | null, _userName?: string | undefined | null, size?: number): string => {
  if (profilePicture) {
    // If it's already a full URL, return as is
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      return profilePicture;
    }
    
    // If it's a relative path starting with /uploads, prepend the backend URL
    if (profilePicture.startsWith('/uploads')) {
      return `http://localhost:5000${profilePicture}`;
    }
  }
  
  // Return size-specific default avatar if available, otherwise use standard default
  if (size && [32, 40, 48, 64, 96, 128].includes(size)) {
    return `/default-avatar-${size}.webp`;
  }
  return '/default-avatar.webp';
};

// Helper function with UI Avatar fallback for display purposes
export const getProfilePictureWithFallback = (profilePicture: string | undefined | null, userName: string | undefined | null, size: number = 64): string => {
  // First try to get the actual profile picture
  const actualPicture = getProfilePictureUrl(profilePicture);
  if (actualPicture) {
    return actualPicture;
  }
  
  // Generate UI Avatar URL as fallback for display
  const name = userName || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=${size}`;
};

// Request interceptor to add auth token and handle deduplication
api.interceptors.request.use(
  async (config) => {
    // Add timestamp for performance monitoring (development only)
    if (import.meta.env.DEV) {
      (config as any).startTime = Date.now();
    }

    const token = localStorage.getItem('careconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For non-GET requests, use queue to throttle concurrent requests
    if (config.method?.toUpperCase() !== 'GET') {
      // Add a small delay for non-GET requests to prevent bursts
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200)); // 0-200ms random delay
    }

    // Add request deduplication for GET requests
    if (config.method?.toUpperCase() === 'GET') {
      const requestKey = createRequestKey(config);
      
      if (pendingRequests.has(requestKey)) {
        console.log(`🔄 Request deduplicated: ${requestKey}`);
        // Cancel this request and return the pending one
        const cancelToken = axios.CancelToken.source();
        config.cancelToken = cancelToken.token;
        cancelToken.cancel('Request deduplicated');
        return pendingRequests.get(requestKey)!;
      }
      
      console.log(`📤 New request: ${requestKey}`);
      // Store this request
      const requestPromise = api.request(config);
      pendingRequests.set(requestKey, requestPromise);
      
      // Set a timeout to clean up stuck requests (30 seconds)
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Request timeout triggered for: ${requestKey}`);
        cleanupStuckRequest(requestKey);
      }, 30000);
      requestTimeouts.set(requestKey, timeoutId);
      
      // Clean up when request completes
      requestPromise.finally(() => {
        console.log(`✅ Request completed: ${requestKey}`);
        cleanupStuckRequest(requestKey);
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and retries
api.interceptors.response.use(
  (response) => {
    // Monitor slow requests in development
    if (import.meta.env.DEV && (response.config as any).startTime) {
      const duration = Date.now() - (response.config as any).startTime;
      if (duration > 2000) {
        console.warn(`🐌 Slow API call: ${response.config.method} ${response.config.url} took ${duration}ms`);
      }
    }

    // Clean up timeout for successful responses
    if (response.config?.method?.toUpperCase() === 'GET') {
      const requestKey = createRequestKey(response.config);
      console.log(`📥 Response received for: ${requestKey}`);
      cleanupStuckRequest(requestKey);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Clean up timeout for failed responses (but not cancelled ones)
    if (originalRequest?.method?.toUpperCase() === 'GET' && !axios.isCancel(error)) {
      const requestKey = createRequestKey(originalRequest);
      console.log(`❌ Error response for: ${requestKey}`);
      cleanupStuckRequest(requestKey);
    }

    // Don't retry if already retried or if it's a cancellation
    if (originalRequest?._retry || axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Handle 429 (Too Many Requests) with improved exponential backoff
    if (error.response?.status === 429) {
      const retryCount = originalRequest._retryCount || 0;
      const maxRetries = 5; // Increased from 3
      
      if (retryCount < maxRetries) {
        originalRequest._retry = true;
        originalRequest._retryCount = retryCount + 1;
        
        // Improved exponential backoff with jitter: base delay + random jitter
        const baseDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, 8s, 16s
        const jitter = Math.random() * 1000; // Up to 1s jitter
        const delay = baseDelay + jitter;
        
        console.log(`Retrying request in ${Math.round(delay)}ms due to 429 error (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    // Handle network errors with retry
    if (!error.response && error.code === 'NETWORK_ERROR') {
      const retryCount = originalRequest._retryCount || 0;
      const maxRetries = 3;
      
      if (retryCount < maxRetries) {
        originalRequest._retry = true;
        originalRequest._retryCount = retryCount + 1;
        
        const delay = (retryCount + 1) * 2000; // 2s, 4s, 6s
        
        console.log(`Retrying request in ${delay}ms due to network error (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    // Handle 401 errors (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('careconnect_token');
      localStorage.removeItem('careconnect_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register new user
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'volunteer' | 'ngo_admin';
    organizationName?: string;
    organizationType?: string;
    phone?: string;
    skills?: string[];
    interests?: string[];
    documents?: {
      registrationCert: File | null;
      taxExemption: File | null;
      organizationalLicense: File | null;
    };
  }) => {
    // If there are documents (for NGO signup), use FormData
    if (userData.documents && userData.role === 'ngo_admin') {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('role', userData.role);
      
      if (userData.organizationName) {
        formData.append('organizationName', userData.organizationName);
      }
      if (userData.organizationType) {
        formData.append('organizationType', userData.organizationType);
      }
      if (userData.phone) {
        formData.append('phone', userData.phone);
      }
      
      // Add documents
      if (userData.documents.registrationCert) {
        formData.append('registrationCert', userData.documents.registrationCert);
      }
      if (userData.documents.taxExemption) {
        formData.append('taxExemption', userData.documents.taxExemption);
      }
      if (userData.documents.organizationalLicense) {
        formData.append('organizationalLicense', userData.documents.organizationalLicense);
      }
      
      const response = await api.post('/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Regular JSON for volunteers
      const { documents, ...cleanUserData } = userData;
      const response = await api.post('/auth/signup', cleanUserData);
      return response.data;
    }
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    skills?: string[];
    interests?: string[];
    availability?: {
      days: string[];
      timeSlots: string[];
    };
    organizationName?: string;
    organizationType?: string;
    website?: string;
    description?: string;
  }) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Verify email with verification code
  verifyEmail: async (verificationData: {
    email: string;
    verificationCode: string;
  }) => {
    const response = await api.post('/auth/verify-email', verificationData);
    return response.data;
  },

  // Resend verification code
  resendVerificationCode: async (email: string) => {
    const response = await api.post('/auth/resend-verification-code', { email });
    return response.data;
  },

  // Send verification email
  sendVerificationEmail: async (email: string) => {
    const response = await api.post('/auth/send-verification-email', { email });
    return response.data;
  },

  // Send verification code for password reset
  sendVerificationCode: async (emailData: { email: string }) => {
    const response = await api.post('/auth/forgot-password', emailData);
    return response.data;
  },

  // Reset password with verification code
  resetPassword: async (resetData: { email: string; code: string; newPassword: string }) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },
};

// Event API endpoints
export const eventAPI = {
  // Get all events
  getAllEvents: async (filters?: {
    category?: string;
    location?: string;
    date?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },

  // Get event by ID
  getEventById: async (eventId: string) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  // Create event (NGO only)
  createEvent: async (eventData: FormData) => {
    const response = await api.post('/events/create', eventData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get NGO's events
  getNGOEvents: async () => {
    const response = await api.get('/events/ngo/my-events');
    return response.data;
  },

  // Get NGO's volunteers
  getNGOVolunteers: async () => {
    const response = await api.get('/events/ngo/volunteers');
    return response.data;
  },

  // Register for event
  registerForEvent: async (eventId: string) => {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  // Unregister from event
  unregisterFromEvent: async (eventId: string) => {
    const response = await api.delete(`/events/${eventId}/register`);
    return response.data;
  },

  // Get volunteer's registered events
  getVolunteerEvents: async () => {
    const response = await api.get('/events/volunteer/my-events');
    return response.data;
  },

  // Update event (NGO only)
  updateEvent: async (eventId: string, eventData: FormData) => {
    const response = await api.put(`/events/${eventId}`, eventData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete event (NGO only)
  deleteEvent: async (eventId: string) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },

  // Cancel event (NGO only)
  cancelEvent: async (eventId: string) => {
    const response = await api.patch(`/events/${eventId}/cancel`);
    return response.data;
  },

  // Get event statistics (NGO only)
  getEventStats: async () => {
    const response = await api.get('/events/ngo/stats');
    return response.data;
  },

  // Get event analytics (NGO only)
  getEventAnalytics: async () => {
    const response = await api.get('/events/ngo/analytics');
    return response.data;
  },

  // Get volunteers for specific event (NGO only)
  getEventVolunteers: async (eventId: string) => {
    const response = await api.get(`/events/${eventId}/volunteers`);
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  // Send message to admin
  send: async (messageData: { 
    subject: string; 
    message: string; 
    category?: string; 
    priority?: string;
    userType?: string;
  }) => {
    const response = await api.post('/messages/send', messageData);
    return response.data;
  },

  // Get user's messages
  getMyMessages: async () => {
    const response = await api.get('/messages/my-messages');
    return response.data;
  },

  // Mark message as read
  markAsRead: async (messageId: string) => {
    const response = await api.patch(`/messages/${messageId}/read`);
    return response.data;
  },

  // Reply to message
  reply: async (messageId: string, messageData: { message: string }) => {
    const response = await api.post(`/messages/${messageId}/reply`, messageData);
    return response.data;
  },
};

// Broadcast API
export const broadcastAPI = {
  // NGO sends broadcast to volunteers
  sendBroadcast: async (broadcastData: {
    subject: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    targetFilters?: {
      status?: 'active' | 'inactive';
      skills?: string[];
      minEventsJoined?: number;
      location?: string;
    };
  }) => {
    const response = await api.post('/messages/ngo/broadcast', broadcastData);
    return response.data;
  },

  // Get replies to a specific broadcast
  getBroadcastReplies: async (broadcastId: string) => {
    const response = await api.get(`/messages/ngo/broadcasts/${broadcastId}/replies`);
    return response.data;
  },

  // Get all replies to NGO's broadcasts
  getAllBroadcastReplies: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/messages/ngo/broadcasts-replies', { params });
    return response.data;
  },

  // Get NGO's broadcast history
  getBroadcastHistory: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/messages/ngo/broadcasts', { params });
    return response.data;
  },

  // Get volunteer's received broadcasts
  getVolunteerBroadcasts: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/messages/volunteer/broadcasts', { params });
    return response.data;
  },

  // Volunteer replies to broadcast
  replyToBroadcast: async (broadcastId: string, replyData: { message: string }) => {
    const response = await api.post(`/messages/volunteer/broadcasts/${broadcastId}/reply`, replyData);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Campaign API endpoints
export const campaignAPI = {
  // Get all campaigns (for volunteers)
  getAllCampaigns: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
  }) => {
    const response = await api.get('/campaigns', { params });
    return response.data;
  },

  // Get single campaign by ID
  getCampaignById: async (id: string) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  // Get campaign categories
  getCategories: async () => {
    const response = await api.get('/campaigns/categories');
    return response.data;
  },

  // NGO specific endpoints
  getMyCampaigns: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/campaigns/ngo/my-campaigns', { params });
    return response.data;
  },

  getCampaignStats: async () => {
    const response = await api.get('/campaigns/ngo/stats');
    return response.data;
  },

  getCampaignAnalytics: async (params?: { timeRange?: string }) => {
    const response = await api.get('/campaigns/ngo/analytics', { params });
    return response.data;
  },

  createCampaign: async (campaignData: FormData | {
    title: string;
    description: string;
    category: string;
    target: number;
    location: string;
    endDate: string;
    image?: string;
    tags?: string[];
  }) => {
    const config = campaignData instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await api.post('/campaigns', campaignData, config);
    return response.data;
  },

  updateCampaign: async (id: string, campaignData: Partial<{
    title: string;
    description: string;
    category: string;
    target: number;
    location: string;
    endDate: string;
    image?: string;
    tags?: string[];
    status: string;
  }>) => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data;
  },

  deleteCampaign: async (id: string) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },

  addCampaignUpdate: async (id: string, updateData: {
    title: string;
    content: string;
    images?: string[];
  }) => {
    const response = await api.post(`/campaigns/${id}/updates`, updateData);
    return response.data;
  },

  donateToCampaign: async (id: string, donationData: {
    amount: number;
    message?: string;
  }) => {
    const response = await api.post(`/campaigns/${id}/donate`, donationData);
    return response.data;
  },

  getCampaignDonors: async (id: string) => {
    const response = await api.get(`/campaigns/${id}/donors`);
    return response.data;
  },
};

// Story API endpoints
export const storyAPI = {
  // Get all stories (for public viewing)
  getAllStories: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
  }) => {
    const response = await api.get('/stories', { params });
    return response.data;
  },

  // Get single story by ID
  getStoryById: async (id: string) => {
    const response = await api.get(`/stories/${id}`);
    return response.data;
  },

  // Get story categories
  getCategories: async () => {
    const response = await api.get('/stories/categories');
    return response.data;
  },

  // Create new story
  createStory: async (storyData: FormData | {
    title: string;
    excerpt: string;
    content: string;
    image?: string;
    category: string;
    tags?: string[];
    status?: 'draft' | 'published';
  }) => {
    const config = storyData instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await api.post('/stories', storyData, config);
    return response.data;
  },

  // Update story
  updateStory: async (id: string, storyData: FormData | Partial<{
    title: string;
    excerpt: string;
    content: string;
    image?: string;
    category: string;
    tags?: string[];
    status: 'draft' | 'published';
  }>) => {
    const config = storyData instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await api.put(`/stories/${id}`, storyData, config);
    return response.data;
  },

  // Delete story
  deleteStory: async (id: string) => {
    const response = await api.delete(`/stories/${id}`);
    return response.data;
  },

  // Get user's stories
  getUserStories: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/stories/user/my-stories', { params });
    return response.data;
  },

  // Get my stories (alias for getUserStories)
  getMyStories: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/stories/user/my-stories', { params });
    return response.data;
  },

  // Admin: Get all stories
  getAllStoriesAdmin: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) => {
    const response = await api.get('/stories/admin/all', { params });
    return response.data;
  },

  // Admin: Update story status
  updateStoryStatus: async (id: string, data: {
    status: 'draft' | 'published' | 'pending_review';
    featured?: boolean;
  }) => {
    const response = await api.patch(`/stories/admin/${id}/status`, data);
    return response.data;
  },
};

// Community API endpoints
export const communityAPI = {
  // Get all communities (public)
  getAllCommunities: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/communities', { params });
    return response.data;
  },

  // Get specific community
  getCommunityById: async (communityId: string) => {
    const response = await api.get(`/communities/${communityId}`);
    return response.data;
  },

  // Get user's joined communities
  getUserCommunities: async () => {
    const response = await api.get('/communities/user/my-communities');
    return response.data;
  },

  // Get NGO's communities
  getNGOCommunities: async () => {
    const response = await api.get('/communities/ngo/my-communities');
    return response.data;
  },

  // Get NGO's joined communities (not owned)
  getNGOJoinedCommunities: async () => {
    const response = await api.get('/communities/ngo/joined-communities');
    return response.data;
  },

  // Create community (NGO only)
  createCommunity: async (data: {
    name: string;
    description: string;
    category: string;
    image?: File;
    isPrivate?: boolean;
  }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    if (data.image) formData.append('image', data.image);
    if (data.isPrivate !== undefined) formData.append('isPrivate', data.isPrivate.toString());

    const response = await api.post('/communities/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update community (NGO only)
  updateCommunity: async (communityId: string, data: {
    name?: string;
    description?: string;
    category?: string;
    image?: File;
    isPrivate?: boolean;
  }) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.image) formData.append('image', data.image);
    if (data.isPrivate !== undefined) formData.append('isPrivate', data.isPrivate.toString());

    const response = await api.put(`/communities/${communityId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete community (NGO only)
  deleteCommunity: async (communityId: string) => {
    const response = await api.delete(`/communities/${communityId}`);
    return response.data;
  },

  // Join community
  joinCommunity: async (communityId: string) => {
    const response = await api.post(`/communities/${communityId}/join`);
    return response.data;
  },

  // Leave community
  leaveCommunity: async (communityId: string) => {
    const response = await api.delete(`/communities/${communityId}/leave`);
    return response.data;
  },

  // Get posts in community
  getCommunityPosts: async (communityId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/communities/${communityId}/posts`, { params });
    return response.data;
  },

  // Create post in community
  createPost: async (communityId: string, data: {
    title: string;
    content: string;
    image?: File;
  }) => {
    // If there's an image, use FormData
    if (data.image) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('image', data.image);

      const response = await api.post(`/communities/${communityId}/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      // No image, send JSON
      const response = await api.post(`/communities/${communityId}/posts`, {
        title: data.title,
        content: data.content
      });
      return response.data;
    }
  },

  // Like a post
  likePost: async (communityId: string, postId: string) => {
    const response = await api.post(`/communities/${communityId}/posts/${postId}/like`);
    return response.data;
  },

  // Comment on a post
  commentOnPost: async (communityId: string, postId: string, content: string) => {
    const response = await api.post(`/communities/${communityId}/posts/${postId}/comment`, { content });
    return response.data;
  },

  // Like or unlike a comment
  likeComment: async (communityId: string, postId: string, commentId: string) => {
    const response = await api.post(`/communities/${communityId}/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  },

  // Delete a comment (moderation)
  deleteComment: async (communityId: string, postId: string, commentId: string) => {
    const response = await api.delete(`/communities/${communityId}/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
};

// API Admin API endpoints
export const apiAdminAPI = {
  // Get API admin dashboard data
  getAPIDashboard: async () => {
    const response = await api.get('/api-admin/dashboard');
    return response.data;
  },

  // Generate new API key
  generateAPIKey: async (data: {
    name: string;
    organization: string;
    permissions: string[];
    expiresAt?: string;
  }) => {
    const response = await api.post('/api-admin/keys', data);
    return response.data;
  },

  // Get all API keys
  getAPIKeys: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/api-admin/keys', { params });
    return response.data;
  },

  // Revoke API key
  revokeAPIKey: async (keyId: string) => {
    const response = await api.delete(`/api-admin/keys/${keyId}`);
    return response.data;
  },

  // Get API usage analytics
  getAPIUsageAnalytics: async () => {
    const response = await api.get('/api-admin/analytics');
    return response.data;
  },

  // Send API key via email
  sendAPIKey: async (requestId: string, apiKey: string) => {
    const response = await api.post('/api-admin/send-key', { requestId, apiKey });
    return response.data;
  },

  // Trigger email monitoring
  triggerEmailMonitoring: async () => {
    const response = await api.post('/api-admin/email-monitoring');
    return response.data;
  },
};

// Export api instance both as named and default export
export { api };
export default api;
