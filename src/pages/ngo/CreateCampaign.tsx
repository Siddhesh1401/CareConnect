import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, FileText, Image, X } from 'lucide-react';
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
    images: [] as File[]
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  const handleImageSelect = (files: File[]) => {
    setFormData(prev => ({ ...prev, images: files }));
    
    // Create previews for all selected files
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previews.push(e.target.result as string);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('target', formData.targetAmount);
      formDataToSend.append('location', 'Mumbai, Maharashtra'); // This could be made dynamic
      formDataToSend.append('endDate', new Date(Date.now() + parseInt(formData.duration) * 24 * 60 * 60 * 1000).toISOString());
      
      // Add images
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await campaignAPI.createCampaign(formDataToSend);
      
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
            <h1 className="text-3xl font-bold text-primary-900">Create Fundraising Campaign</h1>
            <p className="text-primary-600 mt-2">Launch a campaign to raise funds for your cause</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Campaign Details</h3>
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
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
                  placeholder="Describe your campaign and its impact"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
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
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Funding Goals</h3>
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
              <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary-800">
                    Target: ₹{parseInt(formData.targetAmount).toLocaleString()}
                  </div>
                  <div className="text-sm text-primary-600 mt-1">
                    Platform fee: 2.5% + Payment gateway charges
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Campaign Story */}
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Campaign Story</h3>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Tell your story (Why this campaign matters)
              </label>
              <textarea
                name="story"
                value={formData.story}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
                placeholder="Share the story behind your campaign. Explain the problem, your solution, and the impact donations will make."
                required
              />
              <div className="mt-2 text-sm text-primary-500">
                Tip: Include specific details about how funds will be used and the expected impact.
              </div>
            </div>
          </Card>

          {/* Media Upload */}
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Campaign Images</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-primary-200 rounded-lg p-6 text-center bg-primary-50 hover:border-primary-300 transition-all duration-300">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleImageSelect(files);
                  }}
                  className="hidden"
                  id="campaign-images"
                />
                <label htmlFor="campaign-images" className="cursor-pointer block">
                  <Image className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <p className="text-primary-600 mb-2">Click to upload campaign images</p>
                  <p className="text-sm text-primary-500 mb-4">PNG, JPG, GIF up to 5MB each (max 10 images)</p>
                  <div className="inline-flex items-center px-4 py-2 border border-primary-300 rounded-lg text-primary-700 bg-white hover:bg-primary-50 hover:border-primary-400 transition-colors">
                    Choose Images
                  </div>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Campaign image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-primary-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-primary-500">
              High-quality images can increase donations by up to 40%. Include photos that show the impact of your work. ({imagePreviews.length}/10 images selected)
            </div>
          </Card>

          {/* Campaign Preview */}
          <Card className="p-6 bg-primary-50 border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Campaign Preview</h3>
            <div className="bg-white rounded-lg p-4 border border-primary-200 shadow-sm">
              <h4 className="font-semibold text-primary-900 mb-2">
                {formData.title || 'Campaign Title'}
              </h4>
              <p className="text-primary-600 text-sm mb-3">
                {formData.description || 'Campaign description will appear here...'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-500 px-2 py-1 bg-primary-50 rounded border border-primary-100">Target: ₹{formData.targetAmount ? parseInt(formData.targetAmount).toLocaleString() : '0'}</span>
                <span className="text-primary-500 px-2 py-1 bg-primary-50 rounded border border-primary-100">Duration: {formData.duration || '0'} days</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl p-6 border border-primary-100 shadow-soft">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              {/* Save as Draft - Left */}
              <Button
                type="button"
                variant="outline"
                className="border-primary-300 hover:border-primary-400 w-full sm:w-auto order-2 sm:order-1"
              >
                Save as Draft
              </Button>
              
              {/* Launch Campaign - Center */}
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 border border-primary-700 px-8 w-full sm:w-auto order-1 sm:order-2"
              >
                {isSubmitting ? 'Creating Campaign...' : 'Launch Campaign'}
              </Button>
              
              {/* Cancel - Right */}
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="border-primary-300 hover:border-primary-400 w-full sm:w-auto order-3"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};