import User from '../models/User.js';

// Test function to verify NGO profile completion calculation
export const testProfileCompletion = async () => {
  try {
    console.log('🧪 Testing NGO Profile Completion Calculation...\n');

    // Test 1: Basic NGO with minimal info
    const basicNGO = new User({
      name: 'Test NGO',
      email: 'test@ngo.com',
      password: 'password123',
      role: 'ngo_admin',
      organizationName: 'Test Organization',
      organizationType: 'Non-Profit',
      description: 'We help people',
      website: 'https://testngo.com'
    });

    const basicCompletion = basicNGO.calculateProfileCompletion();
    console.log(`📊 Basic NGO completion: ${basicCompletion}%`);
    console.log(`   Expected: ~60% (basic fields only)\n`);

    // Test 2: Enhanced NGO with more fields
    const enhancedNGO = new User({
      name: 'Enhanced NGO',
      email: 'enhanced@ngo.com',
      password: 'password123',
      role: 'ngo_admin',
      organizationName: 'Enhanced Organization',
      organizationType: 'Charity',
      description: 'We help communities grow and thrive',
      website: 'https://enhancedngo.com',
      mission: 'To create positive social impact in underserved communities',
      goals: ['Reduce poverty', 'Improve education', 'Provide healthcare'],
      targetAudience: ['Children', 'Elderly', 'Rural communities'],
      contactDetails: {
        primaryEmail: 'contact@enhanced.org',
        primaryPhone: '+1-555-123-4567',
        address: {
          city: 'New York',
          state: 'NY',
          country: 'USA'
        }
      },
      workingAreas: ['Education', 'Healthcare', 'Environment'],
      impactStats: {
        peopleHelped: 5000,
        projectsCompleted: 25,
        yearsActive: 10
      }
    });

    const enhancedCompletion = enhancedNGO.calculateProfileCompletion();
    console.log(`📊 Enhanced NGO completion: ${enhancedCompletion}%`);
    console.log(`   Expected: ~100% (all fields filled)\n`);

    // Test 3: Volunteer (should return 100%)
    const volunteer = new User({
      name: 'Test Volunteer',
      email: 'volunteer@test.com',
      password: 'password123',
      role: 'volunteer'
    });

    const volunteerCompletion = volunteer.calculateProfileCompletion();
    console.log(`📊 Volunteer completion: ${volunteerCompletion}%`);
    console.log(`   Expected: 100% (non-NGO users are complete by default)\n`);

    console.log('✅ Profile completion calculation tests completed!');
    
    return {
      basicNGO: basicCompletion,
      enhancedNGO: enhancedCompletion,
      volunteer: volunteerCompletion
    };

  } catch (error) {
    console.error('❌ Error testing profile completion:', error);
    throw error;
  }
};

// Export the test function
export default { testProfileCompletion };