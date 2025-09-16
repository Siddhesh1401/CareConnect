import React, { useState } from 'react';
import { Send, Filter, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { broadcastAPI } from '../services/api';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface BroadcastFormData {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetFilters: {
    status?: 'active' | 'inactive';
    skills?: string[];
    location?: string;
  };
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<BroadcastFormData>({
    subject: '',
    message: '',
    priority: 'medium',
    targetFilters: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (field: keyof BroadcastFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (filterField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      targetFilters: {
        ...prev.targetFilters,
        [filterField]: value
      }
    }));
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = formData.targetFilters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];

    handleFilterChange('skills', newSkills.length > 0 ? newSkills : undefined);
  };

  const validateForm = (): boolean => {
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Message is required');
      return false;
    }
    if (formData.subject.length > 200) {
      setError('Subject must be less than 200 characters');
      return false;
    }
    if (formData.message.length > 5000) {
      setError('Message must be less than 5000 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Check if any filters are actually applied
    const hasActiveFilters = formData.targetFilters && (
      formData.targetFilters.status ||
      (formData.targetFilters.skills && formData.targetFilters.skills.length > 0) ||
      formData.targetFilters.location
    );

    try {
      // Prepare data to send - only include targetFilters if they have values
      const dataToSend = {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        priority: formData.priority,
        ...(hasActiveFilters && { targetFilters: formData.targetFilters })
      };

      console.log('Sending broadcast data:', dataToSend); // Debug log

      const response = await broadcastAPI.sendBroadcast(dataToSend);

      if (response.success) {
        setSuccess(`Broadcast sent successfully to ${response.data.broadcast.recipientCount} volunteers!`);
        setFormData({
          subject: '',
          message: '',
          priority: 'medium',
          targetFilters: {}
        });

        // Close modal after success
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 2000);
      } else {
        setError(response.message || 'Failed to send broadcast');
      }
    } catch (err: any) {
      console.error('Broadcast error:', err);
      setError(err.response?.data?.message || 'Failed to send broadcast. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSkills = [
    'Environmental', 'Community Service', 'Education', 'Healthcare',
    'Animal Welfare', 'Disaster Relief', 'Youth Programs', 'Elderly Care'
  ];

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Broadcast Message"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <Input
            label="Subject"
            placeholder="Enter broadcast subject..."
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            maxLength={200}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.subject.length}/200 characters
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <Textarea
            placeholder="Enter your broadcast message..."
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={6}
            maxLength={5000}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.message.length}/5000 characters
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => handleInputChange('priority', priority)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                  formData.priority === priority
                    ? priorityColors[priority]
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Target Filters (Optional)</h4>
            </div>
            {showFilters ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {showFilters && (
            <div className="space-y-4">
              {/* Status Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volunteer Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('status', undefined)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      !formData.targetFilters.status
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Volunteers
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterChange('status', 'active')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.targetFilters.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Active Only
                  </button>
                </div>
              </div>

              {/* Skills Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (Select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => {
                    const isSelected = formData.targetFilters.skills?.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <Input
                  label="Location (City)"
                  placeholder="Filter by city..."
                  value={formData.targetFilters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">{success}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              'Sending...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};