import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  MessageCircle,
  Download,
  UserCheck,
  Clock
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { eventAPI } from '../../services/api';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  joinedDate: string;
  lastActivity: string;
  totalHours: number;
  eventsJoined: number;
  status: 'active' | 'inactive';
  skills: string[];
  interests?: string[];
  points?: number;
  level?: number;
}

interface VolunteerStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalHours: number;
  avgHoursPerVolunteer: number;
}

export const VolunteerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [stats, setStats] = useState<VolunteerStats>({
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalHours: 0,
    avgHoursPerVolunteer: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventAPI.getNGOVolunteers();
      
      if (response.success) {
        setVolunteers(response.data.volunteers);
        setStats(response.data.stats);
      } else {
        setError(response.message || 'Failed to fetch volunteers');
      }
    } catch (err) {
      console.error('Error fetching volunteers:', err);
      setError('Failed to load volunteers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = (volunteerId: string) => {
    console.log('Sending message to volunteer:', volunteerId);
  };

  const handleGenerateCertificate = (volunteerId: string) => {
    console.log('Generating certificate for volunteer:', volunteerId);
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
            <p className="text-gray-600 mt-2">Manage and coordinate with your volunteers</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="mr-2 w-4 h-4" />
              Export Data
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Mail className="mr-2 w-4 h-4" />
              Send Broadcast
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="p-12 text-center bg-blue-50 border border-blue-100">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading volunteers...</p>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-6 bg-red-50 border border-red-100">
            <div className="flex items-center space-x-3">
              <div className="text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-red-800 font-medium">Error loading volunteers</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <Button
                onClick={fetchVolunteers}
                size="sm"
                className="ml-auto bg-red-600 hover:bg-red-700"
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Volunteers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalVolunteers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Volunteers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeVolunteers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalHours}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Hours/Volunteer</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgHoursPerVolunteer}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>
        )}

        {/* Search and Filters */}
        {!loading && !error && (
          <>
            <Card className="p-6 bg-blue-50 border border-blue-100">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search volunteers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                    className="bg-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </Card>

            {/* Volunteers List */}
            <div className="grid gap-6">
              {filteredVolunteers.map((volunteer) => (
                <Card key={volunteer.id} className="p-6 bg-white border border-blue-100">
                  <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={volunteer.avatar}
                    alt={volunteer.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{volunteer.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        volunteer.status === 'active' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {volunteer.status}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span>{volunteer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span>{volunteer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Joined {new Date(volunteer.joinedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Hours:</span>
                          <span className="font-medium text-gray-900">{volunteer.totalHours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Events Joined:</span>
                          <span className="font-medium text-gray-900">{volunteer.eventsJoined}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Activity:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(volunteer.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {volunteer.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(volunteer.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="mr-2 w-4 h-4" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateCertificate(volunteer.id)}
                  >
                    <Award className="mr-2 w-4 h-4" />
                    Certificate
                  </Button>
                </div>
              </div>
            </Card>
          ))}
            </div>

            {/* Empty State */}
            {filteredVolunteers.length === 0 && (
              <Card className="p-12 text-center bg-blue-50 border border-blue-100">
                <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No volunteers have joined your organization yet'}
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};