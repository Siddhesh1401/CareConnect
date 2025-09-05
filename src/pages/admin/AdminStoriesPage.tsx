import React, { useState, useEffect } from 'react';
import { Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { storyAPI } from '../../services/api';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    email: string;
    role: string;
  };
  category: string;
  status: 'draft' | 'published' | 'pending_review';
  createdDate: string;
  likes: number;
  views: number;
  featured: boolean;
}

export const AdminStoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStories();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getAllStoriesAdmin({
        page: currentPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      if (response.success) {
        setStories(response.data.stories);
        setTotalPages(Math.ceil(response.data.pagination.total / response.data.pagination.limit));
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (storyId: string, status: 'published' | 'draft', featured?: boolean) => {
    try {
      await storyAPI.updateStoryStatus(storyId, { status, featured });
      fetchStories(); // Refresh the list
    } catch (error) {
      console.error('Error updating story status:', error);
      alert('Failed to update story status');
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await storyAPI.deleteStory(storyId);
        fetchStories(); // Refresh the list
      } catch (error) {
        console.error('Error deleting story:', error);
        alert('Failed to delete story');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Story Management</h1>
          <p className="text-gray-600">Review, approve, and manage user-generated stories</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </Card>

        {/* Stories Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading stories...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No stories found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Story
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stories.map((story) => (
                    <tr key={story.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {story.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {story.excerpt}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{story.author.name}</div>
                        <div className="text-sm text-gray-500">{story.author.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(story.status)}`}>
                          {story.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{story.views} views</div>
                        <div>{story.likes} likes</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(story.createdDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {story.status === 'pending_review' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(story.id, 'published')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(story.id, 'draft')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {story.status === 'published' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(story.id, 'draft')}
                            >
                              Unpublish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStory(story.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
