import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Send, CheckCircle, Phone, Mail, Clock, AlertCircle, HelpCircle, History, Eye, Reply } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { messagesAPI } from '../services/api';

interface HeaderContactSupportProps {
  userType: 'volunteer' | 'ngo_admin';
}

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

export const HeaderContactSupport: React.FC<HeaderContactSupportProps> = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'form' | 'history'>('quick');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('support');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Message history state
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        resetForm();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const categories = [
    { value: 'technical', label: '🔧 Technical Issue', description: 'Bugs, login problems, or app errors' },
    { value: 'support', label: '❓ General Support', description: 'Questions about using the platform' },
    { value: 'partnership', label: '🤝 Partnership Inquiry', description: 'Collaboration opportunities' },
    { value: 'feedback', label: '💡 Feedback', description: 'Suggestions for improvement' },
    { value: 'urgent', label: '🚨 Urgent Issue', description: 'Critical problems requiring immediate attention' }
  ];

  const priorities = [
    { value: 'low', label: '🟢 Low', description: 'Can wait a few days' },
    { value: 'medium', label: '🟡 Medium', description: 'Should be addressed soon' },
    { value: 'high', label: '🟠 High', description: 'Needs attention within 24 hours' },
    { value: 'urgent', label: '🔴 Urgent', description: 'Critical - immediate response needed' }
  ];

  const quickActions = [
    {
      title: 'Account Help',
      description: 'Login issues, profile settings',
      action: () => {
        setCategory('technical');
        setSubject('Account Help Request');
        setActiveTab('form');
      }
    },
    {
      title: 'How to Use Platform',
      description: 'Navigation, features, tutorials',
      action: () => {
        setCategory('support');
        setSubject('Platform Usage Question');
        setActiveTab('form');
      }
    },
    {
      title: 'Report a Bug',
      description: 'Something not working properly',
      action: () => {
        setCategory('technical');
        setPriority('high');
        setSubject('Bug Report');
        setActiveTab('form');
      }
    },
    {
      title: 'Partnership Inquiry',
      description: 'Collaboration opportunities',
      action: () => {
        setCategory('partnership');
        setSubject('Partnership Opportunity');
        setActiveTab('form');
      }
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await messagesAPI.send({
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
        userType
      });

      if (response.success) {
        setIsSubmitted(true);
        // Refresh messages if history tab is active
        if (activeTab === 'history') {
          fetchMessages();
        }
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          setSubject('');
          setMessage('');
          setCategory('support');
          setPriority('medium');
          setActiveTab('quick');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const response = await messagesAPI.getMyMessages();
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoadingMessages(false);
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
        const updatedMessage = response.data;
        setSelectedMessage(updatedMessage);
        setMessages(prev => prev.map(msg => 
          msg._id === selectedMessage._id ? updatedMessage : msg
        ));
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await messagesAPI.markAsRead(messageId);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, status: 'read' } : msg
      ));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  // Fetch messages when history tab is opened
  const handleTabChange = (tab: 'quick' | 'form' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history' && messages.length === 0) {
      fetchMessages();
    }
  };

  const resetForm = () => {
    setSubject('');
    setMessage('');
    setCategory('support');
    setPriority('medium');
    setActiveTab('quick');
    setIsSubmitted(false);
    setSelectedMessage(null);
    setNewReply('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      resetForm();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in overflow-hidden"
      style={{ zIndex: 999999 }}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-white shadow-2xl max-h-[95vh] overflow-y-auto animate-scale-in transform transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MessageSquare className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Get Help & Support</h3>
                <p className="text-base text-gray-600 mt-1">
                  {userType === 'volunteer' ? '🙋‍♀️ Volunteer Support Center' : '🏢 NGO Support Center'}
                </p>
              </div>
            </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            className="p-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contact Info Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center py-2">
            <div className="flex items-center justify-center space-x-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <span className="text-base font-medium">+91 98765 43210</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-base font-medium">support@careconnect.org</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-base font-medium">24/7 Support</span>
            </div>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">Message Sent Successfully! 🎉</h4>
            <p className="text-gray-600 mb-4">
              Your support request has been received. Our team will respond within:
            </p>
            <div className="bg-blue-50 rounded-lg p-4 inline-block">
              <div className="flex items-center space-x-2 text-blue-700">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  {priority === 'urgent' ? '1-2 hours' : priority === 'high' ? '4-6 hours' : '24 hours'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                onClick={() => handleTabChange('quick')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                  activeTab === 'quick'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HelpCircle className="w-4 h-4 inline mr-2" />
                Quick Help
              </button>
              <button
                onClick={() => handleTabChange('form')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                  activeTab === 'form'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send Message
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                My Messages
              </button>
            </div>

            {/* Quick Help Tab */}
            {activeTab === 'quick' && (
              <div className="p-8">
                <h4 className="text-xl font-semibold mb-6 text-gray-800">How can we help you today?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group hover:shadow-md"
                    >
                      <h5 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 mb-2">
                        {action.title}
                      </h5>
                      <p className="text-base text-gray-600">{action.description}</p>
                    </button>
                  ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-8 pt-8 border-t">
                  <h5 className="font-semibold text-lg text-gray-800 mb-4">💡 Quick Tips</h5>
                  <div className="space-y-3 text-base text-gray-600">
                    <p>• Check our <span className="text-blue-600 font-medium">Knowledge Base</span> for common solutions</p>
                    <p>• Use specific keywords in your support request for faster help</p>
                    <p>• Include screenshots for technical issues when possible</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Tab */}
            {activeTab === 'form' && (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value} title={cat.description}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {categories.find(c => c.value === category)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {priorities.map((pri) => (
                        <option key={pri.value} value={pri.value} title={pri.description}>
                          {pri.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {priorities.find(p => p.value === priority)?.description}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief, clear description of your issue or question"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please provide as much detail as possible. Include:&#10;• What you were trying to do&#10;• What happened instead&#10;• Steps to reproduce the issue&#10;• Any error messages you saw"
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Be as detailed as possible for faster resolution</span>
                    <span>{message.length}/1000</span>
                  </div>
                </div>

                {/* Priority Alert */}
                {priority === 'urgent' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Urgent requests receive priority handling and will be reviewed immediately.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!subject.trim() || !message.trim() || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Message History Tab */}
            {activeTab === 'history' && (
              <div className="p-8">
                {selectedMessage ? (
                  // Conversation View
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMessage(null)}
                        className="text-sm"
                      >
                        ← Back to Messages
                      </Button>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedMessage.status === 'unread' ? 'bg-red-100 text-red-700' :
                        selectedMessage.status === 'read' ? 'bg-blue-100 text-blue-700' :
                        selectedMessage.status === 'replied' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedMessage.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-2">{selectedMessage.subject}</h4>
                      <div className="text-sm text-gray-500 mb-4">
                        {selectedMessage.category} • {selectedMessage.priority} priority • {new Date(selectedMessage.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Conversation Messages */}
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {selectedMessage.conversation?.messages?.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.sender === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="text-sm">{msg.message}</div>
                            <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(msg.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Input */}
                    <div className="border-t pt-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder="Type your reply..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isReplying && newReply.trim()) {
                              sendReply();
                            }
                          }}
                        />
                        <Button
                          onClick={sendReply}
                          disabled={!newReply.trim() || isReplying}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          {isReplying ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Reply className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Message List View
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-800">Your Support Messages</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchMessages}
                        disabled={isLoadingMessages}
                      >
                        {isLoadingMessages ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {isLoadingMessages ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No messages yet. Send your first message using the "Send Message" tab!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {messages.map((message) => (
                          <div
                            key={message._id}
                            onClick={() => {
                              setSelectedMessage(message);
                              if (message.status === 'unread') {
                                markAsRead(message._id);
                              }
                            }}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-medium text-gray-900">{message.subject}</h5>
                                  {message.status === 'unread' && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.message}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>{message.category}</span>
                                  <span className={`px-2 py-1 rounded-full ${
                                    message.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                    message.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                    message.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {message.priority}
                                  </span>
                                  <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Eye className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="relative group bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Support</span>
        
        {/* Pulse indicator for urgent help */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full opacity-75 animate-pulse group-hover:opacity-100"></div>
      </Button>
    );
  }

  return createPortal(modalContent, document.body);
};
