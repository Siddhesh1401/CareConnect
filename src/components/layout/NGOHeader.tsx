import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Building, User, LogOut, Plus, Calendar, Target, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { HeaderContactSupport } from '../HeaderContactSupport';

export const NGOHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/ngo/dashboard' },
    { name: 'Events', href: '/ngo/events' },
    { name: 'Campaigns', href: '/ngo/campaigns' },
    { name: 'Volunteers', href: '/ngo/volunteers' },
    { name: 'Community', href: '/community' },
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    setShowLogoutConfirm(false);
    navigate('/', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/ngo/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div className="text-gray-900">
                <span className="text-xl font-semibold">CareConnect</span>
                <div className="text-xs text-blue-600">NGO Portal</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-md ${
                  isActiveLink(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Contact Support */}
            <HeaderContactSupport userType="ngo_admin" />
            
            <div className="relative">
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>

              {/* Create Dropdown Menu */}
              {isCreateMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/ngo/events/create"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setIsCreateMenuOpen(false)}
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    Create Event
                  </Link>
                  <Link
                    to="/ngo/campaigns/create"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setIsCreateMenuOpen(false)}
                  >
                    <Target className="w-4 h-4 mr-3" />
                    Create Campaign
                  </Link>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      // Handle send broadcast
                      console.log('Send broadcast clicked');
                    }}
                  >
                    <Mail className="w-4 h-4 mr-3" />
                    Send Broadcast
                  </button>
                  <Link
                    to="/community"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setIsCreateMenuOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Create Post
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-blue-600">NGO Admin</div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Organization Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
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
              
              {/* Mobile Create Menu */}
              <div className="border-t border-blue-100 pt-4 mt-4">
                <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Create
                </div>
                <Link
                  to="/ngo/events/create"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Create Event
                </Link>
                <Link
                  to="/ngo/campaigns/create"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Target className="w-4 h-4 mr-3" />
                  Create Campaign
                </Link>
                <button
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setIsMenuOpen(false);
                    console.log('Send broadcast clicked');
                  }}
                >
                  <Mail className="w-4 h-4 mr-3" />
                  Send Broadcast
                </button>
                <Link
                  to="/community"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Create Post
                </Link>
              </div>

              {/* Mobile Support */}
              <div className="border-t border-blue-100 pt-4 mt-4">
                <div className="px-3 mb-3">
                  <HeaderContactSupport userType="ngo_admin" />
                </div>
              </div>
              
              <div className="border-t border-blue-100 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-blue-600">NGO Admin</div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Organization Settings
                </Link>
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

    {/* Logout Confirmation Dialog */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-blue-200/50 relative overflow-hidden">
          {/* Futuristic background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-purple-400/10 rounded-2xl"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-t-2xl"></div>
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-purple-400/20 rounded-full blur-xl"></div>

          <div className="text-center relative z-10">
            {/* Enhanced icon with glow effect */}
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 relative">
                <LogOut className="w-10 h-10 text-white" />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-md opacity-50 -z-10"></div>
              </div>
              {/* Pulsing ring animation */}
              <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 animate-ping"></div>
            </div>

            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Are you sure you want to logout? You will be redirected to the home page.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={cancelLogout}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium border border-gray-300/50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 font-medium relative overflow-hidden group"
              >
                <span className="relative z-10">Logout</span>
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};