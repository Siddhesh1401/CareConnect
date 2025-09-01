import { useState, useRef, useEffect } from 'react';
import { X, Send, User, Heart, Calendar, Users, Building, Search, HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
  actions?: Action[];
}

interface Action {
  label: string;
  type: 'navigate' | 'external' | 'function';
  value: string;
  icon: React.ReactNode;
}

interface FAQ {
  question: string;
  answer: string;
  tags: string[];
}

const faqDatabase: FAQ[] = [
  {
    question: 'How do I become a volunteer?',
    answer: 'To become a volunteer: 1) Sign up for an account, 2) Complete your profile with your skills and interests, 3) Browse available events, 4) Register for events that match your interests. You\'ll receive confirmation and event details via email.',
    tags: ['volunteer', 'signup', 'registration', 'getting started']
  },
  {
    question: 'How do I find events near me?',
    answer: 'You can find events by: 1) Using the search bar on the Events page, 2) Filtering by location, date, and category, 3) Checking the map view for nearby opportunities, 4) Following NGOs you\'re interested in for their upcoming events.',
    tags: ['events', 'location', 'search', 'find']
  },
  {
    question: 'How do NGOs register on the platform?',
    answer: 'NGO registration process: 1) Click "NGO Signup" and create an account, 2) Verify your organization with required documents, 3) Complete your NGO profile with mission and details, 4) Start posting events and connecting with volunteers.',
    tags: ['ngo', 'registration', 'organization', 'signup']
  },
  {
    question: 'How do I make a donation?',
    answer: 'To make a donation: 1) Visit the Donation page, 2) Browse active campaigns, 3) Choose a one-time or recurring donation, 4) Select payment method and complete the transaction. All donations are tax-deductible and 100% transparent.',
    tags: ['donation', 'giving', 'support', 'fund']
  }
];

const quickActions: Action[] = [
  { label: 'Browse Events', type: 'navigate', value: '/events', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Sign Up', type: 'navigate', value: '/signup', icon: <Users className="w-4 h-4" /> },
  { label: 'NGO Portal', type: 'navigate', value: '/ngo/dashboard', icon: <Building className="w-4 h-4" /> },
  { label: 'Contact Admin', type: 'function', value: 'contactAdmin', icon: <HelpCircle className="w-4 h-4" /> },
  { label: 'Get Help', type: 'function', value: 'showSearch', icon: <Search className="w-4 h-4" /> }
];

const comprehensiveResponses = {
  volunteer: {
    keywords: ['volunteer', 'help', 'participate', 'join', 'contribute time', 'give time'],
    responses: [
      '🎯 **Become a Volunteer Today!**\n\n✨ **Why Volunteer with CareConnect?**\n• Make a real difference in your community\n• Gain valuable skills and experience\n• Connect with like-minded people\n• Flexible opportunities that fit your schedule\n\n📋 **Getting Started:**\n1. Create your volunteer account\n2. Tell us about your skills and interests\n3. Browse available events\n4. Register and start making an impact!\n\nReady to begin? Click "Sign Up" above! 🌟',
      '🤝 **Join Our Volunteer Community**\n\n🎯 **Current Opportunities:**\n• Teaching and education programs\n• Environmental conservation\n• Community health initiatives\n• Food distribution and support\n• Elderly care and companionship\n\n💪 **What You\'ll Get:**\n• Meaningful work that matters\n• Training and support\n• Recognition for your contributions\n• Networking opportunities\n\nLet\'s find the perfect opportunity for you! 💪'
    ],
    quickReplies: ['Find events near me', 'What skills are needed?', 'How to get started?']
  },
  events: {
    keywords: ['event', 'activity', 'program', 'schedule', 'calendar', 'upcoming', 'happening'],
    responses: [
      '📅 **Discover Amazing Volunteer Events!**\n\n🌟 **Featured Categories:**\n• **Education & Teaching** - Help children learn\n• **Environment** - Clean beaches, plant trees\n• **Health & Wellness** - Support community health\n• **Food & Hunger** - Help feed those in need\n• **Elder Care** - Provide companionship\n\n🔍 **Find Events:**\n• Browse by location and date\n• Filter by your interests\n• See event details and requirements\n• Register with one click\n\nClick "Browse Events" to explore! 📅',
      '🎪 **Upcoming Volunteer Opportunities**\n\n📍 **Popular Locations:**\n• Schools and educational centers\n• Community centers and shelters\n• Parks and environmental sites\n• Hospitals and healthcare facilities\n• Food banks and distribution centers\n\n⏰ **Time Commitments:**\n• One-time events (few hours)\n• Weekly programs\n• Weekend activities\n• Holiday initiatives\n\nWhat type of event interests you most? 🤔'
    ],
    quickReplies: ['Education events', 'Environmental work', 'Community service']
  },
  ngo: {
    keywords: ['ngo', 'organization', 'partner', 'register ngo', 'nonprofit', 'charity'],
    responses: [
      '🏢 **Partner with us to amplify your impact!**\n\n✨ **NGO Benefits:**\n• Access to 15,000+ active volunteers\n• Free event posting and management\n• Volunteer coordination tools\n• Impact tracking and reporting\n• Community engagement features\n\n📋 **Registration process:**\n1. Sign up as NGO administrator\n2. Verify your organization\n3. Upload required documents\n4. Create your first event!\n\nReady to join? Click "NGO Portal"! 🌟',
      '🤝 **NGO Partnership Program:**\n\n🎯 **What we offer:**\n• Dedicated volunteer management dashboard\n• Event promotion to our community\n• Real-time volunteer registration\n• Impact measurement tools\n• Community support and networking\n\n📄 **Requirements:**\n• Valid NGO registration certificate\n• Tax exemption certificate (if applicable)\n• Organization details and mission\n\nLet\'s work together to create change! 💪'
    ],
    quickReplies: ['NGO registration', 'Partner benefits', 'Contact support']
  },
  donate: {
    keywords: ['donate', 'donation', 'fund', 'support', 'contribute money', 'give'],
    responses: [
      '💝 **Your generosity changes lives!**\n\n🎯 **Ways to donate:**\n• **One-time donations** to specific campaigns\n• **Monthly giving** for sustained impact\n• **Corporate sponsorships** for larger initiatives\n• **In-kind donations** (supplies, equipment)\n\n🔒 **100% Transparency:**\n• All donations go directly to causes\n• Real-time impact tracking\n• Detailed project reports\n• Tax-deductible receipts\n\nClick "Browse Events" to see current campaigns! 🌟',
      '❤️ **Support meaningful causes:**\n\n📈 **Current campaigns:**\n• Clean Water Initiative\n• Education Support Fund\n• Emergency Relief\n• Healthcare Access\n\n💰 **Impact examples:**\n• ₹500 = School supplies for 5 children\n• ₹1,000 = Medical checkup for 10 people\n• ₹5,000 = Clean water for 50 families\n\nEvery rupee makes a difference! 🙏'
    ],
    quickReplies: ['View campaigns', 'Monthly giving', 'Tax benefits']
  },
  help: {
    keywords: ['help', 'support', 'assist', 'guide', 'how', 'what', 'confused', 'admin', 'contact admin', 'message admin', 'talk to admin'],
    responses: [
      '🆘 **I\'m here to help!** What can I assist you with?\n\n❓ **Common questions:**\n• How to become a volunteer?\n• Finding events in my area\n• NGO registration process\n• Making donations\n• Account and profile setup\n\n💬 **Just ask me anything!** I can guide you through:\n• Platform features and navigation\n• Event registration process\n• Volunteer requirements\n• NGO partnership details\n\nWhat would you like to know? 🤔',
      '🚀 **Let me guide you through CareConnect!**\n\n📚 **Quick Start Guide:**\n1. **Sign Up** - Create your account\n2. **Choose Role** - Volunteer or NGO\n3. **Complete Profile** - Add your details\n4. **Explore** - Find events or create them\n5. **Connect** - Join the community!\n\n🎯 **Need specific help?** Try:\n• "How do I volunteer?"\n• "Find events near me"\n• "NGO registration"\n• "Make a donation"\n\nI\'m here for you! 💪'
    ],
    quickReplies: ['Getting started', 'Account help', 'Technical issues']
  },
  greeting: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      '👋 **Hello! Welcome to CareConnect!**\n\nI\'m your friendly assistant, here to help you discover volunteer opportunities and make a positive impact in your community.\n\n🌟 **What brings you here today?**\n• Looking to volunteer?\n• Want to find events?\n• Interested in NGO partnership?\n• Ready to make a donation?\n\nJust tell me what you\'re interested in! 😊',
      '🎉 **Hi there! Great to see you!**\n\nWelcome to the CareConnect community! We\'re passionate about connecting volunteers with meaningful opportunities to create positive change.\n\n💡 **How can I help you today?**\n• Discover volunteer events\n• Learn about NGO partnerships\n• Find donation opportunities\n• Get platform guidance\n\nWhat would you like to explore? 🌈'
    ],
    quickReplies: ['I want to volunteer', 'Show me events', 'NGO information']
  }
};

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 **Hello! Welcome to CareConnect!**\n\nI\'m your friendly assistant, here to help you discover volunteer opportunities and make a positive impact in your community.\n\n🌟 **What brings you here today?**\n• Looking to volunteer?\n• Want to find events?\n• Interested in NGO partnership?\n• Ready to make a donation?\n\nJust tell me what you\'re interested in! 😊',
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: ['I want to volunteer', 'Show me events', 'NGO information', 'Make a donation']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [adminMessaging, setAdminMessaging] = useState(false);
  const [adminMessages, setAdminMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    let bestMatch = 'help';
    let maxMatches = 0;

    Object.entries(comprehensiveResponses).forEach(([category, data]) => {
      let matches = 0;
      data.keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          matches++;
        }
      });

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    });

    return bestMatch;
  };

  const searchFAQ = (query: string): FAQ[] => {
    const lowerQuery = query.toLowerCase();
    return faqDatabase.filter(faq =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery) ||
      faq.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const handleAction = (action: Action) => {
    switch (action.type) {
      case 'navigate':
        navigate(action.value);
        setIsOpen(false);
        break;
      case 'external':
        window.open(action.value, '_blank');
        break;
      case 'function':
        handleFunctionAction(action.value);
        break;
    }
  };

  const handleFunctionAction = (actionValue: string) => {
    switch (actionValue) {
      case 'showSearch':
        setShowSearch(true);
        addMessage('🔍 **Search FAQ & Help**\n\nType your question below and I\'ll find the best answers for you!', 'bot');
        break;
      case 'showContact':
        addMessage('📞 **Contact Support**\n\n📧 **Email:** support@careconnect.org\n📱 **Phone:** +91 98765 43210\n💬 **Live Chat:** Available 9 AM - 9 PM IST\n\n⏰ **Response Time:** Within 24 hours\n\n🌟 **We\'re here to help!**', 'bot');
        break;
      case 'contactAdmin':
        setAdminMessaging(true);
        setShowSearch(false);
        addMessage('👨‍💼 **Contact Admin**\n\n📝 **Send a message to our admin team**\n\nYou can send a direct message to our administrators for:\n• Technical issues\n• Feature requests\n• Partnership inquiries\n• General feedback\n• Account support\n\n💬 **Type your message below and our admin will respond as soon as possible!**\n\n⏰ **Response time:** Usually within 24 hours', 'bot');
        break;
    }
  };

  const addMessage = (text: string, sender: 'user' | 'bot', quickReplies?: string[], actions?: Action[]) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      quickReplies,
      actions
    };
    setMessages(prev => [...prev, message]);
  };

  const addAdminMessage = (text: string, sender: 'user' | 'admin') => {
    const message: Message = {
      id: `admin-${Date.now().toString()}`,
      text,
      sender: sender === 'admin' ? 'bot' : 'user',
      timestamp: new Date()
    };
    setAdminMessages(prev => [...prev, message]);
  };

  const sendMessageToAdmin = (message: string) => {
    // Create admin message object
    const adminMessage = {
      id: `admin-msg-${Date.now()}`,
      userId: 'current-user', // In a real app, this would be the actual user ID
      userName: 'Current User', // In a real app, this would be the actual user name
      userEmail: 'user@example.com', // In a real app, this would be the actual user email
      subject: 'User Inquiry from ChatBot',
      message: message,
      timestamp: new Date(),
      status: 'unread',
      priority: 'medium',
      category: 'support',
      conversation: {
        id: `conv-${Date.now()}`,
        messages: [
          {
            id: `user-msg-${Date.now()}`,
            sender: 'user',
            message: message,
            timestamp: new Date()
          }
        ]
      }
    };

    // Store in localStorage (in a real app, this would be sent to a backend API)
    const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
    existingMessages.push(adminMessage);
    localStorage.setItem('adminMessages', JSON.stringify(existingMessages));

    // Add to current admin messages for immediate display
    addAdminMessage(message, 'user');

    // Simulate admin response after a delay (in a real app, this would come from the admin panel)
    setTimeout(() => {
      addAdminMessage('👨‍💼 **Admin Response:**\n\nThank you for your message! Our admin team has received your inquiry and will respond within 24 hours. We appreciate your patience.\n\n📧 **Reference ID:** #' + adminMessage.id.slice(-6), 'admin');
    }, 2000);

    addMessage('✅ **Message sent to admin!**\n\n📧 Your message has been delivered to our admin team. They will respond within 24 hours.\n\n💬 **You can continue chatting with me or close this window.**', 'bot', ['Back to main menu']);
  };

  const getBotResponse = (userMessage: string): { text: string; quickReplies?: string[]; actions?: Action[] } => {
    // Check if user wants to contact admin
    const adminKeywords = ['admin', 'contact admin', 'message admin', 'talk to admin', 'speak to admin', 'reach admin'];
    const lowerMessage = userMessage.toLowerCase();
    const wantsAdmin = adminKeywords.some(keyword => lowerMessage.includes(keyword));

    if (wantsAdmin && !adminMessaging) {
      setAdminMessaging(true);
      setShowSearch(false);
      return {
        text: '👨‍💼 **Connecting you to Admin Support**\n\n📝 **Direct Admin Communication**\n\nYou can now send messages directly to our admin team. They will receive your messages and respond as soon as possible.\n\n💬 **Type your message below and our admin will respond within 24 hours!**\n\n⏰ **Response time:** Usually within 24 hours',
        quickReplies: ['Back to main menu']
      };
    }

    // Check if we're in admin messaging mode
    if (adminMessaging) {
      sendMessageToAdmin(userMessage);
      return {
        text: '⏳ **Sending message to admin...**',
        quickReplies: []
      };
    }

    // Check if it's a search query
    if (showSearch && userMessage.length > 2) {
      const results = searchFAQ(userMessage);
      if (results.length > 0) {
        const topResult = results[0];
        return {
          text: `🔍 **Found Answer:**\n\n**${topResult.question}**\n\n${topResult.answer}`,
          quickReplies: ['Ask another question', 'Back to main menu'],
          actions: [
            { label: 'Search Again', type: 'function', value: 'showSearch', icon: <Search className="w-4 h-4" /> }
          ]
        };
      } else {
        return {
          text: '🤔 **No exact matches found.**\n\nTry rephrasing your question or browse these popular topics:\n\n• How to become a volunteer?\n• Finding events near me\n• NGO registration process\n• Making donations\n\nOr ask me anything else!',
          quickReplies: ['Popular questions', 'Ask differently', 'Back to main menu']
        };
      }
    }

    const category = analyzeMessage(userMessage);
    const responseData = comprehensiveResponses[category as keyof typeof comprehensiveResponses];

    if (responseData) {
      const randomResponse = responseData.responses[Math.floor(Math.random() * responseData.responses.length)];
      return {
        text: randomResponse,
        quickReplies: responseData.quickReplies
      };
    }

    // Enhanced fallback response
    return {
      text: '🤔 **I\'m here to help!**\n\nI can assist you with:\n\n🎯 **Volunteering:** Getting started, finding events, registration\n🏢 **NGOs:** Partnership info, registration process, benefits\n📅 **Events:** Discovery, filtering, participation\n💝 **Donations:** Giving options, impact tracking, transparency\n🆘 **Support:** FAQ, troubleshooting, contact info\n\n💬 **Try asking:**\n• "How do I volunteer?"\n• "Find events near me"\n• "NGO registration"\n• "How to donate"\n\nWhat would you like to know? 😊',
      quickReplies: ['How to volunteer?', 'Find events', 'NGO info', 'Donation help', 'Search FAQ'],
      actions: [
        { label: 'Browse Events', type: 'navigate', value: '/events', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Get Help', type: 'function', value: 'showSearch', icon: <HelpCircle className="w-4 h-4" /> }
      ]
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    if (adminMessaging) {
      // Handle admin messaging
      setAdminMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      // Simulate admin response delay
      setTimeout(() => {
        const adminResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `📧 **Thank you for contacting admin support!**\n\nYour message: "${userMessage.text}"\n\n✅ **Message Status:** Successfully sent to admin team\n🕐 **Expected Response Time:** Within 2-4 hours\n📱 **Ticket ID:** #${Math.random().toString(36).substr(2, 8).toUpperCase()}\n\nWe'll get back to you as soon as possible. You can also check your email for updates!`,
          sender: 'bot',
          timestamp: new Date()
        };
        setAdminMessages(prev => [...prev, adminResponse]);
        setIsTyping(false);
      }, 1000);
    } else {
      // Handle regular chat
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      // Simulate bot typing delay
      setTimeout(() => {
        const response = getBotResponse(inputValue);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          sender: 'bot',
          timestamp: new Date(),
          quickReplies: response.quickReplies,
          actions: response.actions
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800 + Math.random() * 1200);
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply === 'Back to main menu') {
      setShowSearch(false);
      setAdminMessaging(false);
      addMessage(reply, 'user');
      setTimeout(() => {
        addMessage('👋 **Welcome back to CareConnect!**\n\nWhat would you like to explore today?', 'bot', ['Find volunteer events', 'Become a volunteer', 'NGO partnership', 'Make a donation']);
      }, 500);
      return;
    }

    setInputValue(reply);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Enhanced Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 ${
            isOpen
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rotate-180 scale-110'
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 animate-pulse hover:animate-none hover:scale-110'
          }`}
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <>
              <HelpCircle className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </>
          )}
        </Button>
      </div>

      {/* Enhanced Chat Widget */}
      {isOpen && (
  <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-[9998] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 rounded-t-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/5 rounded-full"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  {adminMessaging ? (
                    <Users className="w-6 h-6" />
                  ) : (
                    <div className="relative">
                      <Heart className="w-6 h-6" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {adminMessaging ? 'Admin Support' : 'CareConnect Assistant'}
                  </h3>
                  <p className="text-sm text-blue-100">
                    {adminMessaging ? 'Direct admin communication' : 'Here to help you make a difference! ✨'}
                  </p>
                </div>
              </div>
              
              {/* Admin Contact Toggle */}
              <button
                onClick={() => {
                  setAdminMessaging(!adminMessaging);
                  if (!adminMessaging) {
                    setAdminMessages([{
                      id: 'admin-welcome',
                      text: '👨‍💼 **Hello! You\'re now connected to admin support.**\n\n🔧 **How can we help you today?**\n• Technical issues\n• Account problems\n• Partnership inquiries\n• Feature requests\n• General support\n\nPlease describe your issue and we\'ll get back to you as soon as possible!',
                      sender: 'bot',
                      timestamp: new Date()
                    }]);
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-full border-2 border-yellow-400 hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse"
                title={adminMessaging ? 'Switch to AI Assistant' : 'Contact Admin Support'}
              >
                {adminMessaging ? <Heart className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                <span className="hidden sm:inline">{adminMessaging ? 'AI Assistant' : 'Contact Admin'}</span>
              </button>
            </div>
          </div>

          {/* Enhanced Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-blue-50/30 via-white/50 to-purple-50/30">
            {(adminMessaging ? adminMessages : messages).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200'
                      : adminMessaging
                      ? 'bg-white/80 backdrop-blur-sm text-gray-800 border border-green-200/50 shadow-green-100'
                      : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200/50 shadow-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.sender === 'bot' ? (
                      adminMessaging ? (
                        <Users className="w-4 h-4 text-green-600" />
                      ) : (
                        <Heart className="w-4 h-4 text-blue-600" />
                      )
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.sender === 'bot'
                        ? (adminMessaging ? 'Admin' : 'Assistant')
                        : 'You'
                      }
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-line">
                    {adminMessaging && message.sender === 'bot' && message.text.includes('**') ? (
                      <div className="space-y-2">
                        {message.text.split('\n').map((line, lineIndex) => {
                          if (line.includes('**')) {
                            const parts = line.split('**');
                            return (
                              <p key={lineIndex} className="leading-relaxed">
                                {parts.map((part, partIndex) => 
                                  partIndex % 2 === 1 ? (
                                    <span key={partIndex} className="font-bold text-green-700">{part}</span>
                                  ) : (
                                    <span key={partIndex}>{part}</span>
                                  )
                                )}
                              </p>
                            );
                          }
                          return line ? <p key={lineIndex} className="leading-relaxed">{line}</p> : <br key={lineIndex} />;
                        })}
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                  <p className="text-xs opacity-50 mt-1 flex items-center justify-between">
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {adminMessaging && message.sender === 'user' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>Sent to Admin</span>
                      </span>
                    )}
                  </p>

                  {/* Enhanced Quick Replies */}
                  {message.quickReplies && message.sender === 'bot' && (
                    <div className="mt-3 space-y-2">
                      {message.quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="block w-full text-left px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 text-xs rounded-lg transition-all duration-200 border border-blue-200/50 hover:border-blue-300 hover:shadow-sm"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {message.actions && message.sender === 'bot' && (
                    <div className="mt-3 space-y-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(action)}
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-lg transition-colors"
                        >
                          {action.icon}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className={`px-4 py-2 rounded-2xl ${
                  adminMessaging ? 'bg-green-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {adminMessaging ? (
                      <Users className="w-4 h-4 text-green-600" />
                    ) : (
                      <Heart className="w-4 h-4 text-blue-600" />
                    )}
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        adminMessaging ? 'bg-green-600' : 'bg-blue-600'
                      }`}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        adminMessaging ? 'bg-green-600' : 'bg-blue-600'
                      }`} style={{ animationDelay: '0.1s' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        adminMessaging ? 'bg-green-600' : 'bg-blue-600'
                      }`} style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Quick Actions */}
          {!adminMessaging && (
            <div className="px-4 py-3 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30 backdrop-blur-sm">
              <div className="flex space-x-2 overflow-x-auto">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action)}
                    className="flex items-center space-x-1 px-3 py-2 bg-white/80 backdrop-blur-sm hover:bg-blue-50 text-blue-600 text-xs rounded-lg border border-blue-200/50 hover:border-blue-300 transition-all duration-200 whitespace-nowrap hover:shadow-sm"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Input */}
          <div className="sticky bottom-0 p-4 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={adminMessaging ? "Type your message to admin..." : "Ask me anything about volunteering..."}
                className="flex-1 px-4 py-3 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/90 backdrop-blur-sm placeholder-gray-400"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-semibold">Send</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
