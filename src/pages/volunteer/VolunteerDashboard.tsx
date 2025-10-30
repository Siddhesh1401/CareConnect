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
import { api } from '../../services/api';

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

        const response = await api.get('/volunteer');

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
      color: 'text-primary-600 bg-primary-50'
    },
    {
      label: 'Events Joined',
      value: dashboardData?.stats.eventsJoined.toString() || '0',
      icon: Calendar,
      color: 'text-primary-600 bg-primary-50'
    },
    {
      label: 'Completed',
      value: dashboardData?.stats.completedEvents.toString() || '0',
      icon: Award,
      color: 'text-primary-600 bg-primary-50'
    },
    {
      label: 'Upcoming',
      value: dashboardData?.stats.upcomingEvents.toString() || '0',
      icon: Star,
      color: 'text-primary-600 bg-primary-50'
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
      <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
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
        <div className="bg-white rounded-lg border border-primary-200 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">Here's your impact overview and upcoming activities</p>
            </div>
            
            <div className="bg-primary-50 rounded-lg p-4 sm:p-6 border border-primary-200 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start space-x-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-900">{dashboardData?.stats.totalPoints || 0}</div>
                  <div className="text-sm text-primary-600">Total Points</div>
                </div>
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const content = (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color.includes('blue') ? 'text-blue-600' : 'text-primary-600'}`} />
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-1000 ${stat.color.includes('blue') ? 'bg-blue-600' : 'bg-primary-600'}`} style={{width: `${Math.min(100, (index + 1) * 25)}%`}}></div>
                </div>
              </>
            );

            return (
              <Card key={index} className="p-6 bg-white border-primary-200">
                <div className="block">
                  {content}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Achievements Panel */}
        <Card className="p-6 bg-white border-primary-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-600 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Achievements</h2>
            </div>
            <Link to="/achievements">
              <Button variant="outline" size="sm" className="border-primary-200 hover:border-primary-300 hover:bg-primary-50">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dashboardData?.achievements.map((achievement) => (
              <div key={achievement.id} className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="text-2xl flex-shrink-0">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{achievement.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-gray-500 truncate flex-1">{formatDate(achievement.earnedDate)}</span>
                  <div className="flex items-center space-x-2 bg-primary-600 text-white px-3 py-1 rounded-full flex-shrink-0">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">{achievement.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="p-6 h-full bg-white border-primary-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-600 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
                </div>
                <Link to="/events">
                  <Button variant="outline" size="sm" className="border-primary-200 hover:border-primary-300 hover:bg-primary-50">
                    Browse More
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {dashboardData?.recentEvents.map((event) => (
                  <div key={event._id} className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-primary-600 font-medium mb-3">{event.ngo}</p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2 whitespace-nowrap">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 whitespace-nowrap">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'upcoming' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-green-600 text-white'
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
            <Card className="p-6 h-full bg-white border-primary-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-600 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Discover Events</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                {dashboardData?.upcomingEvents.map((event) => (
                  <div key={event._id} className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-primary-600 font-medium mb-3">{event.ngo}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
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
                      <Button size="sm" className="w-full bg-primary-600 hover:bg-primary-700">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-primary-200 space-y-4">
                <Link to="/stories/create" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 py-3">
                    <Heart className="mr-2 w-4 h-4" />
                    Share Your Story
                  </Button>
                </Link>
                <Link to="/stories?tab=my" className="block">
                  <Button variant="outline" className="w-full border-primary-200 hover:border-primary-300 hover:bg-primary-50 py-3">
                    <Edit className="mr-2 w-4 h-4" />
                    My Stories
                  </Button>
                </Link>
                <Link to="/community" className="block">
                  <Button variant="outline" className="w-full border-primary-200 hover:border-primary-300 hover:bg-primary-50 py-3">
                    <Users className="mr-2 w-4 h-4" />
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