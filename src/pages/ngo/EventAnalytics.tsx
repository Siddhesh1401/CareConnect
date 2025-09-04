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
  ResponsiveContainer
} from 'recharts';
import {
  Calendar,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface AnalyticsData {
  totalEvents: number;
  totalVolunteers: number;
  averageRegistration: number;
  completionRate: number;
  categoryDistribution: { category: string; count: number; percentage: number }[];
  monthlyEvents: { month: string; events: number; volunteers: number }[];
  topEvents: { title: string; volunteers: number; status: string }[];
  locationStats: { city: string; events: number; volunteers: number }[];
  registrationTrends: { date: string; registrations: number }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export const EventAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('careconnect_token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/events/ngo/analytics?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAnalytics(response.data.data.analytics);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('careconnect_token');
        navigate('/auth/login');
      } else {
        setError('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Analytics</h1>
            <p className="text-gray-600 mt-2">Insights into your event performance and volunteer engagement</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-blue-700">{analytics.totalEvents}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Volunteers</p>
                <p className="text-3xl font-bold text-green-700">{analytics.totalVolunteers}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Avg. Registration</p>
                <p className="text-3xl font-bold text-orange-700">{analytics.averageRegistration.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-700">{analytics.completionRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-lg">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Events by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.category} (${entry.percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Events */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Event Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Events"
                />
                <Line 
                  type="monotone" 
                  dataKey="volunteers" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Volunteers"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Events */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Events</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volunteers" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Location Statistics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Events by Location</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.locationStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#F59E0B" name="Events" />
                <Bar dataKey="volunteers" fill="#10B981" name="Volunteers" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Events Table */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Event Title</th>
                    <th className="text-right py-2">Volunteers</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topEvents.map((event, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{event.title}</td>
                      <td className="py-2 text-right">{event.volunteers}</td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          event.status === 'published' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Location Details */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Location Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">City</th>
                    <th className="text-right py-2">Events</th>
                    <th className="text-right py-2">Volunteers</th>
                    <th className="text-right py-2">Avg/Event</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.locationStats.map((location, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{location.city}</td>
                      <td className="py-2 text-right">{location.events}</td>
                      <td className="py-2 text-right">{location.volunteers}</td>
                      <td className="py-2 text-right">
                        {location.events > 0 ? (location.volunteers / location.events).toFixed(1) : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export Analytics</h3>
              <p className="text-gray-600">Download detailed reports for your records</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                Export PDF
              </Button>
              <Button variant="outline">
                Export CSV
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
