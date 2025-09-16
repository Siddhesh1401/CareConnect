import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, RefreshCw, Eye, ArrowLeft } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { broadcastAPI } from '../services/api';

interface BroadcastReply {
  _id: string;
  broadcastId?: string;
  broadcastSubject?: string;
  volunteerName: string;
  volunteerEmail: string;
  message: string;
  repliedAt: string;
  conversation: {
    messages: Array<{
      id: string;
      sender: 'user' | 'admin';
      message: string;
      timestamp: string;
    }>;
  };
}

interface BroadcastRepliesProps {
  broadcastId?: string; // If provided, show replies for specific broadcast
  showBackButton?: boolean;
  onBack?: () => void;
}

export const BroadcastReplies: React.FC<BroadcastRepliesProps> = ({
  broadcastId,
  showBackButton = false,
  onBack
}) => {
  const [replies, setReplies] = useState<BroadcastReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReply, setSelectedReply] = useState<BroadcastReply | null>(null);

  const fetchReplies = async () => {
    try {
      setRefreshing(true);
      let response;

      if (broadcastId) {
        // Get replies for specific broadcast
        response = await broadcastAPI.getBroadcastReplies(broadcastId);
        setReplies(response.data.replies || []);
      } else {
        // Get all replies for NGO's broadcasts
        response = await broadcastAPI.getAllBroadcastReplies();
        setReplies(response.data.replies || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch broadcast replies:', error);
      setError('Failed to load replies');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [broadcastId]);

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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-primary-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-600 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {broadcastId ? 'Broadcast Replies' : 'All Broadcast Replies'}
              </h2>
              <p className="text-sm text-gray-600">
                {broadcastId ? 'Replies to this broadcast' : 'Replies from volunteers to your broadcasts'}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchReplies}
          disabled={refreshing}
          className="border-primary-200 hover:border-primary-300 hover:bg-primary-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Replies List */}
        <div className="space-y-3">
          {replies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No replies received yet</p>
              <p className="text-sm">Volunteers will reply to your broadcasts here</p>
            </div>
          ) : (
            replies.map((reply) => (
              <div
                key={reply._id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedReply?._id === reply._id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setSelectedReply(reply)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{reply.volunteerName}</h3>
                      <span className="text-sm text-gray-500">replied</span>
                    </div>
                    <p className="text-sm text-primary-600 font-medium">
                      {reply.broadcastSubject ? `Re: ${reply.broadcastSubject}` : 'Broadcast Reply'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(reply.repliedAt)}
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {reply.message}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Mail className="w-3 h-3 mr-1" />
                  <span>{reply.volunteerEmail}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Details */}
        <div>
          {selectedReply ? (
            <div className="bg-gray-50 rounded-lg p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedReply.volunteerName}
                  </h3>
                  <p className="text-primary-600 font-medium text-sm mb-1">
                    {selectedReply.broadcastSubject ? `Re: ${selectedReply.broadcastSubject}` : 'Broadcast Reply'}
                  </p>
                  <p className="text-gray-500 text-sm">{selectedReply.volunteerEmail}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(selectedReply.repliedAt)}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{selectedReply.message}</p>
              </div>

              {/* Conversation History */}
              {selectedReply.conversation && selectedReply.conversation.messages.length > 1 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Conversation History</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedReply.conversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-50 border-l-4 border-blue-400 ml-4'
                            : 'bg-green-50 border-l-4 border-green-400 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${
                            msg.sender === 'user' ? 'text-blue-700' : 'text-green-700'
                          }`}>
                            {msg.sender === 'user' ? 'Volunteer' : 'NGO Admin'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a reply to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};