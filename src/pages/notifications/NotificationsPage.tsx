import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  Calendar, 
  Heart, 
  Users, 
  MessageCircle,
  Award,
  Settings,
  Filter
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: '1',
      type: 'event',
      title: 'Event Registration Confirmed',
      message: 'You have successfully registered for "Beach Cleanup Drive" on January 25th.',
      timestamp: '2 hours ago',
      read: false,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: '2',
      type: 'donation',
      title: 'Donation Receipt',
      message: 'Thank you for your donation of ₹1,000 to Green Earth Foundation.',
      timestamp: '5 hours ago',
      read: false,
      icon: Heart,
      color: 'text-red-600 bg-red-100'
    },
    {
      id: '3',
      type: 'community',
      title: 'New Comment on Your Post',
      message: 'Rahul Kumar commented on your post about the beach cleanup event.',
      timestamp: '1 day ago',
      read: true,
      icon: MessageCircle,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You earned the "Community Builder" badge for making 10 posts.',
      timestamp: '2 days ago',
      read: true,
      icon: Award,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: '5',
      type: 'event',
      title: 'Event Reminder',
      message: 'Don\'t forget about the "Tree Plantation Drive" tomorrow at 7:00 AM.',
      timestamp: '3 days ago',
      read: true,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: '6',
      type: 'community',
      title: 'New Member in Community',
      message: 'Welcome new member Sneha Patel to Environmental Action community.',
      timestamp: '4 days ago',
      read: true,
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
  };

  const handleDeleteNotification = (notificationId: string) => {
    console.log('Deleting notification:', notificationId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Stay updated with your activities and interactions</p>
          </div>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600"
            >
              <Check className="mr-2 w-4 h-4" />
              Mark All Read
            </Button>
            <Button variant="outline" className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600">
              <Settings className="mr-2 w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-8 bg-gradient-to-r from-white to-blue-50/50 border border-blue-100/50 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700">Filter notifications:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'event', label: 'Events' },
              { value: 'donation', label: 'Donations' },
              { value: 'community', label: 'Community' },
              { value: 'achievement', label: 'Achievements' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === filterOption.value
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-blue-100'
                }`}
              >
                {filterOption.label}
                {filterOption.value === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-6">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`group p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                !notification.read 
                  ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-sm border border-blue-100/50'
              }`}
            >
              <div className="flex items-start space-x-6">
                <div className={`p-4 rounded-2xl ${notification.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <notification.icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-bold text-lg ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-3 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition-all duration-300"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <Card className="p-12 text-center bg-blue-50 border-blue-100">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : `No ${filter === 'all' ? '' : filter} notifications to show.`}
            </p>
            <Button 
              onClick={() => setFilter('all')}
              variant="outline" 
            >
              View All Notifications
            </Button>
          </Card>
        )}

        {/* Notification Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900">
            <Settings className="w-5 h-5" />
            <span>Notification Preferences</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Email Notifications</h4>
              <div className="space-y-2">
                {[
                  'Event updates and reminders',
                  'Donation confirmations',
                  'Community activity',
                  'Achievement notifications'
                ].map((item, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500" 
                      defaultChecked 
                    />
                    <span className="text-sm text-gray-600">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Push Notifications</h4>
              <div className="space-y-2">
                {[
                  'Real-time event updates',
                  'Community mentions',
                  'New messages',
                  'Weekly summary'
                ].map((item, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500" 
                      defaultChecked={index < 2} 
                    />
                    <span className="text-sm text-gray-600">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-blue-100">
            <Button>
              Save Preferences
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};