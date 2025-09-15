import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { api } from '../services/api';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'event' | 'campaign' | 'community' | 'ngo' | 'story';
  targetId: string;
  targetName: string;
}

interface ReportReason {
  type: string;
  reasons: string[];
}

const ReportForm: React.FC<ReportFormProps> = ({
  isOpen,
  onClose,
  type,
  targetId,
  targetName
}) => {
  const [reasons, setReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && type) {
      fetchReportReasons();
    }
  }, [isOpen, type]);

  const fetchReportReasons = async () => {
    try {
      const response = await api.get(`/reports/reasons/${type}`);
      setReasons(response.data.data.reasons);
    } catch (error) {
      console.error('Error fetching report reasons:', error);
      setError('Failed to load report reasons');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason || !description.trim()) {
      setError('Please select a reason and provide a description');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/reports', {
        type,
        targetId,
        reason: selectedReason,
        description: description.trim()
      });

      // Reset form
      setSelectedReason('');
      setDescription('');
      onClose();

      // Show success message (you might want to use a toast notification here)
      alert('Report submitted successfully');

    } catch (error: any) {
      console.error('Error submitting report:', error);
      setError(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    setError('');
    onClose();
  };

  const getTypeDisplayName = (type: string) => {
    const names = {
      event: 'Event',
      campaign: 'Campaign',
      community: 'Community',
      ngo: 'NGO',
      story: 'Story'
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Report ${getTypeDisplayName(type)}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            You are reporting: <strong>{targetName}</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for report *
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a reason</option>
            {reasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide details about why you are reporting this content..."
            rows={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific and provide as much detail as possible to help us understand the issue.
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !selectedReason || !description.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportForm;