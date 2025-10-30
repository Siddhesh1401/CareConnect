import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careconnect');

console.log('Connected to MongoDB');

// Define schemas inline
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  organizationName: String,
  profilePicture: String
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  likes: [mongoose.Schema.Types.ObjectId],
  comments: [{
    id: String,
    content: String,
    author: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now },
    likes: [mongoose.Schema.Types.ObjectId]
  }],
  image: String
});

const communitySchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  image: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  members: [mongoose.Schema.Types.ObjectId],
  posts: [postSchema],
  isPrivate: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const storySchema = new mongoose.Schema({
  title: String,
  excerpt: String,
  content: String,
  image: String,
  author: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    role: String,
    avatar: String,
    organizationName: String
  },
  category: String,
  status: String,
  tags: [String],
  readTime: Number,
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  publishedDate: Date,
  featured: Boolean
});

const User = mongoose.model('User', userSchema);
const Community = mongoose.model('Community', communitySchema);
const Story = mongoose.model('Story', storySchema);

try {
  // Get or create test users
  let ngoAdmin = await User.findOne({ role: 'ngo_admin' });
  let volunteer = await User.findOne({ role: 'volunteer' });

  if (!ngoAdmin) {
    console.log('Creating test NGO admin user...');
    ngoAdmin = await User.create({
      name: 'Eco Warriors NGO',
      email: 'eco@example.com',
      role: 'ngo_admin',
      organizationName: 'Eco Warriors',
      profilePicture: 'https://ui-avatars.com/api/?name=Eco+Warriors'
    });
  }

  if (!volunteer) {
    console.log('Creating test volunteer user...');
    volunteer = await User.create({
      name: 'John Volunteer',
      email: 'john@example.com',
      role: 'volunteer',
      profilePicture: 'https://ui-avatars.com/api/?name=John+Volunteer'
    });
  }

  console.log('NGO Admin ID:', ngoAdmin._id);
  console.log('Volunteer ID:', volunteer._id);

  // Create sample communities
  const communitiesData = [
    {
      name: 'Environmental Warriors',
      description: 'A community dedicated to environmental conservation and sustainability initiatives.',
      category: 'environment',
      image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=300&fit=crop',
      createdBy: ngoAdmin._id,
      members: [ngoAdmin._id, volunteer._id],
      isPrivate: false,
      posts: [
        {
          title: 'Beach Cleanup Drive Success',
          content: 'We successfully cleaned up the beach last weekend! Over 50 volunteers participated and collected more than 200kg of plastic waste. Thanks to everyone who contributed! 🌊',
          author: ngoAdmin._id,
          likes: [volunteer._id],
          comments: [],
          image: null
        },
        {
          title: 'Tips for Sustainable Living',
          content: 'Here are 5 easy ways to reduce your carbon footprint:\n1. Use reusable bags and containers\n2. Conserve water daily\n3. Choose eco-friendly products\n4. Plant a tree\n5. Spread awareness',
          author: volunteer._id,
          likes: [ngoAdmin._id],
          comments: [],
          image: null
        }
      ]
    },
    {
      name: 'Education Advocates',
      description: 'Empowering communities through education and skill development programs.',
      category: 'education',
      image: 'https://images.unsplash.com/photo-1427504494785-cdee173cb338?w=400&h=300&fit=crop',
      createdBy: ngoAdmin._id,
      members: [ngoAdmin._id, volunteer._id],
      isPrivate: false,
      posts: [
        {
          title: 'Scholarship Program Launched',
          content: 'Exciting news! We have launched a new scholarship program for underprivileged students. Applications are now open!',
          author: ngoAdmin._id,
          likes: [],
          comments: [],
          image: null
        }
      ]
    },
    {
      name: 'Healthcare Helpers',
      description: 'Supporting healthcare initiatives and community wellness programs.',
      category: 'healthcare',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
      createdBy: ngoAdmin._id,
      members: [ngoAdmin._id],
      isPrivate: false,
      posts: []
    }
  ];

  // Clear existing communities
  await Community.deleteMany({ createdBy: ngoAdmin._id });
  console.log('Cleared existing communities');

  // Insert communities
  const createdCommunities = await Community.insertMany(communitiesData);
  console.log(`✅ Created ${createdCommunities.length} communities`);

  // Create sample stories
  const storiesData = [
    {
      title: 'How One Volunteer Made a Difference',
      excerpt: 'A powerful story of how a single volunteer transformed a community through dedication and passion.',
      content: `
        Priya started volunteering 3 years ago with just an idea and a passion to help. Today, she has impacted over 500 lives through her education initiatives.
        
        Her journey began when she saw children in her neighborhood struggling with their studies due to lack of proper guidance. She decided to start free tuition classes in her small apartment.
        
        What started with 10 students has now grown to 50+ students across multiple centers. Her efforts have led to 95% of her students passing their exams, with many getting scholarships to prestigious schools.
        
        "Every child deserves education regardless of their economic background," Priya says with determination. Her story is an inspiration to all of us.
      `,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
      author: {
        id: ngoAdmin._id,
        name: 'Eco Warriors NGO',
        email: 'eco@example.com',
        role: 'ngo_admin',
        organizationName: 'Eco Warriors',
        avatar: 'https://ui-avatars.com/api/?name=Eco+Warriors'
      },
      category: 'success',
      status: 'published',
      tags: ['education', 'inspiration', 'volunteer', 'impact'],
      readTime: 5,
      likes: 23,
      comments: 8,
      shares: 12,
      views: 156,
      publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      featured: true
    },
    {
      title: 'Community Cleanup: Making Our Streets Green',
      excerpt: 'How our community came together to clean up local streets and parks in a single weekend.',
      content: `
        Last Saturday, over 100 volunteers gathered to clean up our local streets and parks. It was an amazing experience!
        
        Starting early in the morning, teams were assigned to different areas. Armed with trash bags, gloves, and determination, volunteers worked tirelessly.
        
        By noon, we had collected:
        - 500+ kg of plastic waste
        - 200 kg of other recyclables
        - Planted 50 new trees
        
        The community spirit was incredible. Families brought their children, elderly residents contributed, and local businesses provided refreshments.
        
        This initiative shows that when we come together, we can create real change in our environment. Let's continue this momentum!
      `,
      image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=600&h=400&fit=crop',
      author: {
        id: volunteer._id,
        name: 'John Volunteer',
        email: 'john@example.com',
        role: 'volunteer',
        avatar: 'https://ui-avatars.com/api/?name=John+Volunteer'
      },
      category: 'environment',
      status: 'published',
      tags: ['environment', 'cleanup', 'community', 'sustainability'],
      readTime: 4,
      likes: 45,
      comments: 15,
      shares: 28,
      views: 312,
      publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      featured: false
    },
    {
      title: 'Healthcare Camp Serves 200+ Families',
      excerpt: 'Free health checkup camp provides essential medical services to underserved communities.',
      content: `
        Our healthcare initiative reached new heights this month with a comprehensive health checkup camp.
        
        In just two days, we:
        - Provided free health checkups to 200+ families
        - Distributed medicines for common ailments
        - Conducted health awareness sessions
        - Registered high-risk patients for follow-up care
        
        Doctors and paramedics volunteered their time to ensure everyone received proper attention. The feedback from the community was overwhelming and heartwarming.
        
        Many families expressed gratitude for access to medical services they otherwise couldn't afford. This is exactly why we do what we do!
      `,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
      author: {
        id: ngoAdmin._id,
        name: 'Eco Warriors NGO',
        email: 'eco@example.com',
        role: 'ngo_admin',
        organizationName: 'Eco Warriors',
        avatar: 'https://ui-avatars.com/api/?name=Eco+Warriors'
      },
      category: 'healthcare',
      status: 'published',
      tags: ['healthcare', 'community', 'medical', 'awareness'],
      readTime: 3,
      likes: 34,
      comments: 12,
      shares: 19,
      views: 245,
      publishedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      featured: true
    },
    {
      title: 'Empowering Women Through Skill Training',
      excerpt: 'A transformative program teaching valuable skills to women entrepreneurs.',
      content: `
        Introducing our Women Empowerment Through Skills program!
        
        This initiative focuses on:
        ✓ Entrepreneurship training
        ✓ Digital literacy
        ✓ Business management
        ✓ Financial independence
        
        Phase 1 results:
        - 50 women trained
        - 80% completed the full course
        - 15 women started their own businesses
        - Average income increase: 40%
        
        The testimonials from participants have been incredible. Women are not just gaining skills; they're gaining confidence and independence.
        
        We're planning Phase 2 to reach 100+ more women. If you'd like to contribute or volunteer, please reach out!
      `,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
      author: {
        id: ngoAdmin._id,
        name: 'Eco Warriors NGO',
        email: 'eco@example.com',
        role: 'ngo_admin',
        organizationName: 'Eco Warriors',
        avatar: 'https://ui-avatars.com/api/?name=Eco+Warriors'
      },
      category: 'community',
      status: 'published',
      tags: ['women', 'empowerment', 'skills', 'training'],
      readTime: 4,
      likes: 56,
      comments: 22,
      shares: 34,
      views: 401,
      publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      featured: false
    }
  ];

  // Clear existing stories
  await Story.deleteMany({ 'author.id': { $in: [ngoAdmin._id, volunteer._id] } });
  console.log('Cleared existing stories');

  // Insert stories
  const createdStories = await Story.insertMany(storiesData);
  console.log(`✅ Created ${createdStories.length} stories`);

  console.log('\n✨ Sample data seeding complete!');
  console.log(`Total Communities: ${createdCommunities.length}`);
  console.log(`Total Stories: ${createdStories.length}`);

  process.exit(0);
} catch (error) {
  console.error('Error seeding data:', error);
  process.exit(1);
}
