import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SearchBar, SearchFilters } from '../../components/search/SearchBar';
import { FilterPanel } from '../../components/search/FilterPanel';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStories();
  }, [searchQuery, filters, currentPage]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined
      };

      // Add status filters
      if (filters.status && filters.status.length > 0) {
        params.status = filters.status.join(',');
      }

      // Add category filters
      if (filters.category && filters.category.length > 0) {
        params.category = filters.category.join(',');
      }

      // Add date range filters
      if (filters.dateRange?.start) {
        params.startDate = filters.dateRange.start.toISOString().split('T')[0];
      }
      if (filters.dateRange?.end) {
        params.endDate = filters.dateRange.end.toISOString().split('T')[0];
      }

      const response = await storyAPI.getAllStoriesAdmin(params);

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
    <div className="min-h-screen bg-primary-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Story Management</h1>
          <p className="text-gray-600">Review, approve, and manage user-generated stories</p>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mb-6 space-y-4">
          <SearchBar
            placeholder="Search stories by title, author, or content..."
            onSearch={setSearchQuery}
            onFilter={setFilters}
            showFilters={true}
            className="w-full"
          />

          <FilterPanel
            title="Story Filters"
            filters={{
              status: [
                { value: 'draft', label: 'Draft', count: stories.filter(s => s.status === 'draft').length },
                { value: 'published', label: 'Published', count: stories.filter(s => s.status === 'published').length },
                { value: 'pending_review', label: 'Pending Review', count: stories.filter(s => s.status === 'pending_review').length }
              ],
              category: [
                { value: 'personal', label: 'Personal Stories' },
                { value: 'community', label: 'Community Impact' },
                { value: 'volunteer', label: 'Volunteer Experience' },
                { value: 'success', label: 'Success Stories' }
              ],
              dateRange: filters.dateRange
            }}
            selectedFilters={{
              status: filters.status || [],
              category: filters.category || [],
              priority: [],
              dateRange: filters.dateRange
            }}
            onFilterChange={setFilters}
            onClearAll={() => setFilters({})}
            className="w-full"
          />
        </div>

        {/* Stories Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
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
