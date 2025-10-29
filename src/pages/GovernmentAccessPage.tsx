import React, { useState } from 'react';
import { GovernmentAccessRequestForm } from '../components/GovernmentAccessRequestForm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, FileText, FormInput } from 'lucide-react';

const GovernmentAccessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'email'>('form');

  const handleEmailCompose = () => {
    const govEmail = import.meta.env.VITE_GOVERNMENT_EMAIL || 'gov.access@careconnect.org';
    const subject = encodeURIComponent('Government Data Access Request');
    const body = encodeURIComponent(`Organization: [Enter your organization name]
Contact Person: [Your name]
Email: [Your email]
Purpose: [Brief description]
Data Types: [e.g., volunteers, ngos, campaigns]
Justification: [Legal reason]
Estimated Requests/Month: [Number]
Duration: [e.g., 1 year]
API Integration Method: [e.g., REST API]
Data Processing Location: [Location]
Security Measures: [Details]
Government Level: [federal/state/local]
Department: [Department name]
Authorized Officials: [Name1, Email1; Name2, Email2]`);
    // Open Gmail compose in browser
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(govEmail)}&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Data Access Request</h1>
          <p className="text-gray-600">Submit your request for secure access to CareConnect data</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'form'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FormInput className="mr-2 h-4 w-4" />
            Online Form
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Submission
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'form' && (
          <GovernmentAccessRequestForm />
        )}

        {activeTab === 'email' && (
          <Card className="p-8">
            <div className="text-center mb-6">
              <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit via Email</h2>
              <p className="text-gray-600">Send your request directly to our dedicated email address</p>
            </div>

            <div className="space-y-6">
              {/* Email Address */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Send to:</h3>
                <p className="text-blue-800 font-mono text-lg">{import.meta.env.VITE_GOVERNMENT_EMAIL || 'gov.access@careconnect.org'}</p>
              </div>

              {/* Template */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Email Template
                </h3>
                <div className="bg-gray-50 border rounded-lg p-4 font-mono text-sm text-gray-700">
                  Subject: Government Data Access Request<br/><br/>
                  Organization: [Enter your organization name]<br/>
                  Contact Person: [Your name]<br/>
                  Email: [Your email]<br/>
                  Purpose: [Brief description]<br/>
                  Data Types: [e.g., volunteers, ngos, campaigns]<br/>
                  Justification: [Legal reason]<br/>
                  Estimated Requests/Month: [Number]<br/>
                  Duration: [e.g., 1 year]<br/>
                  API Integration Method: [e.g., REST API]<br/>
                  Data Processing Location: [Location]<br/>
                  Security Measures: [Details]<br/>
                  Government Level: [federal/state/local]<br/>
                  Department: [Department name]<br/>
                  Authorized Officials: [Name1, Email1; Name2, Email2]
                </div>
              </div>

              {/* Compose Button */}
              <div className="text-center">
                <Button onClick={handleEmailCompose} size="lg" className="px-8">
                  <Mail className="mr-2 h-5 w-5" />
                  Compose Email
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Opens your email client with pre-filled details
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Fill in the template with your information</li>
                  <li>• Send to the email address above</li>
                  <li>• You'll receive a confirmation and API key once approved</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GovernmentAccessPage;