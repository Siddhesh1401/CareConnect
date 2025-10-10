import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, CheckCircle, XCircle, Clock, Mail, FileText, AlertCircle, Send, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { accessRequestAPI, AccessRequest } from '../../services/accessRequestAPI';
import { apiAdminAPI } from '../../services/api';

interface EmailRequest extends AccessRequest {
  status: 'email_submitted' | 'pending' | 'approved' | 'rejected' | 'under_review';
}

const EmailRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<EmailRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EmailRequest | null>(null);
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3 | 4>(1);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [sendingKey, setSendingKey] = useState(false);
  const [monitoringEmails, setMonitoringEmails] = useState(false);
  const [monitoringResults, setMonitoringResults] = useState<any>(null);

  // Load workflow state from localStorage on mount
  useEffect(() => {
    const savedWorkflow = localStorage.getItem('emailRequestsWorkflow');
    if (savedWorkflow) {
      try {
        const workflowData = JSON.parse(savedWorkflow);
        // Only load workflow state for requests that are not yet approved
        if (workflowData.selectedRequest && workflowData.selectedRequest.status !== 'approved') {
          setSelectedRequest(workflowData.selectedRequest);
          setWorkflowStep(workflowData.workflowStep || 1);
          setPermissions(workflowData.permissions || []);
          setGeneratedKey(workflowData.generatedKey);
          setSendingKey(workflowData.sendingKey || false);
        }
      } catch (error) {
        console.error('Error loading workflow state:', error);
        localStorage.removeItem('emailRequestsWorkflow');
      }
    }
  }, []); // Run only on mount

  // Validate saved state when requests are loaded
  useEffect(() => {
    if (requests.length > 0 && selectedRequest) {
      // For approved requests, don't validate workflow state - they show completed view
      if (selectedRequest.status === 'approved') {
        return;
      }

      const requestStillExists = requests.find(r => r._id === selectedRequest._id);
      if (!requestStillExists) {
        // Request no longer exists, clear state
        setSelectedRequest(null);
        setWorkflowStep(1);
        setPermissions([]);
        setGeneratedKey(null);
        setSendingKey(false);
        localStorage.removeItem('emailRequestsWorkflow');
      }
    }
  }, [requests, selectedRequest]);

  // Save workflow state to localStorage whenever it changes
  useEffect(() => {
    if (selectedRequest && selectedRequest.status !== 'approved') {
      const workflowData = {
        selectedRequest,
        workflowStep,
        permissions,
        generatedKey,
        sendingKey
      };
      localStorage.setItem('emailRequestsWorkflow', JSON.stringify(workflowData));
    } else {
      localStorage.removeItem('emailRequestsWorkflow');
    }
  }, [selectedRequest, workflowStep, permissions, generatedKey, sendingKey]);

  // Fetch email requests (both pending and completed)
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch both email_submitted and approved requests that came from email
      const [emailSubmittedResponse, approvedResponse] = await Promise.all([
        accessRequestAPI.getAllAccessRequests({ status: 'email_submitted' }),
        accessRequestAPI.getAllAccessRequests({ status: 'approved' })
      ]);
      
      // Combine and sort by requested date (newest first)
      const allRequests = [
        ...emailSubmittedResponse.requests,
        ...approvedResponse.requests
      ].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      
      setRequests(allRequests);
    } catch (error) {
      console.error('Error fetching email requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle workflow actions
  const handleReview = (request: EmailRequest) => {
    setSelectedRequest(request);
    // Check if there's saved workflow state for this specific request
    const savedWorkflow = localStorage.getItem('emailRequestsWorkflow');
    if (savedWorkflow) {
      try {
        const workflowData = JSON.parse(savedWorkflow);
        if (workflowData.selectedRequest && workflowData.selectedRequest._id === request._id) {
          // Restore saved state for this request
          setWorkflowStep(workflowData.workflowStep || 1);
          setPermissions(workflowData.permissions || []);
          setGeneratedKey(workflowData.generatedKey);
          setSendingKey(workflowData.sendingKey || false);
          return;
        }
      } catch (error) {
        console.error('Error parsing saved workflow:', error);
      }
    }
    // No saved state for this request, start fresh
    if (request.status !== 'approved') {
      setWorkflowStep(1);
      setPermissions([]);
      setGeneratedKey(null);
      setSendingKey(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await accessRequestAPI.approveAccessRequest(selectedRequest._id, {
        reviewNotes: 'Approved via email submission workflow'
      });
      setWorkflowStep(3); // Skip to generate key
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleGenerateKey = async () => {
    if (!selectedRequest) return;
    try {
      const response = await apiAdminAPI.generateAPIKey({
        name: `Government Key - ${selectedRequest.organization}`,
        organization: selectedRequest.organization,
        permissions
      });
      if (response.success) {
        setGeneratedKey(response.data.key);
        setWorkflowStep(4);
      }
    } catch (error) {
      console.error('Error generating key:', error);
    }
  };

  const handleSendKey = async () => {
    if (!generatedKey || !selectedRequest) return;
    setSendingKey(true);
    try {
      // Send email with key (implement in backend)
      await apiAdminAPI.sendAPIKey(selectedRequest._id, generatedKey);
      alert(`API key sent successfully to ${selectedRequest.contactPerson} at ${selectedRequest.email}!`);
      
      // Clear workflow state
      setSelectedRequest(null);
      setWorkflowStep(1);
      setPermissions([]);
      setGeneratedKey(null);
      setSendingKey(false);
      
      // Clear localStorage
      localStorage.removeItem('emailRequestsWorkflow');
      
      fetchRequests();
    } catch (error) {
      console.error('Error sending key:', error);
      setSendingKey(false);
    }
  };

  const closeModal = () => {
    // Only close the modal, keep workflow state for reopening
    setSelectedRequest(null);
  };

  const handleEmailMonitoring = async () => {
    setMonitoringEmails(true);
    try {
      const response = await apiAdminAPI.triggerEmailMonitoring();
      setMonitoringResults(response);
      
      // Refresh the requests list after monitoring
      fetchRequests();
    } catch (error) {
      console.error('Error triggering email monitoring:', error);
      setMonitoringResults({
        success: false,
        message: 'Failed to check for emails',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setMonitoringEmails(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="h-8 w-8 text-blue-600" />
                Email Requests Management
              </h1>
              <p className="text-gray-600 mt-2">Review and process government data access requests submitted via email</p>
            </div>
            <Button 
              onClick={handleEmailMonitoring} 
              disabled={monitoringEmails}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${monitoringEmails ? 'animate-spin' : ''}`} />
              {monitoringEmails ? 'Checking...' : 'Check for New Emails'}
            </Button>
          </div>
        </div>

        {/* Requests List */}
        <Card className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Requests Yet</h3>
              <p className="text-gray-500">Email requests from governments will appear here once processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{request.organization}</h3>
                    <p className="text-sm text-gray-600">{request.contactPerson} - {request.email}</p>
                    <p className="text-sm text-gray-500">{request.purpose}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      request.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {request.status === 'approved' ? 'Approved' : 'Email Submitted'}
                    </span>
                    {request.status === 'approved' ? (
                      <Button onClick={() => handleReview(request)} size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    ) : (
                      <Button onClick={() => handleReview(request)} size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Workflow Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedRequest.status === 'approved' ? 'Completed Request' : 'Process Request'}: {selectedRequest.organization}
                </h2>
                <Button onClick={closeModal} variant="outline" size="sm">Close</Button>
              </div>

              {selectedRequest.status === 'approved' ? (
                // Completed request view
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Request Approved and API Key Sent</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Organization:</strong> {selectedRequest.organization}
                    </div>
                    <div>
                      <strong>Contact:</strong> {selectedRequest.contactPerson}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedRequest.email}
                    </div>
                    <div>
                      <strong>Approved:</strong> {new Date(selectedRequest.reviewedAt || selectedRequest.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <strong>API Key Generated:</strong> 
                    <span className="ml-2 font-mono text-sm">
                      {selectedRequest.apiKeyGenerated ? 
                        `${selectedRequest.apiKeyGenerated.key.substring(0, 20)}...` : 
                        'Key details not available'
                      }
                    </span>
                  </div>
                </div>
              ) : (
                // Active workflow for pending requests
                <>
                  {/* Progress Indicator */}
                  <div className="flex justify-between mb-6">
                    {['Review', 'Approve', 'Generate Key', 'Send Key'].map((step, index) => (
                      <div key={step} className={`flex-1 text-center ${workflowStep > index + 1 ? 'text-green-600' : workflowStep === index + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full mx-auto mb-1 ${workflowStep > index + 1 ? 'bg-green-600' : workflowStep === index + 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>

              {/* Step Content */}
              {workflowStep === 1 && (
                <div>
                  <h3 className="font-semibold mb-2">Review Request Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Organization:</strong> {selectedRequest.organization}</p>
                    <p><strong>Contact:</strong> {selectedRequest.contactPerson}</p>
                    <p><strong>Email:</strong> {selectedRequest.email}</p>
                    <p><strong>Purpose:</strong> {selectedRequest.purpose}</p>
                    <p><strong>Data Types:</strong> {selectedRequest.dataTypes.join(', ')}</p>
                  </div>
                  <Button onClick={() => setWorkflowStep(2)} className="mt-4">Mark as Reviewed</Button>
                </div>
              )}

              {workflowStep === 2 && (
                <div>
                  <h3 className="font-semibold mb-2">Approve Request & Select Permissions</h3>
                  <div className="space-y-2">
                    {['read:volunteers', 'read:ngos', 'read:campaigns', 'read:events', 'read:reports'].map((perm) => (
                      <label key={perm} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={permissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPermissions([...permissions, perm]);
                            } else {
                              setPermissions(permissions.filter(p => p !== perm));
                            }
                          }}
                          className="mr-2"
                        />
                        {perm}
                      </label>
                    ))}
                  </div>
                  <Button onClick={handleApprove} className="mt-4">Approve Request</Button>
                </div>
              )}

              {workflowStep === 3 && (
                <div>
                  <h3 className="font-semibold mb-2">Generate API Key</h3>
                  <p className="text-sm text-gray-600 mb-4">Permissions: {permissions.join(', ')}</p>
                  <Button onClick={handleGenerateKey} disabled={permissions.length === 0}>
                    Generate API Key
                  </Button>
                </div>
              )}

              {workflowStep === 4 && generatedKey && (
                <div>
                  <h3 className="font-semibold mb-2">Send API Key</h3>
                  <div className="bg-gray-100 p-4 rounded mb-4">
                    <p className="text-sm font-mono break-all">{generatedKey}</p>
                  </div>
                  <Button onClick={handleSendKey} disabled={sendingKey}>
                    <Send className="h-4 w-4 mr-1" />
                    {sendingKey ? 'Sending...' : 'Send Key via Email'}
                  </Button>
                </div>
              )}
                </>
              )}
            </Card>
          </div>
        )}

        {/* Email Monitoring Results Modal */}
        {monitoringResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {monitoringResults.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  Email Check Results
                </h2>
                <Button onClick={() => setMonitoringResults(null)} variant="outline" size="sm">Close</Button>
              </div>

              <div className="space-y-4">
                {monitoringResults.success ? (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {monitoringResults.data?.emailsFound || 0}
                      </div>
                      <div className="text-sm text-gray-600">Emails Found</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {monitoringResults.data?.emailsProcessed || 0}
                        </div>
                        <div className="text-xs text-gray-500">Processed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {monitoringResults.data?.newRequests || 0}
                        </div>
                        <div className="text-xs text-gray-500">New Requests</div>
                      </div>
                    </div>

                    {monitoringResults.data?.processedRequests?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">New Requests Created:</h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {monitoringResults.data.processedRequests.map((request: any, index: number) => (
                            <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                              <div className="font-medium">{request.organization}</div>
                              <div className="text-gray-600">{request.contactPerson} - {request.email}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!monitoringResults.data?.processedRequests?.length) && (
                      <div className="text-center text-gray-500 py-4">
                        No new requests found
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <div className="font-semibold text-red-600 mb-2">Check Failed</div>
                    <div className="text-sm text-gray-600">
                      {monitoringResults.error || 'An unknown error occurred'}
                    </div>
                  </div>
                )}

                {monitoringResults.data?.errors?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-red-600">Errors:</h3>
                    <div className="space-y-1">
                      {monitoringResults.data.errors.map((error: string, index: number) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailRequestsPage;