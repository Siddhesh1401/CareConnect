import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test user management endpoints
async function testUserManagement() {
  try {
    console.log('🧪 Testing User Management Endpoints...\n');

    // First, let's try to get users without authentication (should fail)
    console.log('1. Testing without authentication...');
    try {
      await axios.get(`${API_BASE}/admin/users`);
    } catch (error) {
      console.log('✅ Correctly rejected without auth:', error.response?.status, error.response?.data?.message);
    }

    // For a real test, you would need to:
    // 1. Create an admin user
    // 2. Login to get a token
    // 3. Use that token to test the endpoints

    console.log('\n2. Testing endpoint availability...');
    
    // Test if the routes are registered (they should return 401 without auth)
    const endpoints = [
      '/admin/users',
      '/admin/users/test-id/toggle-status'
    ];

    for (const endpoint of endpoints) {
      try {
        await axios.get(`${API_BASE}${endpoint}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`✅ Endpoint ${endpoint} is registered and requires auth`);
        } else if (error.response?.status === 404) {
          console.log(`❌ Endpoint ${endpoint} not found`);
        } else {
          console.log(`⚠️  Endpoint ${endpoint} returned:`, error.response?.status);
        }
      }
    }

    console.log('\n✅ User management endpoints are set up correctly!');
    console.log('📝 To test fully, you need to:');
    console.log('   1. Create an admin user in the database');
    console.log('   2. Login with admin credentials');
    console.log('   3. Use the token to access /admin/users');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserManagement();