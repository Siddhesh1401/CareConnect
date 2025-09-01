import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const StoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Stories' },
    { value: 'environment', label: 'Environment' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'community', label: 'Community' },
    { value: 'success', label: 'Success Stories' }
  ];

  const stories = [
    {
      id: '1',
      title: 'Transforming Lives Through Education',
      excerpt: 'How our volunteers helped establish 15 digital learning centers across rural Maharashtra, bringing technology education to over 3,000 children.',
      content: 'In the remote villages of Maharashtra, access to quality education has always been a challenge. When our team of dedicated volunteers from CareConnect partnered with local NGOs, we embarked on an ambitious mission to bridge the digital divide...',
      image: 'https://images.pexels.com/photos/8422028/pexels-photo-8422028.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Priya Sharma',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50',
        role: 'Education Volunteer'
      },
      date: '2025-01-15',
      category: 'education',
      readTime: '5 min read',
      likes: 124,
      comments: 18,
      shares: 32
    },
    {
      id: '2',
      title: 'Clean Water Initiative Success',
      excerpt: 'Together we provided access to clean drinking water for 5,000+ families across 12 villages in Rajasthan through innovative water purification systems.',
      content: 'Water scarcity in rural Rajasthan has been a persistent challenge for decades. Our Clean Water Initiative brought together engineers, volunteers, and local communities to implement sustainable solutions...',
      image: 'https://images.pexels.com/photos/4039921/pexels-photo-4039921.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Rajesh Kumar',
        avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=50',
        role: 'Environmental Engineer'
      },
      date: '2025-01-10',
      category: 'environment',
      readTime: '7 min read',
      likes: 89,
      comments: 12,
      shares: 24
    },
    {
      id: '3',
      title: 'Healthcare Outreach Program',
      excerpt: 'Medical camps serving remote villages with 200+ volunteers, providing free healthcare services to over 10,000 people in underserved communities.',
      content: 'Healthcare accessibility remains a critical issue in rural India. Our Healthcare Outreach Program mobilized medical professionals and volunteers to bring essential services directly to communities in need...',
      image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Dr. Meera Patel',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=50',
        role: 'Medical Volunteer'
      },
      date: '2025-01-08',
      category: 'healthcare',
      readTime: '6 min read',
      likes: 156,
      comments: 25,
      shares: 41
    },
    {
      id: '4',
      title: 'Community Garden Revolution',
      excerpt: 'How urban volunteers transformed vacant lots into thriving community gardens, providing fresh produce and bringing neighborhoods together.',
      content: 'Urban food deserts and lack of green spaces inspired our Community Garden Revolution. Volunteers worked with residents to convert unused urban spaces into productive gardens...',
      image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Amit Singh',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=50',
        role: 'Community Organizer'
      },
      date: '2025-01-05',
      category: 'community',
      readTime: '4 min read',
      likes: 73,
      comments: 9,
      shares: 18
    },
    {
      id: '5',
      title: 'From Volunteer to Leader',
      excerpt: 'Sarah\'s journey from first-time volunteer to NGO founder, inspiring others to create lasting change in their communities.',
      content: 'Sarah Johnson started as a weekend volunteer at local food banks. Today, she runs her own NGO that has impacted thousands of lives. Her story exemplifies the transformative power of volunteering...',
      image: 'https://images.pexels.com/photos/6995167/pexels-photo-6995167.jpeg?auto=compress&cs=tinysrgb&w=600',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50',
        role: 'NGO Founder'
      },
      date: '2025-01-03',
      category: 'success',
      readTime: '8 min read',
      likes: 201,
      comments: 34,
      shares: 67
    }
  ];

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6 animate-fade-in">
            Impact Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            Discover inspiring stories of change, impact, and transformation from our community of volunteers and organizations
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-white to-blue-50/50 border border-blue-100/50 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="w-full h-12 text-lg border-blue-200 focus:border-blue-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full lg:w-52 h-12 px-4 py-3 border border-blue-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Featured Story */}
        {filteredStories.length > 0 && (
          <Card className="mb-8 overflow-hidden">
            <div className="lg:flex">
              <div className="lg:w-1/2">
                <img
                  src={filteredStories[0].image}
                  alt={filteredStories[0].title}
                  className="w-full h-64 lg:h-full object-cover"
                />
              </div>
              <div className="lg:w-1/2 p-8">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    FEATURED
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {categories.find(c => c.value === filteredStories[0].category)?.label}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {filteredStories[0].title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {filteredStories[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={filteredStories[0].author.avatar}
                      alt={filteredStories[0].author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{filteredStories[0].author.name}</div>
                      <div className="text-sm text-gray-500">{filteredStories[0].author.role}</div>
                    </div>
                  </div>
                  <Link to={`/stories/${filteredStories[0].id}`}>
                    <Button>
                      Read Story
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.slice(1).map((story) => (
            <Card key={story.id} hover className="overflow-hidden">
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    story.category === 'environment' ? 'bg-green-100 text-green-800' :
                    story.category === 'education' ? 'bg-blue-100 text-blue-800' :
                    story.category === 'healthcare' ? 'bg-red-100 text-red-800' :
                    story.category === 'community' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {categories.find(c => c.value === story.category)?.label}
                  </span>
                  <span className="text-xs text-gray-500">{story.readTime}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {story.excerpt}
                </p>
                
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{story.author.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(story.date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{story.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{story.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{story.shares}</span>
                    </div>
                  </div>
                  <Link
                    to={`/stories/${story.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredStories.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Stories
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredStories.length === 0 && (
          <div className="text-center py-12 bg-blue-50 rounded-lg">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all categories.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};