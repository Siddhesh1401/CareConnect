import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Clock, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { storyAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchStory();
    }
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getStoryById(id!);

      if (response.success) {
        setStory(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching story:', error);
      setError(error.response?.data?.message || 'Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error || 'Story not found'}</p>
            <Link to="/stories">
              <Button>Back to Stories</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/stories" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stories
        </Link>

        {/* Story Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              story.category === 'education' ? 'bg-blue-100 text-blue-800' :
              story.category === 'environment' ? 'bg-green-100 text-green-800' :
              story.category === 'healthcare' ? 'bg-red-100 text-red-800' :
              story.category === 'community' ? 'bg-purple-100 text-purple-800' :
              story.category === 'success' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {story.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {story.excerpt}
          </p>

          {/* Author Info */}
          <div className="flex items-center justify-between py-6 border-t border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {story.author.avatar ? (
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{story.author.name}</div>
                <div className="text-sm text-gray-600">{story.author.role === 'ngo_admin' ? 'NGO Representative' : 'Volunteer'}</div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(story.createdDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{story.readTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{story.views} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {story.image && (
          <div className="mb-8">
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Story Content */}
        <Card className="p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            {story.content.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>

        {/* Engagement Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                <Heart className="w-5 h-5" />
                <span>{story.likes}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{story.comments}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                <Share2 className="w-5 h-5" />
                <span>{story.shares}</span>
              </button>
            </div>

            {user && user.id === story.author.id && (
              <Link to={`/stories/${story.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit Story
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Related Stories Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More Stories</h2>
          <Link to="/stories">
            <Button variant="outline">
              Browse All Stories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
