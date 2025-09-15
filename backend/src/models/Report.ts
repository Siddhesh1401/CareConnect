import mongoose, { Document, Schema } from 'mongoose';

export type ReportType = 'event' | 'campaign' | 'community' | 'ngo' | 'story';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'rejected';

export interface IReport extends Document {
  type: ReportType;
  targetId: mongoose.Types.ObjectId; // ID of the reported item
  reporterId: mongoose.Types.ObjectId; // User who reported
  reason: string; // Specific reason based on type
  description: string; // Detailed description
  status: ReportStatus;
  adminResponse?: string; // Admin's response when resolving
  resolvedBy?: mongoose.Types.ObjectId; // Admin who resolved it
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  type: {
    type: String,
    enum: ['event', 'campaign', 'community', 'ngo', 'story'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  reporterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    type: String
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
ReportSchema.index({ type: 1, status: 1 });
ReportSchema.index({ reporterId: 1 });
ReportSchema.index({ createdAt: -1 });

export default mongoose.model<IReport>('Report', ReportSchema);