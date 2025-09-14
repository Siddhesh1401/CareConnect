import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId; // Reference to User
  date: Date;
  likes: mongoose.Types.ObjectId[]; // Array of user IDs who liked
  comments: {
    id: string;
    content: string;
    author: mongoose.Types.ObjectId;
    date: Date;
    likes: mongoose.Types.ObjectId[]; // Array of user IDs who liked the comment
  }[];
  image?: string;
}

export interface ICommunity extends Document {
  name: string;
  description: string;
  category: string;
  image?: string;
  createdBy: mongoose.Types.ObjectId; // NGO admin who created it
  members: mongoose.Types.ObjectId[]; // Array of user IDs
  posts: IPost[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    id: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Array of user IDs who liked the comment
  }],
  image: { type: String }
});

const CommunitySchema = new Schema<ICommunity>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  posts: [PostSchema],
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICommunity>('Community', CommunitySchema);