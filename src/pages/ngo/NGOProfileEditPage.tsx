import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { getFullImageUrl, getProfilePictureUrl } from '../../services/api';
import api from '../../services/api';

interface NGOProfile {
  id: string;
  name: string;
  email: string;
  organizationName: string;
  organizationType: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  phone: string;
  website: string;
  foundedYear: number | undefined;
  profilePicture: string;
}

export const NGOProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<NGOProfile | null>(null);

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    website: '',
    foundedYear: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        const user = response.data.data.user;
        setProfile(user);
        setFormData({
          organizationName: user.organizationName || '',
          organizationType: user.organizationType || '',
          description: user.description || '',
          address: user.location?.address || '',
          city: user.location?.city || '',
          state: user.location?.state || '',
          country: user.location?.country || '',
          phone: user.phone || '',
          website: user.website || '',
          foundedYear: user.foundedYear?.toString() || ''
        });
        if (user.profilePicture) {
          setProfilePicturePreview(getFullImageUrl(user.profilePicture));
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (file: File | null) => {
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePicture(null);
      setProfilePicturePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const formDataToSend = new FormData();
      formDataToSend.append('organizationName', formData.organizationName);
      formDataToSend.append('organizationType', formData.organizationType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location[address]', formData.address);
      formDataToSend.append('location[city]', formData.city);
      formDataToSend.append('location[state]', formData.state);
      formDataToSend.append('location[country]', formData.country);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('website', formData.website);
      if (formData.foundedYear) {
        formDataToSend.append('foundedYear', formData.foundedYear);
      }
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      const response = await api.put('/auth/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setProfile(prev => prev ? { ...prev, ...response.data.data.user } : null);
        
        // Notify other pages that NGO profile has been updated
        localStorage.setItem('ngo_profile_updated', Date.now().toString());
        
        setTimeout(() => {
          navigate('/ngo/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-primary-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Profile Not Found</h2>
          <p className="text-primary-600 mb-6">Unable to load your profile information</p>
          <Button onClick={() => navigate('/ngo/dashboard')} className="bg-primary-600 hover:bg-primary-700 border border-primary-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ngo/dashboard')}
              className="flex items-center space-x-2 border-primary-300 text-primary-700 hover:bg-primary-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-primary-200"></div>
            <div>
              <h1 className="text-xl font-semibold text-primary-900">Edit Organization Profile</h1>
              <p className="text-sm text-primary-600">Update your organization's information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Success/Error Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">Profile updated successfully! Redirecting...</p>
            </div>
          )}

          {/* Profile Picture Section */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">Profile Picture</h2>
              <div className="flex items-start space-x-6">
                <img
                  src={profilePicturePreview || getProfilePictureUrl(profile.profilePicture, profile.organizationName, 96)}
                  alt={profile.organizationName}
                  className="w-24 h-24 rounded-xl border-4 border-white shadow-soft object-cover"
                />
                <div className="flex-1">
                  <ImageUpload
                    onImageSelect={handleImageUpload}
                    currentImage={profile.profilePicture}
                    placeholder="Click to upload profile picture"
                    maxSizeMB={2}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-primary-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Organization Name *
                  </label>
                  <Input
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    placeholder="Enter organization name"
                    required
                    className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Organization Type *
                  </label>
                  <select
                    value={formData.organizationType}
                    onChange={(e) => handleInputChange('organizationType', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="NGO">NGO</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Trust">Trust</option>
                    <option value="Society">Society</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Founded Year
                  </label>
                  <Input
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                    placeholder="2020"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                    className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your organization, mission, and activities..."
                  rows={4}
                  required
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                />
              </div>
            </div>
          </Card>

          {/* Location Information */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-primary-900 mb-6 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span>Location Information</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street address"
                    className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      City *
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      required
                      className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      State *
                    </label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                      required
                      className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Country *
                    </label>
                    <Input
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Country"
                      required
                      className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="border border-primary-200 shadow-soft">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-primary-900 mb-6 flex items-center space-x-2">
                <Globe className="w-5 h-5 text-primary-500" />
                <span>Contact Information</span>
              </h2>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.yourorganization.com"
                  className="border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/ngo/dashboard')}
              disabled={saving}
              className="border-primary-300 text-primary-700 hover:bg-primary-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 border border-primary-700 flex items-center space-x-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
