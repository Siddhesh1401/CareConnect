import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  ngoId: mongoose.Types.ObjectId;
  ngoName: string;
  category: string;
  target: number;
  raised: number;
  donors: number;
  daysLeft: number;
  image?: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'draft';
  createdDate: Date;
  updatedDate: Date;
  endDate: Date;
  tags?: string[];
  updates?: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    images?: string[];
  }>;
  donations?: Array<{
    id: string;
    donorId: mongoose.Types.ObjectId;
    donorName: string;
    amount: number;
    message?: string;
    createdAt: Date;
    isAnonymous: boolean;
  }>;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  impactMetrics?: {
    peopleHelped?: number;
    resourcesDistributed?: number;
    areaCovered?: string;
    milestones?: Array<{
      title: string;
      achieved: boolean;
      achievedDate?: Date;
    }>;
  };
}

const CampaignSchema = new Schema<ICampaign>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngoName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'children', 'elderly', 'disability', 'other']
  },
  target: {
    type: Number,
    required: true,
    min: 1
  },
  raised: {
    type: Number,
    default: 0,
    min: 0
  },
  donors: {
    type: Number,
    default: 0,
    min: 0
  },
  daysLeft: {
    type: Number,
    default: 30
  },
  image: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'draft'],
    default: 'active'
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  updates: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    images: [{
      type: String
    }]
  }],
  donations: [{
    id: {
      type: String,
      required: true
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    donorName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    message: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  }],
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    website: String
  },
  impactMetrics: {
    peopleHelped: Number,
    resourcesDistributed: Number,
    areaCovered: String,
    milestones: [{
      title: {
        type: String,
        required: true
      },
      achieved: {
        type: Boolean,
        default: false
      },
      achievedDate: Date
    }]
  }
});

// Update the updatedDate field before saving
CampaignSchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Calculate daysLeft before saving
CampaignSchema.pre('save', function(next) {
  const now = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate.getTime() - now.getTime();
  this.daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  next();
});

// Index for better query performance
CampaignSchema.index({ ngoId: 1, status: 1 });
CampaignSchema.index({ category: 1, status: 1 });
CampaignSchema.index({ createdDate: -1 });
CampaignSchema.index({ endDate: 1 });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
