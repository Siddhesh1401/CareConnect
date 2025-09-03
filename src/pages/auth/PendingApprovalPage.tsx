import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, CheckCircle, FileText, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const organizationName = searchParams.get('orgName') || searchParams.get('org') || 'Your Organization';
  const email = searchParams.get('email') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="p-8 bg-white shadow-2xl border-0 animate-fadeInUp">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Clock className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registration Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Welcome <span className="font-semibold text-indigo-600">{organizationName}</span>
            </p>
          </div>

          {/* Status Cards */}
          <div className="space-y-4 mb-8">
            {/* Submission Status */}
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-800">Application Submitted</h3>
                <p className="text-sm text-green-700">Your NGO registration has been successfully submitted</p>
              </div>
            </div>

            {/* Pending Review Status */}
            <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex-shrink-0">
                <FileText className="w-6 h-6 text-amber-600 animate-pulse" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-amber-800">Under Admin Review</h3>
                <p className="text-sm text-amber-700">Our team is currently reviewing your documents and information</p>
              </div>
            </div>

            {/* Email Notification Status */}
            {email && (
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-blue-800">Email Notifications</h3>
                  <p className="text-sm text-blue-700">
                    We'll send updates to <span className="font-medium">{email}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Information Box */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">What happens next?</h3>
            <div className="space-y-3 text-sm text-indigo-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Our admin team will review your registration documents within 24-48 hours</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>You'll receive an email notification once your application is approved or if additional information is needed</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Once approved, you can log in and start creating campaigns and managing volunteers</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/login')}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Go to Login Page
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Questions about your application? Contact us at{' '}
              <a href="mailto:support@careconnect.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
                support@careconnect.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
