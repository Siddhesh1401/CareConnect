// Test script for NGO Profile API endpoints
const BASE_URL = 'http://localhost:5000/api/v1';

// Simulate a test NGO user (you'll need to replace these with actual credentials)
const testCredentials = {
  email: 'ngo@test.com',
  password: 'password123'
};

async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json();
    
    console.log(`\n🔍 ${method} ${endpoint}`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log('📝 Response:', JSON.stringify(result, null, 2));
    
    return { response, result };
  } catch (error) {
    console.log(`\n❌ ${method} ${endpoint}`);
    console.log('🚨 Error:', error.message);
    return null;
  }
}

async function testNGOProfileAPI() {
  console.log('🧪 Testing NGO Profile API Endpoints');
  console.log('=====================================');

  try {
    // Step 1: Login to get authentication token
    console.log('\n1️⃣ Attempting to login...');
    const loginResult = await makeRequest('/auth/login', 'POST', testCredentials);
    
    if (!loginResult || loginResult.response.status !== 200) {
      console.log('❌ Login failed. Creating a test NGO user first...');
      
      // Try to register a test NGO
      const registerData = {
        name: 'Test NGO',
        email: testCredentials.email,
        password: testCredentials.password,
        role: 'ngo_admin',
        ngoName: 'Test NGO Organization'
      };
      
      console.log('\n📝 Registering test NGO...');
      await makeRequest('/auth/register', 'POST', registerData);
      
      // Try login again
      const secondLoginResult = await makeRequest('/auth/login', 'POST', testCredentials);
      if (!secondLoginResult || secondLoginResult.response.status !== 200) {
        console.log('❌ Still unable to login. Please check credentials or create user manually.');
        return;
      }
      loginResult = secondLoginResult;
    }
    
    const token = loginResult.result.token;
    console.log('✅ Login successful!');

    // Step 2: Test profile completion endpoint
    console.log('\n2️⃣ Testing profile completion...');
    await makeRequest('/ngo-profile/completion', 'GET', null, token);

    // Step 3: Test updating enhanced profile
    console.log('\n3️⃣ Testing enhanced profile update...');
    const enhancedProfileData = {
      mission: 'Empowering communities through sustainable development initiatives.',
      vision: 'A world where every community has access to education and healthcare.',
      foundedYear: 2010,
      teamSize: 25,
      website: 'https://test-ngo.org',
      socialMedia: {
        facebook: 'https://facebook.com/test-ngo',
        twitter: 'https://twitter.com/test-ngo',
        instagram: 'https://instagram.com/test-ngo'
      },
      focusAreas: ['Education', 'Healthcare', 'Environment'],
      achievements: [
        {
          title: 'Community Health Program',
          description: 'Provided healthcare services to 5,000 families',
          year: 2023,
          impact: '5000 families served'
        }
      ],
      partnerOrganizations: ['Local Health Department', 'Education Ministry'],
      operatingRegions: ['Mumbai', 'Delhi', 'Bangalore']
    };
    
    await makeRequest('/ngo-profile/enhanced', 'PUT', enhancedProfileData, token);

    // Step 4: Test updating basic profile
    console.log('\n4️⃣ Testing basic profile update...');
    const basicProfileData = {
      name: 'Updated Test NGO',
      ngoName: 'Updated Test NGO Organization',
      phone: '+91-9876543210',
      address: '123 Main Street, Mumbai, Maharashtra, India',
      registrationNumber: 'NGO12345'
    };
    
    await makeRequest('/ngo-profile/basic', 'PUT', basicProfileData, token);

    // Step 5: Check profile completion again (should be higher now)
    console.log('\n5️⃣ Checking updated profile completion...');
    await makeRequest('/ngo-profile/completion', 'GET', null, token);

    console.log('\n✅ NGO Profile API testing completed!');
    
  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message);
  }
}

// Run the test
testNGOProfileAPI();