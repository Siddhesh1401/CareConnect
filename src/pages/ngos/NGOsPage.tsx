import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  Loader2,
  Flag
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ReportForm from '../../components/ReportForm';
import api, { getFullImageUrl } from '../../services/api';

interface NGO {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  location: string;
  verified: boolean;
  rating: number;
  totalVolunteers: number;
  totalEvents: number;
  totalDonations: number;
  founded: string;
  impact: string;
}

export const NGOsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNGOs, setTotalNGOs] = useState(0);

  // Report modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedNGOForReport, setSelectedNGOForReport] = useState<NGO | null>(null);

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

  // Fetch NGOs from API
  const fetchNGOs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedLocation !== 'all' && { location: selectedLocation })
      });

      const response = await api.get(`/ngos?${params}`);
      console.log('NGOs API response:', response.data);
      
      if (response.data.success) {
        console.log('NGOs data:', response.data.data.ngos);
        if (response.data.data.ngos.length > 0) {
          console.log('First NGO:', response.data.data.ngos[0]);
          console.log('First NGO ID:', response.data.data.ngos[0].id);
        }
        setNgos(response.data.data.ngos);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalNGOs(response.data.data.pagination.totalNGOs);
        setCurrentPage(page);
      } else {
        console.error('API returned success: false');
        setError('Failed to fetch NGOs');
      }
    } catch (err: any) {
      console.error('Error fetching NGOs:', err);
      setError(err.response?.data?.message || 'Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const handleReportNGO = (ngo: NGO) => {
    setSelectedNGOForReport(ngo);
    setReportModalOpen(true);
  };

  // Fetch NGOs when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchNGOs(1); // Reset to first page when filters change
    }, 300); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedLocation, sortBy]);

  // Initial load
  useEffect(() => {
    fetchNGOs();
  }, []);

  // Listen for NGO profile updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ngo_profile_updated' && e.newValue) {
        console.log('NGO profile update detected, refreshing NGOs list...');
        fetchNGOs(currentPage);
        // Clear the flag
        localStorage.removeItem('ngo_profile_updated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentPage]);

  // Since filtering is now done on the backend, we just use the fetched ngos
  const filteredNGOs = ngos;

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-700 mb-6 animate-fade-in">
            Partner Organizations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            Discover verified NGOs and social organizations making real impact in communities across India
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-8 mb-12 bg-white border-primary-200">
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
            {loading ? (
              'Loading organizations...'
            ) : (
              <>
                Showing <span className="font-medium">{filteredNGOs.length}</span> of{' '}
                <span className="font-medium">{totalNGOs}</span> organizations
                {searchTerm && (
                  <span> for "<span className="font-medium">{searchTerm}</span>"</span>
                )}
              </>
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
              <option value="name">Name</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* NGOs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading organizations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => fetchNGOs(currentPage)}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNGOs.map((ngo) => (
              <Card key={ngo.id} hover className="overflow-hidden">
                <div className="relative">
                  <img
                    src={getFullImageUrl(ngo.image)}
                    alt={ngo.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600';
                    }}
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
                      {categories.find(c => c.value === ngo.category)?.label || ngo.category}
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
                        <span className="text-sm font-medium text-gray-700">{ngo.rating.toFixed(1)}</span>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 px-3"
                      onClick={() => handleReportNGO(ngo)}
                      title="Report this NGO"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Founded */}
                  <div className="text-xs text-gray-500 text-center pt-2 border-t border-blue-100">
                    Founded in {ngo.founded}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredNGOs.length === 0 && (
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
                fetchNGOs(1);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-12">
            <Button
              onClick={() => fetchNGOs(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  onClick={() => fetchNGOs(pageNum)}
                  variant={currentPage === pageNum ? "primary" : "outline"}
                  size="sm"
                  className={currentPage === pageNum ? "bg-blue-600" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              onClick={() => fetchNGOs(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}

        {/* Load More - Hide if we have pagination */}
        {!loading && !error && totalPages <= 1 && filteredNGOs.length > 0 && (
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

      {/* Report Form Modal */}
      {selectedNGOForReport && (
        <ReportForm
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setSelectedNGOForReport(null);
          }}
          type="ngo"
          targetId={selectedNGOForReport.id}
          targetName={selectedNGOForReport.name}
        />
      )}
    </div>
  );
};