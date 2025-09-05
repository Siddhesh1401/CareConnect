import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, DollarSign, Calendar, FileText, Image, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { campaignAPI } from '../../services/api';

export const EditCampaign: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target: '',
    location: '',
    endDate: '',
    tags: ''
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await campaignAPI.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { value: 'education', label: 'Education' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'environment', label: 'Environment' },
          { value: 'poverty', label: 'Poverty Alleviation' },
          { value: 'disaster-relief', label: 'Disaster Relief' },
          { value: 'animal-welfare', label: 'Animal Welfare' },
          { value: 'children', label: 'Children' },
          { value: 'elderly', label: 'Elderly Care' },
          { value: 'disability', label: 'Disability Support' },
          { value: 'other', label: 'Other' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await campaignAPI.getCampaignById(id);

        if (response.success) {
          const campaign = response.data;
          setFormData({
            title: campaign.title || '',
            description: campaign.description || '',
            category: campaign.category || '',
            target: campaign.target?.toString() || '',
            location: campaign.location || '',
            endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
            tags: campaign.tags?.join(', ') || ''
          });
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        alert('Failed to load campaign data');
        navigate('/ngo/campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const campaignData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        target: parseInt(formData.target),
        location: formData.location,
        endDate: formData.endDate,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await campaignAPI.updateCampaign(id!, campaignData);

      if (response.success) {
        alert('Campaign updated successfully!');
        navigate('/ngo/campaigns');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/ngo/campaigns')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Campaigns
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="text-gray-600 mt-2">Update your campaign details</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="p-6 mb-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter campaign title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your campaign..."
                required
              />
            </div>
          </Card>

          {/* Funding Goals */}
          <Card className="p-6 mb-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Funding Goals</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (₹)
                </label>
                <Input
                  type="number"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  placeholder="Enter target amount"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Campaign location"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card className="p-6 mb-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <Input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="education, children, health"
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
