import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getFullImageUrl } from '../../services/api';
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
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-primary-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">
            {error || 'Event not found'}
          </h2>
          <Button onClick={() => navigate('/events')} className="bg-primary-600 hover:bg-primary-700">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const registeredCount = event.capacity - event.availableSpots;

  if (justRegistered) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white border-primary-200">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary-900 mb-3">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully registered for <strong className="text-primary-600">{event.title}</strong>. 
            We'll send you a confirmation email with all the details.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/volunteer/dashboard')} className="w-full bg-primary-600 hover:bg-primary-700">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/events')} className="w-full border-primary-200 text-primary-600 hover:bg-primary-50">
              Browse More Events
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:bg-primary-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            {event.images && event.images.length > 0 ? (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="relative h-80">
                  <img
                    src={getFullImageUrl(event.images[0])}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 text-primary-600 rounded-full text-sm font-semibold">
                      {event.category}
                    </span>
                  </div>

                  {/* Organization Badge */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{event.organizationName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Organized by</p>
                          <p className="text-sm font-medium text-gray-900">{event.organizationName}</p>
                        </div>
                      </div>
                      
                      {/* Registration Status Badge */}
                      {event.isUserRegistered && (
                        <div className="bg-green-500 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-medium">Registered</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback Hero for events without images */
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="relative h-80 bg-primary-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">{event.category}</h2>
                    <p className="text-primary-100">Community Event</p>
                  </div>
                </div>
              </div>
            )}

            {/* Event Title & Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            {/* Event Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-500 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Date</p>
                    <p className="text-gray-900 font-semibold">{formatDate(event.date)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Time</p>
                    <p className="text-gray-900 font-semibold">{event.startTime} - {event.endTime}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:col-span-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Location</p>
                    <p className="text-gray-900 font-semibold">{event.location.address}</p>
                    <p className="text-gray-600">{event.location.city}, {event.location.state}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Progress */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Registration Progress</p>
                    <p className="text-xl font-bold text-gray-900">{registeredCount} of {event.capacity} volunteers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{Math.round((registeredCount / event.capacity) * 100)}%</p>
                  <p className="text-gray-600 text-sm">Filled</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className="bg-primary-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(registeredCount / event.capacity) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{event.availableSpots} spots remaining</span>
                <span>{event.capacity - registeredCount} registered</span>
              </div>
            </div>

            {/* Requirements */}
            {event.requirements && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Requirements</h3>
                </div>
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                  <p className="text-gray-700">{event.requirements}</p>
                </div>
              </div>
            )}

            {/* What to Expect */}
            {event.whatToExpect && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">What to Expect</h3>
                </div>
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                  <p className="text-gray-700">{event.whatToExpect}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Event Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registration Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {event.isUserRegistered ? (
                // Registered User View
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    You're Registered!
                  </h3>
                  <p className="text-gray-600 mb-6">You're all set for this amazing event</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Registration Status</span>
                        <span className="px-2 py-1 bg-green-500 text-white rounded-full text-sm font-medium">Confirmed</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Event Date</span>
                        <span className="text-gray-900 font-medium">{formatDate(event.date)}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Time</span>
                        <span className="text-gray-900 font-medium">{event.startTime} - {event.endTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/volunteer/dashboard')}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      Go to My Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleUnregister}
                      disabled={isRegistering}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {isRegistering ? 'Processing...' : 'Cancel Registration'}
                    </Button>
                  </div>
                </div>
              ) : (
                // Registration Form
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Register for Event</h3>
                    <p className="text-gray-600">Be part of something meaningful</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Event Date</span>
                        <span className="text-gray-900 font-medium">{formatDate(event.date)}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Time</span>
                        <span className="text-gray-900 font-medium">{event.startTime} - {event.endTime}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Available Spots</span>
                        <span className="text-gray-900 font-medium">{event.availableSpots} remaining</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleRegister}
                    disabled={isRegistering || event.availableSpots <= 0}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3"
                  >
                    {isRegistering ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Registering...</span>
                      </div>
                    ) : event.availableSpots <= 0 ? (
                      'Event Full'
                    ) : (
                      'Register Now'
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    By registering, you agree to attend the event and follow all guidelines provided by the organizer.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
