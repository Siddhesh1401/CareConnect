// Test script to verify backend connectivity
const testBackend = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test signup
    console.log('\nTesting signup...');
    const signupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!',
      role: 'volunteer'
    };
    
    const signupResponse = await fetch(`${baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });
    
    const signupResult = await signupResponse.json();
    console.log('Signup result:', signupResult);
    
    if (signupResult.success) {
      const token = signupResult.data.token;
      
      // Test login
      console.log('\nTesting login...');
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!'
      };
      
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
      
      const loginResult = await loginResponse.json();
      console.log('Login result:', loginResult);
      
      if (loginResult.success) {
        // Test protected route
        console.log('\nTesting protected route...');
        const profileResponse = await fetch(`${baseURL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${loginResult.data.token}`
          }
        });
        
        const profileResult = await profileResponse.json();
        console.log('Profile result:', profileResult);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testBackend();
