import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Inbox, Archive, Star, Search, Filter } from 'lucide-react';
import { BroadcastInbox } from '../../components/BroadcastInbox';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { broadcastAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const VolunteerBroadcasts: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBroadcasts: 0,
    unreadCount: 0,
    repliedCount: 0,
    thisWeekCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await broadcastAPI.getVolunteerBroadcasts();
      if (response.success) {
        const broadcasts = response.data.broadcasts;
        const unreadCount = broadcasts.filter((b: any) => !b.readIds.includes(user?.id)).length;
        const repliedCount = broadcasts.filter((b: any) => b.repliedIds.includes(user?.id)).length;
        const thisWeekCount = broadcasts.filter((b: any) => {
          const sentDate = new Date(b.sentAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sentDate >= weekAgo;
        }).length;

        setStats({
          totalBroadcasts: broadcasts.length,
          unreadCount,
          repliedCount,
          thisWeekCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch broadcast stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/volunteer">
                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary-600 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">NGO Broadcasts</h1>
                  <p className="text-sm text-gray-600">Stay connected with NGO updates and opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.totalBroadcasts}</div>
              <div className="text-sm text-gray-600">Total Broadcasts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.repliedCount}</div>
              <div className="text-sm text-gray-600">Replied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.thisWeekCount}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BroadcastInbox onStatsUpdate={fetchStats} />
      </div>
    </div>
  );
};

export default VolunteerBroadcasts;