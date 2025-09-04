import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Download,
  MessageSquare
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface Volunteer {
  userId: string;
  userName: string;
  userEmail: string;
  registrationDate?: string | Date;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  volunteer?: {
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    verificationStatus: string;
    joinedDate?: string | Date;
  };
}

interface Event {
  _id: string;
  title: string;
  date: string;
  capacity: number;
  registeredCount: number;
}

export const EventVolunteers: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch event volunteers
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('careconnect_token');

      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/volunteers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setEvent(response.data.data.event);
        setVolunteers(response.data.data.volunteers);
      }
    } catch (error: any) {
      console.error('Error fetching volunteers:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('careconnect_token');
        navigate('/auth/login');
      } else if (error.response?.status === 404) {
        alert('Event not found or you do not have permission to access it');
        navigate('/ngo/events');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchVolunteers();
    }
  }, [eventId]);

  // Filter volunteers based on search term and status
  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.volunteer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.volunteer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: 'bg-green-100 text-green-800',
      waitlist: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'waitlist':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleContactVolunteer = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleExportVolunteers = () => {
    if (!event || volunteers.length === 0) return;

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Registration Date', 'Status', 'Verification Status'],
      ...filteredVolunteers.map(v => [
        v.volunteer?.name || v.userName,
        v.volunteer?.email || v.userEmail,
        v.volunteer?.phone || 'N/A',
        v.registrationDate ? formatDate(v.registrationDate) : 'N/A',
        v.status,
        v.volunteer?.verificationStatus || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}_volunteers.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading volunteers...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Event not found</p>
          <Button onClick={() => navigate('/ngo/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/ngo/events')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Events
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Volunteers</h1>
              <p className="text-gray-600 mt-2">{event.title}</p>
              <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExportVolunteers}
              disabled={volunteers.length === 0}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Download className="mr-2 w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Registered</p>
                <p className="text-2xl font-bold text-blue-600">{event.registeredCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {volunteers.filter(v => v.status === 'confirmed').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Waitlist</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {volunteers.filter(v => v.status === 'waitlist').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {volunteers.filter(v => v.status === 'cancelled').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-white border border-blue-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search volunteers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>

            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlist">Waitlist</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Volunteers List */}
        {filteredVolunteers.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-blue-100">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No volunteers found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'No volunteers have registered for this event yet.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredVolunteers.map((volunteer) => (
              <Card key={volunteer.userId} className="p-6 bg-white border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {volunteer.volunteer?.name || volunteer.userName}
                      </h3>
                      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(volunteer.status)}`}>
                        {getStatusIcon(volunteer.status)}
                        <span className="capitalize">{volunteer.status}</span>
                      </span>
                      {volunteer.volunteer?.verificationStatus === 'approved' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>{volunteer.volunteer?.email || volunteer.userEmail}</span>
                      </div>
                      {volunteer.volunteer?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span>{volunteer.volunteer.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Registered: {formatDate(volunteer.registrationDate)}</span>
                      </div>
                    </div>

                    {volunteer.volunteer?.joinedDate && (
                      <p className="text-sm text-gray-500">
                        Member since: {formatDate(volunteer.volunteer?.joinedDate)}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactVolunteer(volunteer.volunteer?.email || volunteer.userEmail)}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
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
