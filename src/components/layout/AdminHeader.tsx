import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, LogOut, Settings, Activity, MessageSquare, Zap, Loader } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { LogoutModal } from '../ui/LogoutModal';
import { getProfilePictureUrl } from '../../services/api';

export const AdminHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isApiLoginLoading, setIsApiLoginLoading] = useState(false);
  const [showApiLoginModal, setShowApiLoginModal] = useState(false);
  const [apiLoginStep, setApiLoginStep] = useState<'confirm' | 'loading' | 'complete'>('confirm');
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get unread messages count
  const getUnreadCount = () => {
    try {
      const storedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      return storedMessages.filter((msg: any) => msg.status === 'unread').length;
    } catch {
      return 0;
    }
  };

  // Update unread count on mount and when location changes
  useEffect(() => {
    setUnreadCount(getUnreadCount());
    
    // Listen for storage changes (when messages are updated)
    const handleStorageChange = () => {
      setUnreadCount(getUnreadCount());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'NGO Requests', href: '/admin/ngo-requests' },
    { name: 'User Management', href: '/admin/users' },
    { name: 'Stories', href: '/admin/stories' },
    { name: 'Reports', href: '/admin/reports' },
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleQuickApiLoginClick = () => {
    setApiLoginStep('confirm');
    setShowApiLoginModal(true);
  };

  const handleConfirmApiLogin = async () => {
    setApiLoginStep('loading');
    
    try {
      setIsApiLoginLoading(true);
      
      // Logout current user first
      await logout();
      
      // Login with API admin credentials
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/login`,
        {
          email: 'api-admin@careconnect.com',
          password: 'apiadmin123'
        }
      );

      console.log('API Admin Login Response:', response.data);
      
      // Check if login was successful
      if (response.data?.success && response.data?.data?.token) {
        const { token, user: userData } = response.data.data;
        
        // Store in localStorage using the same keys as AuthContext
        localStorage.setItem('careconnect_token', token);
        localStorage.setItem('careconnect_user', JSON.stringify(userData));
        
        console.log('Token and user stored successfully');
        
        // Show completion step briefly
        setApiLoginStep('complete');
        
        // Navigate and reload
        setTimeout(() => {
          window.location.href = '/admin/api-dashboard';
        }, 1500);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error: any) {
      console.error('API Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to login as API Admin';
      alert(errorMessage);
      setIsApiLoginLoading(false);
      setShowApiLoginModal(false);
    }
  };

  const handleCancelApiLogin = () => {
    setShowApiLoginModal(false);
    setApiLoginStep('confirm');
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b border-primary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-6">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-gray-900">
                <span className="text-xl font-bold text-primary-700">CareConnect</span>
                <div className="text-xs text-primary-600 font-medium">Admin Panel</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 flex-1 justify-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg whitespace-nowrap ${
                  isActiveLink(item.href)
                    ? 'text-white bg-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Messages Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin/messages"
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActiveLink('/admin/messages')
                  ? 'text-white bg-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* API Admin Quick Login Button */}
            <button
              onClick={handleQuickApiLoginClick}
              disabled={isApiLoginLoading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              title="Switch to API Admin Panel"
            >
              {isApiLoginLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>API Admin</span>
                </>
              )}
            </button>
          </div>

          {/* Desktop Profile */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-50 transition-all duration-200 min-w-0"
              >
                <img
                  src={getProfilePictureUrl(user?.profilePicture, user?.name, 32)}
                  alt={user?.name}
                  className="w-8 h-8 rounded-lg object-cover border-2 border-primary-200 flex-shrink-0"
                />
                <div className="text-left min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">System Admin</div>
                  <div className="text-xs text-primary-600 font-medium truncate">Admin Panel</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-primary-200 py-2 z-50">
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 flex items-center space-x-3 rounded-lg mx-2"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>System Settings</span>
                  </Link>
                  <Link
                    to="/admin/activity"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-3 rounded-xl mx-2 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Activity Log</span>
                  </Link>
                  <hr className="my-2 border-blue-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 rounded-xl mx-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-blue-100">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveLink(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Messages Button */}
              <Link
                to="/admin/messages"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveLink('/admin/messages')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Mobile API Admin Button */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleQuickApiLoginClick();
                }}
                disabled={isApiLoginLoading}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-bold transition-colors bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApiLoginLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Switch to API Admin</span>
                  </>
                )}
              </button>
              
              <div className="border-t border-blue-100 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <img
                    src={getProfilePictureUrl(user?.profilePicture, user?.name, 40)}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-blue-600">System Admin</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>

    {/* API Admin Login Confirmation Modal */}
    {showApiLoginModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {apiLoginStep === 'confirm' && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-white">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-center">Switch to API Admin</h3>
              </div>

              {/* Content */}
              <div className="px-6 py-8 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    You're about to switch to the <span className="font-bold text-blue-600">API Administration Panel</span> with elevated privileges.
                  </p>
                </div>

                {/* Permissions List */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">API Admin Permissions:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-100">
                          <span className="text-green-600 text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">Manage API Keys & Credentials</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-100">
                          <span className="text-green-600 text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">Review API Access Requests</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-100">
                          <span className="text-green-600 text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">View API Analytics & Usage</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-100">
                          <span className="text-green-600 text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">Manage Email Requests & Webhooks</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">Note:</span> Your current session will be logged out and you'll be logged in as API Admin.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button
                  onClick={handleCancelApiLogin}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApiLogin}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
                >
                  Continue to API Admin
                </button>
              </div>
            </>
          )}

          {apiLoginStep === 'loading' && (
            <div className="px-6 py-16 text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <Loader className="w-10 h-10 text-amber-500 animate-spin" />
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900">Authenticating...</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Logging out current session</p>
                <p>• Verifying API credentials</p>
                <p>• Initializing API dashboard</p>
              </div>
            </div>
          )}

          {apiLoginStep === 'complete' && (
            <div className="px-6 py-16 text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">✓</span>
                </div>
              </div>
              <h4 className="text-lg font-bold text-green-600">Login Successful!</h4>
              <p className="text-sm text-gray-600">Redirecting to API Admin Dashboard...</p>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Logout Confirmation Modal */}
    <LogoutModal
      isOpen={showLogoutModal}
      onClose={cancelLogout}
      onConfirm={confirmLogout}
      userRole={user?.role}
      userName={user?.name}
    />
    </>
  );
};