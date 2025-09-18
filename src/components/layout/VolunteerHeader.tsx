import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogoutModal } from '../ui/LogoutModal';
import { HeaderContactSupport } from '../HeaderContactSupport';
import { getProfilePictureUrl } from '../../services/api';

export const VolunteerHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/volunteer/dashboard' },
    { name: 'Broadcasts', href: '/volunteer/broadcasts', icon: '📢' },
    { name: 'Find Events', href: '/events' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Community', href: '/community' },
    { name: 'NGOs', href: '/ngos' },
    { name: 'Stories', href: '/stories' },
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    setShowLogoutModal(false);
    navigate('/', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b border-primary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/volunteer/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="text-gray-900">
                <span className="text-xl font-bold text-primary-700">CareConnect</span>
                <div className="text-xs text-primary-600 font-medium">Volunteer Portal</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg whitespace-nowrap ${
                  isActiveLink(item.href)
                    ? 'text-primary-700 bg-primary-50 border border-primary-200'
                    : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Profile & Actions */}
          <div className="hidden md:flex items-center space-x-5 ml-6">
            {/* Contact Support */}
            <HeaderContactSupport userType="volunteer" />
            
            <Link to="/notifications" className="relative">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-700 hover:bg-primary-50">
                <Bell className="w-5 h-5" />
              </Button>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full text-xs"></span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 transition-all duration-200"
              >
                <img
                  src={getProfilePictureUrl(user?.profilePicture, user?.name, 32)}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary-200"
                />
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-primary-600 font-medium">{user?.points} points</div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-lg shadow-lg border border-primary-200 py-2 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
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
              className="p-3 rounded-lg text-gray-600 hover:text-primary-700 hover:bg-primary-50"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-primary-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveLink(item.href)
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-primary-200 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <img
                    src={getProfilePictureUrl(user?.profilePicture, user?.name, 40)}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-primary-600">{user?.points} points</div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                
                {/* Mobile Support */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="px-3 mb-3">
                    <HeaderContactSupport userType="volunteer" />
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

    {/* Logout Confirmation Modal */}
    <LogoutModal
      isOpen={showLogoutModal}
      onClose={cancelLogout}
      onConfirm={confirmLogout}
      userRole="volunteer"
      userName={user?.name}
    />
    </>
  );
};