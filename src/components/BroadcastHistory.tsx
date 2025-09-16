import React, { useState, useEffect } from 'react';
import { Calendar, Users, Eye, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { broadcastAPI } from '../services/api';

interface BroadcastHistoryItem {
  _id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sentAt?: string;
  stats: {
    totalRecipients: number;
    totalRead: number;
    totalReplied: number;
    readRate: number;
    replyRate: number;
  };
  createdAt: string;
}

interface BroadcastHistoryProps {
  isVisible: boolean;
  onClose: () => void;
  onViewReplies?: (broadcastId: string, broadcastSubject: string) => void;
}

export const BroadcastHistory: React.FC<BroadcastHistoryProps> = ({
  isVisible,
  onClose,
  onViewReplies
}) => {
  const [broadcasts, setBroadcasts] = useState<BroadcastHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchBroadcastHistory();
    }
  }, [isVisible, page]);

  const fetchBroadcastHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await broadcastAPI.getBroadcastHistory({
        page,
        limit: 10
      });

      if (response.success) {
        if (page === 1) {
          setBroadcasts(response.data.broadcasts);
        } else {
          setBroadcasts(prev => [...prev, ...response.data.broadcasts]);
        }
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
      } else {
        setError(response.message || 'Failed to load broadcast history');
      }
    } catch (err: any) {
      console.error('Broadcast history error:', err);
      setError('Failed to load broadcast history');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Broadcast History</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {loading && broadcasts.length === 0 && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading broadcast history...</p>
              </div>
            )}

            {!loading && broadcasts.length === 0 && !error && (
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcasts sent yet</h3>
                <p className="text-gray-600">Your broadcast history will appear here once you send your first message.</p>
              </div>
            )}

            <div className="space-y-4">
              {broadcasts.map((broadcast) => (
                <Card key={broadcast._id} className="border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{broadcast.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(broadcast.sentAt || broadcast.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(broadcast.priority)}`}>
                          {broadcast.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(broadcast.status)}`}>
                          {broadcast.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Recipients:</span>
                        <span className="font-medium">{broadcast.stats.totalRecipients}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Read:</span>
                        <span className="font-medium">{broadcast.stats.totalRead} ({broadcast.stats.readRate}%)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Replies:</span>
                        <span className="font-medium">{broadcast.stats.totalReplied} ({broadcast.stats.replyRate}%)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-600">Delivered:</span>
                        <span className="font-medium text-green-600">{broadcast.stats.totalRecipients}</span>
                      </div>
                    </div>

                    {onViewReplies && broadcast.stats.totalReplied > 0 && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewReplies(broadcast._id, broadcast.subject)}
                          className="text-primary-600 border-primary-200 hover:bg-primary-50"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          View Replies ({broadcast.stats.totalReplied})
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-6">
                <Button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};