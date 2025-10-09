import React from 'react';
import { X, Mail, AlertTriangle, Users, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface EventCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  volunteerCount: number;
  onDeleteAndSendEmail: (message: string) => void;
}

export const EventCancellationModal: React.FC<EventCancellationModalProps> = ({
  isOpen,
  onClose,
  eventTitle,
  volunteerCount,
  onDeleteAndSendEmail
}) => {
  const [customMessage, setCustomMessage] = React.useState('');

  // Default cancellation message
  const defaultMessage = `We regret to inform you that the "${eventTitle}" event has been cancelled due to unforeseen circumstances. We sincerely apologize for any inconvenience this may cause and appreciate your understanding.

Please don't let this discourage you from volunteering! There are many other exciting opportunities available on our platform. We look forward to seeing you at future events.

Thank you for your continued support and enthusiasm for our cause.`;

  // Initialize with default message when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCustomMessage(defaultMessage);
    }
  }, [isOpen, defaultMessage]);

  const handleDeleteAndSend = () => {
    onDeleteAndSendEmail(customMessage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Event & Notify Volunteers
              </h3>
              <p className="text-sm text-gray-500">
                Send cancellation email to {volunteerCount} registered volunteer{volunteerCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-1">Event to be deleted:</h4>
            <p className="text-blue-800 font-semibold">{eventTitle}</p>
            <div className="flex items-center mt-2 text-sm text-blue-700">
              <Users className="w-4 h-4 mr-1" />
              <span>{volunteerCount} registered volunteer{volunteerCount !== 1 ? 's' : ''} will be notified</span>
            </div>
          </div>

          {/* Email Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Cancellation Message
            </label>
            <p className="text-xs text-gray-500 mb-3">
              This message will be sent to all registered volunteers. You can customize it or use the default message.
            </p>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              placeholder="Enter your cancellation message..."
              style={{
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {customMessage.length} characters
              </span>
              <button
                onClick={() => setCustomMessage(defaultMessage)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset to default
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-yellow-800 mb-1">Warning</h5>
                <p className="text-sm text-yellow-700">
                  This action cannot be undone. The event will be permanently deleted and cancellation emails will be sent to all registered volunteers immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAndSend}
            className="px-6 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
            disabled={!customMessage.trim()}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete and Send Email
          </Button>
        </div>
      </div>
    </div>
  );
};