import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Award,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { campaignAPI } from '../../services/api';

interface CampaignAnalyticsData {
  totalCampaigns: number;
  totalRaised: number;
  totalDonors: number;
  averageDonation: number;
  successRate: number;
  activeRate: number;
  donationDistribution: { range: string; count: number; percentage: number }[];
  monthlyTrends: { month: string; campaigns: number; raised: number; donors: number }[];
  topCampaigns: { title: string; raised: number; target: number; donors: number; status: string }[];
  categoryPerformance: { category: string; campaigns: number; raised: number }[];
  donorInsights: { newDonors: number; returningDonors: number; averageLifetime: number }[];
  performanceMetrics: { metric: string; current: number; previous: number; change: number }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export const CampaignAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<CampaignAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('1month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await campaignAPI.getCampaignAnalytics({ timeRange });
      
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError(response.message || 'Failed to load analytics data');
      }
    } catch (error: any) {
      console.error('Error fetching campaign analytics:', error);
      setError(error.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExport = () => {
    if (!analytics) return;
    
    const exportData = {
      timeRange,
      generatedAt: new Date().toISOString(),
      metrics: analytics
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `campaign-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-primary-600 mt-4">Loading campaign analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchAnalytics()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-soft border border-primary-100">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Campaign Analytics</h1>
            <p className="text-primary-600 mt-2">Comprehensive insights into your fundraising performance and donor engagement</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards - Feature 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">Total Campaigns</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.totalCampaigns}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Target className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">Total Raised</p>
                  <p className="text-3xl font-bold text-primary-900">₹{(analytics.totalRaised / 100000).toFixed(1)}L</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">Total Donors</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.totalDonors}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">Avg. Donation</p>
                  <p className="text-3xl font-bold text-primary-900">₹{analytics.averageDonation.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.successRate}%</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Award className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">Active Rate</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.activeRate}%</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 - Feature 2: Fundraising Trends & Feature 3: Donation Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Fundraising Trends */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Monthly Fundraising Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'raised') return [`₹${(value / 100000).toFixed(1)}L`, 'Amount Raised'];
                      if (name === 'campaigns') return [value, 'Campaigns'];
                      if (name === 'donors') return [value, 'Donors'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="raised"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Amount Raised (₹)"
                  />
                  <Area
                    type="monotone"
                    dataKey="donors"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Donors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Donation Distribution */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Donation Amount Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.donationDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.range} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.donationDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts Row 2 - Feature 4: Top Campaigns & Feature 5: Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Campaigns */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Top Performing Campaigns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topCampaigns.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'raised' || name === 'target') return [`₹${(value / 100000).toFixed(1)}L`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="raised" fill="#3B82F6" name="Amount Raised" />
                  <Bar dataKey="target" fill="#E5E7EB" name="Target Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Performance */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Performance by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'raised') return [`₹${(value / 100000).toFixed(1)}L`, 'Amount Raised'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="campaigns" fill="#F59E0B" name="Campaigns" />
                  <Bar dataKey="raised" fill="#10B981" name="Amount Raised" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Feature 6: Detailed Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Performance Details */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Campaign Performance Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="text-left py-2 text-primary-700">Campaign</th>
                      <th className="text-right py-2 text-primary-700">Progress</th>
                      <th className="text-right py-2 text-primary-700">Donors</th>
                      <th className="text-center py-2 text-primary-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topCampaigns.slice(0, 6).map((campaign, index) => (
                      <tr key={index} className="border-b border-primary-100">
                        <td className="py-2 font-medium text-primary-900">{campaign.title}</td>
                        <td className="py-2 text-right text-primary-900">
                          {((campaign.raised / campaign.target) * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 text-right text-primary-900">{campaign.donors}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Donor Insights */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Donor Insights</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-900">{analytics.donorInsights[0]?.newDonors || 0}</p>
                    <p className="text-primary-600 text-sm">New Donors</p>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-900">{analytics.donorInsights[0]?.returningDonors || 0}</p>
                    <p className="text-primary-600 text-sm">Returning Donors</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary-900">Performance Metrics</h4>
                  {analytics.performanceMetrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-primary-600">{metric.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-primary-900">
                          {metric.metric.includes('Duration') ? `${metric.current} days` : 
                           metric.metric.includes('Rate') ? `${metric.current}%` : 
                           metric.current}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          metric.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="border border-primary-200 shadow-soft">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">Export Campaign Analytics</h3>
                <p className="text-primary-600">Download detailed reports for your records and stakeholders</p>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">
                  Export PDF Report
                </Button>
                <Button variant="outline" className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">
                  Export CSV Data
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CampaignAnalytics;