import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Heart,
  Star,
  Verified,
  Mail,
  Globe,
  Phone,
  Building,
  Award,
  TrendingUp,
  Loader2,
  AlertCircle,
  Edit
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api, { getFullImageUrl } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
  website?: string;
  joinedDate: string;
  organizationType?: string;
}

export const NGOProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('NGO Profile Page - ID from params:', id);
    if (id && id !== 'undefined') {
      fetchNGOData();
    } else {
      console.error('Invalid NGO ID:', id);
      setError('Invalid NGO ID');
      setLoading(false);
    }
  }, [id]);

  // Listen for NGO profile updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ngo_profile_updated' && e.newValue) {
        console.log('NGO profile update detected, refreshing NGO data...');
        fetchNGOData();
        // Clear the flag
        localStorage.removeItem('ngo_profile_updated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchNGOData = async () => {
    if (!id || id === 'undefined') {
      console.error('Cannot fetch NGO data - invalid ID:', id);
      setError('Invalid NGO ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching NGO data for ID:', id);
      // Fetch NGO details
      const ngoResponse = await api.get(`/ngos/${id}`);
      console.log('NGO API Response:', ngoResponse);

      if (ngoResponse.data.success) {
        setNgo(ngoResponse.data.data.ngo);
      } else {
        setError('NGO not found');
      }

      // NGO details already include event count, so we don't need to fetch events separately
      // The events fetching can be implemented later when we have a proper events API

    } catch (err: any) {
      console.error('Error fetching NGO data:', err);
      setError(err.response?.data?.message || 'Failed to load NGO details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading NGO details...</p>
        </div>
      </div>
    );
  }

  if (error || !ngo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading NGO</h2>
          <p className="text-gray-600 mb-6">{error || 'NGO not found'}</p>
          <Button onClick={() => navigate('/ngos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to NGOs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ngos')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to NGOs</span>
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900">{ngo.name}</h1>
              {ngo.verified && (
                <Verified className="w-5 h-5 text-blue-600" />
              )}
            </div>
            {user && user.id === ngo.id && user.role === 'ngo_admin' && (
              <div className="ml-auto">
                <Link to="/ngo/profile/edit">
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* NGO Header */}
            <Card className="overflow-hidden">
              <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-end space-x-4">
                    <img
                      src={getFullImageUrl(ngo.image)}
                      alt={ngo.name}
                      className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600';
                      }}
                    />
                    <div className="flex-1 text-white">
                      <h1 className="text-3xl font-bold mb-2">{ngo.name}</h1>
                      <div className="flex items-center space-x-4 text-blue-100">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{ngo.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{ngo.rating.toFixed(1)}</span>
                        </div>
                        <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs font-medium">
                          {ngo.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <Users className="w-5 h-5" />
                      <span className="font-bold text-xl">{ngo.totalVolunteers}</span>
                    </div>
                    <div className="text-sm text-gray-500">Volunteers</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <Calendar className="w-5 h-5" />
                      <span className="font-bold text-xl">{ngo.totalEvents}</span>
                    </div>
                    <div className="text-sm text-gray-500">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <Heart className="w-5 h-5" />
                      <span className="font-bold text-xl">₹{(ngo.totalDonations / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="text-sm text-gray-500">Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                      <Award className="w-5 h-5" />
                      <span className="font-bold text-xl">{ngo.founded}</span>
                    </div>
                    <div className="text-sm text-gray-500">Founded</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed">{ngo.description}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Impact Highlights</h4>
                    <p className="text-gray-700">{ngo.impact}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Events Section */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
                  <Link to={`/events?ngo=${ngo.id}`}>
                    <Button variant="outline" size="sm">
                      View All Events
                    </Button>
                  </Link>
                </div>

                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Events coming soon</p>
                  <p className="text-sm text-gray-400">This organization has organized {ngo.totalEvents} events</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {ngo.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a
                        href={ngo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {ngo.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Contact via email</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{ngo.organizationType || 'Non-profit Organization'}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Get Involved</h3>
                <div className="space-y-4">
                  <Link to={`/events?ngo=${ngo.id}`} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Events
                    </Button>
                  </Link>
                  <Link to={`/ngos/${ngo.id}/donate`} className="block">
                    <Button variant="outline" className="w-full py-3 border-2 hover:bg-gray-50">
                      <Heart className="w-4 h-4 mr-2" />
                      Make a Donation
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Events</span>
                    <span className="font-semibold text-gray-900">{ngo.totalEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Volunteers</span>
                    <span className="font-semibold text-gray-900">{ngo.totalVolunteers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Funds Raised</span>
                    <span className="font-semibold text-gray-900">₹{(ngo.totalDonations / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(ngo.joinedDate).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
