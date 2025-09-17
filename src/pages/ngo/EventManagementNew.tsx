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
  CheckCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import MapsButton from '../../components/ui/MapsButton';
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
    area?: string;
    city: string;
    state: string;
    pinCode?: string;
    landmark?: string;
  };
  capacity: number;
  availableSpots: number;
  registrationStatus: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registeredVolunteers: any[];
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

  // Calculate event status counts
  const getEventStatusCounts = () => {
    const now = new Date();
    
    const active = events.filter(event => {
      const eventDate = new Date(event.date);
      return (event.status === 'draft' || event.status === 'published') && eventDate >= now;
    }).length;

    const finished = events.filter(event => {
      const eventDate = new Date(event.date);
      return event.status === 'completed' || (event.status === 'published' && eventDate < now);
    }).length;

    const deleted = events.filter(event => event.status === 'cancelled').length;

    return { active, finished, deleted };
  };

  const statusCounts = getEventStatusCounts();

  // Filter events based on search term and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = new Date();
    const eventDate = new Date(event.date);

    // Filter by status category
    if (statusFilter === 'active') {
      return (event.status === 'draft' || event.status === 'published') && eventDate >= now;
    } else if (statusFilter === 'finished') {
      return event.status === 'completed' || (event.status === 'published' && eventDate < now);
    } else if (statusFilter === 'deleted') {
      return event.status === 'cancelled';
    }

    return true; // Show all if no filter
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
      if (error.response?.status === 400) {
        alert('Cannot delete event with registered volunteers. Please cancel the event instead.');
      } else {
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const handleClearDeletedEvents = async () => {
    const deletedEvents = events.filter(event => event.status === 'cancelled');
    
    if (deletedEvents.length === 0) {
      alert('No deleted events to clear.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently clear ${deletedEvents.length} deleted event(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('careconnect_token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      // Delete all cancelled events permanently
      const deletePromises = deletedEvents.map(event => 
        axios.delete(`${API_BASE_URL}/events/${event._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      await Promise.all(deletePromises);
      alert('All deleted events cleared successfully');
      fetchEvents(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error: any) {
      console.error('Error clearing deleted events:', error);
      alert('Failed to clear deleted events. Please try again.');
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
          <Link to="/ngo/events/create">
            <Button className="bg-primary-600 hover:bg-primary-700 border border-primary-700">
              <Plus className="mr-2 w-4 h-4" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-primary-200 shadow-soft">
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

          <Card className="border border-primary-200 shadow-soft">
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

          <Card className="border border-primary-200 shadow-soft">
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

          <Card className="border border-primary-200 shadow-soft">
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

        {/* Search Bar */}
        <Card className="border border-primary-200 shadow-soft">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search events by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Event Status Filter Tabs */}
        <Card className="border border-primary-200 shadow-soft">
          <div className="p-6">
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex items-center justify-center px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  statusFilter === 'all'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                All Events
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  {events.length}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('active')}
                className={`flex items-center justify-center px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  statusFilter === 'active'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-blue-50 bg-white border border-gray-200'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Active Events
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {statusCounts.active}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('finished')}
                className={`flex items-center justify-center px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  statusFilter === 'finished'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-green-50 bg-white border border-gray-200'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finished Events
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {statusCounts.finished}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('deleted')}
                className={`flex items-center justify-center px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  statusFilter === 'deleted'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-red-50 bg-white border border-gray-200'
                }`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deleted Events
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  {statusCounts.deleted}
                </span>
              </button>

              {statusFilter === 'deleted' && statusCounts.deleted > 0 && (
                <Button
                  onClick={handleClearDeletedEvents}
                  variant="outline"
                  className="ml-4 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Deleted
                </Button>
              )}
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-primary-900">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {event.category}
                        </span>
                      </div>

                      <p className="text-primary-600 mb-4 line-clamp-2">{event.description}</p>

                      <div className="grid md:grid-cols-4 gap-4 text-sm text-primary-700">
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
                          <div className="text-sm flex-1">
                            <span className="font-medium">{event.location.address}</span>
                            {event.location.area && <span className="text-gray-500">, {event.location.area}</span>}
                            <span className="text-gray-500">, {event.location.city}, {event.location.state}</span>
                            {event.location.pinCode && <span className="text-gray-500"> - {event.location.pinCode}</span>}
                            {event.location.landmark && (
                              <div className="text-xs text-gray-500 mt-1">📍 {event.location.landmark}</div>
                            )}
                          </div>
                          <MapsButton
                            address={event.location.address}
                            area={event.location.area}
                            city={event.location.city}
                            state={event.location.state}
                            pinCode={event.location.pinCode}
                            landmark={event.location.landmark}
                            variant="ghost"
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-primary-500" />
                          <span>{event.capacity - event.availableSpots}/{event.capacity} registered</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Link to={`/events/${event._id}`}>
                        <Button variant="outline" size="sm" className="border-primary-300 text-primary-700 hover:bg-primary-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="border-primary-300 text-primary-700 hover:bg-primary-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event._id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
