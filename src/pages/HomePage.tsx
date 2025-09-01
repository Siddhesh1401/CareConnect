import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Heart, Calendar, Award, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ChatBot } from '../components/ChatBot';

export const HomePage: React.FC = () => {
  const featuredNGOs = [
    {
      id: '1',
      name: 'Green Earth Foundation',
      description: 'Environmental conservation and sustainable development',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      volunteers: 1250,
      events: 45
    },
    {
      id: '2',
      name: 'Hope for Children',
      description: 'Education and healthcare for underprivileged children',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      volunteers: 890,
      events: 32
    },
    {
      id: '3',
      name: 'Community Care',
      description: 'Supporting elderly and community welfare programs',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      volunteers: 675,
      events: 28
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Beach Cleanup Drive',
      ngo: 'Green Earth Foundation',
      date: '2025-01-25',
      location: 'Juhu Beach, Mumbai',
      participants: 45
    },
    {
      id: '2',
      title: 'Educational Workshop',
      ngo: 'Hope for Children',
      date: '2025-01-28',
      location: 'Dharavi Community Center',
      participants: 32
    },
    {
      id: '3',
      title: 'Senior Care Program',
      ngo: 'Community Care',
      date: '2025-02-02',
      location: 'Bandra West',
      participants: 28
    }
  ];

  const stories = [
    {
      id: '1',
      title: 'Transforming Lives Through Education',
      excerpt: 'How our volunteers helped establish 15 digital learning centers across rural Maharashtra',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      author: 'Priya Sharma',
      date: '2025-01-15',
      category: 'Education'
    },
    {
      id: '2',
      title: 'Clean Water Initiative Success',
      excerpt: 'Together we provided access to clean drinking water for 5,000+ families',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      author: 'Rajesh Kumar',
      date: '2025-01-10',
      category: 'Environment'
    },
    {
      id: '3',
      title: 'Healthcare Outreach Program',
      excerpt: 'Medical camps serving remote villages with 200+ volunteers',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      author: 'Dr. Meera Patel',
      date: '2025-01-08',
      category: 'Healthcare'
    }
  ];

  const stats = [
    { label: 'Active Volunteers', value: '15,000+', icon: Users },
    { label: 'Partner NGOs', value: '500+', icon: Heart },
    { label: 'Events Completed', value: '2,500+', icon: Calendar },
    { label: 'Lives Impacted', value: '100,000+', icon: Award }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden border-b border-blue-200/30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-600/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeInLeft">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium animate-bounceIn">
                  <Heart className="w-4 h-4 mr-2 animate-pulse" />
                  Join 15,000+ Active Volunteers
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight animate-slideDown">
                  Connect.
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 animate-fadeInUp"> Volunteer.</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900 animate-fadeInRight">Impact.</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                  Join thousands of passionate volunteers making a difference. Discover meaningful opportunities, 
                  connect with NGOs, and be part of positive change in your community.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    Start Volunteering
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/events">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transform hover:scale-105 transition-all duration-300">
                    Browse Events
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center group animate-fadeInUp" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                    <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fadeInRight">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-300 rounded-3xl transform rotate-3 scale-105"></div>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Diverse team collaborating on community initiatives"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-blue-100 animate-bounceIn" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Join our community</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-lg border border-blue-100 animate-slideUp" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Growing Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-blue-100 relative overflow-hidden border-b border-blue-200/40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-blue-200/30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-gray-600 text-sm mt-2 group-hover:text-blue-600 transition-colors duration-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured NGOs */}
      <section className="py-20 bg-white relative border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Trusted Partners
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Featured Organizations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover amazing NGOs making real impact in communities across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredNGOs.map((ngo, index) => (
              <div key={ngo.id} className={`animate-fadeInUp`} style={{ animationDelay: `${index * 0.1}s` }}>
                <Card hover className="overflow-hidden group transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl h-full">
                  <div className="relative overflow-hidden">
                    <img
                      src={ngo.image}
                      alt={ngo.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=${encodeURIComponent(ngo.name)}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{ngo.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{ngo.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2 group-hover:text-blue-600 transition-colors duration-300">
                        <Users className="w-4 h-4" />
                        <span>{ngo.volunteers} volunteers</span>
                      </div>
                      <div className="flex items-center space-x-2 group-hover:text-blue-600 transition-colors duration-300">
                        <Calendar className="w-4 h-4" />
                        <span>{ngo.events} events</span>
                      </div>
                    </div>
                    <Link to={`/ngos/${ngo.id}`}>
                      <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-600 transition-all duration-300">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Link to="/ngos">
                <Button variant="outline" size="lg" className="transform hover:scale-105 transition-all duration-300 border-2 border-blue-300 hover:border-blue-400">
                  View All NGOs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white border-b border-blue-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-fadeInUp">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Upcoming Events
              </h2>
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join these amazing volunteer opportunities happening near you
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <div key={event.id} className="animate-fadeInUp" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <Card hover className="p-6 group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 rounded-full border border-blue-200">
                        {event.ngo}
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        <Users className="w-3 h-3" />
                        <span>{event.participants} joined</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <Calendar className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>{new Date(event.date).toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <div className="p-1 bg-green-100 rounded-full">
                          <MapPin className="w-3 h-3 text-green-600" />
                        </div>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <Link to={`/events/${event.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transform group-hover:scale-105 transition-all duration-300">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Link to="/events">
                <Button variant="outline" size="lg" className="transform hover:scale-105 transition-all duration-300 border-2 border-blue-300 hover:border-blue-400">
                  View All Events
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

      {/* Impact Stories */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 border-b border-blue-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-fadeInUp">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Stories of Impact
              </h2>
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Read inspiring stories from volunteers and organizations making a difference
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <div key={story.id} className="animate-fadeInUp" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <Card hover className="overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg">
                  <div className="relative overflow-hidden">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=${encodeURIComponent(story.category)}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        {story.category}
                      </span>
                      <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        {new Date(story.date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {story.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">
                        By {story.author}
                      </span>
                      <Link
                        to={`/stories/${story.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Link to="/stories">
                <Button variant="outline" size="lg" className="transform hover:scale-105 transition-all duration-300 border-2 border-blue-300 hover:border-blue-400">
                  View All Stories
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <div className="animate-fadeInUp">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Make a Difference?
              </h2>
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Join our community of changemakers. Whether you want to volunteer, donate, 
                or partner with us, there's a perfect way for you to contribute.
              </p>
            </div>
            
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg border-2 border-white">
                    <Users className="mr-2 w-5 h-5 text-blue-600" />
                    <span className="text-blue-600">Join Community</span>
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg">
                    <Heart className="mr-2 w-5 h-5 text-white" />
                    <span className="text-white">Donate Now</span>
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Additional stats or features */}
            <div className="animate-fadeInUp pt-8" style={{ animationDelay: '0.3s' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">10,000+</div>
                  <div className="text-blue-200 text-sm">Active Volunteers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">500+</div>
                  <div className="text-blue-200 text-sm">Partner NGOs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">1M+</div>
                  <div className="text-blue-200 text-sm">Lives Impacted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">50+</div>
                  <div className="text-blue-200 text-sm">Cities Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
};