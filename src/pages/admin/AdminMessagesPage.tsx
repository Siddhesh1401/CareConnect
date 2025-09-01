import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  Send,
  Search,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface AdminMessage {
  id: string;
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
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  // Load messages from localStorage and merge with mock data
  useEffect(() => {
    const loadMessages = () => {
      const storedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      const parsedStoredMessages = storedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        responseTimestamp: msg.responseTimestamp ? new Date(msg.responseTimestamp) : undefined,
        conversation: {
          ...msg.conversation,
          messages: msg.conversation.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }
      }));

      const mockMessages: AdminMessage[] = [
        {
          id: '1',
          userId: 'user123',
          userName: 'Rajesh Kumar',
          userEmail: 'rajesh.kumar@email.com',
          userPhone: '+91 98765 43210',
          subject: 'Partnership Inquiry - Education NGO',
          message: 'Hello Admin,\n\nI am representing an education-focused NGO called "Bright Future Foundation". We are interested in partnering with CareConnect to organize educational events for underprivileged children. We have been working in rural areas for the past 5 years and have successfully impacted over 2000 children.\n\nCould you please provide information about partnership opportunities and the process to get started?\n\nBest regards,\nRajesh Kumar\nDirector, Bright Future Foundation',
          timestamp: new Date('2025-01-22T10:30:00'),
          status: 'unread',
          priority: 'high',
          category: 'partnership',
          conversation: {
            id: 'conv1',
            messages: [
              {
                id: 'msg1',
                sender: 'user',
                message: 'Hello Admin,\n\nI am representing an education-focused NGO called "Bright Future Foundation". We are interested in partnering with CareConnect to organize educational events for underprivileged children. We have been working in rural areas for the past 5 years and have successfully impacted over 2000 children.\n\nCould you please provide information about partnership opportunities and the process to get started?\n\nBest regards,\nRajesh Kumar\nDirector, Bright Future Foundation',
                timestamp: new Date('2025-01-22T10:30:00')
              }
            ]
          }
        },
        {
          id: '2',
          userId: 'user456',
          userName: 'Priya Sharma',
          userEmail: 'priya.sharma@email.com',
          subject: 'Technical Issue - Cannot Register for Events',
          message: 'Hi,\n\nI am trying to register for a volunteer event but keep getting an error message saying "Invalid session". I have tried clearing my browser cache, using different browsers, and even different devices, but the issue persists.\n\nCan you please help me resolve this issue? I really want to participate in the "Clean City Drive" event this weekend.\n\nThank you,\nPriya',
          timestamp: new Date('2025-01-21T15:45:00'),
          status: 'read',
          priority: 'urgent',
          category: 'technical',
          adminResponse: 'Hello Priya,\n\nThank you for reporting this issue. This sounds like a session management problem. I have checked your account and it appears there was a temporary issue with our authentication system.\n\nI have reset your session and cleared the error. Please try logging in again and registering for the event. If you still encounter any issues, please let me know.\n\nBest regards,\nAdmin Team',
          responseTimestamp: new Date('2025-01-21T16:15:00'),
          conversation: {
            id: 'conv2',
            messages: [
              {
                id: 'msg2',
                sender: 'user',
                message: 'Hi,\n\nI am trying to register for a volunteer event but keep getting an error message saying "Invalid session". I have tried clearing my browser cache, using different browsers, and even different devices, but the issue persists.\n\nCan you please help me resolve this issue? I really want to participate in the "Clean City Drive" event this weekend.\n\nThank you,\nPriya',
                timestamp: new Date('2025-01-21T15:45:00')
              },
              {
                id: 'msg3',
                sender: 'admin',
                message: 'Hello Priya,\n\nThank you for reporting this issue. This sounds like a session management problem. I have checked your account and it appears there was a temporary issue with our authentication system.\n\nI have reset your session and cleared the error. Please try logging in again and registering for the event. If you still encounter any issues, please let me know.\n\nBest regards,\nAdmin Team',
                timestamp: new Date('2025-01-21T16:15:00')
              }
            ]
          }
        }
      ];

      // Combine stored messages with mock data, avoiding duplicates
      const allMessages = [...mockMessages, ...parsedStoredMessages.filter((stored: AdminMessage) =>
        !mockMessages.some(mock => mock.id === stored.id)
      )];

      setMessages(allMessages);
    };

    loadMessages();

    // Set up polling to check for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && message.status === 'unread') ||
      (filter === 'replied' && message.status === 'replied') ||
      (filter === 'urgent' && message.priority === 'urgent');

    const matchesSearch =
      searchTerm === '' ||
      message.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    setIsResponding(true);

    // Simulate API call delay
    setTimeout(() => {
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

      // Update in localStorage
      const storedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      const updatedStoredMessages = storedMessages.map((msg: any) =>
        msg.id === selectedMessage.id ? {
          ...msg,
          status: 'replied',
          adminResponse: responseText,
          responseTimestamp: new Date().toISOString(),
          conversation: updatedMessage.conversation
        } : msg
      );
      localStorage.setItem('adminMessages', JSON.stringify(updatedStoredMessages));

      setSelectedMessage(updatedMessage);
      setResponseText('');
      setIsResponding(false);
    }, 1000);
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'read' as const } : msg
      )
    );

    // Update in localStorage
    const storedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
    const updatedStoredMessages = storedMessages.map((msg: any) =>
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    );
    localStorage.setItem('adminMessages', JSON.stringify(updatedStoredMessages));
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
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white overflow-hidden">
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
                <p className="text-blue-100 mt-2">Manage user inquiries and support requests</p>
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

          {/* Enhanced Filters and Search */}
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All Messages', count: messages.length },
                  { key: 'unread', label: 'Unread', count: messages.filter(m => m.status === 'unread').length },
                  { key: 'replied', label: 'Replied', count: messages.filter(m => m.status === 'replied').length },
                  { key: 'urgent', label: 'Urgent', count: messages.filter(m => m.priority === 'urgent').length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === key
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-blue-50 border border-blue-200/50'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Messages List */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl h-fit max-h-[800px] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
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
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg transform scale-[1.02]'
                        : 'bg-white/80 backdrop-blur-sm border-blue-200/50 hover:border-blue-300'
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
                        <div className="w-3 h-3 bg-blue-500 rounded-full ml-2"></div>
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
              <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl">
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
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-line">{msg.message}</div>
                          <div className={`text-xs mt-2 ${
                            msg.sender === 'user' ? 'text-gray-500' : 'text-blue-100'
                          }`}>
                            {msg.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Response Form */}
                {selectedMessage.status !== 'replied' && (
                  <div className="border-t border-blue-200/50 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                        <Send className="w-4 h-4 text-white" />
                      </div>
                      <span>Send Response</span>
                    </h3>
                    <div className="space-y-4">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Type your response to the user..."
                        className="w-full px-4 py-3 border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                        rows={6}
                      />
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setResponseText('')}
                          className="border-blue-200/50 text-gray-700 hover:bg-blue-50 bg-white/80"
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleSendResponse}
                          disabled={!responseText.trim() || isResponding}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-lg"
                        >
                          {isResponding ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Response
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
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
