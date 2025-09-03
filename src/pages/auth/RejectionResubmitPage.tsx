import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Upload, X, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface DocumentStatus {
  registrationCertificate?: {
    filename?: string;
    status?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };
  taxExemptionCertificate?: {
    filename?: string;
    status?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };
  organizationalLicense?: {
    filename?: string;
    status?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };
}

export const RejectionResubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentStatus>({});
  const [newDocuments, setNewDocuments] = useState<{
    registrationCert: File | null;
    taxExemption: File | null;
    organizationalLicense: File | null;
  }>({
    registrationCert: null,
    taxExemption: null,
    organizationalLicense: null
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in or if we have stored email from rejected login
    const storedEmail = localStorage.getItem('userEmail');
    const storedRejectedDocs = localStorage.getItem('rejectedDocuments');
    
    if (!user && !storedEmail) {
      navigate('/login');
      return;
    }
    
    if (user && user.role !== 'ngo_admin') {
      navigate('/login');
      return;
    }

    // Load rejection data from localStorage if available
    if (storedRejectedDocs) {
      try {
        const rejectedDocs = JSON.parse(storedRejectedDocs);
        console.log('Loaded rejected documents:', rejectedDocs);
        setDocuments(rejectedDocs);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Error parsing rejected documents:', e);
      }
    }

    fetchDocumentStatus();
  }, [user, navigate]);

  const fetchDocumentStatus = async () => {
    try {
      const token = localStorage.getItem('careconnect_token');
      const response = await axios.get(`${API_BASE_URL}/admin/ngos/${user?.id}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDocuments(response.data.data.documents || {});
      }
    } catch (error) {
      console.error('Error fetching document status:', error);
      setError('Failed to load document status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (field: keyof typeof newDocuments, file: File | null) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
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

    setError('');
    setNewDocuments(prev => ({ ...prev, [field]: file }));
  };

  const handleResubmit = async () => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add email for identification (since user isn't logged in)
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        formData.append('email', storedEmail);
      } else if (user?.email) {
        formData.append('email', user.email);
      } else {
        setError('User email not found. Please try logging in again.');
        setUploading(false);
        return;
      }
      
      // Only include files that need to be re-uploaded (rejected documents)
      if (documents.registrationCertificate?.status === 'rejected' && newDocuments.registrationCert) {
        formData.append('registrationCert', newDocuments.registrationCert);
      }
      if (documents.taxExemptionCertificate?.status === 'rejected' && newDocuments.taxExemption) {
        formData.append('taxExemption', newDocuments.taxExemption);
      }
      if (documents.organizationalLicense?.status === 'rejected' && newDocuments.organizationalLicense) {
        formData.append('organizationalLicense', newDocuments.organizationalLicense);
      }

      const response = await axios.patch(
        `${API_BASE_URL}/auth/resubmit-documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data.success) {
        alert('Documents resubmitted successfully! Your application is now under review again.');
        navigate('/auth/pending-approval');
      }
    } catch (error: any) {
      console.error('Error resubmitting documents:', error);
      setError(error.response?.data?.message || 'Failed to resubmit documents');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document status...</p>
        </div>
      </div>
    );
  }

  const rejectedDocuments = Object.entries(documents).filter(
    ([_, doc]) => doc?.status === 'rejected'
  );

  if (rejectedDocuments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Rejected Documents</h2>
          <p className="text-gray-600 mb-4">All your documents are either approved or pending review.</p>
          <Button onClick={() => navigate('/ngo/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Document Resubmission Required</h1>
          <p className="text-lg text-gray-600">
            Some of your documents have been rejected. Please upload new documents to continue with your application.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Registration Certificate */}
          {documents.registrationCertificate?.status === 'rejected' && (
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Registration Certificate</h3>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Rejected</span>
              </div>
              
              {documents.registrationCertificate.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {documents.registrationCertificate.rejectionReason}
                  </p>
                </div>
              )}

              <div className="border-2 border-dashed border-red-300 rounded-lg p-4">
                {newDocuments.registrationCert ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700 font-medium">{newDocuments.registrationCert.name}</span>
                    <button
                      onClick={() => handleFileUpload('registrationCert', null)}
                      className="text-red-600 hover:text-red-700 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('registrationCert', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload new Registration Certificate</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  </label>
                )}
              </div>
            </Card>
          )}

          {/* Tax Exemption Certificate */}
          {documents.taxExemptionCertificate?.status === 'rejected' && (
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Tax Exemption Certificate</h3>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Rejected</span>
              </div>
              
              {documents.taxExemptionCertificate.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {documents.taxExemptionCertificate.rejectionReason}
                  </p>
                </div>
              )}

              <div className="border-2 border-dashed border-red-300 rounded-lg p-4">
                {newDocuments.taxExemption ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700 font-medium">{newDocuments.taxExemption.name}</span>
                    <button
                      onClick={() => handleFileUpload('taxExemption', null)}
                      className="text-red-600 hover:text-red-700 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('taxExemption', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload new Tax Exemption Certificate</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  </label>
                )}
              </div>
            </Card>
          )}

          {/* Organizational License */}
          {documents.organizationalLicense?.status === 'rejected' && (
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Organizational License</h3>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Rejected</span>
              </div>
              
              {documents.organizationalLicense.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {documents.organizationalLicense.rejectionReason}
                  </p>
                </div>
              )}

              <div className="border-2 border-dashed border-red-300 rounded-lg p-4">
                {newDocuments.organizationalLicense ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700 font-medium">{newDocuments.organizationalLicense.name}</span>
                    <button
                      onClick={() => handleFileUpload('organizationalLicense', null)}
                      className="text-red-600 hover:text-red-700 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('organizationalLicense', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload new Organizational License</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  </label>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Button
            onClick={() => navigate('/ngo/dashboard')}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleResubmit}
            disabled={uploading || rejectedDocuments.every(([key]) => !newDocuments[key as keyof typeof newDocuments])}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploading ? 'Uploading...' : 'Resubmit Documents'}
          </Button>
        </div>
      </div>
    </div>
  );
};
