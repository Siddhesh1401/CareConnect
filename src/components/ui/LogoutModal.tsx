import React from 'react';
import { LogOut, X, Shield, Heart, Building, User } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userRole?: string;
  userName?: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userRole = 'user',
  userName = 'User'
}) => {
  if (!isOpen) return null;

  // Role-based styling and icons
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: Shield,
          gradient: 'from-red-500 to-pink-600',
          bgGradient: 'from-red-50 to-pink-50',
          accentColor: 'red',
          title: 'Admin Logout',
          description: 'You will be logged out from the admin panel.'
        };
      case 'ngo_admin':
        return {
          icon: Building,
          gradient: 'from-blue-500 to-indigo-600',
          bgGradient: 'from-blue-50 to-indigo-50',
          accentColor: 'blue',
          title: 'NGO Logout',
          description: 'You will be logged out from your NGO dashboard.'
        };
      case 'volunteer':
        return {
          icon: Heart,
          gradient: 'from-green-500 to-emerald-600',
          bgGradient: 'from-green-50 to-emerald-50',
          accentColor: 'green',
          title: 'Volunteer Logout',
          description: 'You will be logged out from your volunteer dashboard.'
        };
      default:
        return {
          icon: User,
          gradient: 'from-purple-500 to-indigo-600',
          bgGradient: 'from-purple-50 to-indigo-50',
          accentColor: 'purple',
          title: 'Logout Confirmation',
          description: 'You will be logged out and redirected to the home page.'
        };
    }
  };

  const config = getRoleConfig(userRole);
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-300">
      <div className={`bg-gradient-to-br ${config.bgGradient} rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20 relative overflow-hidden`}>
        {/* Animated gradient border */}
        <div className={`absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r ${config.gradient} animate-pulse`}>
          <div className={`w-full h-full bg-gradient-to-br ${config.bgGradient} rounded-3xl`}></div>
        </div>

        {/* Simple background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl"></div>
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${config.gradient} rounded-t-3xl`}></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 group z-20"
        >
          <X className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
        </button>

        <div className="text-center relative z-10">
          {/* Simple icon with single glow effect */}
          <div className="relative mx-auto mb-6">
            <div className={`w-20 h-20 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg relative`}>
              <IconComponent className="w-10 h-10 text-white" />
              {/* Single glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-2xl blur-md opacity-30 -z-10`}></div>
            </div>
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}>
            {config.title}
          </h3>

          {/* User greeting */}
          <p className="text-gray-700 font-medium mb-2">Goodbye, {userName}!</p>

          {/* Description */}
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            {config.description}
          </p>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium border border-gray-200/50"
            >
              Stay Logged In
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-xl hover:shadow-lg hover:shadow-${config.accentColor}-500/25 font-medium relative overflow-hidden group transform hover:scale-105 transition-all duration-300`}
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </span>
              {/* Simple button glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl`}></div>
            </button>
          </div>

          {/* Additional info */}
          <div className="mt-6 p-4 bg-white/50 rounded-xl border border-white/30">
            <p className="text-xs text-gray-500">
              💡 <strong>Tip:</strong> Your session data will be securely cleared from this device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};