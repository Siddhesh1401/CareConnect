import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText, Tag, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import MapsButton from '../../components/ui/MapsButton';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const EditEvent: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
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
    'Uttar Pradesh',
    'West Bengal',
    'Madhya Pradesh',
    'Andhra Pradesh',
    'Telangana',
    'Kerala',
    'Punjab',
    'Haryana'
  ];

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('careconnect_token');
        if (!token) {
          navigate('/auth/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const event = response.data.data.event;
          setFormData({
            title: event.title,
            description: event.description,
            category: event.category,
            date: event.date.split('T')[0], // Format for date input
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            capacity: event.capacity.toString(),
            requirements: event.requirements || '',
            whatToExpect: event.whatToExpect || '',
            tags: event.tags ? event.tags.join(', ') : ''
          });
          setExistingImages(event.images || []);
        }
      } catch (error: any) {
        console.error('Error fetching event:', error);
        setError('Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, navigate]);

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

  const removeNewImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validation
      if (!formData.title.trim() || !formData.description.trim() || !formData.category || 
          !formData.date || !formData.startTime || !formData.endTime || 
          !formData.location.address || !formData.location.city || !formData.location.state ||
          !formData.capacity) {
        setError('All required fields must be filled');
        setIsSubmitting(false);
        return;
      }

      // Validate capacity
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity <= 0) {
        setError('Capacity must be a positive number');
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
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      // Add new images
      selectedImages.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.put(`${API_BASE_URL}/events/${eventId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('Event updated successfully!');
        navigate('/ngo/events');
      }

    } catch (error: any) {
      console.error('Update event error:', error);
      if (error.response?.status === 401) {
        navigate('/auth/login');
      } else {
        setError(error.response?.data?.message || 'Failed to update event. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-soft border border-primary-100">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-primary-600 hover:text-primary-800 hover:bg-primary-50"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary-900">Edit Event</h1>
              <p className="text-primary-600 mt-2">Update your event details</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border border-red-200 shadow-soft mb-6">
            <div className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <Input
                  label="Event Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  leftIcon={<FileText className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
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
                    placeholder="Describe your event and its purpose"
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Current Images */}
          {existingImages.length > 0 && (
            <Card className="border border-primary-200 shadow-soft">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Current Images</h3>
                <div className="grid grid-cols-3 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`http://localhost:5000${image}`}
                        alt={`Current ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-primary-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Add New Images */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Add New Images (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Upload Additional Images (Max 3 total)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
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
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-primary-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Date and Time */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Date & Time</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Event Date *"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  leftIcon={<Calendar className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  required
                />
                <Input
                  label="Start Time *"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  leftIcon={<Clock className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  required
                />
                <Input
                  label="End Time *"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  leftIcon={<Clock className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Location</h3>
              <div className="space-y-4">
                <Input
                  label="Address *"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  leftIcon={<MapPin className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  required
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
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
                      className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                      required
                    >
                      <option value="">Select State</option>
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
            </div>
          </Card>

          {/* Capacity and Additional Information */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <Input
                  label="Volunteer Capacity *"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Maximum number of volunteers"
                  leftIcon={<Users className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  min="1"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="What volunteers need to bring or any special requirements"
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    What to Expect
                  </label>
                  <textarea
                    name="whatToExpect"
                    value={formData.whatToExpect}
                    onChange={handleInputChange}
                    placeholder="What volunteers can expect from this event"
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                    rows={3}
                  />
                </div>

                <Input
                  label="Tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas (e.g., environment, cleanup, community)"
                  leftIcon={<Tag className="w-5 h-5" />}
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
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
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 border border-primary-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating Event...</span>
                </div>
              ) : (
                'Update Event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
