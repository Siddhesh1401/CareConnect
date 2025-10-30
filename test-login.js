// Simple test script to check login API response
const fetch = require('node-fetch');

async function testLogin() {
  const url = 'http://localhost:5000/api/v1/auth/login';
  const credentials = {
    email: 'siddeshbangar14@gmail.com', // NGO with rejected documents
    password: 'password123' // Assuming this is the password
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    console.log('=== LOGIN API TEST ===');
    console.log('Status:', response.status);
    console.log('Response Headers:', response.headers.raw());
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (data.code === 'DOCUMENTS_REJECTED') {
      console.log('\n=== REJECTION DETAILS ===');
      console.log('Rejected Documents:', JSON.stringify(data.data.rejectedDocuments, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();
