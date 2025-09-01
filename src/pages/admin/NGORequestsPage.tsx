import React, { useState } from 'react';
import { 
  Building, 
  CheckCircle, 
  X, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  Download,
  ExternalLink
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const NGORequestsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const ngoRequests = [
    {
      id: '1',
      organizationName: 'Hope Foundation',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh@hopefoundation.org',
      phone: '+91 98765 43210',
      address: 'Mumbai, Maharashtra',
      category: 'Education',
      description: 'We focus on providing quality education to underprivileged children in urban slums.',
      registrationNumber: 'NGO/2024/001',
      submittedDate: '2025-01-20',
      status: 'pending',
      documents: ['Registration Certificate', 'Tax Exemption', 'Annual Report'],
      website: 'https://hopefoundation.org',
      documentUrls: {
        registrationCert: '/documents/hope-foundation-reg-cert.pdf',
        taxExemption: '/documents/hope-foundation-tax-exempt.pdf',
        organizationalLicense: '/documents/hope-foundation-license.pdf'
      }
    },
    {
      id: '2',
      organizationName: 'Clean Water Initiative',
      contactPerson: 'Priya Sharma',
      email: 'priya@cleanwater.org',
      phone: '+91 87654 32109',
      address: 'Delhi, NCR',
      category: 'Environment',
      description: 'Dedicated to providing clean drinking water access to rural communities.',
      registrationNumber: 'NGO/2024/002',
      submittedDate: '2025-01-18',
      status: 'pending',
      documents: ['Registration Certificate', 'Tax Exemption', 'Project Reports'],
      website: 'https://cleanwater.org',
      documentUrls: {
        registrationCert: '/documents/clean-water-reg-cert.pdf',
        taxExemption: '/documents/clean-water-tax-exempt.pdf',
        organizationalLicense: '/documents/clean-water-license.pdf'
      }
    },
    {
      id: '3',
      organizationName: 'Animal Rescue Society',
      contactPerson: 'Amit Singh',
      email: 'amit@animalrescue.org',
      phone: '+91 76543 21098',
      address: 'Bangalore, Karnataka',
      category: 'Animal Welfare',
      description: 'Rescuing and rehabilitating abandoned and injured animals.',
      registrationNumber: 'NGO/2024/003',
      submittedDate: '2025-01-15',
      status: 'approved',
      documents: ['Registration Certificate', 'Tax Exemption', 'Veterinary License'],
      website: 'https://animalrescue.org',
      documentUrls: {
        registrationCert: '/documents/animal-rescue-reg-cert.pdf',
        taxExemption: '/documents/animal-rescue-tax-exempt.pdf',
        organizationalLicense: '/documents/animal-rescue-license.pdf'
      }
    }
  ];

  const filteredRequests = ngoRequests.filter(request => {
    const matchesSearch = request.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (requestId: string) => {
    if (window.confirm('Are you sure you want to approve this NGO registration?')) {
      console.log('Approving NGO request:', requestId);
    }
  };

  const handleReject = (requestId: string) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason) {
      console.log('Rejecting NGO request:', requestId, 'Reason:', reason);
    }
  };

  const handleViewDocument = (url: string, docName: string) => {
    // In a real app, this would open the document in a new tab or modal
    console.log('Viewing document:', docName, url);
    window.open(url, '_blank');
  };
  const pendingCount = ngoRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
          
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Building className="w-8 h-8" />
                </div>
                <span>NGO Registration Requests</span>
                {pendingCount > 0 && (
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/30">
                    {pendingCount} pending
                  </span>
                )}
              </h1>
              <p className="text-blue-100 mt-2">Review and manage NGO registration applications</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-orange-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-green-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {ngoRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600">{ngoRequests.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by organization name or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="bg-white/80 backdrop-blur-sm border-blue-200/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{request.organizationName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {request.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{request.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span>{request.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{request.address}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>Reg: {request.registrationNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building className="w-4 h-4 text-blue-500" />
                        <span>Contact: {request.contactPerson}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Verification Section */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Submitted Documents</span>
                    </h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
                        <span className="text-sm text-gray-700">Registration Certificate</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewDocument(request.documentUrls.registrationCert, 'Registration Certificate')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(request.documentUrls.registrationCert, '_blank')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
                        <span className="text-sm text-gray-700">Tax Exemption</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewDocument(request.documentUrls.taxExemption, 'Tax Exemption')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(request.documentUrls.taxExemption, '_blank')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
                        <span className="text-sm text-gray-700">Organizational License</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewDocument(request.documentUrls.organizationalLicense, 'Organizational License')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(request.documentUrls.organizationalLicense, '_blank')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Submitted Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.documents.map((doc, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <X className="mr-2 w-4 h-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="mr-2 w-4 h-4" />
                      Review
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <Card className="p-12 text-center bg-blue-50 border border-blue-100">
            <Building className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'No NGO registration requests to review'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};