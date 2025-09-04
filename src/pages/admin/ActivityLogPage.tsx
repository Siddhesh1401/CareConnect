import { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Download,
  RefreshCw,
  Clock,
  Monitor,
  Globe
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'warning' | 'error' | 'info';
  category: 'auth' | 'user' | 'ngo' | 'event' | 'system' | 'admin';
}

// Enhanced mock data with more comprehensive activities
const mockLogs: ActivityLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    user: 'Admin User',
    userId: 'admin-1',
    action: 'LOGIN',
    resource: 'Admin Panel',
    details: 'Successful admin login from dashboard',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    category: 'auth'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    user: 'Sarah Johnson',
    userId: 'vol-123',
    action: 'EVENT_REGISTRATION',
    resource: 'Beach Cleanup Drive',
    details: 'Volunteer registered for event successfully',
    ipAddress: '203.192.12.45',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    status: 'success',
    category: 'event'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    user: 'Green Earth Foundation',
    userId: 'ngo-456',
    action: 'EVENT_CREATED',
    resource: 'Tree Plantation Drive',
    details: 'New event created and published to platform',
    ipAddress: '157.48.23.67',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    category: 'event'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
    user: 'System',
    userId: 'system',
    action: 'BACKUP_COMPLETED',
    resource: 'Database',
    details: 'Automated daily database backup completed successfully',
    ipAddress: '127.0.0.1',
    userAgent: 'System Process',
    status: 'success',
    category: 'system'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    user: 'Unknown User',
    userId: 'unknown',
    action: 'LOGIN_FAILED',
    resource: 'Admin Panel',
    details: 'Failed login attempt with invalid credentials',
    ipAddress: '45.123.67.89',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    status: 'error',
    category: 'auth'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    user: 'Hope Foundation',
    userId: 'ngo-789',
    action: 'NGO_REGISTRATION',
    resource: 'NGO Application',
    details: 'New NGO registration submitted for approval',
    ipAddress: '198.51.100.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'info',
    category: 'ngo'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    user: 'Admin User',
    userId: 'admin-1',
    action: 'USER_SUSPENDED',
    resource: 'User Account',
    details: 'User account suspended for policy violation',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'warning',
    category: 'admin'
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
    user: 'Rahul Kumar',
    userId: 'vol-456',
    action: 'DONATION_MADE',
    resource: 'Clean Water Initiative',
    details: 'Donation of ₹1,000 made to campaign',
    ipAddress: '203.192.45.78',
    userAgent: 'Mozilla/5.0 (Android 11; Mobile)',
    status: 'success',
    category: 'event'
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 1000 * 60 * 360), // 6 hours ago
    user: 'Admin User',
    userId: 'admin-1',
    action: 'NGO_APPROVED',
    resource: 'Green Earth Foundation',
    details: 'NGO registration approved and account activated',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    category: 'admin'
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 1000 * 60 * 420), // 7 hours ago
    user: 'Priya Sharma',
    userId: 'vol-789',
    action: 'PROFILE_UPDATED',
    resource: 'User Profile',
    details: 'User updated profile information and skills',
    ipAddress: '203.192.67.12',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
    status: 'success',
    category: 'user'
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 1000 * 60 * 480), // 8 hours ago
    user: 'System',
    userId: 'system',
    action: 'EMAIL_SENT',
    resource: 'Notification System',
    details: 'Bulk email notification sent to 150 volunteers',
    ipAddress: '127.0.0.1',
    userAgent: 'System Process',
    status: 'success',
    category: 'system'
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 1000 * 60 * 540), // 9 hours ago
    user: 'Admin User',
    userId: 'admin-1',
    action: 'MESSAGE_REPLIED',
    resource: 'Support Ticket #123',
    details: 'Admin replied to user support message',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    category: 'admin'
  },
  {
    id: '13',
    timestamp: new Date(Date.now() - 1000 * 60 * 600), // 10 hours ago
    user: 'Mumbai NGO Network',
    userId: 'ngo-101',
    action: 'CAMPAIGN_CREATED',
    resource: 'Education for All',
    details: 'New donation campaign created with ₹50,000 target',
    ipAddress: '157.48.89.34',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    category: 'event'
  },
  {
    id: '14',
    timestamp: new Date(Date.now() - 1000 * 60 * 660), // 11 hours ago
    user: 'System',
    userId: 'system',
    action: 'SECURITY_ALERT',
    resource: 'Login System',
    details: 'Multiple failed login attempts detected from IP 45.123.67.89',
    ipAddress: '127.0.0.1',
    userAgent: 'System Process',
    status: 'warning',
    category: 'system'
  },
  {
    id: '15',
    timestamp: new Date(Date.now() - 1000 * 60 * 720), // 12 hours ago
    user: 'Admin User',
    userId: 'admin-1',
    action: 'SETTINGS_UPDATED',
    resource: 'System Configuration',
    details: 'Updated email notification settings',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    category: 'admin'
  }
];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, statusFilter, categoryFilter, dateFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate loading the mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Add some recent activities to make it more dynamic
      const recentActivities: ActivityLogEntry[] = [
        {
          id: 'recent-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          user: 'Admin User',
          userId: 'admin-1',
          action: 'PAGE_VIEW',
          resource: 'Activity Log',
          details: 'Viewed activity log page',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'info',
          category: 'admin'
        },
        {
          id: 'recent-2',
          timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
          user: 'System',
          userId: 'system',
          action: 'CACHE_CLEARED',
          resource: 'Application Cache',
          details: 'Application cache cleared automatically',
          ipAddress: '127.0.0.1',
          userAgent: 'System Process',
          status: 'success',
          category: 'system'
        }
      ];

      setLogs([...recentActivities, ...mockLogs]);
      setFilteredLogs([...recentActivities, ...mockLogs]);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.user,
        log.action,
        log.resource,
        log.status,
        log.ipAddress,
        `"${log.details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'ngo':
        return 'bg-green-100 text-green-800';
      case 'event':
        return 'bg-orange-100 text-orange-800';
      case 'system':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <span>Activity Log</span>
            </h1>
            <p className="text-gray-600 mt-2">Monitor system activities and user actions</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={fetchLogs}
              isLoading={isLoading}
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={exportLogs}
            >
              <Download className="mr-2 w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Activities</p>
                <p className="text-2xl font-bold text-blue-600">{filteredLogs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((filteredLogs.filter(l => l.status === 'success').length / filteredLogs.length) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Failed Actions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredLogs.filter(l => l.status === 'error').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <XCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Unique Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(filteredLogs.map(l => l.userId)).size}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-blue-50 border border-blue-100">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="bg-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="info">Info</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="user">User Actions</option>
              <option value="ngo">NGO Actions</option>
              <option value="event">Events</option>
              <option value="system">System</option>
              <option value="admin">Admin Actions</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </Card>

        {/* Activity Log Table */}
        <Card className="overflow-hidden bg-white border border-blue-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-gray-500">Loading activity logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No activity logs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {log.timestamp.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.user}</div>
                        <div className="text-xs text-gray-500">{log.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-blue-50 px-6 py-3 border-t border-blue-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};