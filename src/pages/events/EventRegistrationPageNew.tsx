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
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
        if (response.data.success) {
          setEvent(response.data.data.event);
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
        setIsRegistered(true);
        // Refresh event data to update available spots
        const eventResponse = await axios.get(`${API_BASE_URL}/events/${eventId}`);
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 text-center bg-white border border-primary-200 shadow-soft">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-primary-900 mb-3">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            You have successfully registered for <strong className="text-primary-600">{event.title}</strong>. 
            We'll send you a confirmation email with all the details.
          </p>
          <div className="space-y-4">
            <Button onClick={() => navigate('/volunteer/dashboard')} className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl">
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

  const registeredCount = event.capacity - event.availableSpots;

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            {event.images && event.images.length > 0 && (
              <div className="relative group overflow-hidden rounded-2xl shadow-xl">
                <img
                  src={event.images[0]}
                  alt={event.title}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 bg-white border border-primary-200 rounded-2xl px-4 py-3 shadow-soft">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{event.organizationName.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{event.organizationName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Event Info */}
            <Card className="p-8 bg-white border border-primary-200 shadow-soft">
              <h1 className="text-4xl font-bold text-primary-900 mb-6">{event.title}</h1>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium">{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 sm:col-span-2">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium">{event.location.address}, {event.location.city}, {event.location.state}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 p-6 bg-primary-50 rounded-2xl border border-primary-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-500 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-primary-800 font-semibold text-lg">
                    {registeredCount} of {event.capacity} volunteers registered
                  </span>
                </div>
                <div className="w-32 bg-primary-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(registeredCount / event.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-8">{event.description}</p>

              {/* Requirements */}
              {event.requirements && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <p className="text-gray-700">{event.requirements}</p>
                  </div>
                </div>
              )}

              {/* What to Expect */}
              {event.whatToExpect && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What to Expect</h3>
                  <div className="p-6 bg-green-50 border border-green-200 rounded-2xl">
                    <p className="text-gray-700">{event.whatToExpect}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Registration Card */}
          <div className="lg:col-span-1">
            <Card className="p-8 bg-white border border-primary-200 shadow-soft sticky top-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary-900 mb-2">Register for Event</h3>
                <p className="text-gray-600">Join this amazing volunteer opportunity</p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center p-4 bg-primary-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Event Date</span>
                  <span className="text-primary-600 font-semibold">{formatDate(event.date)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Time</span>
                  <span className="text-primary-600 font-semibold">{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Available Spots</span>
                  <span className="text-primary-600 font-semibold">{event.availableSpots}</span>
                </div>
              </div>

              <Button
                onClick={handleRegister}
                disabled={isRegistering || event.availableSpots <= 0}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg font-semibold"
              >
                {isRegistering ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </div>
                ) : event.availableSpots <= 0 ? (
                  'Event Full'
                ) : (
                  'Register Now'
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center mt-4">
                By registering, you agree to attend the event and follow all guidelines.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
