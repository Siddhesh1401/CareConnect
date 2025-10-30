import mongoose from 'mongoose';
import Campaign from '../src/models/Campaign.js';
import User from '../src/models/User.js';

const sampleCampaigns = [
  {
    title: 'Education for Underprivileged Children',
    description: 'Help us provide quality education to 100 children from low-income families in Mumbai. Your donation will cover school fees, books, uniforms, and educational materials for an entire academic year. Every child deserves a chance to learn and grow.',
    category: 'education',
    target: 500000,
    raised: 125000,
    donors: 45,
    location: 'Mumbai, Maharashtra',
    urgency: 'high',
    status: 'active',
    endDate: new Date('2025-12-31'),
    tags: ['education', 'children', 'mumbai', 'school'],
    socialLinks: {
      facebook: 'https://facebook.com/careconnect-education',
      website: 'https://careconnect.org/campaigns/education-drive'
    },
    impactMetrics: {
      peopleHelped: 85,
      areaCovered: 'Mumbai Metropolitan Region',
      milestones: [
        { title: 'Enrolled 50 students', achieved: true, achievedDate: new Date('2025-09-01') },
        { title: 'Distributed school supplies', achieved: true, achievedDate: new Date('2025-09-15') },
        { title: 'Set up learning centers', achieved: false }
      ]
    },
    updates: [
      {
        id: 'update_1',
        title: 'First Month Progress Update',
        content: 'We have successfully enrolled 50 children and distributed school supplies. The children are excited to start their educational journey!',
        createdAt: new Date('2025-09-15')
      }
    ]
  },
  {
    title: 'Medical Aid for Rural Healthcare',
    description: 'Support our mobile medical camp initiative that provides free healthcare services to remote villages. We need funds for medical equipment, medicines, and transportation to reach 10 villages in Maharashtra.',
    category: 'healthcare',
    target: 300000,
    raised: 89000,
    donors: 28,
    location: 'Rural Maharashtra',
    urgency: 'medium',
    status: 'active',
    endDate: new Date('2025-11-30'),
    tags: ['healthcare', 'rural', 'medical', 'mobile-clinic'],
    socialLinks: {
      twitter: 'https://twitter.com/careconnect_health',
      instagram: 'https://instagram.com/careconnect_medical'
    },
    impactMetrics: {
      peopleHelped: 320,
      resourcesDistributed: 1500,
      areaCovered: '10 villages in Maharashtra',
      milestones: [
        { title: 'Visited 5 villages', achieved: true, achievedDate: new Date('2025-08-20') },
        { title: 'Treated 200 patients', achieved: true, achievedDate: new Date('2025-09-10') },
        { title: 'Complete all 10 villages', achieved: false }
      ]
    }
  },
  {
    title: 'Clean Water Initiative for Tribal Communities',
    description: 'Install clean water systems in 5 tribal villages affected by water scarcity. Your contribution will help build borewells, water purification systems, and rainwater harvesting structures.',
    category: 'environment',
    target: 400000,
    raised: 156000,
    donors: 67,
    location: 'Tribal Areas, Maharashtra',
    urgency: 'high',
    status: 'active',
    endDate: new Date('2025-12-15'),
    tags: ['water', 'environment', 'tribal', 'sustainability'],
    socialLinks: {
      facebook: 'https://facebook.com/cleanwater-initiative',
      website: 'https://careconnect.org/campaigns/clean-water'
    },
    impactMetrics: {
      peopleHelped: 1200,
      areaCovered: '5 tribal villages',
      milestones: [
        { title: 'Survey completed for 3 villages', achieved: true, achievedDate: new Date('2025-07-30') },
        { title: 'Installed 2 borewells', achieved: true, achievedDate: new Date('2025-09-05') },
        { title: 'Complete water systems for all villages', achieved: false }
      ]
    },
    updates: [
      {
        id: 'update_1',
        title: 'Water Quality Testing Results',
        content: 'Our team has completed water quality testing in the first three villages. The results show significant contamination levels, confirming the urgent need for clean water systems.',
        createdAt: new Date('2025-08-10')
      }
    ]
  },
  {
    title: 'Emergency Relief for Flood Victims',
    description: 'Provide immediate relief to families affected by recent floods in Kerala. We need funds for food, clean water, temporary shelter, and medical supplies for 200 families.',
    category: 'disaster-relief',
    target: 250000,
    raised: 187000,
    donors: 89,
    location: 'Flood-affected areas, Kerala',
    urgency: 'high',
    status: 'active',
    endDate: new Date('2025-11-15'),
    tags: ['flood-relief', 'emergency', 'kerala', 'disaster'],
    socialLinks: {
      twitter: 'https://twitter.com/careconnect_relief',
      instagram: 'https://instagram.com/flood_relief_2025'
    },
    impactMetrics: {
      peopleHelped: 180,
      resourcesDistributed: 850,
      areaCovered: '3 districts in Kerala',
      milestones: [
        { title: 'Distributed food packages', achieved: true, achievedDate: new Date('2025-08-25') },
        { title: 'Set up medical camps', achieved: true, achievedDate: new Date('2025-09-02') },
        { title: 'Provide permanent housing solutions', achieved: false }
      ]
    }
  },
  {
    title: 'Animal Shelter Expansion Project',
    description: 'Help us expand our animal shelter to accommodate more rescued animals. We need funds to build additional kennels, veterinary facilities, and improve our adoption center.',
    category: 'animal-welfare',
    target: 350000,
    raised: 98000,
    donors: 156,
    location: 'Thane, Maharashtra',
    urgency: 'medium',
    status: 'active',
    endDate: new Date('2026-01-31'),
    tags: ['animals', 'shelter', 'rescue', 'veterinary'],
    socialLinks: {
      facebook: 'https://facebook.com/pawsandtails',
      instagram: 'https://instagram.com/pawsandtails_shelter',
      website: 'https://pawsandtails.org'
    },
    impactMetrics: {
      peopleHelped: 0, // Animals helped, not people
      resourcesDistributed: 45, // Animals rescued
      areaCovered: 'Thane District',
      milestones: [
        { title: 'Completed architectural plans', achieved: true, achievedDate: new Date('2025-08-15') },
        { title: 'Procured construction materials', achieved: true, achievedDate: new Date('2025-09-20') },
        { title: 'Begin construction phase', achieved: false }
      ]
    },
    updates: [
      {
        id: 'update_1',
        title: 'Architectural Plans Finalized',
        content: 'We are excited to announce that our architectural plans for the shelter expansion have been finalized. The new facility will include 50 additional kennels and a state-of-the-art veterinary clinic.',
        createdAt: new Date('2025-08-20')
      },
      {
        id: 'update_2',
        title: 'Community Support Growing',
        content: 'Thanks to our amazing community, we have received overwhelming support for this expansion. Local businesses have also pledged to contribute building materials.',
        createdAt: new Date('2025-09-10')
      }
    ]
  }
];

async function seedSampleCampaigns() {
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

    // Clear existing sample campaigns
    await Campaign.deleteMany({
      title: { $in: sampleCampaigns.map(c => c.title) }
    });

    console.log('Cleared existing sample campaigns');

    // Create campaigns with NGO as organizer
    const campaignsToCreate = sampleCampaigns.map(campaignData => ({
      ...campaignData,
      ngoId: ngo._id,
      ngoName: ngo.name
    }));

    const createdCampaigns = await Campaign.insertMany(campaignsToCreate);

    console.log(`Successfully created ${createdCampaigns.length} sample campaigns:`);
    createdCampaigns.forEach(campaign => {
      console.log(`- ${campaign.title} (${campaign.category}) - Target: ₹${campaign.target.toLocaleString()}, Raised: ₹${campaign.raised.toLocaleString()}`);
    });

  } catch (error) {
    console.error('Error seeding sample campaigns:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
seedSampleCampaigns();