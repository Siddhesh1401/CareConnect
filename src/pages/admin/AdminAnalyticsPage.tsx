import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from API
  const fetchAnalyticsData = async (range: string = timeRange) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('careconnect_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/analytics`, {
        params: { timeRange: range },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when timeRange changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = () => {
    // Export functionality
    if (!analyticsData) {
      alert('No data to export');
      return;
    }

    const exportData = {
      timeRange,
      metrics: analyticsData.metrics,
      userGrowth: analyticsData.userGrowth,
      ngoStatus: analyticsData.ngoStatus,
      campaignPerformance: analyticsData.campaignPerformance,
      activity: analyticsData.activity,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Show loading state
  if (isLoading && !analyticsData) {
    return (
      <div className="min-h-screen bg-primary-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Error: {error}</div>
            <Button onClick={handleRefresh} className="bg-primary-600 hover:bg-primary-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-primary-600" />
                </div>
                <span>Analytics Dashboard</span>
              </h1>
              <p className="text-gray-600">Comprehensive insights into platform performance and user engagement</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              <Button
                onClick={handleExport}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-1">
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setTimeRange('7d')}
                className={`flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === '7d'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last 7 Days
              </button>
              
              <button
                onClick={() => setTimeRange('30d')}
                className={`flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === '30d'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 Days
              </button>
              
              <button
                onClick={() => setTimeRange('90d')}
                className={`flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === '90d'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last 90 Days
              </button>
              
              <button
                onClick={() => setTimeRange('1y')}
                className={`flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === '1y'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last Year
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-primary-600">
                  {analyticsData?.metrics?.totalUsers || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +{analyticsData?.metrics?.userGrowthPercent || 0}% from last month
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active NGOs</p>
                <p className="text-2xl font-bold text-primary-600">
                  {analyticsData?.metrics?.activeNGOs || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Donations</p>
                <p className="text-2xl font-bold text-primary-600">
                  ₹{analyticsData?.metrics?.totalDonations?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +15.3% from last month
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">System Activity</p>
                <p className="text-2xl font-bold text-primary-600">
                  {analyticsData?.metrics?.systemActivity || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +5.7% from last month
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <Card className="p-6 bg-white border border-primary-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">User Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.6}
                  name="Total Users"
                />
                <Area
                  type="monotone"
                  dataKey="volunteers"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Volunteers"
                />
                <Area
                  type="monotone"
                  dataKey="ngos"
                  stackId="3"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.6}
                  name="NGOs"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* NGO Status Distribution */}
          <Card className="p-6 bg-white border border-primary-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">NGO Registration Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.ngoStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(analyticsData?.ngoStatus || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Campaign Performance */}
          <Card className="p-6 bg-white border border-primary-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Campaign Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.campaignPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="donations" fill="#6366F1" name="Donations (₹)" />
                <Bar dataKey="participants" fill="#10B981" name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* System Activity */}
          <Card className="p-6 bg-white border border-primary-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">System Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.activity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="logins"
                  stroke="#6366F1"
                  strokeWidth={2}
                  name="User Logins"
                />
                <Line
                  type="monotone"
                  dataKey="actions"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Total Actions"
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Errors"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-primary-100">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center space-x-2">
              <Eye className="w-5 h-5 text-primary-600" />
              <span>Top Performing Campaigns</span>
            </h4>
            <div className="space-y-3">
              {(analyticsData?.campaignPerformance || []).slice(0, 3).map((campaign: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{campaign.name}</span>
                  <span className="text-sm font-medium text-primary-600">₹{campaign.donations.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white border border-primary-100">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span>Recent Activity</span>
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New NGO Registration</span>
                <span className="text-xs text-primary-600">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Campaign Completed</span>
                <span className="text-xs text-primary-600">5 hours ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Story Published</span>
                <span className="text-xs text-primary-600">1 day ago</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-primary-100">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <span>Growth Metrics</span>
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Growth</span>
                <span className="text-sm font-medium text-green-600">
                  +{analyticsData?.metrics?.userGrowthPercent || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Retention</span>
                <span className="text-sm font-medium text-green-600">87.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Engagement Rate</span>
                <span className="text-sm font-medium text-green-600">94.1%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
