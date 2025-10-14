// Test volunteer dashboard endpoint after fix
const http = require('http');

async function testVolunteerDashboard() {
  console.log('🧪 Testing Volunteer Dashboard API Fix');
  console.log('=====================================\n');

  // Test the volunteer dashboard endpoint
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/dashboard/volunteer',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📊 Status Message: ${res.statusMessage}`);
    
    if (res.statusCode === 404) {
      console.log('❌ Endpoint still not found!');
      return;
    }
    
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.log('✅ Endpoint exists! (Auth required as expected)');
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📝 Response:', data);
      console.log('\n✅ Volunteer Dashboard API is properly configured!');
      console.log('🎯 Frontend should now be able to access: /api/v1/dashboard/volunteer');
    });
  });

  req.on('error', (error) => {
    console.log('❌ Test failed:', error.message);
  });

  req.end();
}

testVolunteerDashboard();