import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { communityAPI } from '../../services/api';

export const CreateCommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general'
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const categories = [
    { value: 'general', label: 'General Discussion' },
    { value: 'volunteer', label: 'Volunteering' },
    { value: 'environment', label: 'Environment' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'animals', label: 'Animal Welfare' },
    { value: 'elderly', label: 'Elderly Care' },
    { value: 'children', label: 'Children & Youth' },
    { value: 'disaster', label: 'Disaster Relief' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in both name and description fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        image: selectedImage || undefined,
      };

      await communityAPI.createCommunity(communityData);

      // Navigate back to community page
      navigate('/community');
    } catch (error) {
      console.error('Error creating community:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create community';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 bg-white rounded-xl p-6 shadow-soft border border-primary-100">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-900 hover:bg-primary-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Create New Community</h1>
            <p className="text-primary-600 mt-2">Build a community around your cause and connect with like-minded people</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border border-red-200 shadow-soft">
            <div className="p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Information */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Community Information</h3>
              <div className="space-y-4">
                <Input
                  label="Community Name *"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter a descriptive name for your community"
                  leftIcon={<Users className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what your community is about and what members can expect..."
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Image Upload */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Community Image (Optional)</h3>
              <ImageUpload
                onImageSelect={setSelectedImage}
                placeholder="Add a cover image to make your community more attractive"
                className="w-full"
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
              className="bg-primary-600 hover:bg-primary-700 border border-primary-700 min-w-[150px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Create Community</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityPage;