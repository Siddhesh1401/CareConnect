import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Building, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export const DemoPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (email: string, role: string) => {
    try {
      await login(email, 'password');
      
      // Navigate based on role
      if (role === 'volunteer') {
        navigate('/volunteer/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/ngo/dashboard');
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  const demoAccounts = [
    {
      role: 'Volunteer',
      email: 'volunteer@careconnect.com',
      description: 'Explore volunteer features, join events, and track your impact',
      icon: User,
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      roleKey: 'volunteer'
    },
    {
      role: 'NGO Admin',
      email: 'ngo@careconnect.com',
      description: 'Manage events, campaigns, and volunteers for your organization',
      icon: Building,
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      roleKey: 'ngo_admin'
    },
    {
      role: 'System Admin',
      email: 'admin@careconnect.com',
      description: 'Access platform management, user oversight, and system settings',
      icon: Shield,
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      roleKey: 'admin'
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Try CareConnect Demo</h1>
          <p className="text-gray-600 text-lg">
            Experience different user roles and explore all features
          </p>
        </div>

        {/* Demo Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {demoAccounts.map((account, index) => {
            const IconComponent = account.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`${account.bgColor} p-6 text-center text-white`}>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl mx-auto flex items-center justify-center mb-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{account.role}</h3>
                  <p className="text-sm opacity-90">{account.email}</p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {account.description}
                  </p>
                  
                  <Button
                    onClick={() => handleDemoLogin(account.email, account.roleKey)}
                    className={`w-full ${account.bgColor} ${account.hoverColor} text-white`}
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Login as {account.role}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What You Can Explore
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Volunteer Experience</h3>
              <p className="text-sm text-gray-600">
                Join events, track hours, earn achievements, and connect with community
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">NGO Management</h3>
              <p className="text-sm text-gray-600">
                Create events, manage campaigns, track volunteers and donations
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Admin Panel</h3>
              <p className="text-sm text-gray-600">
                Platform oversight, user management, and system administration
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 group px-4 py-2 border-2 border-blue-200 hover:border-blue-400 rounded-lg hover:bg-blue-50 hover:shadow-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">Home</span>
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 group px-4 py-2 border-2 border-blue-200 hover:border-blue-400 rounded-lg hover:bg-blue-50 hover:shadow-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <span className="relative z-10">Sign In</span>
            </Link>
            
            <Link
              to="/signup"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 group px-4 py-2 border-2 border-blue-200 hover:border-blue-400 rounded-lg hover:bg-blue-50 hover:shadow-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <span className="relative z-10">Sign Up</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
