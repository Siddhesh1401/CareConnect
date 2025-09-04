import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
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
  registrationStatus: string;
  isUserRegistered?: boolean;
  requirements?: string;
  whatToExpect?: string;
  images?: string[];
  tags?: string[];
}

export const EventRegistrationPage: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Include auth token if available to get registration status
        const token = localStorage.getItem('careconnect_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, { headers });
        if (response.data.success) {
          const eventData = response.data.data.event;
          setEvent(eventData);
          // Don't set isRegistered here - only set when they register in this session
          // The registration card will handle showing the correct state based on isUserRegistered
        } else {
          setError('Event not found');
        }
      } catch (error: any) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      const token = localStorage.getItem('careconnect_token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/events/${eventId}/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setJustRegistered(true);
        // Refresh event data to update available spots
        const eventResponse = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (eventResponse.data.success) {
          setEvent(eventResponse.data.data.event);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.status === 401) {
        navigate('/auth/login');
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || 'Registration failed');
      } else {
        alert('Failed to register. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration for this event?')) {
      return;
    }

    try {
      setIsRegistering(true);
      const token = localStorage.getItem('careconnect_token');
      
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/events/${eventId}/register`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('Registration cancelled successfully');
        setJustRegistered(false);
        // Refresh event data to update available spots
        const eventResponse = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (eventResponse.data.success) {
          setEvent(eventResponse.data.data.event);
        }
      }
    } catch (error: any) {
      console.error('Unregistration error:', error);
      if (error.response?.status === 401) {
        navigate('/auth/login');
      } else {
        alert(error.response?.data?.message || 'Failed to cancel registration. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const registeredCount = event.capacity - event.availableSpots;

  if (justRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 text-center bg-white/90 backdrop-blur-sm border border-green-200 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            You have successfully registered for <strong className="text-blue-600">{event.title}</strong>. 
            We'll send you a confirmation email with all the details.
          </p>
          <div className="space-y-4">
            <Button onClick={() => navigate('/volunteer/dashboard')} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/events')} className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
              Browse More Events
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="group text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 p-4 rounded-2xl transition-all duration-300 border border-transparent hover:border-blue-200/50"
          >
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Events</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Main Event Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Enhanced Hero Section */}
            {event.images && event.images.length > 0 ? (
              <div className="relative group overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-700">
                <img
                  src={event.images[0]}
                  alt={event.title}
                  className="w-full h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Category Badge */}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-blue-700 rounded-full text-sm font-semibold shadow-lg">
                    {event.category}
                  </span>
                </div>

                {/* Organization Info */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 shadow-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{event.organizationName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Organized by</p>
                        <p className="text-sm font-semibold text-gray-900">{event.organizationName}</p>
                      </div>
                    </div>
                    
                    {/* Registration Status Badge */}
                    {event.isUserRegistered && (
                      <div className="bg-green-500/95 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-white" />
                          <span className="text-white text-sm font-semibold">Registered</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback Hero for events without images */
              <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 h-80 lg:h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <Calendar className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{event.category}</h2>
                    <p className="text-blue-100">Community Event</p>
                  </div>
                </div>
              </div>
            )}

            {/* Event Title & Description Card */}
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6 leading-tight">
                {event.title}
              </h1>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-8 text-justify">
                {event.description}
              </p>
            </Card>

            {/* Event Details Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500 rounded-2xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Date</p>
                    <p className="text-gray-900 font-semibold text-lg">{formatDate(event.date)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500 rounded-2xl shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium uppercase tracking-wide">Time</p>
                    <p className="text-gray-900 font-semibold text-lg">{event.startTime} - {event.endTime}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 sm:col-span-2">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500 rounded-2xl shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-purple-600 font-medium uppercase tracking-wide">Location</p>
                    <p className="text-gray-900 font-semibold text-lg">{event.location.address}</p>
                    <p className="text-gray-600">{event.location.city}, {event.location.state}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Registration Progress */}
            <Card className="p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-0 shadow-xl rounded-3xl text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Registration Progress</p>
                    <p className="text-2xl font-bold">{registeredCount} of {event.capacity} volunteers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{Math.round((registeredCount / event.capacity) * 100)}%</p>
                  <p className="text-blue-100 text-sm">Filled</p>
                </div>
              </div>
              
              <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm">
                <div 
                  className="bg-white h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${(registeredCount / event.capacity) * 100}%` }}
                />
              </div>
              
              <div className="mt-4 flex justify-between text-sm text-blue-100">
                <span>{event.availableSpots} spots remaining</span>
                <span>{event.capacity - registeredCount} registered</span>
              </div>
            </Card>

            {/* Requirements */}
            {event.requirements && (
              <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-xl rounded-3xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-amber-500 rounded-2xl shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Requirements</h3>
                </div>
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200/50">
                  <p className="text-gray-700 leading-relaxed">{event.requirements}</p>
                </div>
              </Card>
            )}

            {/* What to Expect */}
            {event.whatToExpect && (
              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-xl rounded-3xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-green-500 rounded-2xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">What to Expect</h3>
                </div>
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200/50">
                  <p className="text-gray-700 leading-relaxed">{event.whatToExpect}</p>
                </div>
              </Card>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Event Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Enhanced Registration Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
                {event.isUserRegistered ? (
                  // Enhanced Registered User View
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                      You're Registered!
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">You're all set for this amazing event</p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-semibold">Registration Status</span>
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">Confirmed</span>
                        </div>
                      </div>
                      
                      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-semibold">Event Date</span>
                          <span className="text-blue-700 font-bold">{formatDate(event.date)}</span>
                        </div>
                      </div>
                      
                      <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-semibold">Time</span>
                          <span className="text-purple-700 font-bold">{event.startTime} - {event.endTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button 
                        onClick={() => navigate('/volunteer/dashboard')}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl py-4 text-lg font-semibold rounded-2xl transition-all duration-300"
                      >
                        Go to My Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleUnregister}
                        disabled={isRegistering}
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 py-4 text-lg font-semibold rounded-2xl transition-all duration-300"
                      >
                        {isRegistering ? 'Processing...' : 'Cancel Registration'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Enhanced Registration Form
                  <>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        Join This Event
                      </h3>
                      <p className="text-gray-600 text-lg">Be part of something meaningful</p>
                    </div>

                    <div className="space-y-6 mb-8">
                      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-semibold">Event Date</span>
                          <span className="text-blue-700 font-bold">{formatDate(event.date)}</span>
                        </div>
                      </div>
                      
                      <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-semibold">Time</span>
                          <span className="text-green-700 font-bold">{event.startTime} - {event.endTime}</span>
                        </div>
                      </div>
                      
                      <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-semibold">Available Spots</span>
                          <span className="text-purple-700 font-bold">{event.availableSpots} remaining</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering || event.availableSpots <= 0}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed py-5 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105"
                    >
                      {isRegistering ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Registering...</span>
                        </div>
                      ) : event.availableSpots <= 0 ? (
                        'Event Full'
                      ) : (
                        'Register Now'
                      )}
                    </Button>

                    <p className="text-sm text-gray-500 text-center mt-6 leading-relaxed">
                      By registering, you agree to attend the event and follow all guidelines provided by the organizer.
                    </p>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
