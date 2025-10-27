import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  action: string; // 'generate_key', 'revoke_key', 'approve_request', 'reject_request', 'edit_key', 'pause_key', 'resume_key'
  performedBy: mongoose.Types.ObjectId; // User who performed the action
  targetType: 'api_key' | 'access_request'; // What was affected
  targetId: string; // ID of the affected resource
  targetName: string; // Name/description of the affected resource
  details?: any; // Additional details about the action
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
    enum: [
      'generate_key',
      'revoke_key',
      'approve_request',
      'reject_request',
      'edit_key',
      'pause_key',
      'resume_key',
      'bulk_revoke_keys',
      'bulk_approve_requests',
      'bulk_reject_requests'
    ]
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['api_key', 'access_request']
  },
  targetId: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
