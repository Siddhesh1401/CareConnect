import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { authAPI } from '../../services/api';

interface VerificationResponse {
  success: boolean;
  message: string;
  data?: {
    isEmailVerified?: boolean;
    attemptsRemaining?: number;
  };
}

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (email) {
      setMessage('Please check your email for the verification code and enter it below.');
      setMessageType('info');
    }
  }, [email]);

  const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !verificationCode) {
      showMessage('Please enter both email and verification code.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data: VerificationResponse = await authAPI.verifyEmail({
        email,
        verificationCode
      });

      if (data.success) {
        setIsVerified(true);
        showMessage('Email verified successfully! You can now log in.', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to verify email. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      showMessage('Please enter your email address.', 'error');
      return;
    }

    setIsResending(true);
    try {
      const data: VerificationResponse = await authAPI.resendVerificationCode(email);

      if (data.success) {
        setAttemptsRemaining(data.data?.attemptsRemaining || 5);
        showMessage('New verification code sent to your email.', 'success');
        setVerificationCode('');
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification code. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!email) {
      showMessage('Please enter your email address.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data: VerificationResponse = await authAPI.sendVerificationEmail(email);

      if (data.success) {
        setAttemptsRemaining(data.data?.attemptsRemaining || 5);
        showMessage('Verification email sent! Please check your email.', 'success');
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600">Your email has been successfully verified.</p>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Continue to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            Enter your email and the verification code sent to you.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : messageType === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {messageType === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {messageType === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            {messageType === 'info' && <Mail className="w-5 h-5 mr-2" />}
            <span className="text-sm">{message}</span>
          </div>
        )}

        <form onSubmit={handleVerifyEmail} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {!searchParams.get('email') && (
            <Button
              type="button"
              onClick={handleSendVerificationEmail}
              disabled={isLoading || !email}
              className="w-full mb-4"
              variant="outline"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send Verification Code
            </Button>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email || !verificationCode}
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Verify Email
          </Button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <Button
            type="button"
            onClick={handleResendCode}
            disabled={isResending || !email || attemptsRemaining <= 0}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Resend Code
          </Button>

          <p className="text-sm text-gray-500">
            Attempts remaining: {attemptsRemaining}/5
          </p>

          <div className="text-sm">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailVerificationPage;
