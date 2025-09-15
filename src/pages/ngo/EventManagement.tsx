import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Search,
  CheckCircle,
  BarChart3,
  Ban
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getFullImageUrl } from '../../services/api';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  capacity: number;
  availableSpots: number;
  registrationStatus: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registeredVolunteers: any[];
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export const EventManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalVolunteers: 0,
    upcomingEvents: 0
  });

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('careconnect_token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await axios.get(`${API_BASE_URL}/events/ngo/my-events?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setEvents(response.data.data.events);
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('careconnect_token');
        navigate('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch event statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('careconnect_token');
      
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/events/ngo/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [statusFilter]);

  // Filter events based on search term
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('careconnect_token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Event deleted successfully');
        fetchEvents(); // Refresh the list
        fetchStats(); // Refresh stats
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      if (error.response?.status === 400 && error.response?.data?.data?.canCancel) {
        const volunteersCount = error.response.data.data.registeredVolunteers;
        const shouldCancel = window.confirm(
          `Cannot delete event with ${volunteersCount} registered volunteer(s). Would you like to cancel the event instead? This will mark it as cancelled and notify volunteers.`
        );
        
        if (shouldCancel) {
          handleCancelEvent(eventId);
        }
      } else {
        alert(error.response?.data?.message || 'Failed to delete event. Please try again.');
      }
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem('careconnect_token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.patch(`${API_BASE_URL}/events/${eventId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const volunteersCount = response.data.data.registeredVolunteers;
        alert(`Event cancelled successfully. ${volunteersCount} registered volunteers will be notified.`);
        fetchEvents(); // Refresh the list
        fetchStats(); // Refresh stats
      }
    } catch (error: any) {
      console.error('Error cancelling event:', error);
      alert(error.response?.data?.message || 'Failed to cancel event. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-soft border border-primary-100">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Event Management</h1>
            <p className="text-primary-600 mt-2">Create and manage your organization's events</p>
          </div>
          <div className="flex gap-3">
            <Link to="/ngo/events/analytics">
              <Button variant="outline" className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">
                <BarChart3 className="mr-2 w-4 h-4" />
                View Analytics
              </Button>
            </Link>
            <Link to="/ngo/events/create">
              <Button className="bg-primary-600 hover:bg-primary-700 border border-primary-700">
                <Plus className="mr-2 w-4 h-4" />
                Create New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-primary-200 shadow-soft hover:shadow-medium transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">Total Events</p>
                  <p className="text-3xl font-bold text-primary-900">{stats.totalEvents}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="border border-primary-200 shadow-soft hover:shadow-medium transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">Published</p>
                  <p className="text-3xl font-bold text-primary-900">{stats.publishedEvents}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="border border-primary-200 shadow-soft hover:shadow-medium transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">Total Volunteers</p>
                  <p className="text-3xl font-bold text-primary-900">{stats.totalVolunteers}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="border border-primary-200 shadow-soft hover:shadow-medium transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">Upcoming Events</p>
                  <p className="text-3xl font-bold text-primary-900">{stats.upcomingEvents}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border border-primary-200 shadow-soft">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                />
              </div>

              <div className="flex space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Events List */}
        {loading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="border border-primary-200 shadow-soft">
                <div className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-primary-100 rounded mb-4"></div>
                    <div className="h-4 bg-primary-100 rounded mb-2"></div>
                    <div className="h-4 bg-primary-100 rounded w-3/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-900 mb-2">No events found</h3>
              <p className="text-primary-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first event to get started.'}
              </p>
              <Link to="/ngo/events/create">
                <Button className="bg-primary-600 hover:bg-primary-700 border border-primary-700">
                  <Plus className="mr-2 w-4 h-4" />
                  Create New Event
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="border border-primary-200 shadow-soft hover:shadow-medium transition-shadow">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Event Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={getFullImageUrl(event.image)}
                        alt={event.title}
                        className="w-20 h-20 object-cover rounded-lg border border-primary-200"
                      />
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-primary-900 truncate">{event.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {event.category}
                            </span>
                          </div>

                          <p className="text-primary-600 mb-4 line-clamp-2">{event.description}</p>
                        
                          <div className="grid md:grid-cols-4 gap-4 text-sm text-primary-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-primary-500" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-primary-500" />
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-primary-500" />
                              <span>{event.location.city}, {event.location.state}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-primary-500" />
                              <span>{event.capacity - event.availableSpots}/{event.capacity} registered</span>
                            </div>
                        </div>
                      </div>
                    
                      <div className="flex space-x-2 mt-4">
                        <Link to={`/events/${event._id}`}>
                          <Button variant="outline" size="sm" className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/ngo/events/${event._id}/volunteers`}>
                          <Button variant="outline" size="sm" className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">
                            <Users className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/ngo/events/edit/${event._id}`}>
                          <Button variant="outline" size="sm" className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>

                        {event.status !== 'cancelled' && event.registeredVolunteers?.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelEvent(event._id)}
                            className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                            title="Cancel Event"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event._id)}
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-primary-600 mb-1">
                    <span>Registration Progress</span>
                    <span>{Math.round(((event.capacity - event.availableSpots) / event.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-primary-100 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((event.capacity - event.availableSpots) / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
