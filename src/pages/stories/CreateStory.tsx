import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, Upload, X, Tag, FileText, Image as ImageIcon, Heart } from 'lucide-react';
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

export const CreateStory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'community',
    tags: [],
    status: 'draft'
  });

  const [errors, setErrors] = useState<Partial<StoryFormData>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleInputChange = (field: keyof StoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
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
    const newErrors: Partial<StoryFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const storyData = { ...formData, status };
      const response = await storyAPI.createStory(storyData);

      if (response.success) {
        navigate('/stories');
      }
    } catch (error: any) {
      console.error('Error creating story:', error);
      alert(error.response?.data?.message || 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab or modal
    const previewData = { ...formData, author: user };
    localStorage.setItem('storyPreview', JSON.stringify(previewData));
    window.open('/stories/preview', '_blank');
  };

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Create Your Impact Story</h1>
          <p className="text-gray-600">Share your journey and inspire others with your experiences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card className="p-6 border border-primary-200 shadow-soft">
              <label className="block text-sm font-medium text-primary-900 mb-2">
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
            <Card className="p-6 border border-primary-200 shadow-soft">
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Story Excerpt *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Write a brief summary of your story (max 500 characters)..."
                className={`w-full px-3 py-2 border border-primary-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
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
            <Card className="p-6 border border-primary-200 shadow-soft">
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Story Content *
              </label>
              <div className="border border-primary-200 rounded-md">
                <div className="bg-primary-50 px-3 py-2 border-b border-primary-200 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  <span className="text-sm text-primary-700">Rich Text Editor</span>
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
            <Card className="p-6 border border-primary-200 shadow-soft">
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
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
            <Card className="p-6 border border-primary-200 shadow-soft">
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border border-primary-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
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
            <Card className="p-6 border border-primary-200 shadow-soft">
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Cover Image
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <button
                      onClick={() => {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-primary-200 rounded-md p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                    <p className="text-primary-600 mb-4">Upload a cover image for your story</p>
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
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6 border border-primary-200 shadow-soft">
              <div className="space-y-3">
                <Button
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>

                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Publish Story
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

              <div className="mt-4 text-sm text-primary-600">
                <p>✨ Your story will be published immediately and visible to the community</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
