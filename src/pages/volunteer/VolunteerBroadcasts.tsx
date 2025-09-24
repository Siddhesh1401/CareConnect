import React, { useState, useEffect } from 'react';
import { BroadcastInbox } from '../../components/BroadcastInbox';
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
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-900 mb-6 animate-fade-in">
            NGO Broadcasts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            Stay connected with NGO updates and opportunities
          </p>
        </div>

        {/* Stats Overview */}
        <Card className="p-8 mb-12 bg-white border border-primary-200 shadow-soft">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.totalBroadcasts}</div>
              <div className="text-sm text-gray-600">Total Broadcasts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.repliedCount}</div>
              <div className="text-sm text-gray-600">Replied</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.thisWeekCount}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <BroadcastInbox onStatsUpdate={fetchStats} />
      </div>
    </div>
  );
};

export default VolunteerBroadcasts;