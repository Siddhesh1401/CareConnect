import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, DollarSign, Calendar, FileText, Image } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { campaignAPI } from '../../services/api';

export const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetAmount: '',
    duration: '',
    story: '',
    images: [] as string[]
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
        target: parseInt(formData.targetAmount),
        location: 'Mumbai, Maharashtra', // This could be made dynamic
        endDate: new Date(Date.now() + parseInt(formData.duration) * 24 * 60 * 60 * 1000).toISOString(),
        tags: [] // Could be added to form
      };

      const response = await campaignAPI.createCampaign(campaignData);
      
      if (response.success) {
        navigate('/ngo/campaigns');
      } else {
        alert('Failed to create campaign: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Fundraising Campaign</h1>
            <p className="text-gray-600 mt-2">Launch a campaign to raise funds for your cause</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
            <div className="space-y-4">
              <Input
                label="Campaign Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter campaign title"
                leftIcon={<FileText className="w-5 h-5" />}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your campaign and its impact"
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
          </Card>

          {/* Funding Goals */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Goals</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Target Amount (₹)"
                name="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={handleInputChange}
                placeholder="500000"
                leftIcon={<DollarSign className="w-5 h-5" />}
                min="1000"
                required
              />
              <Input
                label="Campaign Duration (days)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="30"
                leftIcon={<Calendar className="w-5 h-5" />}
                min="1"
                max="365"
                required
              />
            </div>
            
            {formData.targetAmount && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-800">
                    Target: ₹{parseInt(formData.targetAmount).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Platform fee: 2.5% + Payment gateway charges
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Campaign Story */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Story</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell your story (Why this campaign matters)
              </label>
              <textarea
                name="story"
                value={formData.story}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share the story behind your campaign. Explain the problem, your solution, and the impact donations will make."
                required
              />
              <div className="mt-2 text-sm text-gray-500">
                Tip: Include specific details about how funds will be used and the expected impact.
              </div>
            </div>
          </Card>

          {/* Media Upload */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Media</h3>
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center bg-blue-50">
              <Image className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload campaign images or videos</p>
              <p className="text-sm text-gray-500 mb-4">PNG, JPG, GIF up to 10MB each</p>
              <Button variant="outline" type="button">
                Choose Files
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              High-quality images and videos can increase donations by up to 40%. Include photos that show the impact of your work.
            </div>
          </Card>

          {/* Campaign Preview */}
          <Card className="p-6 bg-blue-50 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Preview</h3>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                {formData.title || 'Campaign Title'}
              </h4>
              <p className="text-gray-600 text-sm mb-3">
                {formData.description || 'Campaign description will appear here...'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Target: ₹{formData.targetAmount ? parseInt(formData.targetAmount).toLocaleString() : '0'}</span>
                <span className="text-gray-500">Duration: {formData.duration || '0'} days</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating Campaign...' : 'Launch Campaign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};