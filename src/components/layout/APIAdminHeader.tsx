import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Key, Users, BarChart3, User, LogOut, Database, Activity, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const APIAdminHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleTabChange = (tab: string) => {
    if (tab === 'email-requests') {
      navigate('/admin/email-requests');
    } else {
      navigate(`/admin/api-dashboard?tab=${tab}`);
    }
  };

  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';

  const navigation = [
    { name: 'API Management', tab: 'overview', icon: Shield, current: currentTab === 'overview' && location.pathname === '/admin/api-dashboard' },
    { name: 'API Keys', tab: 'keys', icon: Key, current: currentTab === 'keys' && location.pathname === '/admin/api-dashboard' },
    { name: 'Access Requests', tab: 'requests', icon: Users, current: currentTab === 'requests' && location.pathname === '/admin/api-dashboard' },
    { name: 'Email Requests', tab: 'email-requests', icon: Mail, current: location.pathname === '/admin/email-requests' },
    { name: 'Analytics', tab: 'analytics', icon: BarChart3, current: currentTab === 'analytics' && location.pathname === '/admin/api-dashboard' },
  ];

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-lg border-b border-blue-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <Link to="/admin/api-dashboard" className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CareConnect</h1>
                  <p className="text-xs text-blue-200">API Administration</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleTabChange(item.tab)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-800/50 text-white border border-blue-600/50'
                      : 'text-blue-200 hover:text-white hover:bg-blue-800/30'
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right side - Profile and Status */}
            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="hidden lg:flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                <Activity className="mr-1.5 h-3 w-3" />
                System Active
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name || 'API Admin'}
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                      <p className="text-xs text-blue-400 mt-1">API Administrator</p>
                    </div>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-white hover:text-blue-200 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    handleTabChange(item.tab);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-800/50 text-white border border-blue-600/50'
                      : 'text-blue-200 hover:text-white hover:bg-blue-800/30'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};