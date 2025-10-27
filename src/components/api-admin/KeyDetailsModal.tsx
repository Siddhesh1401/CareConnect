import React from 'react';
import { X, Key, Calendar, Activity, Shield, Copy, Check, Clock, User, Globe } from 'lucide-react';
import { Button } from '../ui/Button';

interface UsageLog {
  timestamp: string;
  endpoint: string;
  method: string;
  ipAddress?: string;
  userAgent?: string;
}

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
  updatedAt?: string;
  revokedAt?: string;
  revokedBy?: string;
  expiresAt?: string;
  usageLogs?: UsageLog[];
}

interface KeyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: APIKey | null;
}

export const KeyDetailsModal: React.FC<KeyDetailsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !apiKey) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{apiKey.name}</h2>
              <p className="text-sm text-gray-600">{apiKey.organization}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apiKey.status)}`}>
              {apiKey.status.toUpperCase()}
            </span>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm break-all">
                {apiKey.key}
              </code>
              <Button
                onClick={() => copyToClipboard(apiKey.key)}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Permissions
            </label>
            <div className="flex flex-wrap gap-2">
              {apiKey.permissions.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                <Activity className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Total API Calls</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{apiKey.usageCount.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Last Used</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Detailed Information
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created
                </dt>
                <dd className="text-gray-900 font-medium">{formatDate(apiKey.createdAt)}</dd>
              </div>
              {apiKey.updatedAt && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Last Updated</dt>
                  <dd className="text-gray-900 font-medium">{formatDate(apiKey.updatedAt)}</dd>
                </div>
              )}
              {apiKey.revokedAt && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600 text-red-600">Revoked On</dt>
                  <dd className="text-red-900 font-medium">{formatDate(apiKey.revokedAt)}</dd>
                </div>
              )}
              {apiKey.revokedBy && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600 text-red-600">Revoked By</dt>
                  <dd className="text-red-900 font-medium">{apiKey.revokedBy}</dd>
                </div>
              )}
              {apiKey.expiresAt && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Expires</dt>
                  <dd className="text-gray-900 font-medium">{formatDate(apiKey.expiresAt)}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Key ID</dt>
                <dd className="text-gray-900 font-mono text-xs">{apiKey.id}</dd>
              </div>
            </dl>
          </div>

          {/* Usage History */}
          {apiKey.usageLogs && apiKey.usageLogs.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Recent Usage History
              </h3>
              
              {/* Non-Technical Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">📊 Usage Summary</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>
                    <span className="font-medium">Total Requests:</span>{' '}
                    <span className="font-bold">{apiKey.usageCount}</span> times this key has been used
                  </p>
                  <p>
                    <span className="font-medium">Last Activity:</span>{' '}
                    {apiKey.lastUsed ? (
                      <>
                        {(() => {
                          const lastUsed = new Date(apiKey.lastUsed);
                          const now = new Date();
                          const diffMs = now.getTime() - lastUsed.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffDays = Math.floor(diffMs / 86400000);
                          
                          if (diffMins < 1) return 'Just now';
                          if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                          if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                          return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                        })()}
                      </>
                    ) : (
                      'Never used'
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Most Common Action:</span>{' '}
                    {(() => {
                      const endpoints = apiKey.usageLogs.map(log => log.endpoint);
                      const counts = endpoints.reduce((acc: any, endpoint) => {
                        acc[endpoint] = (acc[endpoint] || 0) + 1;
                        return acc;
                      }, {});
                      const mostCommon = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0];
                      const endpointName = mostCommon[0].replace('/api/', '').replace('/', '');
                      return `Accessing ${endpointName} data (${mostCommon[1]} times)`;
                    })()}
                  </p>
                  <p className="text-xs pt-2 border-t border-blue-200 mt-2">
                    💡 <span className="font-medium">What this means:</span> This API key is being actively used by{' '}
                    <span className="font-semibold">{apiKey.organization}</span> to access your system's data.{' '}
                    {apiKey.usageCount > 10 ? 'This is a frequently used key.' : 'This is a new or occasionally used key.'}
                  </p>
                </div>
              </div>
              {/* Technical Details Header */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 italic">
                  📋 Technical details for developers (each request shows what data was accessed)
                </p>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {apiKey.usageLogs.slice(-10).reverse().map((log, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span 
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            log.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                            log.method === 'POST' ? 'bg-green-100 text-green-700' :
                            log.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                            log.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                          title={
                            log.method === 'GET' ? 'GET = Reading/viewing data' :
                            log.method === 'POST' ? 'POST = Creating new data' :
                            log.method === 'PUT' ? 'PUT = Updating existing data' :
                            log.method === 'DELETE' ? 'DELETE = Removing data' :
                            'Request type'
                          }
                        >
                          {log.method}
                        </span>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {log.endpoint}
                        </span>
                        <span className="text-xs text-gray-500 italic">
                          ({log.method === 'GET' ? 'viewed' : 
                            log.method === 'POST' ? 'created' : 
                            log.method === 'PUT' ? 'updated' : 
                            log.method === 'DELETE' ? 'deleted' : 'accessed'} {log.endpoint.replace('/api/', '').replace('/', '')} data)
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {log.ipAddress && (
                        <div className="flex items-center text-gray-600">
                          <Globe className="h-3 w-3 mr-1.5 text-blue-500" />
                          <span className="font-medium">IP:</span>
                          <span className="ml-1 font-mono">{log.ipAddress}</span>
                        </div>
                      )}
                      {log.userAgent && (
                        <div className="flex items-start text-gray-600 col-span-2">
                          <User className="h-3 w-3 mr-1.5 mt-0.5 text-purple-500 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="font-medium">User Agent:</span>
                            <span className="ml-1 break-all">
                              {log.userAgent.substring(0, 80)}{log.userAgent.length > 80 ? '...' : ''}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {apiKey.usageLogs.length > 10 && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Showing last 10 of <span className="font-semibold text-gray-700">{apiKey.usageLogs.length}</span> total requests
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Usage History */}
          {(!apiKey.usageLogs || apiKey.usageLogs.length === 0) && apiKey.usageCount === 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No usage history yet</p>
                <p className="text-xs text-gray-400 mt-1">API calls will appear here once the key is used</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
