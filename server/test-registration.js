async function testRegistration() {
  try {
    console.log('🧪 Testing Registration API...');
    
    const testData = {
      name: 'Test User',
      phone: '1234567890',
      password: 'TestPass123!',
      role: 'resident',
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        village: 'Shivajinagar'
      }
    };
    
    console.log('📤 Sending registration request...');
    console.log('📦 Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('📥 Response:', JSON.stringify(responseData, null, 2));
    } else {
      console.log('❌ Registration failed!');
      console.log('📥 Status:', response.status);
      console.log('📥 Response:', JSON.stringify(responseData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('🚨 Error:', error.message);
  }
}

testRegistration();
