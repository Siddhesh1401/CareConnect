import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get full image URL
export const getFullImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '';
  
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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear local storage and redirect to login
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

  createCampaign: async (campaignData: {
    title: string;
    description: string;
    category: string;
    target: number;
    location: string;
    endDate: string;
    image?: string;
    tags?: string[];
  }) => {
    const response = await api.post('/campaigns', campaignData);
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
  createStory: async (storyData: {
    title: string;
    excerpt: string;
    content: string;
    image?: string;
    category: string;
    tags?: string[];
    status?: 'draft' | 'published';
  }) => {
    const response = await api.post('/stories', storyData);
    return response.data;
  },

  // Update story
  updateStory: async (id: string, storyData: Partial<{
    title: string;
    excerpt: string;
    content: string;
    image?: string;
    category: string;
    tags?: string[];
    status: 'draft' | 'published';
  }>) => {
    const response = await api.put(`/stories/${id}`, storyData);
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

// Export api instance both as named and default export
export { api };
export default api;
