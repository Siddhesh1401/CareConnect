import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  organizerId: mongoose.Types.ObjectId;
  organizerName: string;
  organizationName: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  capacity: number;
  registeredVolunteers: {
    userId: mongoose.Types.ObjectId;
    userName: string;
    userEmail: string;
    registrationDate: Date;
    status: 'confirmed' | 'waitlist' | 'cancelled';
  }[];
  requirements?: string;
  whatToExpect?: string;
  images?: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Environment', 'Education', 'Healthcare', 'Community Development', 'Animal Welfare', 'Disaster Relief', 'Women Empowerment', 'Youth Development']
  },
  organizerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: {
    type: String,
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  registeredVolunteers: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'waitlist', 'cancelled'],
      default: 'confirmed'
    }
  }],
  requirements: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  whatToExpect: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better performance
EventSchema.index({ organizerId: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ 'location.city': 1 });

// Virtual for available spots
EventSchema.virtual('availableSpots').get(function() {
  const confirmedVolunteers = this.registeredVolunteers.filter(v => v.status === 'confirmed').length;
  return this.capacity - confirmedVolunteers;
});

// Virtual for registration status
EventSchema.virtual('registrationStatus').get(function() {
  const confirmedVolunteers = this.registeredVolunteers.filter(v => v.status === 'confirmed').length;
  if (confirmedVolunteers >= this.capacity) {
    return 'full';
  } else if (confirmedVolunteers >= this.capacity * 0.8) {
    return 'filling_fast';
  } else {
    return 'open';
  }
});

const Event = mongoose.model<IEvent>('Event', EventSchema);

export default Event;
