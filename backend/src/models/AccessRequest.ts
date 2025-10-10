import { Schema, model, Document, Types } from 'mongoose';

export interface IAccessRequest extends Document {
  _id: Types.ObjectId;
  organization: string;
  contactPerson: string;
  email: string;
  phone?: string;
  purpose: string;
  dataTypes: string[];
  justification: string;
  estimatedUsage: {
    requestsPerMonth: number;
    duration: string; // e.g., "6 months", "1 year", "ongoing"
  };
  technicalDetails: {
    apiIntegrationMethod: string;
    dataProcessingLocation: string;
    securityMeasures: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'email_submitted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reviewNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  apiKeyGenerated?: Types.ObjectId;
  requestedAt: Date;
  expiresAt?: Date;
  governmentLevel: 'federal' | 'state' | 'local' | 'municipal';
  department: string;
  authorizedOfficials: Array<{
    name: string;
    title: string;
    email: string;
    phone?: string;
  }>;
}

const AccessRequestSchema = new Schema<IAccessRequest>({
  organization: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    trim: true,
    match: /^[\+]?[1-9][\d]{0,15}$/
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  dataTypes: [{
    type: String,
    enum: [
      'volunteer_data',
      'ngo_data',
      'campaign_data',
      'event_data',
      'story_data',
      'community_data',
      'analytics_data',
      'user_statistics',
      'performance_metrics'
    ],
    required: true
  }],
  justification: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  estimatedUsage: {
    requestsPerMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000
    },
    duration: {
      type: String,
      required: true,
      enum: ['1 month', '3 months', '6 months', '1 year', '2 years', 'ongoing']
    }
  },
  technicalDetails: {
    apiIntegrationMethod: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    dataProcessingLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    securityMeasures: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review', 'email_submitted'],
    default: 'pending',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  apiKeyGenerated: {
    type: Schema.Types.ObjectId,
    ref: 'APIKey'
  },
  requestedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiresAt: {
    type: Date
  },
  governmentLevel: {
    type: String,
    enum: ['federal', 'state', 'local', 'municipal'],
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  authorizedOfficials: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: String,
      trim: true,
      match: /^[\+]?[1-9][\d]{0,15}$/
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
AccessRequestSchema.index({ status: 1, requestedAt: -1 });
AccessRequestSchema.index({ organization: 1 });
AccessRequestSchema.index({ email: 1 });
AccessRequestSchema.index({ governmentLevel: 1, department: 1 });
AccessRequestSchema.index({ reviewedBy: 1 }, { sparse: true });

// Virtual for calculating request age
AccessRequestSchema.virtual('ageInDays').get(function(this: IAccessRequest) {
  return Math.floor((Date.now() - this.requestedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for checking if request is expired
AccessRequestSchema.virtual('isExpired').get(function(this: IAccessRequest) {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

// Pre-save middleware to set expiration date
AccessRequestSchema.pre('save', function(this: IAccessRequest, next) {
  // Set default expiration to 30 days if not set
  if (!this.expiresAt && this.status === 'pending') {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

// Static method to get pending requests count
AccessRequestSchema.statics.getPendingCount = function() {
  return this.countDocuments({ status: 'pending' });
};

// Static method to get requests by status
AccessRequestSchema.statics.getByStatus = function(status: string, limit = 20, skip = 0) {
  return this.find({ status })
    .sort({ requestedAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('reviewedBy', 'username email')
    .populate('apiKeyGenerated', 'name key status');
};

export const AccessRequest = model<IAccessRequest>('AccessRequest', AccessRequestSchema);
export default AccessRequest;