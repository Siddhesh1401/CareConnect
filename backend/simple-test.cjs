// Simple health check test
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Health Check Status: ${res.statusCode}`);
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Response:', data);
    testNGOProfileEndpoints();
  });
});

req.on('error', (error) => {
  console.error('❌ Health check failed:', error.message);
});

req.end();

// Test NGO Profile endpoints if health check passes
function testNGOProfileEndpoints() {
  console.log('\n🧪 Testing NGO Profile Endpoints...');
  
  // Test without authentication first to see error handling
  const profileOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/ngo-profile/completion',
    method: 'GET'
  };

  const profileReq = http.request(profileOptions, (res) => {
    console.log(`📊 NGO Profile Completion Status: ${res.statusCode}`);
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📝 Response:', data);
      console.log('✅ NGO Profile API endpoints are accessible!');
    });
  });

  profileReq.on('error', (error) => {
    console.error('❌ NGO Profile test failed:', error.message);
  });

  profileReq.end();
}