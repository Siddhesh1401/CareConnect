import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Calendar, 
  Heart, 
  Star,
  ChevronDown,
  Verified,
  TrendingUp
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const NGOsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'environment', label: 'Environment' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'community', label: 'Community Development' },
    { value: 'animals', label: 'Animal Welfare' },
    { value: 'disaster', label: 'Disaster Relief' },
    { value: 'women', label: 'Women Empowerment' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'pune', label: 'Pune' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'kolkata', label: 'Kolkata' }
  ];

  const ngos = [
    {
      id: '1',
      name: 'Green Earth Foundation',
      description: 'Dedicated to environmental conservation and sustainable development through community-driven initiatives and awareness programs.',
      image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'environment',
      location: 'Mumbai, Maharashtra',
      verified: true,
      rating: 4.8,
      totalVolunteers: 1250,
      totalEvents: 45,
      totalDonations: 2400000,
      founded: '2018',
      impact: 'Planted 50,000+ trees, cleaned 25+ beaches'
    },
    {
      id: '2',
      name: 'Hope for Children',
      description: 'Providing quality education and healthcare services to underprivileged children across urban and rural communities.',
      image: 'https://images.pexels.com/photos/8422403/pexels-photo-8422403.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'education',
      location: 'Delhi, NCR',
      verified: true,
      rating: 4.9,
      totalVolunteers: 890,
      totalEvents: 32,
      totalDonations: 1800000,
      founded: '2015',
      impact: 'Educated 10,000+ children, built 15 schools'
    },
    {
      id: '3',
      name: 'Community Care Network',
      description: 'Supporting elderly care, community welfare programs, and social development initiatives in urban slums.',
      image: 'https://images.pexels.com/photos/6994928/pexels-photo-6994928.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'community',
      location: 'Bangalore, Karnataka',
      verified: true,
      rating: 4.7,
      totalVolunteers: 675,
      totalEvents: 28,
      totalDonations: 1200000,
      founded: '2019',
      impact: 'Served 5,000+ families, 20+ community centers'
    },
    {
      id: '4',
      name: 'Healthcare Heroes',
      description: 'Providing free medical services, health awareness programs, and emergency medical support in rural areas.',
      image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'healthcare',
      location: 'Chennai, Tamil Nadu',
      verified: true,
      rating: 4.6,
      totalVolunteers: 543,
      totalEvents: 38,
      totalDonations: 1600000,
      founded: '2017',
      impact: 'Treated 25,000+ patients, 100+ medical camps'
    },
    {
      id: '5',
      name: 'Paws & Hearts Animal Rescue',
      description: 'Rescuing, rehabilitating, and finding homes for abandoned and injured animals while promoting animal welfare.',
      image: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'animals',
      location: 'Pune, Maharashtra',
      verified: false,
      rating: 4.5,
      totalVolunteers: 234,
      totalEvents: 18,
      totalDonations: 450000,
      founded: '2020',
      impact: 'Rescued 2,000+ animals, 500+ adoptions'
    },
    {
      id: '6',
      name: 'Women Empowerment Initiative',
      description: 'Empowering women through skill development, entrepreneurship support, and awareness programs.',
      image: 'https://images.pexels.com/photos/8422028/pexels-photo-8422028.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'women',
      location: 'Hyderabad, Telangana',
      verified: true,
      rating: 4.8,
      totalVolunteers: 456,
      totalEvents: 22,
      totalDonations: 980000,
      founded: '2016',
      impact: 'Trained 3,000+ women, 500+ businesses started'
    }
  ];

  const filteredNGOs = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ngo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ngo.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || ngo.location.toLowerCase().includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'volunteers':
        return b.totalVolunteers - a.totalVolunteers;
      case 'events':
        return b.totalEvents - a.totalEvents;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6 animate-fade-in">
            Partner Organizations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            Discover verified NGOs and social organizations making real impact in communities across India
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-white to-blue-50/50 border border-blue-100/50 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search organizations by name or cause..."
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
                className="w-full lg:w-60 h-12 px-4 py-3 border border-blue-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full lg:w-48 px-4 py-2.5 border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
              >
                {locations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </Card>

        {/* Results and Sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-medium">{filteredNGOs.length}</span> organizations
            {searchTerm && (
              <span> for "<span className="font-medium">{searchTerm}</span>"</span>
            )}
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-blue-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="rating">Rating</option>
              <option value="volunteers">Volunteers</option>
              <option value="events">Events</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* NGOs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNGOs.map((ngo) => (
            <Card key={ngo.id} hover className="overflow-hidden">
              <div className="relative">
                <img
                  src={ngo.image}
                  alt={ngo.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ngo.category === 'environment' ? 'bg-green-100 text-green-800' :
                    ngo.category === 'education' ? 'bg-blue-100 text-blue-800' :
                    ngo.category === 'healthcare' ? 'bg-red-100 text-red-800' :
                    ngo.category === 'community' ? 'bg-purple-100 text-purple-800' :
                    ngo.category === 'animals' ? 'bg-orange-100 text-orange-800' :
                    'bg-pink-100 text-pink-800'
                  }`}>
                    {categories.find(c => c.value === ngo.category)?.label}
                  </span>
                </div>
                {ngo.verified && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full">
                    <Verified className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* NGO Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {ngo.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-blue-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{ngo.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{ngo.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {ngo.description}
                  </p>
                </div>

                {/* Impact Stats */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">IMPACT HIGHLIGHTS</div>
                  <div className="text-sm text-gray-700">{ngo.impact}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{ngo.totalVolunteers}</span>
                    </div>
                    <div className="text-xs text-gray-500">Volunteers</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{ngo.totalEvents}</span>
                    </div>
                    <div className="text-xs text-gray-500">Events</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">₹{(ngo.totalDonations / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="text-xs text-gray-500">Raised</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Link to={`/ngos/${ngo.id}`} className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      View Details
                    </Button>
                  </Link>
                  <Link to={`/ngos/${ngo.id}/donate`}>
                    <Button variant="outline" size="sm" className="px-3">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {/* Founded */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t border-blue-100">
                  Founded in {ngo.founded}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredNGOs.length === 0 && (
          <div className="text-center py-12 bg-blue-50 rounded-lg">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find more organizations.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredNGOs.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Organizations
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
          <h2 className="text-2xl font-bold mb-4">Is your organization missing?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our platform to connect with passionate volunteers and expand your impact. 
            Registration is free and takes just a few minutes.
          </p>
          <Button size="lg">
            Register Your NGO
          </Button>
        </div>
      </div>
    </div>
  );
};