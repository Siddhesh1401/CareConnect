import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  Send,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SearchBar, SearchFilters } from '../../components/search/SearchBar';
import { FilterPanel } from '../../components/search/FilterPanel';
import api from '../../services/api';

interface AdminMessage {
  id: string;
  _id?: string; // MongoDB _id for API calls
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  message: string;
  timestamp: Date;
  status: 'unread' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'partnership' | 'support' | 'feedback' | 'other';
  adminResponse?: string;
  responseTimestamp?: Date;
  conversation: {
    id: string;
    messages: Array<{
      id: string;
      sender: 'user' | 'admin';
      message: string;
      timestamp: Date;
    }>;
  };
}

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [responseText, setResponseText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isResponding, setIsResponding] = useState(false);

  // Load messages from API
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('careconnect_token');
        const response = await api.get('/admin/messages', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          const apiMessages = response.data.data.messages.map((msg: any) => ({
            ...msg,
            id: msg._id,
            _id: msg._id, // Keep original _id for API calls
            timestamp: new Date(msg.createdAt),
            responseTimestamp: msg.responseTimestamp ? new Date(msg.responseTimestamp) : undefined,
            conversation: {
              ...msg.conversation,
              messages: msg.conversation.messages.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              }))
            }
          }));
          setMessages(apiMessages);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    // Set up polling to check for new messages every 10 seconds
    const interval = setInterval(loadMessages, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredMessages = messages.filter(message => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      message.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = !filters.status || filters.status.length === 0 ||
      filters.status.includes(message.status);

    // Priority filter
    const matchesPriority = !filters.priority || filters.priority.length === 0 ||
      filters.priority.includes(message.priority);

    // Category filter
    const matchesCategory = !filters.category || filters.category.length === 0 ||
      filters.category.includes(message.category);

    // Date range filter
    const matchesDateRange = !filters.dateRange?.start && !filters.dateRange?.end ||
      (filters.dateRange?.start && filters.dateRange?.end &&
       message.timestamp >= filters.dateRange.start &&
       message.timestamp <= filters.dateRange.end);

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDateRange;
  });

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    setIsResponding(true);

    try {
      const token = localStorage.getItem('careconnect_token');
      const messageId = selectedMessage._id || selectedMessage.id;
      console.log('Sending response to message ID:', messageId);
      console.log('Response text:', responseText);
      
      const response = await api.patch(`/admin/messages/${messageId}/respond`, {
        response: responseText
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        const updatedMessage: AdminMessage = {
          ...selectedMessage,
          status: 'replied',
          adminResponse: responseText,
          responseTimestamp: new Date(),
          conversation: {
            ...selectedMessage.conversation,
            messages: [
              ...selectedMessage.conversation.messages,
              {
                id: `admin-${Date.now()}`,
                sender: 'admin',
                message: responseText,
                timestamp: new Date()
              }
            ]
          }
        };

        setMessages(prev =>
          prev.map(msg => msg.id === selectedMessage.id ? updatedMessage : msg)
        );

        setSelectedMessage(updatedMessage);
        setResponseText('');
        alert('Response sent successfully!');
      }
    } catch (error: any) {
      console.error('Failed to send response:', error);
      console.error('Error response:', error.response?.data);
      // Show user-friendly error message
      alert(`Failed to send response: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsResponding(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await api.patch(`/admin/messages/${messageId}/status`, {
        status: 'read'
      });

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, status: 'read' as const } : msg
        )
      );
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-primary-100 text-primary-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <span>Admin Messages</span>
                </h1>
                <p className="text-primary-100 mt-2">Manage user inquiries and support requests</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/30">
                  <span className="text-sm font-semibold">{messages.filter(m => m.status === 'unread').length} Unread</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/30">
                  <span className="text-sm font-semibold">{messages.filter(m => m.status === 'replied').length} Replied</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="space-y-4">
            <SearchBar
              placeholder="Search messages by sender, subject, content, or email..."
              onSearch={setSearchQuery}
              onFilter={setFilters}
              showFilters={true}
              className="w-full"
            />

            <FilterPanel
              title="Message Filters"
              filters={{
                status: [
                  { value: 'unread', label: 'Unread', count: messages.filter(m => m.status === 'unread').length },
                  { value: 'read', label: 'Read', count: messages.filter(m => m.status === 'read').length },
                  { value: 'replied', label: 'Replied', count: messages.filter(m => m.status === 'replied').length },
                  { value: 'closed', label: 'Closed', count: messages.filter(m => m.status === 'closed').length }
                ],
                priority: [
                  { value: 'urgent', label: 'Urgent', count: messages.filter(m => m.priority === 'urgent').length },
                  { value: 'high', label: 'High', count: messages.filter(m => m.priority === 'high').length },
                  { value: 'medium', label: 'Medium', count: messages.filter(m => m.priority === 'medium').length },
                  { value: 'low', label: 'Low', count: messages.filter(m => m.priority === 'low').length }
                ],
                category: [
                  { value: 'technical', label: 'Technical Support' },
                  { value: 'partnership', label: 'Partnership' },
                  { value: 'support', label: 'General Support' },
                  { value: 'feedback', label: 'Feedback' },
                  { value: 'other', label: 'Other' }
                ],
                dateRange: filters.dateRange
              }}
              selectedFilters={{
                status: filters.status || [],
                category: filters.category || [],
                priority: filters.priority || [],
                dateRange: filters.dateRange
              }}
              onFilterChange={setFilters}
              onClearAll={() => setFilters({})}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Messages List */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/70 backdrop-blur-sm border border-primary-200/50 shadow-xl h-fit max-h-[800px] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span>Messages</span>
              </h2>

              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (message.status === 'unread') {
                        markAsRead(message.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      selectedMessage?.id === message.id
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-300 shadow-lg transform scale-[1.02]'
                        : 'bg-white/80 backdrop-blur-sm border-primary-200/50 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{message.userName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 line-clamp-2">{message.subject}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{message.message}</p>
                      </div>
                      {message.status === 'unread' && (
                        <div className="w-3 h-3 bg-primary-500 rounded-full ml-2"></div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{message.timestamp.toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Enhanced Message Details and Response */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="p-6 bg-white/70 backdrop-blur-sm border border-primary-200/50 shadow-xl">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{selectedMessage.userName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedMessage.userEmail}</span>
                        </div>
                        {selectedMessage.userPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{selectedMessage.userPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                        {selectedMessage.priority} priority
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMessage.status)}`}>
                        {selectedMessage.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <Calendar className="w-4 h-4" />
                    <span>Received on {selectedMessage.timestamp.toLocaleString()}</span>
                    {selectedMessage.responseTimestamp && (
                      <>
                        <span>•</span>
                        <span>Replied on {selectedMessage.responseTimestamp.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Conversation */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedMessage.conversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl ${
                            msg.sender === 'user'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-primary-600 text-white'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-line">{msg.message}</div>
                          <div className={`text-xs mt-2 ${
                            msg.sender === 'user' ? 'text-gray-500' : 'text-primary-100'
                          }`}>
                            {msg.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Response Form - Always show to allow continued conversation */}
                <div className="border-t border-primary-200/50 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <span>
                      {selectedMessage.status === 'replied' ? 'Continue Conversation' : 'Send Response'}
                    </span>
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder={
                        selectedMessage.status === 'replied' 
                          ? "Continue the conversation..." 
                          : "Type your response to the user..."
                      }
                      className="w-full px-4 py-3 border border-primary-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setResponseText('')}
                        className="border-primary-200/50 text-gray-700 hover:bg-primary-50 bg-white/80"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleSendResponse}
                        disabled={!responseText.trim() || isResponding}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 shadow-lg"
                      >
                        {isResponding ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {selectedMessage.status === 'replied' ? 'Send Reply' : 'Send Response'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 bg-white/70 backdrop-blur-sm border border-primary-200/50 shadow-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Message</h3>
                <p className="text-gray-500">Choose a message from the list to view details and respond</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
