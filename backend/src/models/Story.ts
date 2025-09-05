import mongoose, { Document, Schema } from 'mongoose';

export interface IStory extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  author: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role: 'volunteer' | 'ngo_admin';
    avatar?: string;
    organizationName?: string;
  };
  category: 'education' | 'environment' | 'healthcare' | 'community' | 'success' | 'other';
  status: 'draft' | 'published' | 'pending_review';
  tags?: string[];
  readTime?: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdDate: Date;
  updatedDate: Date;
  publishedDate?: Date;
  featured: boolean;
}

const StorySchema = new Schema<IStory>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    trim: true
  },
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['volunteer', 'ngo_admin'],
      required: true
    },
    avatar: String,
    organizationName: String
  },
  category: {
    type: String,
    enum: ['education', 'environment', 'healthcare', 'community', 'success', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'pending_review'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTime: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  },
  publishedDate: Date,
  featured: {
    type: Boolean,
    default: false
  }
});

// Update the updatedDate on save
StorySchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Calculate read time based on content length
StorySchema.pre('save', function(next) {
  if (this.content) {
    // Average reading speed: 200 words per minute
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  next();
});

// Index for search and filtering
StorySchema.index({ title: 'text', excerpt: 'text', content: 'text' });
StorySchema.index({ category: 1, status: 1, createdDate: -1 });
StorySchema.index({ 'author.id': 1 });

export default mongoose.model<IStory>('Story', StorySchema);
