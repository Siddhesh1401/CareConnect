import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search, 
  Filter,
  ChevronDown,
  Star,
  Heart,
  Building,
  CheckCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatBot } from '../../components/ChatBot';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  organizerName: string;
  organizationName: string;
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
  registrationStatus: 'open' | 'filling_fast' | 'full';
  isUserRegistered?: boolean;
  tags?: string[];
}

export const EventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Environment', label: 'Environment' },
    { value: 'Education', label: 'Education' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Community Development', label: 'Community Development' },
    { value: 'Animal Welfare', label: 'Animal Welfare' },
    { value: 'Disaster Relief', label: 'Disaster Relief' },
    { value: 'Women Empowerment', label: 'Women Empowerment' },
    { value: 'Youth Development', label: 'Youth Development' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'pune', label: 'Pune' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'hyderabad', label: 'Hyderabad' }
  ];

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLocation !== 'all') params.append('city', selectedLocation);

      // Include auth token if available to get registration status
      const token = localStorage.getItem('careconnect_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_BASE_URL}/events?${params}`, { headers });
      
      if (response.data.success) {
        setEvents(response.data.data.events);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, selectedCategory, selectedLocation, pagination.page]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Environment': 'bg-green-100 text-green-800',
      'Education': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Community Development': 'bg-purple-100 text-purple-800',
      'Animal Welfare': 'bg-orange-100 text-orange-800',
      'Disaster Relief': 'bg-yellow-100 text-yellow-800',
      'Women Empowerment': 'bg-pink-100 text-pink-800',
      'Youth Development': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getRegistrationStatusBadge = (status: string) => {
    switch (status) {
      case 'full':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Full</span>;
      case 'filling_fast':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Filling Fast</span>;
      default:
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Open</span>;
    }
  };
  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-900 mb-6 animate-fade-in">
            Volunteer Events
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            Discover meaningful volunteer opportunities and make a positive impact in your community
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-8 mb-12 bg-white border border-primary-200 shadow-soft">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search events, organizations, or locations..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="w-full h-12 text-lg border-primary-200 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full lg:w-52 h-12 px-4 py-3 border border-primary-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer bg-white shadow-soft hover:shadow-medium transition-all duration-300"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full lg:w-52 h-12 px-4 py-3 border border-primary-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer bg-white shadow-soft hover:shadow-medium transition-all duration-300"
              >
                {locations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden h-12 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600 text-lg">
            {loading ? (
              'Loading events...'
            ) : (
              <>
                Showing <span className="font-semibold text-primary-600">{events.length}</span> events
                {searchTerm && (
                  <span> for "<span className="font-semibold text-primary-600">{searchTerm}</span>"</span>
                )}
              </>
            )}
          </p>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="font-medium">Sort by:</span>
            <select className="border border-primary-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-soft hover:shadow-medium transition-all duration-300">
              <option value="date">Date</option>
              <option value="popularity">Popularity</option>
              <option value="location">Location</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden bg-white border border-primary-200 shadow-soft">
                <div className="w-full h-48 bg-primary-100 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-primary-100 rounded animate-pulse"></div>
                  <div className="h-6 bg-primary-100 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-primary-100 rounded animate-pulse"></div>
                    <div className="h-3 bg-primary-100 rounded animate-pulse w-3/4"></div>
                  </div>
                  <div className="h-10 bg-primary-100 rounded animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event._id} className="group overflow-hidden hover:shadow-medium hover:-translate-y-2 transition-all duration-500 bg-white border border-primary-200 shadow-soft">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                    <Building className="w-16 h-16 text-white/70" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {event.isUserRegistered && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        You're In!
                      </span>
                    )}
                    {getRegistrationStatusBadge(event.registrationStatus)}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* NGO Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors duration-300">
                      {event.organizationName}
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>

                  {/* Event Title */}
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      <span className="font-medium">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span className="font-medium">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span className="font-medium">{event.location.address}, {event.location.city}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-primary-500" />
                        <span className="font-medium">
                          {event.capacity - event.availableSpots}/{event.capacity} registered
                        </span>
                      </div>
                      <div className="w-24 bg-primary-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((event.capacity - event.availableSpots) / event.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    {event.isUserRegistered ? (
                      <Link to={`/events/${event._id}`} className="flex-1">
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg group-hover:scale-105 transition-all duration-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/events/${event._id}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                          View & Register
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" size="sm" className="border-primary-200 hover:border-primary-300 hover:bg-primary-50 text-primary-600">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16 bg-primary-50 rounded-2xl border border-primary-200">
            <Calendar className="w-20 h-20 text-primary-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No events found</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Try adjusting your search criteria or filters to find more events.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
              }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && events.length > 0 && pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-16">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="border-primary-200 hover:border-primary-300 hover:bg-primary-50 text-primary-600"
            >
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {[...Array(Math.min(5, pagination.pages))].map((_, index) => {
                const page = index + 1;
                return (
                  <Button
                    key={page}
                    variant={pagination.page === page ? 'primary' : 'outline'}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={pagination.page === page 
                      ? 'bg-primary-600 text-white' 
                      : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50 text-primary-600'
                    }
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="border-primary-200 hover:border-primary-300 hover:bg-primary-50 text-primary-600"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
};