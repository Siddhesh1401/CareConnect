import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card } from './ui/Card';
import { accessRequestAPI, AccessRequestData } from '../services/accessRequestAPI';
import { Shield, Building2, Users, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const dataTypeOptions = [
  { value: 'volunteer_data', label: 'Volunteer Data', description: 'Volunteer profiles and activity' },
  { value: 'ngo_data', label: 'NGO Data', description: 'Organization information and operations' },
  { value: 'campaign_data', label: 'Campaign Data', description: 'Fundraising and awareness campaigns' },
  { value: 'event_data', label: 'Event Data', description: 'Community events and activities' },
  { value: 'story_data', label: 'Story Data', description: 'Impact stories and testimonials' },
  { value: 'community_data', label: 'Community Data', description: 'Community forums and discussions' },
  { value: 'analytics_data', label: 'Analytics Data', description: 'Usage and engagement metrics' },
  { value: 'user_statistics', label: 'User Statistics', description: 'Aggregated user behavior data' },
  { value: 'performance_metrics', label: 'Performance Metrics', description: 'System performance data' }
];

const governmentLevels = [
  { value: 'federal', label: 'Federal Government' },
  { value: 'state', label: 'State Government' },
  { value: 'local', label: 'Local Government' },
  { value: 'international', label: 'International Organization' }
];

const integrationTypes = [
  { value: 'rest_api', label: 'REST API', description: 'Real-time API access' },
  { value: 'webhook', label: 'Webhooks', description: 'Event-driven notifications' },
  { value: 'bulk_export', label: 'Bulk Export', description: 'Scheduled data exports' },
  { value: 'real_time', label: 'Real-time Stream', description: 'Live data streaming' }
];

const dataFormats = [
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'csv', label: 'CSV' }
];

const securityRequirements = [
  'encryption_in_transit',
  'encryption_at_rest',
  'multi_factor_authentication',
  'ip_whitelisting',
  'audit_logging',
  'data_anonymization',
  'gdpr_compliance',
  'hipaa_compliance'
];

export const GovernmentAccessRequestForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AccessRequestData>>({
    organization: '',
    contactPerson: '',
    email: '',
    phone: '',
    purpose: '',
    dataTypes: [],
    justification: '',
    estimatedUsage: {
      requestsPerDay: 100,
      requestsPerMonth: 3000,
      dataRetentionPeriod: 12
    },
    technicalDetails: {
      integrationType: 'rest_api',
      securityRequirements: [],
      dataFormat: 'json',
      expectedResponseTime: '< 1 second'
    },
    governmentLevel: 'federal',
    department: '',
    authorizedOfficials: [
      {
        name: '',
        title: '',
        email: '',
        phone: ''
      }
    ]
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleDataTypeToggle = (dataType: string) => {
    const currentTypes = formData.dataTypes || [];
    const newTypes = currentTypes.includes(dataType)
      ? currentTypes.filter((type: any) => type !== dataType)
      : [...currentTypes, dataType];
    
    handleInputChange('dataTypes', newTypes);
  };

  const handleSecurityRequirementToggle = (requirement: string) => {
    const currentRequirements = formData.technicalDetails?.securityRequirements || [];
    const newRequirements = currentRequirements.includes(requirement)
      ? currentRequirements.filter((req: any) => req !== requirement)
      : [...currentRequirements, requirement];
    
    handleNestedInputChange('technicalDetails', 'securityRequirements', newRequirements);
  };

  const handleOfficialChange = (index: number, field: string, value: string) => {
    const newOfficials = [...(formData.authorizedOfficials || [])];
    newOfficials[index] = {
      ...newOfficials[index],
      [field]: value
    };
    handleInputChange('authorizedOfficials', newOfficials);
  };

  const addOfficial = () => {
    const newOfficials = [
      ...(formData.authorizedOfficials || []),
      { name: '', title: '', email: '', phone: '' }
    ];
    handleInputChange('authorizedOfficials', newOfficials);
  };

  const removeOfficial = (index: number) => {
    const newOfficials = formData.authorizedOfficials?.filter((_: any, i: any) => i !== index) || [];
    handleInputChange('authorizedOfficials', newOfficials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await accessRequestAPI.submitAccessRequest(formData as AccessRequestData);
      setSubmitSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit access request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully</h2>
          <p className="text-gray-600 mb-4">
            Your government data access request has been submitted and is under review.
            You will receive an email notification with updates on your request status.
          </p>
          <Button onClick={() => {
            setSubmitSuccess(false);
            setFormData({
              organization: '',
              contactPerson: '',
              email: '',
              phone: '',
              purpose: '',
              dataTypes: [],
              justification: '',
              estimatedUsage: {
                requestsPerDay: 100,
                requestsPerMonth: 3000,
                dataRetentionPeriod: 12
              },
              technicalDetails: {
                integrationType: 'rest_api',
                securityRequirements: [],
                dataFormat: 'json',
                expectedResponseTime: '< 1 second'
              },
              governmentLevel: 'federal',
              department: '',
              authorizedOfficials: [
                {
                  name: '',
                  title: '',
                  email: '',
                  phone: ''
                }
              ]
            });
          }}>
            Submit Another Request
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Government Data Access Request
          </h1>
          <p className="text-gray-600">
            Submit a formal request for access to CareConnect platform data for official government purposes.
            All requests are reviewed by our API administration team and require approval.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="organization">
                  Organization Name *
                </label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e: any) => handleInputChange('organization', e.target.value)}
                  placeholder="Department of Health and Human Services"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="governmentLevel">
                  Government Level *
                </label>
                <select
                  id="governmentLevel"
                  value={formData.governmentLevel}
                  onChange={(e: any) => handleInputChange('governmentLevel', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {governmentLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="department">
                  Department/Division *
                </label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e: any) => handleInputChange('department', e.target.value)}
                  placeholder="Public Health Data Division"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Primary Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contactPerson">
                  Contact Person *
                </label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e: any) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Dr. Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: any) => handleInputChange('email', e.target.value)}
                  placeholder="jane.smith@agency.gov"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e: any) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Details
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="purpose">
                Purpose of Data Access *
              </label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e: any) => handleInputChange('purpose', e.target.value)}
                placeholder="Describe the specific purpose and intended use of the data..."
                required
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="justification">
                Legal Justification *
              </label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e: any) => handleInputChange('justification', e.target.value)}
                placeholder="Provide legal authority and justification for this data request..."
                required
                rows={3}
              />
            </div>
          </div>

          {/* Data Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Requested Data Types *</h3>
            <p className="text-sm text-gray-600">Select all data types you need access to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dataTypeOptions.map(option => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.dataTypes?.includes(option.value)
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => handleDataTypeToggle(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {formData.dataTypes?.includes(option.value) && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Estimates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estimated Usage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="requestsPerDay">
                  Requests per Day
                </label>
                <Input
                  id="requestsPerDay"
                  type="number"
                  value={formData.estimatedUsage?.requestsPerDay}
                  onChange={(e: any) => handleNestedInputChange('estimatedUsage', 'requestsPerDay', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="requestsPerMonth">
                  Requests per Month
                </label>
                <Input
                  id="requestsPerMonth"
                  type="number"
                  value={formData.estimatedUsage?.requestsPerMonth}
                  onChange={(e: any) => handleNestedInputChange('estimatedUsage', 'requestsPerMonth', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dataRetentionPeriod">
                  Data Retention (months)
                </label>
                <Input
                  id="dataRetentionPeriod"
                  type="number"
                  value={formData.estimatedUsage?.dataRetentionPeriod}
                  onChange={(e: any) => handleNestedInputChange('estimatedUsage', 'dataRetentionPeriod', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="integrationType">
                  Integration Type *
                </label>
                <select
                  id="integrationType"
                  value={formData.technicalDetails?.integrationType}
                  onChange={(e: any) => handleNestedInputChange('technicalDetails', 'integrationType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {integrationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dataFormat">
                  Data Format *
                </label>
                <select
                  id="dataFormat"
                  value={formData.technicalDetails?.dataFormat}
                  onChange={(e: any) => handleNestedInputChange('technicalDetails', 'dataFormat', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {dataFormats.map(format => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expectedResponseTime">
                  Expected Response Time
                </label>
                <Input
                  id="expectedResponseTime"
                  value={formData.technicalDetails?.expectedResponseTime}
                  onChange={(e: any) => handleNestedInputChange('technicalDetails', 'expectedResponseTime', e.target.value)}
                  placeholder="< 1 second"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security Requirements</label>
              <p className="text-sm text-gray-600 mb-2">Select all applicable security requirements:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {securityRequirements.map(requirement => (
                  <div
                    key={requirement}
                    className={`p-2 text-sm border rounded cursor-pointer transition-colors ${
                      formData.technicalDetails?.securityRequirements?.includes(requirement)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSecurityRequirementToggle(requirement)}
                  >
                    {requirement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Authorized Officials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Authorized Officials</h3>
            <p className="text-sm text-gray-600">Provide details of officials authorized to access this data:</p>
            {formData.authorizedOfficials?.map((official, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`official-name-${index}`}>
                      Name *
                    </label>
                    <Input
                      id={`official-name-${index}`}
                      value={official.name}
                      onChange={(e: any) => handleOfficialChange(index, 'name', e.target.value)}
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`official-title-${index}`}>
                      Title *
                    </label>
                    <Input
                      id={`official-title-${index}`}
                      value={official.title}
                      onChange={(e: any) => handleOfficialChange(index, 'title', e.target.value)}
                      placeholder="Director of Data Analytics"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`official-email-${index}`}>
                      Email *
                    </label>
                    <Input
                      id={`official-email-${index}`}
                      type="email"
                      value={official.email}
                      onChange={(e: any) => handleOfficialChange(index, 'email', e.target.value)}
                      placeholder="john.doe@agency.gov"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`official-phone-${index}`}>
                      Phone *
                    </label>
                    <Input
                      id={`official-phone-${index}`}
                      value={official.phone}
                      onChange={(e: any) => handleOfficialChange(index, 'phone', e.target.value)}
                      placeholder="+1 (555) 987-6543"
                      required
                    />
                  </div>
                </div>
                {formData.authorizedOfficials && formData.authorizedOfficials.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => removeOfficial(index)}
                  >
                    Remove Official
                  </Button>
                )}
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addOfficial}
            >
              Add Another Official
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Access Request'}
          </Button>
        </form>
      </Card>
    </div>
  );
};