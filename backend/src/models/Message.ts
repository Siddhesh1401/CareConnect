import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'partnership' | 'support' | 'feedback' | 'other';
  adminResponse?: string;
  responseTimestamp?: Date;
  conversation: {
    messages: Array<{
      id: string;
      sender: 'user' | 'admin';
      message: string;
      timestamp: Date;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for anonymous users
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  userPhone: {
    type: String,
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
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'closed'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['technical', 'partnership', 'support', 'feedback', 'other'],
    default: 'other'
  },
  adminResponse: {
    type: String,
    maxlength: 2000
  },
  responseTimestamp: {
    type: Date
  },
  conversation: {
    messages: [{
      id: {
        type: String,
        required: true
      },
      sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
      },
      message: {
        type: String,
        required: true,
        maxlength: 2000
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ userId: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ priority: 1 });
messageSchema.index({ category: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);