import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'volunteer' | 'ngo_admin' | 'admin';
  isVerified: boolean;
  profilePicture?: string;
  phone?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Volunteer specific fields
  skills?: string[];
  interests?: string[];
  availability?: {
    days: string[];
    timeSlots: string[];
  };
  points?: number;
  level?: number;
  achievements?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedDate: Date;
    points: number;
  }[];
  
  // NGO specific fields
  organizationName?: string;
  organizationType?: string;
  registrationNumber?: string;
  foundedYear?: number;
  website?: string;
  description?: string;
  documents?: {
    registrationCertificate?: {
      filename?: string;
      status?: 'pending' | 'approved' | 'rejected';
      rejectionReason?: string;
    };
    taxExemptionCertificate?: {
      filename?: string;
      status?: 'pending' | 'approved' | 'rejected';
      rejectionReason?: string;
    };
    organizationalLicense?: {
      filename?: string;
      status?: 'pending' | 'approved' | 'rejected';
      rejectionReason?: string;
    };
  };
  isNGOVerified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  rejectionHistory?: Array<{
    documentType: string;
    reason: string;
    rejectedAt: Date;
  }>;

  // Email verification
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  emailVerificationAttempts: number;
  
  // Password reset
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  
  // Timestamps
  joinedDate: Date;
  lastActive?: Date;
  
  // Account status
  isActive: boolean;
  accountStatus: 'active' | 'suspended' | 'deleted';
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['volunteer', 'ngo_admin', 'admin'],
    required: [true, 'Role is required'],
    default: 'volunteer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Volunteer specific fields
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      type: String
    }]
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  achievements: [{
    id: String,
    title: String,
    description: String,
    icon: String,
    earnedDate: {
      type: Date,
      default: Date.now
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  
  // NGO specific fields
  organizationName: {
    type: String,
    trim: true
  },
  organizationType: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  foundedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  documents: {
    registrationCertificate: {
      filename: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      rejectionReason: String
    },
    taxExemptionCertificate: {
      filename: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      rejectionReason: String
    },
    organizationalLicense: {
      filename: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      rejectionReason: String
    }
  },
  isNGOVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  rejectionHistory: [{
    documentType: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    rejectedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    sparse: true
  },
  emailVerificationExpires: {
    type: Date,
    sparse: true
  },
  emailVerificationAttempts: {
    type: Number,
    default: 0,
    max: 5,
    required: true
  },
  
  // Password reset
  passwordResetCode: {
    type: String,
    sparse: true
  },
  passwordResetExpires: {
    type: Date,
    sparse: true
  },
  
  // Timestamps
  joinedDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });

// Pre-save middleware to update lastActive and set verification status
userSchema.pre('save', function(next: any) {
  if (this.isNew || this.isModified()) {
    this.lastActive = new Date();
    
    // Set verification status based on role for new users
    if (this.isNew && !this.verificationStatus) {
      this.verificationStatus = this.role === 'ngo_admin' ? 'pending' : 'approved';
    }
  }
  next();
});

// Instance method to check if user is NGO admin
userSchema.methods.isNGOAdmin = function(): boolean {
  return this.role === 'ngo_admin';
};

// Instance method to check if user is admin
userSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin';
};

// Instance method to check if user is volunteer
userSchema.methods.isVolunteer = function(): boolean {
  return this.role === 'volunteer';
};

export default mongoose.model<IUser>('User', userSchema);
