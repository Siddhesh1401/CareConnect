import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Calendar, 
  Users, 
  Heart, 
  Clock, 
  MapPin, 
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Hours', value: '45', icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { label: 'Events Joined', value: '12', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { label: 'Donations Made', value: '₹5,250', icon: Heart, color: 'text-blue-600 bg-blue-50' },
    { label: 'Community Posts', value: '8', icon: Users, color: 'text-blue-600 bg-blue-50' }
  ];

  const recentEvents = [
    {
      id: '1',
      title: 'Beach Cleanup Drive',
      ngo: 'Green Earth Foundation',
      date: '2025-01-25',
      time: '9:00 AM',
      location: 'Juhu Beach, Mumbai',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Tree Plantation',
      ngo: 'EcoWarriors',
      date: '2025-01-20',
      time: '7:00 AM', 
      location: 'Aarey Forest, Mumbai',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Food Distribution',
      ngo: 'Hope Foundation',
      date: '2025-01-15',
      time: '6:00 PM',
      location: 'Dharavi, Mumbai',
      status: 'completed'
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Completed your first volunteer activity',
      icon: '🏆',
      earnedDate: '2025-01-15',
      points: 100
    },
    {
      id: '2',
      title: 'Community Builder',
      description: 'Made 10 posts in community discussions',
      icon: '🌟',
      earnedDate: '2025-01-20',
      points: 200
    },
    {
      id: '3',
      title: 'Environmental Champion',
      description: 'Participated in 5 environmental events',
      icon: '🌱',
      earnedDate: '2025-01-22',
      points: 300
    }
  ];

  const upcomingEvents = [
    {
      id: '4',
      title: 'Educational Workshop',
      ngo: 'Hope for Children',
      date: '2025-01-28',
      location: 'Bandra Community Center'
    },
    {
      id: '5',
      title: 'Senior Care Program',
      ngo: 'Community Care',
      date: '2025-02-02',
      location: 'Bandra West'
    }
  ];

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
              <div className="text-3xl font-bold text-white">{user?.points || 1250}</div>
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
            {achievements.map((achievement) => (
              <div key={achievement.id} className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{new Date(achievement.earnedDate).toLocaleDateString()}</span>
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
                {recentEvents.map((event) => (
                  <div key={event.id} className="group bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors duration-300">{event.title}</h3>
                        <p className="text-blue-600 font-medium mb-3">{event.ngo}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
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
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{event.title}</h3>
                    <p className="text-blue-600 font-medium mb-4">{event.ngo}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Link to={`/events/${event.id}`}>
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-blue-200">
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