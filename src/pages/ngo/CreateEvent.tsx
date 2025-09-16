import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText, Tag, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import MapsButton from '../../components/ui/MapsButton';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    location: {
      address: '',
      city: '',
      state: ''
    },
    capacity: '',
    requirements: '',
    whatToExpect: '',
    tags: ''
  });

  const categories = [
    'Environment',
    'Education',
    'Healthcare',
    'Community Development',
    'Animal Welfare',
    'Disaster Relief',
    'Women Empowerment',
    'Youth Development'
  ];

  const states = [
    'Maharashtra',
    'Delhi',
    'Karnataka',
    'Tamil Nadu',
    'Gujarat',
    'Rajasthan',
    'West Bengal',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'Andhra Pradesh',
    'Telangana',
    'Kerala',
    'Odisha',
    'Punjab',
    'Haryana'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files].slice(0, 3)); // Max 3 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || 
          !formData.date || !formData.startTime || !formData.endTime ||
          !formData.location.address || !formData.location.city || !formData.location.state ||
          !formData.capacity) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Validate capacity
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity < 1) {
        setError('Capacity must be a valid number greater than 0');
        setIsSubmitting(false);
        return;
      }

      // Validate date (should be in future)
      const eventDate = new Date(formData.date);
      if (eventDate <= new Date()) {
        setError('Event date must be in the future');
        setIsSubmitting(false);
        return;
      }

      // Validate time
      if (formData.startTime >= formData.endTime) {
        setError('End time must be after start time');
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem('careconnect_token');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      // Prepare FormData for file upload
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('startTime', formData.startTime);
      formDataToSend.append('endTime', formData.endTime);
      formDataToSend.append('location', JSON.stringify(formData.location));
      formDataToSend.append('capacity', formData.capacity);
      formDataToSend.append('requirements', formData.requirements);
      formDataToSend.append('whatToExpect', formData.whatToExpect);
      formDataToSend.append('tags', JSON.stringify(formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []));

      // Add images only if they exist
      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => {
          formDataToSend.append('images', image);
        });
      }

      console.log('Submitting form data:', {
        title: formData.title,
        location: formData.location,
        imageCount: selectedImages.length
      });

      const response = await axios.post(`${API_BASE_URL}/events/create`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('🎉 Event created successfully! It is now live and visible to volunteers.');
        navigate('/ngo/events');
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('careconnect_token');
        navigate('/auth/login');
      } else if (error.response?.status === 403) {
        setError('Only verified NGOs can create events. Please ensure your organization is approved.');
      } else {
        setError(error.response?.data?.message || 'Failed to create event. Please try again.');
      }
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
            <h1 className="text-3xl font-bold text-primary-900">Create New Event</h1>
            <p className="text-primary-600 mt-2">Fill in the details to create a volunteer event</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200 shadow-soft">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="Event Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                leftIcon={<FileText className="w-5 h-5" />}
                required
              />

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
                  placeholder="Describe your event, its purpose, and what volunteers will do"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Event Images */}
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Event Images (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Upload Event Images (Max 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
                />
                <p className="text-sm text-primary-500 mt-1">
                  Accepted formats: JPG, PNG, GIF. Max size: 5MB per image.
                </p>
              </div>
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-primary-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 border border-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Date and Time */}
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Date & Time</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Event Date *"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                leftIcon={<Calendar className="w-5 h-5" />}
                required
                min={new Date().toISOString().split('T')[0]}
              />

              <Input
                label="Start Time *"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                leftIcon={<Clock className="w-5 h-5" />}
                required
              />

              <Input
                label="End Time *"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                leftIcon={<Clock className="w-5 h-5" />}
                required
              />
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Location</h3>
            <div className="space-y-4">
              <Input
                label="Address *"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                placeholder="Street address, building name, etc."
                leftIcon={<MapPin className="w-5 h-5" />}
                required
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="City *"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    State *
                  </label>
                  <select
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
                    required
                  >
                    <option value="">Select state</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Google Maps Navigation Button */}
              <div className="flex justify-end pt-4">
                <MapsButton
                  address={formData.location.address}
                  city={formData.location.city}
                  state={formData.location.state}
                  variant="outline"
                  size="sm"
                />
              </div>
            </div>
          </Card>

          {/* Event Details */}
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-3 border-b border-primary-100">Event Details</h3>
            <div className="space-y-4">
              <Input
                label="Volunteer Capacity *"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Maximum number of volunteers"
                leftIcon={<Users className="w-5 h-5" />}
                min="1"
                required
              />

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Requirements (Optional)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
                  placeholder="Any specific skills, experience, or items volunteers should bring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  What to Expect (Optional)
                </label>
                <textarea
                  name="whatToExpect"
                  value={formData.whatToExpect}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
                  placeholder="What volunteers can expect during the event"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Tags (Optional)
                </label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas (e.g., cleanup, outdoor, family-friendly)"
                  leftIcon={<Tag className="w-5 h-5" />}
                />
                <p className="text-sm text-primary-500 mt-1">
                  Tags help volunteers find your event more easily
                </p>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 bg-white rounded-xl p-6 border border-primary-100 shadow-soft">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="border-primary-300 hover:border-primary-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 min-w-[200px] border border-primary-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Event...</span>
                </div>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
