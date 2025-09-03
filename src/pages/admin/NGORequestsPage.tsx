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
  Search,
  ExternalLink,
  Upload,
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
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
          status: statusFilter === 'all' ? '' : statusFilter,
          search: searchTerm
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
  }, [statusFilter, searchTerm]);

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

  // Filter requests based on search and status
  const filteredRequests = (ngoRequests || []).filter(request => {
    if (!request) return false;
    
    const matchesSearch = 
      request.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">NGO Registration Requests</h1>
          <p className="text-xl text-gray-600">Review and manage NGO registration applications</p>
        </div>

        {/* Statistics Cards - Now Clickable */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className={`p-6 bg-white/70 backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              statusFilter === 'pending' ? 'border-orange-400 ring-2 ring-orange-200' : 'border-orange-200/50'
            }`}
            onClick={() => setStatusFilter('pending')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{statusCounts.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          
          <Card 
            className={`p-6 bg-white/70 backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              statusFilter === 'approved' ? 'border-green-400 ring-2 ring-green-200' : 'border-green-200/50'
            }`}
            onClick={() => setStatusFilter('approved')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved NGOs</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                <p className="text-xs text-gray-500 mt-1">Active organizations</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          
          <Card 
            className={`p-6 bg-white/70 backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              statusFilter === 'all' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-blue-200/50'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.pending + statusCounts.approved + statusCounts.rejected}</p>
                <p className="text-xs text-gray-500 mt-1">All time registrations</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Status Tabs */}
        <div className="space-y-6">
          {/* Search Bar */}
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl">
            <Input
              placeholder="Search by organization name, contact person, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              className="bg-white/80 backdrop-blur-sm border-blue-200/50"
            />
          </Card>

          {/* Status Filter Tabs */}
          <Card className="p-2 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl">
            <div className="flex flex-wrap gap-2">
              {[
                { 
                  value: 'all', 
                  label: 'All Requests', 
                  count: statusCounts.pending + statusCounts.approved + statusCounts.rejected,
                  color: 'blue',
                  icon: Building
                },
                { 
                  value: 'pending', 
                  label: 'Pending Review', 
                  count: statusCounts.pending,
                  color: 'orange',
                  icon: Clock
                },
                { 
                  value: 'approved', 
                  label: 'Approved', 
                  count: statusCounts.approved,
                  color: 'green',
                  icon: CheckCircle
                },
                { 
                  value: 'rejected', 
                  label: 'Rejected', 
                  count: statusCounts.rejected,
                  color: 'red',
                  icon: X
                }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = statusFilter === tab.value;
                
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`
                      flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex-1 min-w-fit
                      ${isActive 
                        ? `bg-gradient-to-r ${
                            tab.color === 'blue' ? 'from-blue-500 to-blue-600' :
                            tab.color === 'orange' ? 'from-orange-500 to-orange-600' :
                            tab.color === 'green' ? 'from-green-500 to-green-600' :
                            'from-red-500 to-red-600'
                          } text-white shadow-lg transform scale-105` 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{tab.label}</span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : `${
                            tab.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                            tab.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                            tab.color === 'green' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`
                      }
                    `}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <Card className="p-12 text-center bg-white/70 backdrop-blur-sm border border-blue-200/50">
              <div className="max-w-md mx-auto">
                {statusFilter === 'pending' && (
                  <>
                    <Clock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                    <p className="text-gray-500">There are currently no NGO registrations awaiting review.</p>
                    <p className="text-sm text-gray-400 mt-2">New registrations will appear here for approval.</p>
                  </>
                )}
                {statusFilter === 'approved' && (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved NGOs</h3>
                    <p className="text-gray-500">No NGOs have been approved yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Approved organizations will be listed here.</p>
                  </>
                )}
                {statusFilter === 'rejected' && (
                  <>
                    <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rejected Applications</h3>
                    <p className="text-gray-500">No NGO applications have been rejected.</p>
                    <p className="text-sm text-gray-400 mt-2">Rejected applications will appear here.</p>
                  </>
                )}
                {statusFilter === 'all' && (
                  <>
                    <Building className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No NGO Registrations</h3>
                    <p className="text-gray-500">No NGO registration requests found.</p>
                    <p className="text-sm text-gray-400 mt-2">All NGO applications will be displayed here.</p>
                  </>
                )}
                {searchTerm && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">
                      💡 Try adjusting your search terms or changing the status filter
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request._id} className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{request.organizationName || 'Unnamed Organization'}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.verificationStatus === 'pending' ? 'bg-blue-100 text-blue-800' :
                      request.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.verificationStatus}
                    </span>
                    {request.organizationType && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
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
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>{request.email}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span>{request.phone}</span>
                        </div>
                      )}
                      {request.location && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-blue-500" />
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
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>Reg: {request.registrationNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building className="w-4 h-4 text-blue-500" />
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
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm"
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
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Uploaded Documents
                      </h4>
                      
                      {/* Registration Certificate */}
                      {request.documents.registrationCertificate && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-900">Registration Certificate</span>
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
                              className="text-blue-600 hover:text-blue-700"
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
                      <div className="flex items-center space-x-2 text-blue-600">
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
