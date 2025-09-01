import React, { useState } from 'react';
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
  Heart
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatBot } from '../../components/ChatBot';

export const EventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'environment', label: 'Environment' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'community', label: 'Community' },
    { value: 'animals', label: 'Animal Welfare' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'pune', label: 'Pune' }
  ];

  const events = [
    {
      id: '1',
      title: 'Beach Cleanup Drive',
      description: 'Join us for a massive beach cleanup initiative to protect marine life and keep our coastlines pristine. Bring your enthusiasm and we\'ll provide all the equipment!',
      ngo: 'Green Earth Foundation',
      ngoLogo: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=100',
      date: '2025-01-25',
      time: '9:00 AM - 1:00 PM',
      location: 'Juhu Beach, Mumbai',
      capacity: 100,
      registered: 45,
      category: 'environment',
      image: 'https://images.pexels.com/photos/4039921/pexels-photo-4039921.jpeg?auto=compress&cs=tinysrgb&w=600',
      difficulty: 'Beginner',
      isRegistered: false
    },
    {
      id: '2',
      title: 'Educational Workshop for Children',
      description: 'Help underprivileged children learn digital skills and basic computer literacy. No teaching experience required - just patience and enthusiasm!',
      ngo: 'Hope for Children',
      ngoLogo: 'https://images.pexels.com/photos/8422403/pexels-photo-8422403.jpeg?auto=compress&cs=tinysrgb&w=100',
      date: '2025-01-28',
      time: '2:00 PM - 5:00 PM',
      location: 'Dharavi Community Center',
      capacity: 30,
      registered: 22,
      category: 'education',
      image: 'https://images.pexels.com/photos/8422028/pexels-photo-8422028.jpeg?auto=compress&cs=tinysrgb&w=600',
      difficulty: 'Intermediate',
      isRegistered: true
    },
    {
      id: '3',
      title: 'Senior Care Program',
      description: 'Spend quality time with elderly residents, help with daily activities, and bring joy to their day through conversation and companionship.',
      ngo: 'Community Care',
      ngoLogo: 'https://images.pexels.com/photos/6994928/pexels-photo-6994928.jpeg?auto=compress&cs=tinysrgb&w=100',
      date: '2025-02-02',
      time: '10:00 AM - 3:00 PM',
      location: 'Sunshine Senior Center, Bandra',
      capacity: 20,
      registered: 15,
      category: 'community',
      image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=600',
      difficulty: 'Beginner',
      isRegistered: false
    },
    {
      id: '4',
      title: 'Tree Plantation Drive',
      description: 'Help us plant 1000 trees in the Aarey Forest area. This is a great opportunity to contribute to Mumbai\'s green cover and fight climate change.',
      ngo: 'EcoWarriors Mumbai',
      ngoLogo: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=100',
      date: '2025-02-05',
      time: '7:00 AM - 11:00 AM',
      location: 'Aarey Forest, Mumbai',
      capacity: 150,
      registered: 89,
      category: 'environment',
      image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
      difficulty: 'Beginner',
      isRegistered: false
    },
    {
      id: '5',
      title: 'Medical Camp Organization',
      description: 'Assist in organizing a free medical camp for rural communities. Help with registration, crowd management, and basic support tasks.',
      ngo: 'Healthcare for All',
      ngoLogo: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=100',
      date: '2025-02-08',
      time: '8:00 AM - 4:00 PM',
      location: 'Vasai Rural Area',
      capacity: 40,
      registered: 28,
      category: 'healthcare',
      image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=600',
      difficulty: 'Intermediate',
      isRegistered: false
    },
    {
      id: '6',
      title: 'Animal Shelter Support',
      description: 'Help care for rescued animals at our shelter. Activities include feeding, cleaning, playing with animals, and general maintenance work.',
      ngo: 'Paws & Hearts',
      ngoLogo: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=100',
      date: '2025-02-10',
      time: '9:00 AM - 2:00 PM',
      location: 'Animal Rescue Center, Thane',
      capacity: 25,
      registered: 18,
      category: 'animals',
      image: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=600',
      difficulty: 'Beginner',
      isRegistered: false
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.ngo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || event.location.toLowerCase().includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleRegister = (eventId: string) => {
    console.log('Registering for event:', eventId);
    // In a real app, this would call an API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6 animate-fade-in">
            Volunteer Events
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            Discover meaningful volunteer opportunities and make a positive impact in your community
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-white to-blue-50/50 border border-blue-100/50 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search events, organizations, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="w-full h-12 text-lg border-blue-200 focus:border-blue-400"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full lg:w-52 h-12 px-4 py-3 border border-blue-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
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
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full lg:w-52 h-12 px-4 py-3 border border-blue-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
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
              className="lg:hidden h-12 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600 text-lg">
            Showing <span className="font-semibold text-blue-600">{filteredEvents.length}</span> events
            {searchTerm && (
              <span> for "<span className="font-semibold text-blue-600">{searchTerm}</span>"</span>
            )}
          </p>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="font-medium">Sort by:</span>
            <select className="border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <option value="date">Date</option>
              <option value="popularity">Popularity</option>
              <option value="location">Location</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white/80 backdrop-blur-sm border border-blue-100/50">
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    event.category === 'environment' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                    event.category === 'education' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                    event.category === 'healthcare' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                    event.category === 'community' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                    'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  }`}>
                    {categories.find(c => c.value === event.category)?.label}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    event.difficulty === 'Beginner' ? 'bg-green-100/90 text-green-800' :
                    event.difficulty === 'Intermediate' ? 'bg-yellow-100/90 text-yellow-800' :
                    'bg-red-100/90 text-red-800'
                  }`}>
                    {event.difficulty}
                  </div>
                </div>
                {event.isRegistered && (
                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Registered</span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* NGO Info */}
                <div className="flex items-center space-x-3">
                  <img
                    src={event.ngoLogo}
                    alt={event.ngo}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 group-hover:border-blue-300 transition-colors duration-300"
                  />
                  <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">{event.ngo}</span>
                </div>

                {/* Event Title */}
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                  {event.title}
                </h3>

                {/* Event Description */}
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{new Date(event.date).toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{event.registered}/{event.capacity} registered</span>
                    </div>
                    <div className="w-24 bg-blue-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  {event.isRegistered ? (
                    <Button variant="outline" className="flex-1 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100" disabled>
                      <Star className="mr-2 w-4 h-4 fill-current text-blue-500" />
                      Registered
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                      onClick={() => handleRegister(event.id)}
                    >
                      Register Now
                    </Button>
                  )}
                  <Link to={`/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
            <Calendar className="w-20 h-20 text-blue-300 mx-auto mb-6" />
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
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-16">
            <Button variant="outline" size="lg" className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 px-8 py-3">
              Load More Events
            </Button>
          </div>
        )}
      </div>

      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
};