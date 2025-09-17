import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  History, 
  BarChart3, 
  Users, 
  Eye, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  Target,
  Zap,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { BroadcastModal } from './BroadcastModal';
import { BroadcastHistory } from './BroadcastHistory';
import { BroadcastReplies } from './BroadcastReplies';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { broadcastAPI } from '../services/api';

type ViewMode = 'compose' | 'history' | 'replies';

interface NGOBroadcastsProps {
  initialView?: ViewMode;
  broadcastId?: string;
}

export const NGOBroadcasts: React.FC<NGOBroadcastsProps> = ({
  initialView = 'dashboard',
  broadcastId
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>(initialView);
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string | undefined>(broadcastId);
  const [selectedBroadcastSubject, setSelectedBroadcastSubject] = useState<string>('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [broadcastStats, setBroadcastStats] = useState({
    totalBroadcasts: 0,
    totalRecipients: 0,
    totalReplies: 0,
    avgReadRate: 0,
    avgReplyRate: 0,
    recentBroadcasts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchBroadcastStats();
    }
  }, [currentView]);

  const fetchBroadcastStats = async () => {
    try {
      setLoading(true);
      // Get recent broadcasts for stats
      const response = await broadcastAPI.getBroadcastHistory({ page: 1, limit: 5 });
      if (response.success) {
        const broadcasts = response.data.broadcasts;
        const stats = {
          totalBroadcasts: broadcasts.length,
          totalRecipients: broadcasts.reduce((sum, b) => sum + b.stats.totalRecipients, 0),
          totalReplies: broadcasts.reduce((sum, b) => sum + b.stats.totalReplied, 0),
          avgReadRate: broadcasts.length > 0 
            ? Math.round(broadcasts.reduce((sum, b) => sum + b.stats.readRate, 0) / broadcasts.length)
            : 0,
          avgReplyRate: broadcasts.length > 0 
            ? Math.round(broadcasts.reduce((sum, b) => sum + b.stats.replyRate, 0) / broadcasts.length)
            : 0,
          recentBroadcasts: broadcasts.slice(0, 3)
        };
        setBroadcastStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch broadcast stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReplies = (broadcastId: string, broadcastSubject: string) => {
    setSelectedBroadcastId(broadcastId);
    setSelectedBroadcastSubject(broadcastSubject);
    setCurrentView('replies');
    setShowComposeModal(false);
    setShowHistoryModal(false);
  };

  const handleBackToHistory = () => {
    setSelectedBroadcastId(undefined);
    setSelectedBroadcastSubject('');
    setCurrentView('dashboard');
    setShowHistoryModal(false);
    setShowComposeModal(false);
  };

  const handleComposeClick = () => {
    setCurrentView('compose');
    setShowComposeModal(true);
    setShowHistoryModal(false);
  };

  const handleHistoryClick = () => {
    setCurrentView('history');
    setShowHistoryModal(true);
    setShowComposeModal(false);
  };

  const handleDashboardClick = () => {
    setCurrentView('dashboard');
    setShowComposeModal(false);
    setShowHistoryModal(false);
  };

  const handleComposeClose = () => {
    setShowComposeModal(false);
    setCurrentView('dashboard');
  };

  const handleHistoryClose = () => {
    setShowHistoryModal(false);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-12">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-primary-200 shadow-soft">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-600">Total Broadcasts</p>
                      <p className="text-3xl font-bold text-primary-900">{broadcastStats.totalBroadcasts}</p>
                    </div>
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-primary-200 shadow-soft">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-600">Total Recipients</p>
                      <p className="text-3xl font-bold text-primary-900">{broadcastStats.totalRecipients}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-primary-200 shadow-soft">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-600">Avg Read Rate</p>
                      <p className="text-3xl font-bold text-primary-900">{broadcastStats.avgReadRate}%</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-primary-200 shadow-soft">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-600">Avg Reply Rate</p>
                      <p className="text-3xl font-bold text-primary-900">{broadcastStats.avgReplyRate}%</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border border-primary-200 shadow-soft">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={handleComposeClick}
                    className="bg-primary-600 hover:bg-primary-700 h-auto p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Send className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Send Broadcast</div>
                        <div className="text-sm opacity-90">Compose and send a new message</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('history')}
                    className="border-primary-300 hover:bg-primary-50 h-auto p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <History className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">View History</div>
                        <div className="text-sm opacity-75">Manage sent broadcasts</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('analytics')}
                    className="border-primary-300 hover:bg-primary-50 h-auto p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Analytics</div>
                        <div className="text-sm opacity-75">View performance metrics</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Broadcasts */}
            <Card className="border border-primary-200 shadow-soft">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-900">Recent Broadcasts</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('history')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </Button>
                </div>

                {broadcastStats.recentBroadcasts.length > 0 ? (
                  <div className="space-y-4">
                    {broadcastStats.recentBroadcasts.map((broadcast: any) => (
                      <div key={broadcast._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{broadcast.subject}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(broadcast.sentAt || broadcast.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{broadcast.stats.totalRecipients}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>{broadcast.stats.readRate}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                            <span>{broadcast.stats.totalReplied}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcasts yet</h3>
                    <p className="text-gray-600 mb-4">Send your first broadcast to get started</p>
                    <Button onClick={handleComposeClick}>
                      <Send className="w-4 h-4 mr-2" />
                      Send First Broadcast
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case 'compose':
        return (
          <div className="space-y-8">
            {/* Quick Templates */}
            <Card className="border border-primary-200 shadow-soft">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Quick Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleComposeClick}
                    className="h-auto p-4 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="text-left">
                      <div className="font-medium text-primary-900 mb-2">Event Announcement</div>
                      <div className="text-sm text-primary-600">Announce upcoming events and volunteer opportunities</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleComposeClick}
                    className="h-auto p-4 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="text-left">
                      <div className="font-medium text-primary-900 mb-2">Impact Update</div>
                      <div className="text-sm text-primary-600">Share your NGO's recent achievements and impact</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleComposeClick}
                    className="h-auto p-4 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="text-left">
                      <div className="font-medium text-primary-900 mb-2">Volunteer Recognition</div>
                      <div className="text-sm text-primary-600">Thank and recognize volunteer contributions</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleComposeClick}
                    className="h-auto p-4 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="text-left">
                      <div className="font-medium text-primary-900 mb-2">Urgent Appeal</div>
                      <div className="text-sm text-primary-600">Request immediate help for urgent situations</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleComposeClick}
                    className="h-auto p-4 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="text-left">
                      <div className="font-medium text-primary-900 mb-2">Training Session</div>
                      <div className="text-sm text-primary-600">Invite volunteers to training and skill development</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleComposeClick}
                    className="h-auto p-4 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="text-left">
                      <div className="font-medium text-primary-900 mb-2">Custom Message</div>
                      <div className="text-sm text-primary-600">Create a custom broadcast from scratch</div>
                    </div>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Broadcasts for Reference */}
            <Card className="border border-primary-200 shadow-soft">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Recent Broadcasts</h3>
                {broadcastStats.recentBroadcasts.length > 0 ? (
                  <div className="space-y-3">
                    {broadcastStats.recentBroadcasts.slice(0, 3).map((broadcast: any) => (
                      <div key={broadcast._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{broadcast.subject}</h4>
                          <p className="text-xs text-gray-600">
                            {new Date(broadcast.sentAt || broadcast.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-gray-500">{broadcast.stats.readRate}% read</span>
                          <span className="text-gray-500">{broadcast.stats.totalReplied} replies</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No recent broadcasts</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case 'history':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Broadcast History</h3>
              <p className="text-gray-600">Use the "History" button above to view your broadcast history.</p>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            {/* Analytics Header */}
            <Card className="border border-primary-200 shadow-soft">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-8 h-8 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900">Broadcast Analytics</h3>
                    <p className="text-sm text-primary-600">Detailed performance metrics and insights</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border border-primary-200 shadow-soft">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-600">+12%</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-600">Engagement Rate</p>
                    <p className="text-2xl font-bold text-primary-900">{broadcastStats.avgReadRate + broadcastStats.avgReplyRate}%</p>
                    <p className="text-xs text-gray-600 mt-1">Combined read & reply rate</p>
                  </div>
                </div>
              </Card>

              <Card className="border border-primary-200 shadow-soft">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-600">Target</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-600">Response Time</p>
                    <p className="text-2xl font-bold text-primary-900">2.4h</p>
                    <p className="text-xs text-gray-600 mt-1">Average reply time</p>
                  </div>
                </div>
              </Card>

              <Card className="border border-primary-200 shadow-soft">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-600">Best</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-600">Peak Activity</p>
                    <p className="text-2xl font-bold text-primary-900">2-4 PM</p>
                    <p className="text-xs text-gray-600 mt-1">Most active hours</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Broadcast Performance Chart Placeholder */}
            <Card className="border border-primary-200 shadow-soft">
              <div className="p-6">
                <h4 className="text-lg font-semibold text-primary-900 mb-4">Broadcast Performance Over Time</h4>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Performance chart visualization</p>
                    <p className="text-sm text-gray-500">Coming soon with detailed analytics</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Performing Broadcasts */}
            <Card className="border border-primary-200 shadow-soft">
              <div className="p-6">
                <h4 className="text-lg font-semibold text-primary-900 mb-4">Top Performing Broadcasts</h4>
                {broadcastStats.recentBroadcasts.length > 0 ? (
                  <div className="space-y-4">
                    {broadcastStats.recentBroadcasts
                      .sort((a: any, b: any) => b.stats.readRate - a.stats.readRate)
                      .slice(0, 3)
                      .map((broadcast: any, index: number) => (
                        <div key={broadcast._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{broadcast.subject}</h5>
                              <p className="text-sm text-gray-600">
                                {new Date(broadcast.sentAt || broadcast.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{broadcast.stats.readRate}% read</p>
                            <p className="text-xs text-gray-600">{broadcast.stats.totalReplied} replies</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No broadcast data available yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case 'replies':
        return (
          <BroadcastReplies
            broadcastId={selectedBroadcastId}
            showBackButton={true}
            onBack={handleBackToHistory}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-soft border border-primary-100 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              {currentView === 'dashboard' && 'Broadcast Dashboard'}
              {currentView === 'compose' && 'Send Broadcast'}
              {currentView === 'history' && 'Broadcast History'}
              {currentView === 'analytics' && 'Broadcast Analytics'}
              {currentView === 'replies' && `Replies: ${selectedBroadcastSubject}`}
            </h1>
            <p className="text-primary-600 mt-2">
              {currentView === 'dashboard' && 'Overview of your broadcast communications'}
              {currentView === 'compose' && 'Send messages to your volunteers'}
              {currentView === 'history' && 'View and manage your sent broadcasts'}
              {currentView === 'analytics' && 'Analyze broadcast performance and engagement'}
              {currentView === 'replies' && 'View replies from volunteers'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant={currentView === 'dashboard' ? 'primary' : 'outline'}
              size="sm"
              onClick={handleDashboardClick}
              className={currentView === 'dashboard' ? 'bg-primary-600' : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50'}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'compose' ? 'primary' : 'outline'}
              size="sm"
              onClick={handleComposeClick}
              className={currentView === 'compose' ? 'bg-primary-600' : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50'}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast
            </Button>
            <Button
              variant={currentView === 'history' ? 'primary' : 'outline'}
              size="sm"
              onClick={handleHistoryClick}
              className={currentView === 'history' ? 'bg-primary-600' : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50'}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {renderContent()}
      </div>

      {/* Modals */}
      <BroadcastModal
        isOpen={showComposeModal}
        onClose={handleComposeClose}
        onSuccess={() => {
          setShowComposeModal(false);
          setCurrentView('dashboard');
        }}
      />

      <BroadcastHistory
        isVisible={showHistoryModal}
        onClose={handleHistoryClose}
        onViewReplies={handleViewReplies}
      />
    </div>
  );
};