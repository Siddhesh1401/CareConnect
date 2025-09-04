import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, User, Shield, Send, X, Eye, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { messagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ConversationMessage {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: string;
}

interface SupportMessage {
  _id: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  adminResponse?: string;
  responseTimestamp?: string;
  conversation: {
    messages: ConversationMessage[];
  };
  createdAt: string;
  updatedAt: string;
}

interface MessageInboxProps {
  userType: 'volunteer' | 'ngo_admin';
}

export const MessageInbox: React.FC<MessageInboxProps> = ({ userType }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setRefreshing(true);
      const response = await messagesAPI.getMyMessages();

      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !newReply.trim()) return;

    setIsReplying(true);
    try {
      const response = await messagesAPI.reply(selectedMessage._id, {
        message: newReply.trim()
      });

      if (response.success) {
        setNewReply('');
        // Update the selected message and messages list
        const updatedMessage = response.data;
        setSelectedMessage(updatedMessage);
        setMessages(prev => prev.map(msg => 
          msg._id === selectedMessage._id ? updatedMessage : msg
        ));
      }
    } catch (error: any) {
      console.error('Failed to send reply:', error);
      setError('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await messagesAPI.markAsRead(messageId);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, status: 'read' } : msg
      ));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = messages.filter(msg => msg.status === 'unread').length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading your messages...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Support Messages</h3>
            <p className="text-sm text-gray-600">
              {messages.length === 0 ? 'No messages yet' : `${messages.length} total, ${unreadCount} unread`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h4>
          <p className="text-gray-600 mb-4">
            When you contact support, your conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
          {/* Messages List */}
          <div className="border-r border-gray-200 overflow-y-auto max-h-[600px]">
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div
                  key={message._id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'unread') {
                      markAsRead(message._id);
                    }
                  }}
                  className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedMessage?._id === message._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  } ${message.status === 'unread' ? 'bg-blue-25' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      message.status === 'unread' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium text-gray-900 truncate ${
                          message.status === 'unread' ? 'font-semibold' : ''
                        }`}>
                          {message.subject}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {message.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className={`font-medium ${getPriorityColor(message.priority)}`}>
                          {message.priority.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      </div>
                      {message.conversation?.messages?.length > 1 && (
                        <div className="mt-2 text-xs text-blue-600">
                          💬 {message.conversation.messages.length} messages
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Detail */}
          <div className="flex flex-col">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedMessage.status)}`}>
                        {selectedMessage.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMessage(null)}
                        className="lg:hidden"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={`font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                      Priority: {selectedMessage.priority.toUpperCase()}
                    </span>
                    <span>Category: {selectedMessage.category}</span>
                    <span>Created: {formatDate(selectedMessage.createdAt)}</span>
                  </div>
                </div>

                {/* Conversation */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
                  {selectedMessage.conversation?.messages?.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {msg.sender === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">
                            {msg.sender === 'user' ? 'You' : 'Support Team'}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Section */}
                {selectedMessage.status !== 'closed' && (
                  <div className="p-4 border-t bg-gray-50">
                    <div className="space-y-3">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {newReply.length}/500 characters
                        </span>
                        <Button
                          onClick={sendReply}
                          disabled={!newReply.trim() || isReplying}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          {isReplying ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Select a message</h4>
                  <p className="text-gray-600">
                    Choose a message from the list to view the conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
