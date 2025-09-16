import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Send, RefreshCw, Megaphone, Search, Star } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { broadcastAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface BroadcastMessage {
  _id: string;
  ngoId: string;
  ngoName: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetFilters: {
    status?: 'active' | 'inactive';
    skills?: string[];
    location?: string;
  };
  recipientIds: string[];
  deliveredIds: string[];
  readIds: string[];
  repliedIds: string[];
  stats: {
    totalRecipients: number;
    totalDelivered: number;
    totalRead: number;
    totalReplied: number;
    deliveryRate: number;
    readRate: number;
    replyRate: number;
  };
  sentAt: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt: string;
  isRead?: boolean; // Local state for read status
}

export const BroadcastInbox: React.FC<{ onStatsUpdate?: () => void }> = ({ onStatsUpdate }) => {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'ngo'>('date');

  const fetchBroadcasts = async () => {
    try {
      setRefreshing(true);
      const response = await broadcastAPI.getVolunteerBroadcasts();

      if (response.success) {
        // Mark broadcasts as read if they haven't been read yet
        const broadcastsWithReadStatus = response.data.broadcasts.map((broadcast: BroadcastMessage) => ({
          ...broadcast,
          isRead: broadcast.readIds.includes(user?.id || '')
        }));
        setBroadcasts(broadcastsWithReadStatus);
        onStatsUpdate?.(); // Update stats in parent component
      }
    } catch (error: any) {
      console.error('Failed to fetch broadcasts:', error);
      setError('Failed to load broadcasts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (broadcastId: string) => {
    try {
      // For now, we'll just update local state since we don't have a markAsRead endpoint
      // In a full implementation, you'd call an API to mark as read on the server
      setBroadcasts(prev => prev.map(broadcast =>
        broadcast._id === broadcastId
          ? { ...broadcast, isRead: true, readIds: [...broadcast.readIds, user?.id || ''] }
          : broadcast
      ));

      // Update selected broadcast if it's the one being marked as read
      if (selectedBroadcast && selectedBroadcast._id === broadcastId) {
        setSelectedBroadcast(prev => prev ? {
          ...prev,
          isRead: true,
          readIds: [...prev.readIds, user?.id || '']
        } : null);
      }
      onStatsUpdate?.(); // Update stats after marking as read
    } catch (error) {
      console.error('Failed to mark broadcast as read:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedBroadcast || !newReply.trim()) return;

    setIsReplying(true);
    try {
      const response = await broadcastAPI.replyToBroadcast(selectedBroadcast._id, {
        message: newReply.trim()
      });

      if (response.success) {
        setNewReply('');
        // Update the broadcast to show it has been replied to
        setBroadcasts(prev => prev.map(broadcast =>
          broadcast._id === selectedBroadcast._id
            ? { ...broadcast, repliedIds: [...broadcast.repliedIds, user?.id || ''] }
            : broadcast
        ));

        if (selectedBroadcast) {
          setSelectedBroadcast(prev => prev ? {
            ...prev,
            repliedIds: [...prev.repliedIds, user?.id || '']
          } : null);
        }
        onStatsUpdate?.(); // Update stats after replying
      }
    } catch (error: any) {
      console.error('Failed to send reply:', error);
      setError('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter broadcasts based on active tab and search
  const filteredBroadcasts = broadcasts
    .filter(broadcast => {
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'unread' && !broadcast.isRead) ||
        (activeTab === 'read' && broadcast.isRead);

      const matchesSearch =
        broadcast.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        broadcast.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        broadcast.message.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'ngo':
          return a.ngoName.localeCompare(b.ngoName);
        default:
          return 0;
      }
    });

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Tabs and Search */}
      <Card className="p-6 bg-white border-primary-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-600 rounded-lg">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">NGO Broadcasts</h2>
              <p className="text-sm text-gray-600">Stay updated with NGO communications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBroadcasts}
              disabled={refreshing}
              className="border-primary-200 hover:border-primary-300 hover:bg-primary-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4">
          {[
            { key: 'all', label: 'All', count: broadcasts.length },
            { key: 'unread', label: 'Unread', count: broadcasts.filter(b => !b.isRead).length },
            { key: 'read', label: 'Read', count: broadcasts.filter(b => b.isRead).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search broadcasts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="ngo">Sort by NGO</option>
          </select>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Broadcasts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Broadcasts List */}
        <div className="space-y-3">
          {filteredBroadcasts.length === 0 ? (
            <Card className="p-8 text-center">
              <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No broadcasts found' : 'No broadcasts yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'NGOs will send you updates and opportunities here'
                }
              </p>
            </Card>
          ) : (
            filteredBroadcasts.map((broadcast) => (
              <Card
                key={broadcast._id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                  selectedBroadcast?._id === broadcast._id
                    ? 'border-primary-300 bg-primary-50'
                    : broadcast.isRead
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-primary-200 bg-white'
                }`}
                onClick={() => {
                  setSelectedBroadcast(broadcast);
                  if (!broadcast.isRead) {
                    markAsRead(broadcast._id);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${broadcast.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {broadcast.subject}
                      </h3>
                      {!broadcast.isRead && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-primary-600 font-medium">{broadcast.ngoName}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(broadcast.priority)}`}>
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(broadcast.priority)}
                      <span className="capitalize">{broadcast.priority}</span>
                    </div>
                  </div>
                </div>
                <p className={`text-sm mb-2 overflow-hidden text-ellipsis ${broadcast.isRead ? 'text-gray-600' : 'text-gray-700'}`} style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  lineHeight: '1.4em',
                  maxHeight: '2.8em'
                }}>
                  {broadcast.message}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(broadcast.sentAt)}</span>
                  <div className="flex items-center space-x-2">
                    {broadcast.repliedIds.includes(user?.id || '') && (
                      <span className="text-green-600 font-medium">✓ Replied</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add favorite/archive functionality here
                      }}
                      className="p-1 h-auto"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Broadcast Details - Enhanced */}
        <div>
          {selectedBroadcast ? (
            <Card className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedBroadcast.subject}
                  </h3>
                  <p className="text-primary-600 font-medium">{selectedBroadcast.ngoName}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedBroadcast.priority)}`}>
                  <div className="flex items-center space-x-1">
                    {getPriorityIcon(selectedBroadcast.priority)}
                    <span className="capitalize">{selectedBroadcast.priority}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{selectedBroadcast.message}</p>
              </div>

              <div className="text-sm text-gray-500 mb-6">
                <p>Sent: {formatDate(selectedBroadcast.sentAt)}</p>
                {selectedBroadcast.targetFilters && Object.keys(selectedBroadcast.targetFilters).length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-700 mb-1">Target Filters:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBroadcast.targetFilters.skills?.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {selectedBroadcast.targetFilters.location && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          📍 {selectedBroadcast.targetFilters.location}
                        </span>
                      )}
                      {selectedBroadcast.targetFilters.status && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {selectedBroadcast.targetFilters.status}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Section - Enhanced */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Reply to NGO</h4>
                {selectedBroadcast.repliedIds.includes(user?.id || '') ? (
                  <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>You have already replied to this broadcast</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {newReply.length}/500 characters
                      </span>
                      <Button
                        onClick={sendReply}
                        disabled={!newReply.trim() || isReplying}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        {isReplying ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a broadcast to view details</p>
                <p className="text-sm">Click on any broadcast from the list to read it</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};