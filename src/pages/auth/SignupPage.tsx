import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Heart, Building, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatBot } from '../../components/ChatBot';

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'volunteer' as 'volunteer' | 'ngo_admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<{
    registrationCert: File | null;
    taxExemption: File | null;
    organizationalLicense: File | null;
  }>({
    registrationCert: null,
    taxExemption: null,
    organizationalLicense: null
  });
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (field: keyof typeof documents, file: File | null) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
    }
    
    setDocuments(prev => ({ ...prev, [field]: file }));
    setError('');
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { level: 0, text: 'Too short' };
    if (password.length < 8) return { level: 1, text: 'Weak' };
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) return { level: 1, text: 'Weak' };
    if (!/(?=.*\d)/.test(password)) return { level: 2, text: 'Good' };
    return { level: 3, text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate NGO documents
    if (formData.role === 'ngo_admin') {
      if (!documents.registrationCert || !documents.taxExemption || !documents.organizationalLicense) {
        setError('Please upload all required documents for NGO registration');
        return;
      }
    }

    try {
      // Prepare additional data based on role
      const additionalData: any = {};
      
      if (formData.role === 'ngo_admin') {
        // For NGO admin, the "name" field represents the organization name
        additionalData.organizationName = formData.name;
        // Include documents for upload
        additionalData.documents = documents;
      }
      
      await signup(formData.name, formData.email, formData.password, formData.role, additionalData);
      
      // Handle redirect based on user role
      if (formData.role === 'volunteer') {
        // Volunteers need email verification
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else if (formData.role === 'ngo_admin') {
        // NGOs go to pending approval page
        navigate(`/auth/pending-approval?org=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`);
      }
      
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // If it's the NGO approval message, show it as a success state
      if (err.message && err.message.includes('Please wait for admin approval')) {
        setError(''); // Clear any existing errors
        // Redirect NGOs to pending approval page
        navigate(`/auth/pending-approval?org=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`);
        return;
      }
      
      setError(err.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden h-full max-h-[700px] border border-blue-100">
        
        <div className="flex h-full">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <div className="text-center text-white space-y-6 relative z-10 animate-fadeInLeft">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center animate-bounceIn">
                <Heart className="w-12 h-12" />
              </div>
              <div className="animate-slideDown" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Create your account and join a community of changemakers. Together, we can create 
                  lasting impact in communities across India.
                </p>
              </div>
              <div className="space-y-4 pt-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-3 text-blue-100 group hover:text-white transition-colors duration-300">
                  <div className="w-2 h-2 bg-blue-200 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <span>Find meaningful volunteer opportunities</span>
                </div>
                <div className="flex items-center space-x-3 text-blue-100 group hover:text-white transition-colors duration-300">
                  <div className="w-2 h-2 bg-blue-200 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <span>Connect with like-minded individuals</span>
                </div>
                <div className="flex items-center space-x-3 text-blue-100 group hover:text-white transition-colors duration-300">
                  <div className="w-2 h-2 bg-blue-200 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <span>Track your impact and achievements</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8 h-full">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-6 animate-fadeInDown">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg animate-bounceIn">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Create Account</h1>
                  <p className="text-gray-600 text-sm">Join the CareConnect community today</p>
                </div>

              <form onSubmit={handleSubmit} className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-shake">
                    {error}
                  </div>
                )}

                {/* Role Selection */}
                <div className="animate-fadeInLeft" style={{ animationDelay: '0.3s' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="role"
                        value="volunteer"
                        checked={formData.role === 'volunteer'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all duration-300 transform hover:scale-105 ${
                        formData.role === 'volunteer'
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}>
                        <User className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Volunteer</span>
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        name="role"
                        value="ngo_admin"
                        checked={formData.role === 'ngo_admin'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all duration-300 transform hover:scale-105 ${
                        formData.role === 'ngo_admin'
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}>
                        <Building className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">NGO</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="animate-fadeInRight" style={{ animationDelay: '0.4s' }}>
                    <Input
                      type="text"
                      name="name"
                      placeholder={formData.role === 'volunteer' ? 'Your full name' : 'Organization name'}
                      value={formData.name}
                      onChange={handleInputChange}
                      leftIcon={formData.role === 'volunteer' ? <User className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                      required
                    />
                  </div>

                  <div className="animate-fadeInLeft" style={{ animationDelay: '0.5s' }}>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      leftIcon={<Mail className="w-5 h-5" />}
                      required
                    />
                  </div>

                  <div className="space-y-2 animate-fadeInRight" style={{ animationDelay: '0.6s' }}>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
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
                    {formData.password && (
                      <div className="flex items-center space-x-2 animate-fadeIn">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              passwordStrength.level === 1 ? 'bg-red-400 w-1/4' :
                              passwordStrength.level === 2 ? 'bg-yellow-400 w-2/4' :
                              passwordStrength.level === 3 ? 'bg-green-500 w-full' :
                              'bg-gray-300 w-1/6'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.level === 1 ? 'text-red-600' :
                          passwordStrength.level === 2 ? 'text-yellow-600' :
                          passwordStrength.level === 3 ? 'text-green-600' :
                          'text-gray-500'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="animate-fadeInLeft" style={{ animationDelay: '0.7s' }}>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      leftIcon={<Lock className="w-5 h-5" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="hover:text-gray-600 transition-colors duration-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      }
                      error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
                      required
                    />
                  </div>
                </div>

                {/* NGO Document Upload */}
                {formData.role === 'ngo_admin' && (
                  <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Upload className="w-5 h-5 mr-2 text-blue-600" />
                      Required Documents
                    </h4>
                    
                    {/* Registration Certificate */}
                    <div className="animate-fadeInLeft" style={{ animationDelay: '0.9s' }}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Certificate *
                      </label>
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-400 transition-colors duration-300">
                        {documents.registrationCert ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm text-gray-700 font-medium truncate">{documents.registrationCert.name}</span>
                            <button
                              type="button"
                              onClick={() => handleFileUpload('registrationCert', null)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded ml-2"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload('registrationCert', e.target.files?.[0] || null)}
                              className="hidden"
                            />
                            <div className="text-center group">
                              <Upload className="w-6 h-6 text-blue-400 mx-auto mb-1 group-hover:text-blue-600 transition-colors" />
                              <p className="text-xs text-gray-600 group-hover:text-gray-800">Click to upload (Max 5MB)</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Tax Exemption Document */}
                    <div className="animate-fadeInRight" style={{ animationDelay: '1s' }}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Exemption Certificate *
                      </label>
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-400 transition-colors duration-300">
                        {documents.taxExemption ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm text-gray-700 font-medium truncate">{documents.taxExemption.name}</span>
                            <button
                              type="button"
                              onClick={() => handleFileUpload('taxExemption', null)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded ml-2"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload('taxExemption', e.target.files?.[0] || null)}
                              className="hidden"
                            />
                            <div className="text-center group">
                              <Upload className="w-6 h-6 text-blue-400 mx-auto mb-1 group-hover:text-blue-600 transition-colors" />
                              <p className="text-xs text-gray-600 group-hover:text-gray-800">Click to upload (Max 5MB)</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Organizational License */}
                    <div className="animate-fadeInLeft" style={{ animationDelay: '1.1s' }}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organizational License *
                      </label>
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-400 transition-colors duration-300">
                        {documents.organizationalLicense ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm text-gray-700 font-medium truncate">{documents.organizationalLicense.name}</span>
                            <button
                              type="button"
                              onClick={() => handleFileUpload('organizationalLicense', null)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded ml-2"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload('organizationalLicense', e.target.files?.[0] || null)}
                              className="hidden"
                            />
                            <div className="text-center group">
                              <Upload className="w-6 h-6 text-blue-400 mx-auto mb-1 group-hover:text-blue-600 transition-colors" />
                              <p className="text-xs text-gray-600 group-hover:text-gray-800">Click to upload (Max 5MB)</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-600 animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
                  <label className="flex items-start space-x-2 cursor-pointer hover:text-gray-800 transition-colors duration-200">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5 transition-all duration-200" 
                      required 
                    />
                    <span>
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                <div className="animate-fadeInUp" style={{ animationDelay: '1.3s' }}>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg" 
                    size="lg" 
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center animate-fadeInUp" style={{ animationDelay: '1.4s' }}>
                <p className="text-gray-600 mb-8 text-base">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-200">
                    Sign in here
                  </Link>
                </p>
                
                {/* Enhanced Demo and Home Links */}
                <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '1.5s' }}>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  
                  <p className="text-gray-500 text-sm font-medium">
                    Explore our platform
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Link to="/demo" className="group">
                      <Button
                        variant="outline"
                        size="lg"
                        className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-2 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg font-semibold px-8 py-3"
                      >
                        <span className="relative z-10 flex items-center">
                          <span className="text-lg mr-2">✨</span>
                          Try Demo
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </Link>
                    
                    <Link to="/" className="group">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-2 border-gray-200 hover:from-gray-100 hover:to-slate-100 hover:border-gray-300 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg font-semibold px-8 py-3"
                      >
                        <span className="relative z-10 flex items-center">
                          <span className="text-lg mr-2">←</span>
                          Back to Home
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-slate-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      By signing up, you agree to our platform's mission of connecting volunteers with meaningful opportunities
                    </p>
                  </div>
                </div>
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