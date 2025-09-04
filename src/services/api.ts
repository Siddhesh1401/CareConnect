import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Export api instance both as named and default export
export { api };
export default api;
