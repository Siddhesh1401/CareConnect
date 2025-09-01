import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const EventRegistrationPage: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Mock event data - in real app this would be fetched based on eventId
  const event = {
    id: eventId,
    title: 'Beach Cleanup Drive',
    description: 'Join us for a massive beach cleanup initiative to protect marine life and keep our coastlines pristine. This is a wonderful opportunity to contribute to environmental conservation while meeting like-minded individuals who care about our planet.',
    ngo: 'Green Earth Foundation',
    ngoLogo: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=100',
    date: '2025-01-25',
    time: '9:00 AM - 1:00 PM',
    location: 'Juhu Beach, Mumbai',
    capacity: 100,
    registered: 45,
    image: 'https://images.pexels.com/photos/4039921/pexels-photo-4039921.jpeg?auto=compress&cs=tinysrgb&w=800',
    requirements: [
      'Comfortable clothing and closed-toe shoes',
      'Water bottle and sun protection',
      'Enthusiasm and positive attitude'
    ],
    whatToExpect: [
      'Meet and greet with fellow volunteers',
      'Safety briefing and equipment distribution',
      '3-4 hours of beach cleanup activity',
      'Lunch and refreshments provided',
      'Certificate of participation'
    ]
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRegistering(false);
    setIsRegistered(true);
    
    // Auto redirect after 3 seconds
    setTimeout(() => {
      navigate('/volunteer/dashboard');
    }, 3000);
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 text-center bg-white/90 backdrop-blur-sm border border-green-200 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex items-center space-x-3">
                  <img
                    src={event.ngoLogo}
                    alt={event.ngo}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                  />
                  <span className="text-sm font-semibold text-gray-900">{event.ngo}</span>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-xl">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6">{event.title}</h1>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">{new Date(event.date).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">{event.time}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 sm:col-span-2">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-blue-800 font-semibold text-lg">
                    {event.registered} of {event.capacity} volunteers registered
                  </span>
                </div>
                <div className="w-32 bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {event.description}
                </p>
              </div>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Bring</h3>
              <ul className="space-y-2">
                {event.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600">{requirement}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* What to Expect */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
              <ul className="space-y-2">
                {event.whatToExpect.map((item: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Registration Sidebar */}
          <div>
            <Card className="p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Register for Event</h3>
              
              <div className="space-y-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{event.capacity - event.registered}</div>
                  <div className="text-sm text-gray-600">spots remaining</div>
                </div>
              </div>

              <div className="space-y-4 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Registration Fee:</span>
                  <span className="font-medium text-blue-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Certificate:</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Refreshments:</span>
                  <span className="font-medium">Provided</span>
                </div>
              </div>

              <Button 
                onClick={handleRegister}
                isLoading={isRegistering}
                className="w-full mb-4"
                size="lg"
              >
                {isRegistering ? 'Registering...' : 'Register Now'}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                By registering, you agree to attend the full event and follow all safety guidelines.
              </div>

              <div className="mt-6 pt-4 border-t border-blue-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>📧 events@careconnect.com</div>
                  <div>📞 +91 98765 43210</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};