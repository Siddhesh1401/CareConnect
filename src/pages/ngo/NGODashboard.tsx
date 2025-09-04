import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Heart, 
  Plus, 
  Edit,
  Eye,
  MapPin,
  Clock,
  Star,
  Target,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface NGODashboardData {
  stats: {
    totalVolunteers: number;
    activeEvents: number;
    totalEvents: number;
    upcomingEvents: number;
    totalDonations: string;
    impactScore: string;
  };
  recentEvents: Array<{
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    volunteers: number;
    capacity: number;
    status: string;
  }>;
  recentVolunteers: Array<{
    _id: string;
    name: string;
    avatar: string;
    joinedDate: string;
    eventsJoined: number;
  }>;
  campaigns: any[];
}

export const NGODashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<NGODashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('careconnect_token');

        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/dashboard/ngo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error: any) {
        console.error('Error fetching NGO dashboard data:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { 
      label: 'Total Volunteers', 
      value: dashboardData?.stats.totalVolunteers.toString() || '0', 
      icon: Users, 
      color: 'text-blue-600 bg-blue-50', 
      change: '+12%' 
    },
    { 
      label: 'Active Events', 
      value: dashboardData?.stats.activeEvents.toString() || '0', 
      icon: Calendar, 
      color: 'text-blue-600 bg-blue-50', 
      change: '+3' 
    },
    { 
      label: 'Total Donations', 
      value: dashboardData?.stats.totalDonations || '₹0L', 
      icon: Heart, 
      color: 'text-blue-600 bg-blue-50', 
      change: '+18%' 
    },
    { 
      label: 'Impact Score', 
      value: dashboardData?.stats.impactScore || '0.0', 
      icon: Star, 
      color: 'text-blue-600 bg-blue-50', 
      change: '+0.2' 
    }
  ];

  const recentEvents = dashboardData?.recentEvents || [];
  const recentVolunteers = dashboardData?.recentVolunteers || [];
  const campaigns = dashboardData?.campaigns || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name}! 🏢
            </h1>
            <p className="text-gray-600 mt-2">Manage your organization and track your impact</p>
          </div>
          <div className="flex gap-3">
            <Link to="/ngo/profile/edit">
              <Button variant="outline" className="flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            </Link>
            <Link to={`/ngos/${user?.id}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>View Public Profile</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-green-600">
                    {stat.change} this month
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Management */}
          <div className="lg:col-span-2">
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Event Management</h2>
                <div className="flex space-x-2">
                  <Link to="/ngo/events">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 w-4 h-4" />
                      View All
                    </Button>
                  </Link>
                  <Link to="/ngo/events/create">
                    <Button size="sm">
                      <Plus className="mr-2 w-4 h-4" />
                      Create
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event._id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{event.volunteers}/{event.capacity} volunteers</span>
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${(event.volunteers / event.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {event.status}
                        </span>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Campaign Progress */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
                <Link to="/ngo/campaigns">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-medium text-gray-900 mb-2">{campaign.title}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          ₹{campaign.raised.toLocaleString()} raised
                        </span>
                        <span className="text-gray-600">
                          ₹{campaign.target.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(campaign.raised / campaign.target) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{campaign.donors} donors</span>
                        <span>{campaign.daysLeft} days left</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Volunteers */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">New Volunteers</h3>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="space-y-3">
                {recentVolunteers.map((volunteer) => (
                  <div key={volunteer._id} className="flex items-center space-x-3">
                    <img
                      src={volunteer.avatar}
                      alt={volunteer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{volunteer.name}</div>
                      <div className="text-sm text-gray-500">
                        Joined {formatDate(volunteer.joinedDate)}
                      </div>
                    </div>
                    <div className="text-sm text-blue-600">
                      {volunteer.eventsJoined} events
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link to="/ngo/volunteers">
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 w-4 h-4" />
                    Manage All Volunteers
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/ngo/events/create">
              <Button variant="outline" className="w-full p-4 h-auto flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                <span>Create Event</span>
              </Button>
            </Link>
            <Link to="/ngo/campaigns/create">
              <Button variant="outline" className="w-full p-4 h-auto flex-col">
                <Target className="w-6 h-6 mb-2" />
                <span>Start Campaign</span>
              </Button>
            </Link>
            <Link to="/ngo/volunteers">
              <Button variant="outline" className="w-full p-4 h-auto flex-col">
                <Users className="w-6 h-6 mb-2" />
                <span>Manage Volunteers</span>
              </Button>
            </Link>
            <Link to="/ngo/reports">
              <Button variant="outline" className="w-full p-4 h-auto flex-col">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span>View Reports</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};