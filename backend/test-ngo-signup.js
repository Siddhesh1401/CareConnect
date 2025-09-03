import axios from 'axios';

const testNGOSignup = async () => {
  try {
    console.log('Testing NGO signup...');
    
    const signupData = {
      name: 'Green Earth Foundation',
      email: 'admin@greenearth.org',
      password: 'SecurePass123!',
      role: 'ngo_admin'
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/signup', signupData);
    
    console.log('NGO Signup Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ NGO signup successful!');
      console.log('User ID:', response.data.data.user._id);
      console.log('Organization Name:', response.data.data.user.organizationName);
      console.log('Token received:', response.data.data.token ? 'Yes' : 'No');
    }
    
  } catch (error) {
    console.error('❌ NGO signup failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
};

testNGOSignup();
