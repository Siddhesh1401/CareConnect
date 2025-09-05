import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  author?: {
    name: string;
    avatar: string;
    role: string;
  };
  date?: string;
  readTime?: string;
}

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800'
};

export const StoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>(() => {
    // Check URL parameter or default to 'all'
    return searchParams.get('tab') === 'my' ? 'my' : 'all';
  });
  const [stories, setStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [myStoriesFilter, setMyStoriesFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleTabChange = (tab: 'all' | 'my') => {
    setActiveTab(tab);
    // Update URL parameter
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab === 'my') {
      newSearchParams.set('tab', 'my');
    } else {
      newSearchParams.delete('tab');
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  useEffect(() => {
    fetchCategories();
    if (activeTab === 'all') {
      fetchStories();
    } else {
      fetchMyStories();
    }
  }, [selectedCategory, searchTerm, activeTab]);

  const fetchCategories = async () => {
    try {
      const response = await storyAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getAllStories({
        category: selectedCategory,
        search: searchTerm,
        status: 'published'
      });

      if (response.success) {
        setStories(response.data.stories || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getMyStories();
      if (response.success) {
        setMyStories(response.data.stories || []);
      }
    } catch (error) {
      console.error('Error fetching my stories:', error);
      setMyStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      const response = await storyAPI.deleteStory(storyId);
      if (response.success) {
        setMyStories((myStories || []).filter(story => story.id !== storyId));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredStories = activeTab === 'all' 
    ? (stories || []).filter(story => {
        const matchesSearch = story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             story.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : (myStories || []).filter(story => {
        const matchesFilter = myStoriesFilter === 'all' || story.status === myStoriesFilter;
        const matchesSearch = story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             story.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent animate-fade-in">
              Stories
            </h1>
            {user && (
              <Link to="/stories/create" className="ml-6">
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Share Your Story
                </Button>
              </Link>
            )}
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            {activeTab === 'all' 
              ? "Discover inspiring stories of change, impact, and transformation from our community"
              : "Manage your published stories and drafts"
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg border border-blue-100">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              All Stories
            </button>
            {user && (
              <button
                onClick={() => handleTabChange('my')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'my'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                My Stories
              </button>
            )}
          </div>
        </div>

        {/* My Stories Stats */}
        {activeTab === 'my' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stories</p>
                  <p className="text-2xl font-bold text-gray-900">{(myStories || []).length}</p>
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
                    {(myStories || []).filter(s => s.status === 'published').length}
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
                    {(myStories || []).filter(s => s.status === 'draft').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-white to-blue-50/50 border border-blue-100/50 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <Input
                placeholder={activeTab === 'all' ? "Search stories..." : "Search my stories..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="w-full h-12 text-lg border-blue-200 focus:border-blue-400"
              />
            </div>
            {activeTab === 'all' ? (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full lg:w-52 h-12 px-4 py-3 border border-blue-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'published', label: 'Published' },
                    { key: 'draft', label: 'Drafts' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setMyStoriesFilter(option.key as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        myStoriesFilter === option.key
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Featured Story - Only for All Stories tab */}
        {activeTab === 'all' && filteredStories.length > 0 && (
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
                      src={filteredStories[0].author?.avatar || '/default-avatar.png'}
                      alt={filteredStories[0].author?.name || 'Author'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{filteredStories[0].author?.name}</div>
                      <div className="text-sm text-gray-500">{filteredStories[0].author?.role}</div>
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
          {(activeTab === 'all' ? filteredStories.slice(1) : filteredStories).map((story) => (
            <Card key={story.id} hover className="overflow-hidden">
              {story.image && (
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      story.category === 'environment' ? 'bg-green-100 text-green-800' :
                      story.category === 'education' ? 'bg-blue-100 text-blue-800' :
                      story.category === 'healthcare' ? 'bg-red-100 text-red-800' :
                      story.category === 'community' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {categories.find(c => c.value === story.category)?.label || story.category}
                    </span>
                    {activeTab === 'my' && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[story.status]}`}>
                        {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                      </span>
                    )}
                  </div>
                  {activeTab === 'all' && story.readTime && (
                    <span className="text-xs text-gray-500">{story.readTime}</span>
                  )}
                  {activeTab === 'my' && (
                    <div className="flex items-center space-x-2">
                      <Link to={`/stories/edit/${story.id}`}>
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(story.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {story.excerpt}
                </p>
                
                {activeTab === 'all' && story.author && (
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={story.author.avatar || '/default-avatar.png'}
                      alt={story.author.name || 'Author'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{story.author.name}</div>
                      <div className="text-xs text-gray-500">
                        {story.date ? new Date(story.date).toLocaleDateString('en-IN') : ''}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'my' && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(story.createdDate)}
                      {story.publishedDate && (
                        <> • Published: {formatDate(story.publishedDate)}</>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{story.likes || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{story.comments || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{story.shares || 0}</span>
                    </div>
                    {activeTab === 'my' && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{story.views || 0}</span>
                      </div>
                    )}
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

        {/* Load More - Only for All Stories */}
        {activeTab === 'all' && filteredStories.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Stories
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredStories.length === 0 && (
          <div className="text-center py-12 bg-blue-50 rounded-lg">
            {activeTab === 'all' ? (
              <>
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
              </>
            ) : (
              <>
                <Edit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {myStoriesFilter === 'all' ? 'No stories yet' : `No ${myStoriesFilter} stories`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {myStoriesFilter === 'all' 
                    ? "Start sharing your impact stories with the community."
                    : `You don't have any ${myStoriesFilter} stories yet.`
                  }
                </p>
                <Link to="/stories/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Story
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Story</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this story? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};