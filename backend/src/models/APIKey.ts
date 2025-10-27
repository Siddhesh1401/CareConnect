import mongoose, { Document, Schema } from 'mongoose';

export interface UsageLog {
  timestamp: Date;
  endpoint: string;
  method: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAPIKey extends Document {
  name: string;
  key: string;
  organization: string;
  status: 'active' | 'revoked' | 'expired' | 'paused';
  permissions: string[];
  usageCount: number;
  lastUsed?: Date;
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId; // Reference to User who created it
  revokedAt?: Date;
  revokedBy?: mongoose.Types.ObjectId;
  pausedAt?: Date;
  pausedBy?: mongoose.Types.ObjectId;
  notes?: string;
  tags?: string[];
  usageLogs: UsageLog[];
  createdAt: Date;
  updatedAt: Date;
}

const APIKeySchema = new Schema<IAPIKey>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired', 'paused'],
    default: 'active'
  },
  permissions: [{
    type: String,
    enum: [
      'read:volunteers',
      'read:ngos',
      'read:events',
      'read:campaigns',
      'read:communities',
      'read:stories',
      'read:reports',
      'write:volunteers',
      'write:ngos',
      'write:events',
      'write:campaigns',
      'write:communities',
      'write:stories',
      'write:reports'
    ]
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  pausedAt: {
    type: Date
  },
  pausedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  tags: [{
    type: String
  }],
  usageLogs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    endpoint: String,
    method: String,
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Index for efficient lookups
APIKeySchema.index({ key: 1 });
APIKeySchema.index({ status: 1 });
APIKeySchema.index({ createdBy: 1 });
APIKeySchema.index({ createdAt: -1 });

export const APIKey = mongoose.model<IAPIKey>('APIKey', APIKeySchema);