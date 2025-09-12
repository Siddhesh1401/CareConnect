import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Camera,
  Bell,
  Shield,
  Award,
  Heart,
  Users,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: ''
  });

  const handleSave = () => {
    // In a real app, this would update the user profile via API
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const stats = user?.role === 'volunteer' ? [
    { label: 'Events Joined', value: '12', icon: Calendar },
    { label: 'Hours Volunteered', value: '45', icon: Clock },
    { label: 'Donations Made', value: '₹5,250', icon: Heart },
    { label: 'Community Posts', value: '8', icon: Users }
  ] : [
    { label: 'Events Created', value: '24', icon: Calendar },
    { label: 'Volunteers Managed', value: '1,248', icon: Users },
    { label: 'Funds Raised', value: '₹2.4L', icon: Heart },
    { label: 'Impact Score', value: '4.8', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-primary-700">Profile Settings</h1>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg p-3"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="p-8 bg-white border-primary-200">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
                />
              ) : (
                <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center border-4 border-primary-200">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-all duration-200">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{user?.name}</h2>
              <p className="text-primary-600 capitalize font-semibold text-lg">{user?.role?.replace('_', ' ')}</p>
              <p className="text-gray-600 text-lg">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-3">
                Member since {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {user?.role === 'volunteer' && user?.points && (
              <div className="text-center bg-primary-50 p-6 rounded-lg border border-primary-200">
                <div className="text-4xl font-bold text-primary-700">{user.points}</div>
                <div className="text-sm text-gray-600 font-medium">Total Points</div>
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="group p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm border border-blue-100/50">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-blue-100/50">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card className="p-8 bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                leftIcon={<User className="w-5 h-5" />}
              />
              
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                leftIcon={<Mail className="w-5 h-5" />}
              />
              
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                leftIcon={<Phone className="w-5 h-5" />}
                placeholder="+91 98765 43210"
              />
              
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                leftIcon={<MapPin className="w-5 h-5" />}
                placeholder="Mumbai, India"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Tell us about yourself and your interests..."
              />
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Notification Preferences</h3>
            
            <div className="space-y-6">
              {[
                { id: 'events', label: 'Event Updates', description: 'Get notified about new events and registration confirmations' },
                { id: 'community', label: 'Community Activity', description: 'Notifications for likes, comments, and new posts' },
                { id: 'donations', label: 'Donation Receipts', description: 'Receive confirmation and receipts for donations' },
                { id: 'achievements', label: 'Achievements', description: 'Get notified when you earn new badges or points' },
                { id: 'newsletter', label: 'Newsletter', description: 'Weekly updates about platform activities and impact stories' }
              ].map((setting) => (
                <div key={setting.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{setting.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                  </div>
                  <div className="flex space-x-4 ml-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-600">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">Push</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Security Settings</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-4 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                  <Button>
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="border-t border-blue-100 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Add an extra layer of security to your account</p>
                    <p className="text-sm text-gray-500 mt-1">Status: Not enabled</p>
                  </div>
                  <Button variant="outline">
                    Enable 2FA
                  </Button>
                </div>
              </div>

              <div className="border-t border-blue-100 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                  >
                    Download My Data
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        console.log('Account deletion requested');
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Achievements Section for Volunteers */}
        {user?.role === 'volunteer' && user?.achievements && user.achievements.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2 text-gray-900">
              <Award className="w-6 h-6 text-blue-600" />
              <span>Your Achievements</span>
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.achievements.map((achievement) => (
                <div key={achievement.id} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">🏆</div>
                    <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(achievement.earnedDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Award className="w-4 h-4" />
                      <span>{achievement.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};