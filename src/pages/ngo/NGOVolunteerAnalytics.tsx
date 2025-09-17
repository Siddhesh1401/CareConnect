import React, { useState, useEffect } from 'react';
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
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  UserCheck,
  TrendingUp,
  Award,
  Clock,
  Star,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface NGOVolunteerAnalyticsData {
  totalVolunteers: number;
  activeVolunteers: number;
  newVolunteers: number;
  averageRating: number;
  retentionRate: number;
  totalHours: number;
  skillsDistribution: { skill: string; count: number; percentage: number }[];
  monthlyEngagement: { month: string; volunteers: number; hours: number; events: number }[];
  topVolunteers: { name: string; hours: number; eventsJoined: number; rating: number; level: string }[];
  eventParticipation: { eventType: string; participants: number; hours: number }[];
  volunteerGrowth: { date: string; newJoins: number; totalActive: number }[];
  performanceMetrics: { metric: string; current: number; previous: number; change: number }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export const NGOVolunteerAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<NGOVolunteerAnalyticsData | null>(null);
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
      // Mock data for NGO volunteer analytics
      const mockData: NGOVolunteerAnalyticsData = {
        totalVolunteers: 47,
        activeVolunteers: 32,
        newVolunteers: 8,
        averageRating: 4.6,
        retentionRate: 82.4,
        totalHours: 1247,
        skillsDistribution: [
          { skill: 'Teaching', count: 18, percentage: 38.3 },
          { skill: 'Event Management', count: 14, percentage: 29.8 },
          { skill: 'Healthcare Support', count: 12, percentage: 25.5 },
          { skill: 'Fundraising', count: 9, percentage: 19.1 },
          { skill: 'Social Media', count: 7, percentage: 14.9 }
        ],
        monthlyEngagement: [
          { month: 'Jan', volunteers: 28, hours: 186, events: 6 },
          { month: 'Feb', volunteers: 31, hours: 234, events: 8 },
          { month: 'Mar', volunteers: 35, hours: 287, events: 9 },
          { month: 'Apr', volunteers: 38, hours: 312, events: 11 },
          { month: 'May', volunteers: 42, hours: 356, events: 13 },
          { month: 'Jun', volunteers: 47, hours: 398, events: 15 }
        ],
        topVolunteers: [
          { name: 'Priya Sharma', hours: 142, eventsJoined: 12, rating: 4.9, level: 'Gold' },
          { name: 'Arjun Patel', hours: 128, eventsJoined: 10, rating: 4.8, level: 'Gold' },
          { name: 'Sneha Reddy', hours: 115, eventsJoined: 9, rating: 4.7, level: 'Silver' },
          { name: 'Rahul Kumar', hours: 98, eventsJoined: 8, rating: 4.6, level: 'Silver' },
          { name: 'Anita Singh', hours: 87, eventsJoined: 7, rating: 4.5, level: 'Bronze' }
        ],
        eventParticipation: [
          { eventType: 'Education Programs', participants: 23, hours: 456 },
          { eventType: 'Healthcare Camps', participants: 18, hours: 324 },
          { eventType: 'Environmental Cleanup', participants: 15, hours: 245 },
          { eventType: 'Community Outreach', participants: 12, hours: 198 },
          { eventType: 'Fundraising Events', participants: 9, hours: 134 }
        ],
        volunteerGrowth: [
          { date: 'Week 1', newJoins: 2, totalActive: 28 },
          { date: 'Week 2', newJoins: 3, totalActive: 31 },
          { date: 'Week 3', newJoins: 1, totalActive: 32 },
          { date: 'Week 4', newJoins: 4, totalActive: 36 }
        ],
        performanceMetrics: [
          { metric: 'Volunteer Satisfaction', current: 4.6, previous: 4.3, change: 7.0 },
          { metric: 'Event Completion Rate', current: 94.2, previous: 89.1, change: 5.7 },
          { metric: 'Average Hours per Volunteer', current: 26.5, previous: 23.8, change: 11.3 }
        ]
      };
      
      setAnalytics(mockData);
    } catch (error: any) {
      console.error('Error fetching NGO volunteer analytics:', error);
      setError('Failed to load analytics data');
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
    const exportFileDefaultName = `ngo-volunteer-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
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
          <p className="text-primary-600 mt-4">Loading volunteer analytics...</p>
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
            <h1 className="text-3xl font-bold text-primary-900">Volunteer Analytics</h1>
            <p className="text-primary-600 mt-2">Insights into your volunteer engagement and performance</p>
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

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">Total Volunteers</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.totalVolunteers}</p>
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
                  <p className="text-primary-600 text-sm font-medium">Active Volunteers</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.activeVolunteers}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <UserCheck className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">New Volunteers</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.newVolunteers}</p>
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
                  <p className="text-primary-600 text-sm font-medium">Average Rating</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.averageRating.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Star className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-600 text-sm font-medium">Retention Rate</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.retentionRate}%</p>
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
                  <p className="text-primary-600 text-sm font-medium">Total Hours</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.totalHours.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Clock className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Engagement Trends */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Monthly Engagement</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="volunteers"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Active Volunteers"
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Hours Contributed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Skills Distribution */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Volunteer Skills Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.skillsDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.skill} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.skillsDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Volunteers */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Top Volunteers</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topVolunteers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#3B82F6" name="Hours Contributed" />
                  <Bar dataKey="eventsJoined" fill="#10B981" name="Events Joined" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Event Participation */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Event Participation by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.eventParticipation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="eventType" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="participants" fill="#F59E0B" name="Participants" />
                  <Bar dataKey="hours" fill="#8B5CF6" name="Total Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Volunteer Leaderboard */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Volunteer Leaderboard</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="text-left py-2 text-primary-700">Name</th>
                      <th className="text-right py-2 text-primary-700">Hours</th>
                      <th className="text-right py-2 text-primary-700">Events</th>
                      <th className="text-center py-2 text-primary-700">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topVolunteers.map((volunteer, index) => (
                      <tr key={index} className="border-b border-primary-100">
                        <td className="py-2 font-medium text-primary-900">{volunteer.name}</td>
                        <td className="py-2 text-right text-primary-900">{volunteer.hours}</td>
                        <td className="py-2 text-right text-primary-900">{volunteer.eventsJoined}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            volunteer.level === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                            volunteer.level === 'Silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {volunteer.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Performance Insights</h3>
              <div className="space-y-4">
                {analytics.performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-primary-900 font-medium">{metric.metric}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-primary-600 text-sm">{metric.current.toFixed(1)}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        metric.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-primary-900 mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-900">{(analytics.totalHours / analytics.activeVolunteers).toFixed(1)}</p>
                    <p className="text-primary-600">Avg Hours/Volunteer</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-900">{((analytics.activeVolunteers / analytics.totalVolunteers) * 100).toFixed(1)}%</p>
                    <p className="text-primary-600">Engagement Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NGOVolunteerAnalytics;