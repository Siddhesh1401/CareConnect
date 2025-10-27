import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Tag, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

interface APIKey {
  id: string;
  name: string;
  key: string;
  organization: string;
  status: 'active' | 'revoked' | 'expired' | 'paused';
  permissions: string[];
  expiresAt?: string;
  notes?: string;
  tags?: string[];
}

interface EditKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: APIKey | null;
  onSave: (updates: Partial<APIKey>) => Promise<void>;
}

const AVAILABLE_PERMISSIONS = [
  'read:volunteers',
  'read:ngos',
  'read:events',
  'read:campaigns',
];

export const EditKeyModal: React.FC<EditKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSave,
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setPermissions(apiKey.permissions || []);
      setExpiresAt(apiKey.expiresAt ? apiKey.expiresAt.split('T')[0] : '');
      setNotes(apiKey.notes || '');
      setTags(apiKey.tags || []);
    }
  }, [apiKey]);

  if (!isOpen || !apiKey) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        permissions,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        notes,
        tags,
      });
      onClose();
    } catch (error) {
      console.error('Error saving key:', error);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const hasChanges = () => {
    return (
      JSON.stringify(permissions.sort()) !== JSON.stringify((apiKey.permissions || []).sort()) ||
      expiresAt !== (apiKey.expiresAt ? apiKey.expiresAt.split('T')[0] : '') ||
      notes !== (apiKey.notes || '') ||
      JSON.stringify(tags.sort()) !== JSON.stringify((apiKey.tags || []).sort())
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit API Key</h2>
            <p className="text-sm text-gray-600 mt-1">{apiKey.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Permissions
            </label>
            <div className="space-y-2">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {permissions.length} of {AVAILABLE_PERMISSIONS.length} permissions selected
            </p>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Expiration Date
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {expiresAt
                ? `Key will expire on ${new Date(expiresAt).toLocaleDateString()}`
                : 'No expiration date set (key never expires)'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this API key..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Internal notes (not visible to key holder)
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Tags help organize and categorize API keys
            </p>
          </div>

          {/* Status Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`font-medium ${
                  apiKey.status === 'active' ? 'text-green-600' :
                  apiKey.status === 'paused' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {apiKey.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Organization:</span>
                <span className="font-medium text-gray-900">{apiKey.organization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Key ID:</span>
                <span className="font-mono text-xs text-gray-900">{apiKey.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {hasChanges() ? (
              <span className="text-yellow-600 font-medium">● Unsaved changes</span>
            ) : (
              <span className="text-gray-500">No changes</span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button onClick={onClose} variant="outline" disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saving || !hasChanges()}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
