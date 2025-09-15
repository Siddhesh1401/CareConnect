import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Activity,
  Download,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { api, getFullImageUrl } from '../../services/api';

interface Report {
  _id: string;
  type: 'event' | 'campaign' | 'community' | 'ngo' | 'story';
  targetId: string;
  reporterId: {
    _id: string;
    name: string;
    email: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  adminResponse?: string;
  resolvedBy?: {
    _id: string;
    name: string;
  };
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'reject' | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'createdAt' | 'status' | 'type'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [contentData, setContentData] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, statusFilter, typeFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.reporterId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reporterId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt).toISOString().split('T')[0];
        const startDate = dateRange.start || '1970-01-01';
        const endDate = dateRange.end || new Date().toISOString().split('T')[0];
        return reportDate >= startDate && reportDate <= endDate;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const handleAction = (report: Report, action: 'resolve' | 'reject') => {
    setSelectedReport(report);
    setActionType(action);
    setAdminResponse('');
    setIsActionModalOpen(true);
  };

  const submitAction = async () => {
    if (!selectedReport || !actionType) return;

    setIsProcessing(true);
    try {
      const status = actionType === 'resolve' ? 'resolved' : 'rejected';
      await api.put(`/reports/${selectedReport._id}/status`, {
        status,
        adminResponse: adminResponse.trim() || undefined
      });

      // Update local state
      setReports(reports.map(report =>
        report._id === selectedReport._id
          ? { ...report, status, adminResponse: adminResponse.trim() || undefined, resolvedAt: new Date() }
          : report
      ));

      setIsActionModalOpen(false);
      setSelectedReport(null);
      setActionType(null);
      setAdminResponse('');
    } catch (error) {
      console.error('Failed to update report status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async (action: 'resolve' | 'reject') => {
    if (selectedReports.size === 0) return;

    setIsProcessing(true);
    try {
      const status = action === 'resolve' ? 'resolved' : 'rejected';
      const reportIds = Array.from(selectedReports);

      // Update all selected reports
      await Promise.all(
        reportIds.map(id =>
          api.put(`/reports/${id}/status`, {
            status,
            adminResponse: `Bulk ${action}d by admin`
          })
        )
      );

      // Update local state
      setReports(reports.map(report =>
        selectedReports.has(report._id)
          ? { ...report, status, adminResponse: `Bulk ${action}d by admin`, resolvedAt: new Date() }
          : report
      ));

      setSelectedReports(new Set());
    } catch (error) {
      console.error('Failed to bulk update reports:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Type',
      'Reporter Name',
      'Reporter Email',
      'Reason',
      'Description',
      'Status',
      'Admin Response',
      'Created Date',
      'Resolved Date'
    ];

    const csvData = filteredReports.map(report => [
      report._id,
      report.type,
      report.reporterId.name,
      report.reporterId.email,
      report.reason,
      `"${report.description.replace(/"/g, '""')}"`,
      report.status,
      report.adminResponse ? `"${report.adminResponse.replace(/"/g, '""')}"` : '',
      new Date(report.createdAt).toLocaleString(),
      report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewReportedContent = async (report: Report) => {
    setContentLoading(true);
    setContentModalOpen(true);

    try {
      let contentResponse;

      switch (report.type) {
        case 'event':
          contentResponse = await api.get(`/events/${report.targetId}`);
          break;
        case 'campaign':
          contentResponse = await api.get(`/campaigns/${report.targetId}`);
          break;
        case 'community':
          contentResponse = await api.get(`/communities/${report.targetId}`);
          break;
        case 'story':
          contentResponse = await api.get(`/stories/${report.targetId}`);
          break;
        case 'ngo':
          contentResponse = await api.get(`/ngos/${report.targetId}`);
          break;
        default:
          throw new Error('Unsupported content type');
      }

      if (contentResponse.data.success) {
        setContentData({
          ...contentResponse.data.data,
          reportType: report.type,
          report: report
        });
      } else {
        setContentData(null);
      }
    } catch (error) {
      console.error('Failed to load reported content:', error);
      setContentData(null);
    } finally {
      setContentLoading(false);
    }
  };

  const handleContentAction = async (action: 'delete' | 'hide' | 'warn', contentData: any) => {
    if (!contentData) return;

    setIsProcessing(true);
    try {
      let actionResult;

      switch (action) {
        case 'delete':
          switch (contentData.reportType) {
            case 'event':
              actionResult = await api.delete(`/events/${contentData._id || contentData.id}`);
              break;
            case 'campaign':
              actionResult = await api.delete(`/campaigns/${contentData._id || contentData.id}`);
              break;
            case 'community':
              actionResult = await api.delete(`/communities/${contentData._id || contentData.id}`);
              break;
            case 'story':
              actionResult = await api.delete(`/stories/${contentData._id || contentData.id}`);
              break;
            case 'ngo':
              // For NGOs, we can't delete the NGO account, but we can mark the report as resolved
              // In a real implementation, this might involve suspending the NGO or other admin actions
              console.log('NGO deletion would require special admin privileges');
              break;
          }
          break;

        case 'hide':
          // For now, we'll implement hide as an update that sets status to hidden
          // This would need backend support for a proper hide feature
          console.log('Hide functionality would need backend implementation');
          break;

        case 'warn':
          // This would typically send a notification to the content creator
          console.log('Warn functionality would need notification system');
          break;
      }

      if (actionResult && actionResult.data.success) {
        // Update the report status to resolved
        await api.put(`/reports/${contentData.report._id}/status`, {
          status: 'resolved',
          adminResponse: `Content ${action}d by admin`
        });

        // Update local state
        setReports(reports.map(report =>
          report._id === contentData.report._id
            ? { ...report, status: 'resolved', adminResponse: `Content ${action}d by admin`, resolvedAt: new Date() }
            : report
        ));

        setContentModalOpen(false);
        setContentData(null);
      }
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'campaign': return 'bg-indigo-100 text-indigo-800';
      case 'community': return 'bg-cyan-100 text-cyan-800';
      case 'interview': return 'bg-pink-100 text-pink-800';
      case 'study': return 'bg-orange-100 text-orange-800';
      case 'ngo': return 'bg-teal-100 text-teal-800';
      case 'tourist': return 'bg-lime-100 text-lime-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total Reports: {reports.length}
          </div>
          <Button
            onClick={exportToCSV}
            variant="secondary"
            size="sm"
            disabled={filteredReports.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Analytics Dashboard
          </h2>
          <Button
            onClick={() => setShowAnalytics(!showAnalytics)}
            variant="secondary"
            size="sm"
          >
            {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>
        </div>

        {showAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Reports */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Reports</p>
                  <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
                </div>
              </div>
            </div>

            {/* Pending Reports */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {reports.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Resolved Reports */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-900">
                    {reports.filter(r => r.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejected Reports */}
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-900">
                    {reports.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports by Type */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Reports by Type</h3>
              <div className="space-y-2">
                {['event', 'campaign', 'community', 'ngo', 'story'].map(type => {
                  const count = reports.filter(r => r.type === type).length;
                  const percentage = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {reports.slice(0, 5).map(report => (
                  <div key={report._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      report.status === 'resolved' ? 'bg-green-500' :
                      report.status === 'rejected' ? 'bg-red-500' :
                      report.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{report.reason}</p>
                      <p className="text-xs text-gray-500">
                        {report.reporterId.name} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="event">Events</option>
            <option value="campaign">Campaigns</option>
            <option value="community">Communities</option>
            <option value="ngo">NGOs</option>
            <option value="story">Stories</option>
          </select>

          <div>
            <label className="block text-xs text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
                setDateRange({
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                });
              }}
              variant="secondary"
              className="flex-1"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Sorting Options */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'status' | 'type')}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="createdAt">Date Created</option>
                <option value="status">Status</option>
                <option value="type">Type</option>
              </select>
              <Button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                variant="secondary"
                size="sm"
              >
                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        </div>
      </Card>
      {selectedReports.size > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedReports(new Set(filteredReports.map(r => r._id)));
                    } else {
                      setSelectedReports(new Set());
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-blue-700">Select All</span>
              </div>
              <div className="h-4 w-px bg-blue-300"></div>
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedReports.size} report{selectedReports.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleBulkAction('resolve')}
                variant="primary"
                size="sm"
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Bulk Resolve
              </Button>
              <Button
                onClick={() => handleBulkAction('reject')}
                variant="danger"
                size="sm"
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Bulk Reject
              </Button>
              <Button
                onClick={() => setSelectedReports(new Set())}
                variant="secondary"
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {reports.length === 0
                ? 'No reports have been submitted yet.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report._id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedReports.has(report._id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedReports);
                        if (e.target.checked) {
                          newSelected.add(report._id);
                        } else {
                          newSelected.delete(report._id);
                        }
                        setSelectedReports(newSelected);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(report.type)}`}>
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {report.reason}
                  </h3>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {report.reporterId.name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    onClick={() => handleViewDetails(report)}
                    variant="secondary"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  <Button
                    onClick={() => viewReportedContent(report)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Content
                  </Button>

                  {report.status === 'pending' || report.status === 'under_review' ? (
                    <>
                      <Button
                        onClick={() => handleAction(report, 'resolve')}
                        variant="primary"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                      <Button
                        onClick={() => handleAction(report, 'reject')}
                        variant="danger"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedReport.type)}`}>
                  {selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status.replace('_', ' ').charAt(0).toUpperCase() + selectedReport.status.replace('_', ' ').slice(1)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
              <div className="text-sm text-gray-600">
                <p><strong>Name:</strong> {selectedReport.reporterId.name}</p>
                <p><strong>Email:</strong> {selectedReport.reporterId.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <p className="text-gray-900">{selectedReport.reason}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.description}</p>
            </div>

            {selectedReport.adminResponse && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.adminResponse}</p>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p><strong>Reported on:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
              {selectedReport.resolvedAt && (
                <p><strong>Resolved on:</strong> {new Date(selectedReport.resolvedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={`${actionType === 'resolve' ? 'Resolve' : 'Reject'} Report`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {actionType} this report?
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Response (Optional)
            </label>
            <Textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Add a response to inform the reporter..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setIsActionModalOpen(false)}
              variant="secondary"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              disabled={isProcessing}
              variant={actionType === 'resolve' ? 'primary' : 'danger'}
            >
              {isProcessing ? 'Processing...' : `${actionType === 'resolve' ? 'Resolve' : 'Reject'} Report`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Content Moderation Modal */}
      <Modal
        isOpen={contentModalOpen}
        onClose={() => {
          setContentModalOpen(false);
          setContentData(null);
        }}
        title="Review Reported Content"
      >
        {contentLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading content...</span>
          </div>
        ) : contentData ? (
          <div className="space-y-6">
            {/* Report Information */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Report Details</h3>
              <div className="text-sm text-red-800">
                <p><strong>Reason:</strong> {contentData.report.reason}</p>
                <p><strong>Description:</strong> {contentData.report.description}</p>
                <p><strong>Reported by:</strong> {contentData.report.reporterId.name}</p>
              </div>
            </div>

            {/* Content Display */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                {contentData.reportType} Content
              </h3>

              {contentData.reportType === 'event' && (
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">{contentData.title}</h4>
                  <p className="text-gray-600">{contentData.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Location:</strong> {contentData.location}</div>
                    <div><strong>Date:</strong> {new Date(contentData.date).toLocaleDateString()}</div>
                    <div><strong>Category:</strong> {contentData.category}</div>
                    <div><strong>Status:</strong> {contentData.status}</div>
                  </div>
                  {contentData.image && (
                    <img
                      src={getFullImageUrl(contentData.image)}
                      alt={contentData.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

              {contentData.reportType === 'campaign' && (
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">{contentData.title}</h4>
                  <p className="text-gray-600">{contentData.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Target:</strong> ${contentData.target}</div>
                    <div><strong>Current:</strong> ${contentData.current || 0}</div>
                    <div><strong>Category:</strong> {contentData.category}</div>
                    <div><strong>Status:</strong> {contentData.status}</div>
                  </div>
                  {contentData.image && (
                    <img
                      src={getFullImageUrl(contentData.image)}
                      alt={contentData.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

              {contentData.reportType === 'community' && (
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">{contentData.name}</h4>
                  <p className="text-gray-600">{contentData.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Category:</strong> {contentData.category}</div>
                    <div><strong>Members:</strong> {contentData.memberCount || 0}</div>
                    <div><strong>Privacy:</strong> {contentData.isPrivate ? 'Private' : 'Public'}</div>
                  </div>
                  {contentData.image && (
                    <img
                      src={getFullImageUrl(contentData.image)}
                      alt={contentData.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

              {contentData.reportType === 'ngo' && (
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">{contentData.organizationName || contentData.name}</h4>
                  <p className="text-gray-600">{contentData.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Type:</strong> {contentData.organizationType}</div>
                    <div><strong>Email:</strong> {contentData.email}</div>
                    <div><strong>Phone:</strong> {contentData.phone}</div>
                    <div><strong>Founded:</strong> {contentData.foundedYear}</div>
                  </div>
                  {contentData.location && (
                    <div className="text-sm">
                      <strong>Location:</strong> {contentData.location.city}, {contentData.location.state}
                    </div>
                  )}
                  {contentData.logo && (
                    <img
                      src={getFullImageUrl(contentData.logo)}
                      alt={contentData.organizationName || contentData.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

              {contentData.reportType === 'story' && (
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">{contentData.title}</h4>
                  <p className="text-gray-600">{contentData.excerpt}</p>
                  <div className="text-sm">
                    <strong>Content:</strong>
                    <div className="mt-2 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                      {contentData.content}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Category:</strong> {contentData.category}</div>
                    <div><strong>Status:</strong> {contentData.status}</div>
                  </div>
                  {contentData.image && (
                    <img
                      src={getFullImageUrl(contentData.image)}
                      alt={contentData.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Moderation Actions */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderation Actions</h3>
              <div className="flex flex-wrap gap-3">
                {contentData.reportType !== 'ngo' ? (
                  <Button
                    onClick={() => handleContentAction('delete', contentData)}
                    variant="danger"
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Delete Content
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleContentAction('delete', contentData)}
                    variant="danger"
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Suspend NGO
                  </Button>
                )}
                <Button
                  onClick={() => handleContentAction('hide', contentData)}
                  variant="secondary"
                  disabled={isProcessing}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Hide Content
                </Button>
                <Button
                  onClick={() => handleContentAction('warn', contentData)}
                  variant="warning"
                  disabled={isProcessing}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Warn Creator
                </Button>
              </div>
              {contentData.reportType === 'ngo' && (
                <p className="text-sm text-gray-600 mt-2">
                  Note: NGO accounts cannot be deleted but can be suspended or hidden from public view.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content Not Found</h3>
            <p className="text-gray-600">
              The reported content may have been already deleted or is no longer available.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};