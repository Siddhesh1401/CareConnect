import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Calendar,
  Users,
  Heart,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Edit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface DashboardData {
  stats: {
    totalHours: number;
    eventsJoined: number;
    completedEvents: number;
    upcomingEvents: number;
    totalPoints: number;
  };
  recentEvents: Array<{
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    ngo: string;
    status: 'upcoming' | 'completed';
    registrationDate?: string;
  }>;
  upcomingEvents: Array<{
    _id: string;
    title: string;
    ngo: string;
    date: string;
    location: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedDate: string;
    points: number;
  }>;
}

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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

        const response = await axios.get(`${API_BASE_URL}/dashboard/volunteer`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: 'Total Hours',
      value: dashboardData?.stats.totalHours.toString() || '0',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Events Joined',
      value: dashboardData?.stats.eventsJoined.toString() || '0',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Completed',
      value: dashboardData?.stats.completedEvents.toString() || '0',
      icon: Award,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Upcoming',
      value: dashboardData?.stats.upcomingEvents.toString() || '0',
      icon: Star,
      color: 'text-blue-600 bg-blue-50'
    }
  ];

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl border border-blue-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">Here's your impact overview and upcoming activities</p>
          </div>
          
          <div className="relative z-10 flex items-center space-x-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{dashboardData?.stats.totalPoints || 0}</div>
              <div className="text-sm text-blue-100">Total Points</div>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="group p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border border-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 w-full bg-blue-50 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{width: `${Math.min(100, (index + 1) * 25)}%`}}></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Achievements Panel */}
        <Card className="p-8 bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Achievements</h2>
            </div>
            <Link to="/achievements">
              <Button variant="outline" size="sm" className="group border-blue-200 hover:border-blue-300 hover:bg-blue-50">
                View All
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData?.achievements.map((achievement) => (
              <div key={achievement.id} className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{formatDate(achievement.earnedDate)}</span>
                  <div className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-full">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">{achievement.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
                </div>
                <Link to="/events">
                  <Button variant="outline" size="sm" className="group border-blue-200 hover:border-blue-300 hover:bg-blue-50">
                    Browse More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-6">
                {dashboardData?.recentEvents.map((event) => (
                  <div key={event._id} className="group bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors duration-300">{event.title}</h3>
                        <p className="text-blue-600 font-medium mb-3">{event.ngo}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                        event.status === 'upcoming' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card className="p-8 h-full bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Discover Events</h2>
                </div>
              </div>
              
              <div className="space-y-6">
                {dashboardData?.upcomingEvents.map((event) => (
                  <div key={event._id} className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{event.title}</h3>
                    <p className="text-blue-600 font-medium mb-4">{event.ngo}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Link to={`/events/${event._id}`}>
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-blue-200 space-y-4">
                <Link to="/stories/create">
                  <Button className="w-full group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Heart className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    Share Your Story
                  </Button>
                </Link>
                <Link to="/stories?tab=my">
                  <Button variant="outline" className="w-full group border-blue-200 hover:border-blue-300 hover:bg-blue-50">
                    <Edit className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    My Stories
                  </Button>
                </Link>
                <Link to="/community" className="block">
                  <Button variant="outline" className="w-full group border-blue-200 hover:border-blue-300 hover:bg-blue-50">
                    <Users className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    Join Community Discussions
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};