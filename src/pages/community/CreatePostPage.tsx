import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { communityAPI } from '../../services/api';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in both title and content fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Get the first community ID from user's communities
      const userCommunities = await communityAPI.getUserCommunities();
      const communities = userCommunities?.data || [];

      if (Array.isArray(communities) && communities.length > 0) {
        const firstCommunity = communities[0];
        const communityId = firstCommunity?.id || firstCommunity?._id;

        if (communityId) {
          const postData = {
            title: formData.title.trim(),
            content: formData.content.trim(),
            image: selectedImage || undefined,
          };

          await communityAPI.createPost(communityId, postData);

          // Navigate back to community page
          navigate('/community');
        } else {
          setError('Unable to determine community for posting');
        }
      } else {
        setError('You must join a community before creating posts');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
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
            <h1 className="text-3xl font-bold text-primary-900">Create New Post</h1>
            <p className="text-primary-600 mt-2">Share your thoughts, experiences, or ask questions with the community</p>
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
          {/* Post Information */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Post Information</h3>
              <div className="space-y-4">
                <Input
                  label="Post Title *"
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a descriptive title for your post"
                  leftIcon={<FileText className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Share your thoughts, experiences, or ask questions..."
                    rows={6}
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Image Upload */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Post Image (Optional)</h3>
              <ImageUpload
                onImageSelect={setSelectedImage}
                placeholder="Add a photo to make your post more engaging"
                className="w-full"
                useDefaultImage={true}
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
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
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
                  <span>Create Post</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;