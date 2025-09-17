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
  Users,
  UserCheck,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface VolunteerAnalyticsData {
  totalVolunteers: number;
  activeVolunteers: number;
  newRegistrations: number;
  averageAge: number;
  retentionRate: number;
  participationRate: number;
  ageDistribution: { range: string; count: number; percentage: number }[];
  monthlySignups: { month: string; signups: number; active: number }[];
  topVolunteers: { name: string; points: number; eventsJoined: number; level: string }[];
  locationStats: { city: string; volunteers: number; events: number }[];
  activityTrends: { date: string; logins: number; eventJoins: number }[];
  skillsDistribution: { skill: string; volunteers: number }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export const VolunteerAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<VolunteerAnalyticsData | null>(null);
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
      // Mock data for now - will be replaced with actual API call
      const mockData: VolunteerAnalyticsData = {
        totalVolunteers: 1247,
        activeVolunteers: 892,
        newRegistrations: 156,
        averageAge: 26.4,
        retentionRate: 78.3,
        participationRate: 65.8,
        ageDistribution: [
          { range: '18-24', count: 423, percentage: 33.9 },
          { range: '25-34', count: 487, percentage: 39.1 },
          { range: '35-44', count: 198, percentage: 15.9 },
          { range: '45+', count: 139, percentage: 11.1 }
        ],
        monthlySignups: [
          { month: 'Jan', signups: 89, active: 67 },
          { month: 'Feb', signups: 124, active: 98 },
          { month: 'Mar', signups: 156, active: 134 },
          { month: 'Apr', signups: 178, active: 147 },
          { month: 'May', signups: 203, active: 189 },
          { month: 'Jun', signups: 234, active: 198 }
        ],
        topVolunteers: [
          { name: 'Priya Sharma', points: 2450, eventsJoined: 24, level: 'Gold' },
          { name: 'Arjun Patel', points: 2280, eventsJoined: 19, level: 'Gold' },
          { name: 'Sneha Reddy', points: 2100, eventsJoined: 21, level: 'Silver' },
          { name: 'Rahul Kumar', points: 1980, eventsJoined: 18, level: 'Silver' },
          { name: 'Anita Singh', points: 1850, eventsJoined: 16, level: 'Silver' }
        ],
        locationStats: [
          { city: 'Mumbai', volunteers: 289, events: 45 },
          { city: 'Delhi', volunteers: 234, events: 38 },
          { city: 'Bangalore', volunteers: 198, events: 32 },
          { city: 'Chennai', volunteers: 167, events: 28 },
          { city: 'Pune', volunteers: 142, events: 24 }
        ],
        activityTrends: [
          { date: 'Week 1', logins: 456, eventJoins: 89 },
          { date: 'Week 2', logins: 523, eventJoins: 112 },
          { date: 'Week 3', logins: 478, eventJoins: 98 },
          { date: 'Week 4', logins: 589, eventJoins: 134 }
        ],
        skillsDistribution: [
          { skill: 'Teaching', volunteers: 234 },
          { skill: 'Healthcare', volunteers: 198 },
          { skill: 'Environment', volunteers: 167 },
          { skill: 'Community Service', volunteers: 143 },
          { skill: 'Technology', volunteers: 89 }
        ]
      };
      
      setAnalytics(mockData);
    } catch (error: any) {
      console.error('Error fetching volunteer analytics:', error);
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
    const exportFileDefaultName = `volunteer-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
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
            <p className="text-primary-600 mt-2">Comprehensive insights into volunteer engagement and community growth</p>
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
                  <p className="text-primary-600 text-sm font-medium">Total Volunteers</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.totalVolunteers.toLocaleString()}</p>
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
                  <p className="text-3xl font-bold text-primary-900">{analytics.activeVolunteers.toLocaleString()}</p>
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
                  <p className="text-primary-600 text-sm font-medium">New Registrations</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.newRegistrations}</p>
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
                  <p className="text-primary-600 text-sm font-medium">Average Age</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.averageAge.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Clock className="w-8 h-8 text-primary-600" />
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
                  <p className="text-primary-600 text-sm font-medium">Participation Rate</p>
                  <p className="text-3xl font-bold text-primary-900">{analytics.participationRate}%</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <MapPin className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 - Feature 2: Monthly Trends & Feature 3: Age Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Signup Trends */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Monthly Volunteer Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlySignups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="signups"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="New Signups"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Active Volunteers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Age Distribution */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Age Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.ageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.range} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.ageDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts Row 2 - Feature 4: Top Volunteers & Feature 5: Location Stats */}
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
                  <Bar dataKey="points" fill="#3B82F6" name="Points" />
                  <Bar dataKey="eventsJoined" fill="#10B981" name="Events Joined" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Location Statistics */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Volunteers by City</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.locationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volunteers" fill="#F59E0B" name="Volunteers" />
                  <Bar dataKey="events" fill="#8B5CF6" name="Events" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Feature 6: Detailed Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Volunteer Performance Details */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Volunteer Leaderboard</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="text-left py-2 text-primary-700">Name</th>
                      <th className="text-right py-2 text-primary-700">Points</th>
                      <th className="text-right py-2 text-primary-700">Events</th>
                      <th className="text-center py-2 text-primary-700">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topVolunteers.map((volunteer, index) => (
                      <tr key={index} className="border-b border-primary-100">
                        <td className="py-2 font-medium text-primary-900">{volunteer.name}</td>
                        <td className="py-2 text-right text-primary-900">{volunteer.points.toLocaleString()}</td>
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

          {/* Skills Distribution */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">Skills Distribution</h3>
              <div className="space-y-4">
                {analytics.skillsDistribution.map((skill, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-primary-900 font-medium">{skill.skill}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-primary-100 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${(skill.volunteers / analytics.totalVolunteers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-primary-600 text-sm font-medium">{skill.volunteers}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-primary-900 mb-3">Activity Insights</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-900">71.5%</p>
                    <p className="text-primary-600">Engagement Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-900">2.3</p>
                    <p className="text-primary-600">Avg Events/Month</p>
                  </div>
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
                <h3 className="text-lg font-semibold text-primary-900">Export Volunteer Analytics</h3>
                <p className="text-primary-600">Download detailed reports for volunteer management and insights</p>
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

export default VolunteerAnalytics;