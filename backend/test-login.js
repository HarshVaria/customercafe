const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing login endpoint...\n');
    console.log('URL: http://localhost:5000/api/auth/login');
    console.log('Payload:', { username: 'owner', password: 'owner123' });
    console.log('\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'owner',
      password: 'owner123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login Successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Login Failed!\n');
    
    if (error.response) {
      console.log('Status Code:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received');
      console.log('Request:', error.request);
    } else {
      console.log('Error:', error.message);
    }
    console.log('\nFull Error:', error);
  }
};

testLogin();