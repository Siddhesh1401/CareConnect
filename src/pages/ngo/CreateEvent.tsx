import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText, Tag, Image } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: '',
    requirements: '',
    whatToExpect: ''
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Creating event:', formData);
    setIsSubmitting(false);
    navigate('/ngo/events');
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-600 mt-2">Fill in the details to create a volunteer event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
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
                  placeholder="Describe your event, its purpose, and what volunteers will do"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Event Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                leftIcon={<Calendar className="w-5 h-5" />}
                required
              />
              <Input
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                leftIcon={<Clock className="w-5 h-5" />}
                required
              />
              <Input
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                leftIcon={<Clock className="w-5 h-5" />}
                required
              />
            </div>
          </Card>

          {/* Location & Capacity */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Capacity</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                leftIcon={<MapPin className="w-5 h-5" />}
                required
              />
              <Input
                label="Maximum Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Number of volunteers needed"
                leftIcon={<Users className="w-5 h-5" />}
                min="1"
                required
              />
            </div>
          </Card>

          {/* Additional Details */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements (What volunteers should bring)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List what volunteers should bring or prepare (e.g., comfortable clothing, water bottle)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What to Expect
                </label>
                <textarea
                  name="whatToExpect"
                  value={formData.whatToExpect}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the event schedule and what volunteers can expect"
                />
              </div>
            </div>
          </Card>

          {/* Event Image */}
          <Card className="p-6 bg-white border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Image</h3>
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center bg-blue-50">
              <Image className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload event image or banner</p>
              <p className="text-sm text-gray-500 mb-4">PNG, JPG, GIF up to 10MB</p>
              <Button variant="outline" type="button">
                Choose File
              </Button>
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
              {isSubmitting ? 'Creating Event...' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};