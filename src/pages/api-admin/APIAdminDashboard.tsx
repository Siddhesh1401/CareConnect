import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Shield, Key, Users, BarChart3, Settings, Plus, Eye, Trash2, CheckCircle, XCircle, Clock, Download, Activity, AlertCircle, FileText, Building2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiAdminAPI } from '../../services/api';
import { accessRequestAPI, AccessRequest as APIAccessRequest, AccessRequestStats } from '../../services/accessRequestAPI';

interface APIKey {
  id: string;
  name: string;
  key: string;
  organization: string;
  status: 'active' | 'revoked' | 'expired';
  permissions: string[];
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
}

interface DashboardData {
  stats: {
    activeKeys: number;
    pendingRequests: number;
    totalRequests: number;
    approvedRequests: number;
  };
  recentKeys: APIKey[];
  apiKeys: APIKey[];
  accessRequests: APIAccessRequest[];
}

const APIAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'requests' | 'analytics'>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API Key Generation Modal State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [keyFormData, setKeyFormData] = useState({
    name: 'Government Access Key',
    organization: 'Government Agency',
    permissions: ['read:volunteers', 'read:reports']
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiAdminAPI.getAPIDashboard();
        console.log('API Dashboard Response:', response);
        if (response.success) {
          setDashboardData(response.data);
          console.log('Dashboard Data Set:', response.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Memoize stats calculation
  const stats = useMemo(() => {
    if (!dashboardData || !dashboardData.stats) {
      return {
        activeKeys: 0,
        pendingRequests: 0,
        totalRequests: 0,
        approvedRequests: 0
      };
    }
    return {
      activeKeys: dashboardData.stats.activeKeys || 0,
      pendingRequests: dashboardData.stats.pendingRequests || 0,
      totalRequests: dashboardData.stats.totalRequests || 0,
      approvedRequests: dashboardData.stats.approvedRequests || 0
    };
  }, [dashboardData]);

  // Memoize event handlers
  const generateNewKey = useCallback(async () => {
    try {
      console.log('Sending API key data:', keyFormData);
      const result = await apiAdminAPI.generateAPIKey(keyFormData);
      console.log('API key generation result:', result);
      console.log('API key generation result.data:', result.data);
      if (result.success && result.data && result.data.key) {
        console.log('Setting new API key:', result.data.key);
        setNewApiKey(result.data.key); // Store the generated API key
        // Refresh dashboard data
        const response = await apiAdminAPI.getAPIDashboard();
        if (response.success) {
          setDashboardData(response.data);
        }
      } else {
        console.error('API key not found in response:', result);
        alert('API key was generated but not returned properly. Please try again.');
      }
    } catch (err) {
      console.error('Error generating API key:', err);
      console.error('Error details:', err.response?.data);
      alert(`Failed to generate API key: ${err.response?.data?.message || err.message}`);
    }
  }, [keyFormData]);

  const openKeyModal = useCallback(() => {
    setKeyFormData({
      name: 'Government Access Key',
      organization: 'Government Agency',
      permissions: ['read:volunteers', 'read:reports']
    });
    setNewApiKey(null);
    setShowKeyModal(true);
  }, []);

  const closeKeyModal = useCallback(() => {
    setShowKeyModal(false);
    setNewApiKey(null);
  }, []);

  const revokeKey = useCallback(async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await apiAdminAPI.revokeAPIKey(keyId);
      if (result.success) {
        alert('API key revoked successfully!');
        // Refresh dashboard data
        const response = await apiAdminAPI.getAPIDashboard();
        if (response.success) {
          setDashboardData(response.data);
        }
      }
    } catch (err) {
      console.error('Error revoking API key:', err);
      alert('Failed to revoke API key. Please try again.');
    }
  }, []);

  const approveRequest = useCallback(async (requestId: string) => {
    try {
      const result = await accessRequestAPI.approveAccessRequest(requestId, {
        reviewNotes: 'Request approved by API admin',
        generateApiKey: true
      });
      
      if (result.success) {
        alert('Access request approved successfully!');
        // Refresh dashboard data
        const response = await apiAdminAPI.getAPIDashboard();
        if (response.success) {
          setDashboardData(response.data);
        }
      }
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request. Please try again.');
    }
  }, []);

  const rejectRequest = useCallback(async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const result = await accessRequestAPI.rejectAccessRequest(requestId, reason);
      
      if (result.success) {
        alert('Access request rejected successfully!');
        // Refresh dashboard data
        const response = await apiAdminAPI.getAPIDashboard();
        if (response.success) {
          setDashboardData(response.data);
        }
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request. Please try again.');
    }
  }, []);

  const setActiveTabCallback = useCallback((tab: 'overview' | 'keys' | 'requests' | 'analytics') => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Shield className="mr-3 text-blue-600" size={32} />
                    API Management
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Secure government data access and API key management
                  </p>
                </div>
                <div className="flex items-center space-x-2">
              <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Activity className="mr-2" size={14} />
                System Active
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'keys', label: 'API Keys', icon: Key },
              { id: 'requests', label: 'Access Requests', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabCallback(tab.id as 'overview' | 'keys' | 'requests' | 'analytics')}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2" size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Key className="text-blue-600" size={24} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active API Keys</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeKeys}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Clock className="text-yellow-600" size={24} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <BarChart3 className="text-purple-600" size={24} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total API Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{(stats.totalRequests || 0).toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600" size={24} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={generateNewKey}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="mr-2" size={16} />
                    Generate New API Key
                  </Button>
                  <Button
                    onClick={() => setActiveTabCallback('requests')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200 transform hover:scale-105"
                  >
                    <Users className="mr-2" size={16} />
                    Review Access Requests ({stats.pendingRequests})
                  </Button>
                  <Button
                    onClick={() => setActiveTabCallback('analytics')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 transform hover:scale-105"
                  >
                    <BarChart3 className="mr-2" size={16} />
                    View Usage Analytics
                  </Button>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardData?.recentKeys.slice(0, 3).map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{key.name}</p>
                        <p className="text-sm text-gray-600">Organization: {key.organization}</p>
                        <p className="text-sm text-gray-600">Last used: {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{key.usageCount} calls</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {key.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!dashboardData?.recentKeys || dashboardData.recentKeys.length === 0) && (
                    <div className="text-gray-500 text-center py-8">
                      <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No recent activity</p>
                      <p className="text-sm">API key usage will appear here</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'keys' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">API Keys Management</h3>
              <Button onClick={openKeyModal} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2" size={16} />
                Generate New Key
              </Button>
            </div>

            <div className="space-y-4">
              {dashboardData?.apiKeys.map((key) => (
                <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{key.name}</h4>
                      <p className="text-sm text-gray-600 font-mono mt-1">{key.key}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-600">Created: {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'Unknown'}</span>
                        <span className="text-sm text-gray-600">Last used: {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</span>
                        <span className="text-sm text-gray-600">{key.usageCount} API calls</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {key.permissions.map((permission) => (
                          <span key={permission} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1" size={14} />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeKey(key.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-1" size={14} />
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(!dashboardData?.apiKeys || dashboardData.apiKeys.length === 0) && (
                <div className="text-center py-12">
                  <Key size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys Yet</h3>
                  <p className="text-gray-600 mb-4">Generate your first API key to enable government data access</p>
                  <Button onClick={generateNewKey} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2" size={16} />
                    Generate API Key
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Access Requests Tab */}
        {activeTab === 'requests' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Access Requests</h3>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="mr-2" size={16} />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {dashboardData?.accessRequests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{request.organization}</h4>
                      <p className="text-sm text-gray-600 mt-1">{request.purpose}</p>
                      <p className="text-sm text-gray-600">Requested: {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'Unknown'}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {request.dataTypes.map((dataType) => (
                          <span key={dataType} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {dataType.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveRequest(request._id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="mr-1" size={14} />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectRequest(request._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="mr-1" size={14} />
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="mr-1" size={14} />
                          Approved
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <XCircle className="mr-1" size={14} />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!dashboardData?.accessRequests || dashboardData.accessRequests.length === 0) && (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Access Requests</h3>
                  <p className="text-gray-600">Government agencies can request data access through the API</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage Trends</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Usage analytics will be displayed here</p>
                  <p className="text-sm">Charts and graphs showing API call patterns</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top API Consumers</h3>
              <div className="space-y-3">
                {dashboardData?.apiKeys.slice(0, 5).map((key, index) => (
                  <div key={key.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{key.name}</p>
                        <p className="text-sm text-gray-600">{key.usageCount} API calls</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${(() => {
                              if (!dashboardData?.apiKeys || dashboardData.apiKeys.length === 0) return 0;
                              const usageCounts = dashboardData.apiKeys.map(k => k.usageCount || 0);
                              const maxUsage = Math.max(...usageCounts, 1);
                              return ((key.usageCount || 0) / maxUsage) * 100;
                            })()}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!dashboardData?.apiKeys || dashboardData.apiKeys.length === 0) && (
                  <div className="text-gray-500 text-center py-8">
                    <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No API usage data available</p>
                    <p className="text-sm">Top consumers will appear here once API keys are used</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
        </div>
        )}
      </div>

      {/* API Key Generation Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {console.log('Modal render - newApiKey:', newApiKey, 'showKeyModal:', showKeyModal)}
            {!newApiKey ? (
              <>
                <h3 className="text-lg font-semibold mb-4">Generate New API Key</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={keyFormData.name}
                      onChange={(e) => setKeyFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Government Portal Key"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={keyFormData.organization}
                      onChange={(e) => setKeyFormData(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="e.g., Department of Health"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      {['read:volunteers', 'read:ngos', 'read:campaigns', 'read:events', 'read:reports'].map(permission => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={keyFormData.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setKeyFormData(prev => ({ 
                                  ...prev, 
                                  permissions: [...prev.permissions, permission] 
                                }));
                              } else {
                                setKeyFormData(prev => ({ 
                                  ...prev, 
                                  permissions: prev.permissions.filter(p => p !== permission) 
                                }));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button onClick={closeKeyModal} variant="outline">
                    Cancel
                  </Button>
                  <Button 
                    onClick={generateNewKey}
                    disabled={!keyFormData.name.trim() || !keyFormData.organization.trim() || keyFormData.permissions.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Generate Key
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4 text-green-600">🎉 API Key Generated Successfully!</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded-md p-4">
                    <label className="block text-sm font-bold text-red-800 mb-2">
                      ⚠️ COPY THIS API KEY NOW - IT WON'T BE SHOWN AGAIN!
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newApiKey}
                        readOnly
                        className="w-full p-3 border-2 border-red-300 rounded-md bg-yellow-50 font-mono text-sm font-bold"
                        onClick={(e) => e.target.select()}
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(newApiKey);
                          alert('✅ API key copied to clipboard! You can now test it in the government portal.');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 text-xs bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        📋 COPY KEY
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Save this API key securely. For security reasons, 
                      you won't be able to see the full key again after closing this dialog.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Test your key:</strong> You can test this API key in the Government Portal at{' '}
                      <code className="bg-blue-100 px-1 rounded">http://localhost:8081</code>
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button onClick={closeKeyModal} className="bg-green-600 hover:bg-green-700 text-white">
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { APIAdminDashboard };
export default APIAdminDashboard;