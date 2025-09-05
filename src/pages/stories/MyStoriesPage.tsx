import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  Heart, 
  Share, 
  MessageCircle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { storyAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  category: string;
  status: 'draft' | 'published';
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdDate: string;
  publishedDate?: string;
}

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800'
};

export const MyStoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMyStories();
  }, []);

  const fetchMyStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getMyStories();
      if (response.success) {
        setStories(response.data);
      }
    } catch (error) {
      console.error('Error fetching my stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      const response = await storyAPI.deleteStory(storyId);
      if (response.success) {
        setStories(stories.filter(story => story.id !== storyId));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    }
  };

  const filteredStories = stories.filter(story => {
    if (filter === 'all') return true;
    return story.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stories</h1>
            <p className="text-gray-600">Manage your published stories and drafts</p>
          </div>
          <Link to="/stories/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Story
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stories</p>
                <p className="text-2xl font-bold text-gray-900">{stories.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stories.filter(s => s.status === 'published').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stories.filter(s => s.status === 'draft').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Stories' },
              { key: 'published', label: 'Published' },
              { key: 'draft', label: 'Drafts' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No stories yet' : `No ${filter} stories`}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all' 
                  ? 'Start sharing your impact stories with the community'
                  : `You don't have any ${filter} stories yet`
                }
              </p>
              <Link to="/stories/create">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Story
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Story Image */}
                <div className="aspect-video bg-gray-200 relative">
                  {story.image ? (
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[story.status]}`}>
                      {story.status === 'draft' ? 'Draft' : 'Published'}
                    </span>
                  </div>
                </div>

                {/* Story Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {story.excerpt}
                  </p>

                  {/* Stats */}
                  {story.status === 'published' && (
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{story.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{story.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{story.comments}</span>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>
                      {story.status === 'published' && story.publishedDate
                        ? `Published ${formatDate(story.publishedDate)}`
                        : `Created ${formatDate(story.createdDate)}`
                      }
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link to={`/stories/${story.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/stories/${story.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(story.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Story
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this story? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
