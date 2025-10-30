import mongoose from 'mongoose';
import Event from '../src/models/Event.js';
import User from '../src/models/User.js';

const sampleEvents = [
  {
    title: 'Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup to remove plastic waste and preserve our coastal environment. We\'ll provide gloves, bags, and refreshments. All skill levels welcome!',
    category: 'Environment',
    date: new Date('2025-11-15'),
    startTime: '09:00',
    endTime: '12:00',
    location: {
      address: 'Marine Drive Beach',
      area: 'Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400002',
      landmark: 'Near Marine Drive Promenade'
    },
    capacity: 50,
    status: 'published',
    requirements: 'Comfortable clothing and closed-toe shoes',
    tags: ['cleanup', 'outdoor', 'environment']
  },
  {
    title: 'Senior Citizen Home Visit Program',
    description: 'Spend quality time with elderly residents at Sunshine Senior Living Home. Activities include reading, playing games, and helping with light household tasks.',
    category: 'Community Development',
    date: new Date('2025-11-20'),
    startTime: '14:00',
    endTime: '17:00',
    location: {
      address: '123 Sunshine Nagar',
      area: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400069',
      landmark: 'Opposite Andheri Sports Complex'
    },
    capacity: 20,
    status: 'published',
    requirements: 'Patience, empathy, and good communication skills',
    tags: ['senior-care', 'community', 'indoor']
  },
  {
    title: 'Digital Literacy Workshop for Underprivileged Children',
    description: 'Teach basic computer skills to children from low-income families. We\'ll cover internet safety, basic typing, and introductory coding concepts.',
    category: 'Education',
    date: new Date('2025-11-25'),
    startTime: '10:00',
    endTime: '13:00',
    location: {
      address: 'Community Learning Center',
      area: 'Dadar West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400028',
      landmark: 'Near Dadar Railway Station'
    },
    capacity: 25,
    status: 'published',
    requirements: 'Basic computer knowledge and teaching experience preferred',
    tags: ['education', 'children', 'technology']
  },
  {
    title: 'Blood Donation Camp',
    description: 'Help save lives by donating blood at our mobile blood donation camp. Medical professionals will be present to ensure safety and proper procedures.',
    category: 'Healthcare',
    date: new Date('2025-12-01'),
    startTime: '08:00',
    endTime: '16:00',
    location: {
      address: 'City Hospital Parking Lot',
      area: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400050',
      landmark: 'Main entrance of City Hospital'
    },
    capacity: 100,
    status: 'published',
    requirements: 'Must be 18-65 years old, weigh at least 50kg, and be in good health',
    tags: ['health', 'blood-donation', 'medical']
  },
  {
    title: 'Animal Shelter Volunteer Day',
    description: 'Help care for abandoned and rescued animals at Paws & Tails Shelter. Tasks include feeding, cleaning, walking dogs, and socializing with cats.',
    category: 'Animal Welfare',
    date: new Date('2025-12-05'),
    startTime: '11:00',
    endTime: '15:00',
    location: {
      address: '45 Green Valley Road',
      area: 'Thane West',
      city: 'Thane',
      state: 'Maharashtra',
      pinCode: '400601',
      landmark: 'Near Ghodbunder Road Junction'
    },
    capacity: 15,
    status: 'published',
    requirements: 'Love for animals and willingness to work in outdoor conditions',
    tags: ['animals', 'shelter', 'outdoor']
  }
];

async function seedSampleEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careconnect');

    console.log('Connected to MongoDB');

    // Find a verified NGO to assign as organizer
    const ngo = await User.findOne({ role: 'ngo_admin', verificationStatus: 'approved' });

    if (!ngo) {
      console.log('No verified NGO found. Please create an NGO account first.');
      return;
    }

    console.log(`Using NGO: ${ngo.name} (${ngo.organizationName})`);

    // Clear existing sample events
    await Event.deleteMany({
      title: { $in: sampleEvents.map(e => e.title) }
    });

    console.log('Cleared existing sample events');

    // Create events with NGO as organizer
    const eventsToCreate = sampleEvents.map(eventData => ({
      ...eventData,
      organizerId: ngo._id,
      organizerName: ngo.name,
      organizationName: ngo.organizationName || ngo.name,
      registeredVolunteers: []
    }));

    const createdEvents = await Event.insertMany(eventsToCreate);

    console.log(`Successfully created ${createdEvents.length} sample events:`);
    createdEvents.forEach(event => {
      console.log(`- ${event.title} (${event.category})`);
    });

  } catch (error) {
    console.error('Error seeding sample events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
seedSampleEvents();