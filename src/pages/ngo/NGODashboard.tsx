import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
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
import { getProfilePictureUrl } from '../../services/api';
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
    profilePicture: string;
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
          const data = response.data.data;
          // Deduplicate arrays to prevent duplicate keys
          if (data.recentVolunteers) {
            const uniqueVolunteers = data.recentVolunteers.filter((volunteer: any, index: number, arr: any[]) => 
              arr.findIndex((v: any) => v._id === volunteer._id) === index
            );
            data.recentVolunteers = uniqueVolunteers;
          }
          if (data.recentEvents) {
            const uniqueEvents = data.recentEvents.filter((event: any, index: number, arr: any[]) => 
              arr.findIndex((e: any) => e._id === event._id) === index
            );
            data.recentEvents = uniqueEvents;
          }
          if (data.campaigns) {
            const uniqueCampaigns = data.campaigns.filter((campaign: any, index: number, arr: any[]) => 
              arr.findIndex((c: any) => c.id === campaign.id) === index
            );
            data.campaigns = uniqueCampaigns;
          }
          setDashboardData(data);
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
      color: 'text-primary-600 bg-primary-50',
      change: '+12%'
    },
    {
      label: 'Active Events',
      value: dashboardData?.stats.activeEvents.toString() || '0',
      icon: Calendar,
      color: 'text-primary-600 bg-primary-50',
      change: '+3'
    },
    {
      label: 'Total Donations',
      value: dashboardData?.stats.totalDonations || '₹0L',
      icon: Heart,
      color: 'text-primary-600 bg-primary-50',
      change: '+18%'
    },
    {
      label: 'Impact Score',
      value: dashboardData?.stats.impactScore || '0.0',
      icon: Star,
      color: 'text-primary-600 bg-primary-50',
      change: '+0.2'
    }
  ];  const recentEvents = dashboardData?.recentEvents || [];
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
      <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-20 bg-white rounded-xl mb-8 shadow-soft border border-primary-100"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-xl shadow-soft border border-primary-100"></div>
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-white rounded-xl shadow-soft border border-primary-100"></div>
              <div className="h-96 bg-white rounded-xl shadow-soft border border-primary-100"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
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
    <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-soft border border-primary-100 hover:shadow-medium transition-all duration-300">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              Welcome, {user?.name}! 🏢
            </h1>
            <p className="text-primary-600 mt-2">Manage your organization and track your impact</p>
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
            <Link to="/stories/create">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center space-x-2 px-4 py-2 rounded-lg font-medium">
                <Heart className="w-4 h-4" />
                <span>Share Story</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-white rounded-xl border border-primary-100 shadow-soft">
          {stats.map((stat, index) => {
            if (stat.link) {
              return (
                <Link key={`stat-${stat.label}-${index}`} to={stat.link}>
                  <Card className="p-6 hover:shadow-medium transition-all duration-300 border-primary-200 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.color} border border-primary-200`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-900">{stat.value}</div>
                        {stat.change && (
                          <div className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                            {stat.change} this month
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-primary-600 font-medium border-t border-primary-100 pt-2">{stat.label}</div>
                  </Card>
                </Link>
              );
            }

            return (
              <Card key={`stat-${stat.label}-${index}`} className="p-6 hover:shadow-medium transition-all duration-300 border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color} border border-primary-200`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-900">{stat.value}</div>
                    <div className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                      {stat.change} this month
                    </div>
                  </div>
                </div>
                <div className="text-sm text-primary-600 font-medium border-t border-primary-100 pt-2">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Management */}
          <div className="lg:col-span-2">
            <Card className="p-6 h-full border-primary-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-100">
                <h2 className="text-xl font-semibold text-primary-900">Event Management</h2>
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
                {recentEvents.map((event, index) => (
                  <div key={`event-${event._id}-${index}`} className="bg-primary-50 rounded-lg p-4 border border-primary-200 hover:border-primary-300 transition-all duration-300 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-primary-900 mb-1 pb-1 border-b border-primary-100">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-primary-500 mb-2 pt-2">
                          <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border border-primary-100">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border border-primary-100">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border border-primary-100">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2 border-t border-primary-100">
                          <div className="flex items-center space-x-1 text-sm text-primary-600">
                            <Users className="w-4 h-4" />
                            <span>{event.volunteers}/{event.capacity} volunteers</span>
                          </div>
                          <div className="w-20 bg-primary-200 rounded-full h-1.5 border border-primary-300">
                            <div 
                              className="bg-primary-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${(event.volunteers / event.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          event.status === 'upcoming' 
                            ? 'bg-primary-100 text-primary-800 border-primary-200' 
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {event.status}
                        </span>
                        <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-600 border border-transparent hover:border-primary-200">
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
            <Card className="p-6 border-primary-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary-100">
                <h3 className="text-lg font-semibold text-primary-900">Active Campaigns</h3>
                <Link to="/ngo/campaigns">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {campaigns.map((campaign, index) => (
                  <div key={`campaign-${campaign.id}-${index}`} className="bg-primary-50 rounded-lg p-4 border border-primary-200 hover:border-primary-300 transition-all duration-300 shadow-sm">
                    <h4 className="font-medium text-primary-900 mb-2 pb-2 border-b border-primary-100">{campaign.title}</h4>
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-600 px-2 py-1 bg-white rounded border border-primary-100">
                          ₹{campaign.raised.toLocaleString()} raised
                        </span>
                        <span className="text-primary-600 px-2 py-1 bg-white rounded border border-primary-100">
                          ₹{campaign.target.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-primary-200 rounded-full h-2 border border-primary-300">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${(campaign.raised / campaign.target) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-primary-500 pt-1 border-t border-primary-100">
                        <span className="px-2 py-1 bg-white rounded border border-primary-100">{campaign.donors} donors</span>
                        <span className="px-2 py-1 bg-white rounded border border-primary-100">{campaign.daysLeft} days left</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Volunteers */}
            <Card className="p-6 border-primary-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary-100">
                <h3 className="text-lg font-semibold text-primary-900">New Volunteers</h3>
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              
              <div className="space-y-3">
                {recentVolunteers.map((volunteer, index) => (
                  <div key={`volunteer-${volunteer._id}-${index}`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-all duration-300 border border-transparent hover:border-primary-200">
                    <img
                      src={getProfilePictureUrl(volunteer.profilePicture, volunteer.name, 40)}
                      alt={volunteer.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-primary-900">{volunteer.name}</div>
                      <div className="text-sm text-primary-500">
                        Joined {formatDate(volunteer.joinedDate)}
                      </div>
                    </div>
                    <div className="text-sm text-primary-600 px-2 py-1 bg-primary-50 rounded border border-primary-200">
                      {volunteer.eventsJoined} events
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-primary-200">
                <Link to="/ngo/volunteers">
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 w-4 h-4" />
                    Manage All Volunteers
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Stories Section */}
            <Card className="p-6 border-primary-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary-100">
                <h3 className="text-lg font-semibold text-primary-900">Your Stories</h3>
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              
              <p className="text-sm text-primary-600 mb-4 p-3 bg-primary-50 rounded border border-primary-200">
                Share your impact stories and inspire others in the community.
              </p>
              
              <div className="space-y-3">
                <Link to="/stories/create">
                  <Button className="w-full bg-green-600 hover:bg-green-700 border border-green-700">
                    <Plus className="mr-2 w-4 h-4" />
                    Create New Story
                  </Button>
                </Link>
                <Link to="/stories?tab=my">
                  <Button variant="outline" className="w-full border-primary-300">
                    <Edit className="mr-2 w-4 h-4" />
                    My Stories
                  </Button>
                </Link>
                <Link to="/stories">
                  <Button variant="outline" className="w-full border-primary-300">
                    <Eye className="mr-2 w-4 h-4" />
                    View All Stories
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 border-primary-200">
          <h3 className="text-lg font-semibold mb-4 text-primary-900 pb-3 border-b border-primary-100">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/ngo/events/create">
              <Button variant="outline" className="w-full p-4 h-auto flex-col hover:bg-primary-50 border-primary-200 hover:border-primary-300 shadow-sm hover:shadow-medium">
                <Calendar className="w-6 h-6 mb-2 text-primary-600" />
                <span className="text-primary-700">Create Event</span>
              </Button>
            </Link>
            <Link to="/ngo/campaigns/create">
              <Button variant="outline" className="w-full p-4 h-auto flex-col hover:bg-primary-50 border-primary-200 hover:border-primary-300 shadow-sm hover:shadow-medium">
                <Target className="w-6 h-6 mb-2 text-primary-600" />
                <span className="text-primary-700">Start Campaign</span>
              </Button>
            </Link>
            <Link to="/stories/create">
              <Button variant="outline" className="w-full p-4 h-auto flex-col hover:bg-primary-50 border-primary-200 hover:border-primary-300 shadow-sm hover:shadow-medium">
                <Heart className="w-6 h-6 mb-2 text-primary-600" />
                <span className="text-primary-700">Share Story</span>
              </Button>
            </Link>
            <Link to="/ngo/volunteers">
              <Button variant="outline" className="w-full p-4 h-auto flex-col hover:bg-primary-50 border-primary-200 hover:border-primary-300 shadow-sm hover:shadow-medium">
                <Users className="w-6 h-6 mb-2 text-primary-600" />
                <span className="text-primary-700">Manage Volunteers</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};