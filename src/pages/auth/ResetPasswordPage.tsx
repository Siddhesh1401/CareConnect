import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to login page in 3 seconds...
          </p>
          <Link to="/login">
            <Button className="w-full">
              Go to Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      {/* Home Page Button */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 shadow-md px-6 py-2"
          >
            ← Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="max-w-md w-full">
        <Card className="p-8 bg-white">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
            <p className="text-gray-600">
              Enter your new password below to complete the reset process.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5" />}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5" />}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium">Password requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li className={password.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                  At least 6 characters long
                </li>
                <li className={password === confirmPassword && password.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                  Passwords match
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              isLoading={isLoading}
              disabled={!password || !confirmPassword || password !== confirmPassword || password.length < 6}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
