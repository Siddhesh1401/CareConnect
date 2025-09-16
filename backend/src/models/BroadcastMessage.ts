import mongoose, { Document, Schema } from 'mongoose';

export interface IBroadcastMessage extends Document {
  ngoId: mongoose.Types.ObjectId;
  ngoName: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetFilters: {
    status?: 'active' | 'inactive';
    skills?: string[];
    minEventsJoined?: number;
    location?: string;
  };
  recipientIds: mongoose.Types.ObjectId[]; // Volunteer IDs who should receive it
  deliveredIds: mongoose.Types.ObjectId[]; // Volunteers who actually received it
  readIds: mongoose.Types.ObjectId[]; // Volunteers who read it
  repliedIds: mongoose.Types.ObjectId[]; // Volunteers who replied
  stats: {
    totalRecipients: number;
    totalDelivered: number;
    totalRead: number;
    totalReplied: number;
    deliveryRate: number;
    readRate: number;
    replyRate: number;
  };
  scheduledFor?: Date; // For future scheduling
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const broadcastMessageSchema = new Schema<IBroadcastMessage>({
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngoName: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 5000 // Longer for broadcasts
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetFilters: {
    status: {
      type: String,
      enum: ['active', 'inactive']
    },
    skills: [{
      type: String,
      trim: true
    }],
    minEventsJoined: {
      type: Number,
      min: 0
    },
    location: {
      type: String,
      trim: true
    }
  },
  recipientIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  deliveredIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  readIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  repliedIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  stats: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    totalDelivered: {
      type: Number,
      default: 0
    },
    totalRead: {
      type: Number,
      default: 0
    },
    totalReplied: {
      type: Number,
      default: 0
    },
    deliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    readRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    replyRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes for better performance
broadcastMessageSchema.index({ ngoId: 1 });
broadcastMessageSchema.index({ status: 1 });
broadcastMessageSchema.index({ priority: 1 });
broadcastMessageSchema.index({ sentAt: -1 });
broadcastMessageSchema.index({ scheduledFor: 1 });
broadcastMessageSchema.index({ 'targetFilters.status': 1 });
broadcastMessageSchema.index({ 'targetFilters.skills': 1 });

// Pre-save middleware to calculate stats
broadcastMessageSchema.pre('save', function(next) {
  if (this.recipientIds && this.recipientIds.length > 0) {
    this.stats.totalRecipients = this.recipientIds.length;
  }

  if (this.deliveredIds && this.deliveredIds.length > 0) {
    this.stats.totalDelivered = this.deliveredIds.length;
    this.stats.deliveryRate = Math.round((this.deliveredIds.length / this.stats.totalRecipients) * 100);
  }

  if (this.readIds && this.readIds.length > 0) {
    this.stats.totalRead = this.readIds.length;
    this.stats.readRate = Math.round((this.readIds.length / this.stats.totalRecipients) * 100);
  }

  if (this.repliedIds && this.repliedIds.length > 0) {
    this.stats.totalReplied = this.repliedIds.length;
    this.stats.replyRate = Math.round((this.repliedIds.length / this.stats.totalRecipients) * 100);
  }

  next();
});

export default mongoose.model<IBroadcastMessage>('BroadcastMessage', broadcastMessageSchema);