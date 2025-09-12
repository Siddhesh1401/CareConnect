import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CheckCircle, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  AlertTriangle,
  ExternalLink,
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface NGORequest {
  _id: string;
  organizationName: string;
  name: string;
  email: string;
  phone?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  organizationType?: string;
  description?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  website?: string;
  registrationNumber?: string;
  documents?: {
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
  };
  rejectionReason?: string;
}

export const NGORequestsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status?: string[];
    category?: string[];
  }>({});
  const [ngoRequests, setNGORequests] = useState<NGORequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Modal states
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    ngo?: NGORequest;
  }>({ isOpen: false });
  
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    ngo?: NGORequest;
    reason: string;
  }>({ isOpen: false, reason: '' });

  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    ngo?: NGORequest;
    documentType?: string;
    action?: 'approve' | 'reject';
    reason: string;
  }>({ isOpen: false, reason: '' });

  // Fetch NGO requests from backend
  const fetchNGORequests = async () => {
    try {
      const token = localStorage.getItem('careconnect_token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/ngos`, {
        params: {
          status: filters.status && filters.status.length > 0 ? filters.status.join(',') : '',
          search: searchQuery
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setNGORequests(response.data.data.ngos || []);
        setStatusCounts(response.data.data.statusCounts || { pending: 0, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Error fetching NGO requests:', error);
      // Set empty arrays to prevent undefined errors
      setNGORequests([]);
      setStatusCounts({ pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGORequests();
  }, [searchQuery, filters]);

  // Approve NGO
  const handleApprove = async (ngoId: string) => {
    const ngo = ngoRequests.find(n => n._id === ngoId);
    if (!ngo) return;
    
    setApprovalModal({ isOpen: true, ngo });
  };

  // Reject NGO
  const handleReject = async (ngoId: string) => {
    const ngo = ngoRequests.find(n => n._id === ngoId);
    if (!ngo) return;
    
    setRejectionModal({ isOpen: true, ngo, reason: '' });
  };

  // Approve entire NGO
  const handleApproveNGO = async () => {
    if (!approvalModal.ngo) return;

    try {
      const token = localStorage.getItem('careconnect_token');
      const response = await axios.patch(
        `${API_BASE_URL}/admin/ngos/${approvalModal.ngo._id}/approve`,
        { approvalNotes: 'Approved by admin' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setApprovalModal({ isOpen: false });
        await fetchNGORequests(); // Refresh the list
        
        // Show success message
        alert(`🎉 ${approvalModal.ngo.organizationName} has been approved successfully! They can now access their NGO dashboard.`);
      }
    } catch (error) {
      console.error('Error approving NGO:', error);
      alert('Failed to approve NGO');
    }
  };

  // Reject entire NGO
  const handleRejectNGO = async () => {
    if (!rejectionModal.ngo || !rejectionModal.reason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      const token = localStorage.getItem('careconnect_token');
      const response = await axios.patch(
        `${API_BASE_URL}/admin/ngos/${rejectionModal.ngo._id}/reject`,
        { rejectionReason: rejectionModal.reason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setRejectionModal({ isOpen: false, reason: '' });
        await fetchNGORequests(); // Refresh the list
        
        // Show success message
        alert(`❌ ${rejectionModal.ngo.organizationName} has been rejected. They will be notified via email.`);
      }
    } catch (error) {
      console.error('Error rejecting NGO:', error);
      alert('Failed to reject NGO');
    }
  };

  // Approve specific document
  const handleDocumentApprove = async (ngoId: string, documentType: string) => {
    const ngo = ngoRequests.find(n => n._id === ngoId);
    if (!ngo) return;
    
    setDocumentModal({ 
      isOpen: true, 
      ngo, 
      documentType, 
      action: 'approve',
      reason: ''
    });
  };

  // Reject specific document
  const handleDocumentReject = async (ngoId: string, documentType: string) => {
    const ngo = ngoRequests.find(n => n._id === ngoId);
    if (!ngo) return;
    
    setDocumentModal({ 
      isOpen: true, 
      ngo, 
      documentType, 
      action: 'reject',
      reason: ''
    });
  };

  // Execute document action
  const handleDocumentAction = async () => {
    if (!documentModal.ngo || !documentModal.documentType || !documentModal.action) return;
    
    if (documentModal.action === 'reject' && !documentModal.reason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      const token = localStorage.getItem('careconnect_token');
      const endpoint = documentModal.action === 'approve' ? 'approve' : 'reject';
      const payload = documentModal.action === 'reject' ? { rejectionReason: documentModal.reason } : {};
      
      const response = await axios.patch(
        `${API_BASE_URL}/admin/ngos/${documentModal.ngo._id}/documents/${documentModal.documentType}/${endpoint}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setDocumentModal({ isOpen: false, reason: '' });
        await fetchNGORequests(); // Refresh the list
        
        const docName = documentModal.documentType.replace(/([A-Z])/g, ' $1').toLowerCase();
        if (documentModal.action === 'approve') {
          alert(`✅ ${docName} approved successfully!${response.data.data?.allDocumentsApproved ? ' NGO is now fully approved!' : ''}`);
        } else {
          alert(`❌ ${docName} rejected. NGO will be notified to resubmit.`);
        }
      }
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Failed to process document');
    }
  };

  // Filter requests based on search and filters
  const filteredRequests = (ngoRequests || []).filter(request => {
    if (!request) return false;

    const matchesSearch =
      request.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.organizationType?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = !filters.status || filters.status.length === 0 ||
      filters.status.includes(request.verificationStatus);

    // Organization type filter
    const matchesType = !filters.category || filters.category.length === 0 ||
      filters.category.includes(request.organizationType || '');

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading NGO requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">NGO Registration Requests</h1>
          <p className="text-xl text-gray-600">Review and manage NGO registration applications</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{statusCounts.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved NGOs</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                <p className="text-xs text-gray-500 mt-1">Active organizations</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-primary-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-primary-600">{statusCounts.pending + statusCounts.approved + statusCounts.rejected}</p>
                <p className="text-xs text-gray-500 mt-1">All time registrations</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Building className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </div>        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by organization name, contact person, email, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  status: e.target.value ? [e.target.value] : []
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Organization Type Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filters.category?.[0] || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  category: e.target.value ? [e.target.value] : []
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="environment">Environment</option>
                <option value="poverty">Poverty Alleviation</option>
                <option value="disaster">Disaster Relief</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {((filters.status && filters.status.length > 0) || (filters.category && filters.category.length > 0)) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilters({})}
                className="text-primary-600 hover:text-primary-800"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-1">
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setFilters({ ...filters, status: [] })}
                className={`flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  !filters.status || filters.status.length === 0
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Building className="w-4 h-4 mr-2" />
                All Requests
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  {statusCounts.pending + statusCounts.approved + statusCounts.rejected}
                </span>
              </button>
              
              <button
                onClick={() => setFilters({ ...filters, status: ['pending'] })}
                className={`flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  filters.status && filters.status.includes('pending')
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Pending Review
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {statusCounts.pending}
                </span>
              </button>
              
              <button
                onClick={() => setFilters({ ...filters, status: ['approved'] })}
                className={`flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  filters.status && filters.status.includes('approved')
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {statusCounts.approved}
                </span>
              </button>
              
              <button
                onClick={() => setFilters({ ...filters, status: ['rejected'] })}
                className={`flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  filters.status && filters.status.includes('rejected')
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4 mr-2" />
                Rejected
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  {statusCounts.rejected}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <Card className="p-12 text-center bg-white border border-primary-200">
              <div className="max-w-md mx-auto">
                <Building className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No NGO Registrations Found</h3>
                <p className="text-gray-500">No NGO registration requests match your current filters.</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
                {searchQuery && (
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm text-primary-600">
                      💡 Try adjusting your search terms or changing the filters
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request._id} className="p-6 bg-white border border-primary-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{request.organizationName || 'Unnamed Organization'}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.verificationStatus === 'pending' ? 'bg-primary-100 text-primary-800' :
                      request.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.verificationStatus}
                    </span>
                    {request.organizationType && (
                      <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                        {request.organizationType}
                      </span>
                    )}
                  </div>
                  
                  {request.description && (
                    <p className="text-gray-600 mb-4">{request.description}</p>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4 text-primary-500" />
                        <span>{request.email}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="w-4 h-4 text-primary-500" />
                          <span>{request.phone}</span>
                        </div>
                      )}
                      {request.location && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          <span>
                            {[request.location.city, request.location.state, request.location.country]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {request.registrationNumber && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FileText className="w-4 h-4 text-primary-500" />
                          <span>Reg: {request.registrationNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building className="w-4 h-4 text-primary-500" />
                        <span>Contact: {request.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {request.website && (
                    <div className="mb-4">
                      <a 
                        href={request.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Visit Website</span>
                      </a>
                    </div>
                  )}
                  
                  {/* Documents Section */}
                  {request.documents && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-primary-500" />
                        Uploaded Documents
                      </h4>
                      
                      {/* Registration Certificate */}
                      {request.documents.registrationCertificate && (
                        <div className="p-4 bg-primary-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-primary-600" />
                              <span className="font-medium text-primary-900">Registration Certificate</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                request.documents.registrationCertificate.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.documents.registrationCertificate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.documents.registrationCertificate.status || 'pending'}
                              </span>
                            </div>
                            <a
                              href={`http://localhost:5000/uploads/documents/${request.documents.registrationCertificate.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          {request.documents.registrationCertificate.rejectionReason && (
                            <p className="text-sm text-red-600 mb-3">
                              <strong>Rejection Reason:</strong> {request.documents.registrationCertificate.rejectionReason}
                            </p>
                          )}
                          {request.documents.registrationCertificate.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleDocumentApprove(request._id, 'registrationCertificate')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleDocumentReject(request._id, 'registrationCertificate')}
                                size="sm"
                                variant="danger"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tax Exemption Certificate */}
                      {request.documents.taxExemptionCertificate && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-900">Tax Exemption Certificate</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                request.documents.taxExemptionCertificate.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.documents.taxExemptionCertificate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.documents.taxExemptionCertificate.status || 'pending'}
                              </span>
                            </div>
                            <a
                              href={`http://localhost:5000/uploads/documents/${request.documents.taxExemptionCertificate.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          {request.documents.taxExemptionCertificate.rejectionReason && (
                            <p className="text-sm text-red-600 mb-3">
                              <strong>Rejection Reason:</strong> {request.documents.taxExemptionCertificate.rejectionReason}
                            </p>
                          )}
                          {request.documents.taxExemptionCertificate.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleDocumentApprove(request._id, 'taxExemptionCertificate')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleDocumentReject(request._id, 'taxExemptionCertificate')}
                                size="sm"
                                variant="danger"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Organizational License */}
                      {request.documents.organizationalLicense && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-purple-900">Organizational License</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                request.documents.organizationalLicense.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.documents.organizationalLicense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.documents.organizationalLicense.status || 'pending'}
                              </span>
                            </div>
                            <a
                              href={`http://localhost:5000/uploads/documents/${request.documents.organizationalLicense.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          {request.documents.organizationalLicense.rejectionReason && (
                            <p className="text-sm text-red-600 mb-3">
                              <strong>Rejection Reason:</strong> {request.documents.organizationalLicense.rejectionReason}
                            </p>
                          )}
                          {request.documents.organizationalLicense.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleDocumentApprove(request._id, 'organizationalLicense')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleDocumentReject(request._id, 'organizationalLicense')}
                                size="sm"
                                variant="danger"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {!request.documents.registrationCertificate && !request.documents.taxExemptionCertificate && !request.documents.organizationalLicense && (
                        <p className="text-sm text-gray-500 italic">No documents uploaded</p>
                      )}
                    </div>
                  )}
                  
                  {/* Status Display */}
                  {request.verificationStatus === 'approved' && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">This NGO has been approved and is active on the platform</span>
                      </div>
                    </div>
                  )}
                  
                  {request.verificationStatus === 'rejected' && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-red-600">
                        <X className="w-5 h-5" />
                        <span className="text-sm font-medium">This NGO registration has been rejected</span>
                        {request.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-700">
                              <strong>Reason:</strong> {request.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {request.verificationStatus === 'pending' && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-primary-600">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-medium">Pending document review - approve all documents to activate this NGO</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false })}
        title="Approve NGO Registration"
        size="md"
      >
        {approvalModal.ngo && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Approve {approvalModal.ngo.organizationName}?
              </h3>
              <p className="text-gray-600 mt-2">
                This will grant full access to the NGO dashboard and mark the organization as verified.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">What happens next:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• NGO will receive email confirmation</li>
                <li>• Full access to NGO dashboard</li>
                <li>• Can create campaigns and events</li>
                <li>• Listed in verified NGOs directory</li>
              </ul>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setApprovalModal({ isOpen: false })}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveNGO}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Approve NGO
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, reason: '' })}
        title="Reject NGO Registration"
        size="md"
      >
        {rejectionModal.ngo && (
          <div className="space-y-4">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Reject {rejectionModal.ngo.organizationName}?
              </h3>
              <p className="text-gray-600 mt-2">
                Please provide a detailed reason for rejection. This will be sent to the organization.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Please explain why this registration is being rejected..."
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setRejectionModal({ isOpen: false, reason: '' })}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectNGO}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Reject NGO
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Document Action Modal */}
      <Modal
        isOpen={documentModal.isOpen}
        onClose={() => setDocumentModal({ isOpen: false, reason: '' })}
        title={`${documentModal.action === 'approve' ? 'Approve' : 'Reject'} Document`}
        size="md"
      >
        {documentModal.ngo && documentModal.documentType && (
          <div className="space-y-4">
            <div className="text-center">
              {documentModal.action === 'approve' ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {documentModal.action === 'approve' ? 'Approve' : 'Reject'} {documentModal.documentType.replace(/([A-Z])/g, ' $1').toLowerCase()}?
              </h3>
              <p className="text-gray-600 mt-2">
                Organization: {documentModal.ngo.organizationName}
              </p>
            </div>
            
            {documentModal.action === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={documentModal.reason}
                  onChange={(e) => setDocumentModal(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Please explain why this document is being rejected..."
                  required
                />
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setDocumentModal({ isOpen: false, reason: '' })}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDocumentAction}
                className={`flex-1 ${documentModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {documentModal.action === 'approve' ? (
                  <>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve Document
                  </>
                ) : (
                  <>
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject Document
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
