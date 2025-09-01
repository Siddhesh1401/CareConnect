export interface User {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo_admin' | 'admin';
  avatar?: string;
  points?: number;
  achievements?: Achievement[];
  joinedDate: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: Date;
  points: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  ngoId: string;
  ngoName: string;
  capacity: number;
  registered: number;
  image: string;
  category: string;
  isRegistered?: boolean;
}

export interface NGO {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  location: string;
  verified: boolean;
  totalEvents: number;
  totalVolunteers: number;
  totalDonations: number;
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: Date;
  category: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: User;
  date: Date;
  likes: number;
  comments: Comment[];
  image?: string;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  date: Date;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  image: string;
  category: string;
  isJoined?: boolean;
}