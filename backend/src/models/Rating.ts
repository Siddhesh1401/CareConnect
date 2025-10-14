import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  userId: mongoose.Types.ObjectId;
  ngoId: mongoose.Types.ObjectId;
  rating: number;
  feedback?: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'NGO ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    feedback: {
      type: String,
      maxlength: [500, 'Feedback cannot exceed 500 characters'],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one rating per user per NGO
RatingSchema.index({ userId: 1, ngoId: 1 }, { unique: true });

export default mongoose.model<IRating>('Rating', RatingSchema);
