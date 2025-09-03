import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Heart, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatBot } from '../../components/ChatBot';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle incoming state message (from NGO registration)
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setMessageType(location.state.type || 'info');
      // Clear the state to prevent message from persisting on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      const role = email === 'volunteer@careconnect.com' ? 'volunteer' : 'ngo_admin';
      navigate(role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      console.log('Error code:', err.code);
      console.log('Error response:', err.response?.data);
      
      // Check if NGO has rejected documents and needs to resubmit
      if (err.code === 'DOCUMENTS_REJECTED') {
        console.log('Redirecting to resubmit page');
        console.log('Rejected documents from error:', err.rejectedDocuments);
        // Store the rejected documents info for the resubmission page
        localStorage.setItem('rejectedDocuments', JSON.stringify(err.rejectedDocuments || {}));
        localStorage.setItem('userEmail', email);
        navigate('/auth/resubmit-documents');
        return;
      }
      
      // Check if NGO is pending approval and redirect to pending page
      if (err.code === 'PENDING_APPROVAL') {
        console.log('Redirecting to pending approval page with data:', err.data);
        
        // Extract organization details from error data or fallback to email parsing
        const orgName = err.data?.organizationName || 
                       email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const userEmail = err.data?.email || email;
        
        navigate(`/auth/pending-approval?orgName=${encodeURIComponent(orgName)}&email=${encodeURIComponent(userEmail)}`);
        return;
      }
      
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative h-[95vh] max-h-[750px] animate-slideDown">
        
        <div className="flex h-full">
          {/* Left Side - Login Form */}
          <div className="flex-1 p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full animate-fadeInUp">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6 animate-bounceIn">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <Heart className="w-9 h-9 text-white animate-pulse" />
                  </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fadeInLeft">Welcome Back</h1>
                <p className="text-gray-600 text-base lg:text-lg animate-fadeInRight">Sign in to continue making a difference</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                {message && (
                  <div className={`p-4 border rounded-xl animate-fadeInDown ${
                    messageType === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                    messageType === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    <div className="flex items-center">
                      {messageType === 'success' ? (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      ) : (
                        <Info className="w-5 h-5 mr-2" />
                      )}
                      {message}
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-shake">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="animate-fadeInLeft" style={{ animationDelay: '0.3s' }}>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="w-5 h-5" />}
                      required
                    />
                  </div>

                  <div className="animate-fadeInRight" style={{ animationDelay: '0.4s' }}>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="w-5 h-5" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="hover:text-gray-600 transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                  <label className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500" />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                  <Button 
                    type="submit" 
                    className="w-full py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl" 
                    size="lg" 
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                <p className="text-gray-600 mb-6">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline">
                    Create one now
                  </Link>
                </p>
                
                {/* Demo Button and Home Link side by side */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="animate-fadeInLeft" style={{ animationDelay: '0.8s' }}>
                    <Link to="/demo">
                      <Button
                        variant="outline"
                        size="lg"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transform hover:scale-105 transition-all duration-200"
                      >
                        ✨ Try Demo Accounts
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="animate-fadeInRight" style={{ animationDelay: '0.9s' }}>
                    <Link to="/">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all duration-200"
                      >
                        ← Home
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="mt-5 pt-5 border-t border-gray-100"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Branding */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10 text-center text-white space-y-6 animate-fadeInUp">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl mx-auto flex items-center justify-center backdrop-blur-sm animate-bounceIn transform hover:scale-110 transition-transform duration-300">
                <Heart className="w-12 h-12 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold animate-fadeInLeft">Connect & Impact</h2>
              <p className="text-blue-100 text-lg leading-relaxed animate-fadeInRight">
                Join thousands of volunteers making a real difference in communities worldwide. 
                Your journey to meaningful impact starts here.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="text-center animate-fadeInLeft" style={{ animationDelay: '0.5s' }}>
                  <div className="text-2xl font-bold hover:text-blue-200 transition-colors cursor-default">15K+</div>
                  <div className="text-blue-200 text-sm">Active Volunteers</div>
                </div>
                <div className="text-center animate-fadeInRight" style={{ animationDelay: '0.6s' }}>
                  <div className="text-2xl font-bold hover:text-blue-200 transition-colors cursor-default">500+</div>
                  <div className="text-blue-200 text-sm">Partner NGOs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
};