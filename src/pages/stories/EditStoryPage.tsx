import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, Upload, X, Tag, FileText, Image as ImageIcon, Heart, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { storyAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface StoryFormData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
}

const categories = [
  { value: '', label: 'Select a category' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'community', label: 'Community Development' },
  { value: 'success', label: 'Success Story' },
  { value: 'other', label: 'Other' }
];

export const EditStoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    tags: [],
    status: 'draft'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

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
        const story = response.data;
        setFormData({
          title: story.title,
          excerpt: story.excerpt,
          content: story.content,
          image: story.image || '',
          category: story.category,
          tags: story.tags || [],
          status: story.status
        });
      }
    } catch (error: any) {
      console.error('Error fetching story:', error);
      if (error.response?.status === 404) {
        navigate('/stories?tab=my');
      } else {
        alert('Failed to load story');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const storyData = { ...formData, status };
      const response = await storyAPI.updateStory(id!, storyData);

      if (response.success) {
        navigate('/stories?tab=my');
      }
    } catch (error: any) {
      console.error('Error updating story:', error);
      alert(error.response?.data?.message || 'Failed to update story');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const previewData = { ...formData, author: user };
    localStorage.setItem('storyPreview', JSON.stringify(previewData));
    window.open('/stories/preview', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/stories?tab=my')}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Story</h1>
              <p className="text-gray-600">Update your story and share your latest experiences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Give your story a compelling title..."
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </Card>

            {/* Excerpt */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Excerpt *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Write a brief summary of your story (max 500 characters)..."
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.excerpt ? 'border-red-500' : ''
                }`}
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{errors.excerpt && <span className="text-red-500">{errors.excerpt}</span>}</span>
                <span>{formData.excerpt.length}/500</span>
              </div>
            </Card>

            {/* Content - Rich Text Editor Placeholder */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Content *
              </label>
              <div className="border border-gray-300 rounded-md">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Rich Text Editor</span>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Tell your story in detail... Share your experiences, challenges, and impact..."
                  className={`w-full px-3 py-3 border-0 focus:outline-none focus:ring-0 resize-none min-h-[300px] ${
                    errors.content ? 'border-red-500' : ''
                  }`}
                  rows={15}
                />
              </div>
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </Card>

            {/* Tags */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button onClick={handleAddTag} variant="outline" size="sm">
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : ''
                }`}
              >
                {categories.filter(cat => cat.value !== 'all').map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </Card>

            {/* Image Upload */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Image
              </label>
              {formData.image ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Add an image to make your story more engaging
                  </p>
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="pointer-events-none">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <div className="space-y-3">
                <Button
                  onClick={() => handleSubmit('draft')}
                  disabled={saving}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save as Draft'}
                </Button>

                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {saving ? 'Publishing...' : 'Update & Publish'}
                </Button>

                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>✨ Your changes will be saved and visible to the community</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
