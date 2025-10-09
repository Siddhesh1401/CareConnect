import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogoutModal } from '../ui/LogoutModal';
import { getProfilePictureUrl } from '../../services/api';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = user ? [
    { name: 'Dashboard', href: 
      user.role === 'volunteer' ? '/volunteer/dashboard' : 
      user.role === 'api_admin' ? '/api-admin/dashboard' :
      '/ngo/dashboard' 
    },
    { name: 'Events', href: '/events' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Community', href: '/community' },
    { name: 'NGOs', href: '/ngos' },
    { name: 'Stories', href: '/stories' },
    { name: 'Notifications', href: '/notifications' },
  ] : [
    { name: 'Events', href: '/events' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'NGOs', href: '/ngos' },
    { name: 'Stories', href: '/stories' },
    { name: 'About', href: '/about' },
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
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50 transition-all duration-500 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-4">
          {/* Section 1: Logo & Brand */}
          <div className="flex items-center animate-fade-in-left">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-xl">
                <Heart className="w-7 h-7 text-white group-hover:animate-pulse" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300 group-hover:scale-105">
                CareConnect
              </span>
            </Link>
          </div>

          {/* Section 2: Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1 bg-gray-50/30 rounded-xl px-4 py-2 animate-fade-in-up">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative text-base font-medium transition-all duration-300 px-4 py-2.5 rounded-lg group transform hover:scale-105 hover:-translate-y-1 ${
                  isActiveLink(item.href)
                    ? 'text-blue-600 bg-white shadow-sm animate-bounce-subtle'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/70 hover:shadow-md'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: `fadeInScale 0.6s ease-out ${index * 100}ms both`
                }}
              >
                <span className="relative z-10 group-hover:animate-pulse">{item.name}</span>
                {isActiveLink(item.href) && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full animate-expand"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-all duration-300 rounded-lg group-hover:animate-pulse"></div>
              </Link>
            ))}
            
            {/* Stories Action Button */}
            {user && (
              <Link to="/stories/create">
                <Button 
                  className="ml-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>Share Story</span>
                </Button>
              </Link>
            )}
          </nav>

          {/* Section 3: Auth/Profile Actions */}
          <div className="hidden md:flex items-center relative animate-fade-in-right">
            {user ? (
              <div className="relative animate-bounce-in">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/70 transition-all duration-300 transform hover:scale-105"
                >
                  <img
                    src={getProfilePictureUrl(user.profilePicture, user.name, 36)}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-base font-medium text-gray-700">{user.name}</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile Settings
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
            ) : (
              <div className="relative">
                {/* Animated border container */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-blue-500 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-t from-transparent via-blue-500 to-transparent"></div>
                  </div>
                </div>
                
                {/* Content container */}
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/50">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-xl p-2">
                    <Link to="/demo">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-600 border-blue-300/60 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm font-medium"
                      >
                        ✨ Demo
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-700 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-105 font-medium"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 font-semibold relative overflow-hidden group"
                      >
                        <span className="relative z-10">Join Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-xl border-t border-gray-100 transform transition-all duration-300 ease-out z-50">
            <div className="px-6 pt-6 pb-8 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 transform hover:scale-105 group ${
                    isActiveLink(item.href)
                      ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300 inline-block">{item.name}</span>
                </Link>
              ))}
              
              {user ? (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  {/* Stories Button for Mobile */}
                  <Link to="/stories/create" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg rounded-xl py-3 mb-4 flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Share Story</span>
                    </Button>
                  </Link>
                  
                  <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-4">
                    <img
                      src={getProfilePictureUrl(user.profilePicture, user.name, 48)}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover shadow-md"
                    />
                    <div className="ml-4">
                      <div className="text-base font-semibold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all duration-300 text-center transform hover:scale-105 mb-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-6 mt-6 space-y-3">
                  <Link to="/demo" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center text-blue-600 border-2 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 rounded-xl py-3">
                      Try Demo
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 rounded-xl py-3">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg rounded-xl py-3">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
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
      userRole={user?.role}
      userName={user?.name}
    />
    </>
  );
};