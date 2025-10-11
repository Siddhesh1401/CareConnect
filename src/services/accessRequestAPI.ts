import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

export interface AccessRequestData {
  organization: string;
  contactPerson: string;
  email: string;
  phone: string;
  purpose: string;
  dataTypes: string[];
  justification: string;
  estimatedUsage: {
    requestsPerDay: number;
    requestsPerMonth: number;
    dataRetentionPeriod: number;
  };
  technicalDetails: {
    integrationType: 'rest_api' | 'webhook' | 'bulk_export' | 'real_time';
    securityRequirements: string[];
    dataFormat: 'json' | 'xml' | 'csv';
    expectedResponseTime: string;
  };
  governmentLevel: 'federal' | 'state' | 'local' | 'international';
  department: string;
  authorizedOfficials: Array<{
    name: string;
    title: string;
    email: string;
    phone: string;
  }>;
}

export interface AccessRequest extends AccessRequestData {
  _id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'email_submitted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  reviewNotes?: string;
  apiKeyGenerated?: {
    _id: string;
    name: string;
    key: string;
    status: string;
  };
}

export interface AccessRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  underReview: number;
  recentRequests: number;
  byGovernmentLevel: Record<string, number>;
  approvalRate: string;
}

export interface PaginatedAccessRequests {
  requests: AccessRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRequests: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AccessRequestAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('careconnect_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // Submit a new access request (public endpoint)
  async submitAccessRequest(data: AccessRequestData) {
    const response = await axios.post(`${API_URL}/access-requests/submit`, data);
    return response.data;
  }

  // Get all access requests (admin only)
  async getAllAccessRequests(params?: {
    status?: string;
    page?: number;
    limit?: number;
    priority?: string;
    governmentLevel?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.governmentLevel) queryParams.append('governmentLevel', params.governmentLevel);

    const response = await axios.get(
      `${API_URL}/access-requests?${queryParams.toString()}`,
      this.getAuthHeaders()
    );
    return response.data.data as PaginatedAccessRequests;
  }

  // Get specific access request by ID (admin only)
  async getAccessRequestById(id: string) {
    const response = await axios.get(
      `${API_URL}/access-requests/${id}`,
      this.getAuthHeaders()
    );
    return response.data.data as AccessRequest;
  }

  // Approve an access request (admin only)
  async approveAccessRequest(id: string, data: {
    reviewNotes?: string;
    generateApiKey?: boolean;
    keyName?: string;
    permissions?: string[];
    expiresAt?: string;
  }) {
    const response = await axios.put(
      `${API_URL}/access-requests/${id}/approve`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Reject an access request (admin only)
  async rejectAccessRequest(id: string, reviewNotes: string) {
    const response = await axios.put(
      `${API_URL}/access-requests/${id}/reject`,
      { reviewNotes },
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Update request priority (admin only)
  async updateRequestPriority(id: string, priority: 'low' | 'medium' | 'high' | 'urgent') {
    const response = await axios.put(
      `${API_URL}/access-requests/${id}/priority`,
      { priority },
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Get access request statistics (admin only)
  async getAccessRequestStats() {
    const response = await axios.get(
      `${API_URL}/access-requests/stats`,
      this.getAuthHeaders()
    );
    return response.data.data as AccessRequestStats;
  }
}

export const accessRequestAPI = new AccessRequestAPI();