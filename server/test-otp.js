const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOTP() {
  try {
    console.log('🧪 Testing OTP functionality...');
    
    // Test 1: Send OTP for new user
    console.log('\n📱 Test 1: Sending OTP for new user...');
    const response1 = await fetch('http://localhost:5000/api/otp/send-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '1234567890',
        email: 'test@example.com'
      })
    });

    const data1 = await response1.json();
    console.log('Response:', data1);

    if (data1.success) {
      console.log('✅ OTP sent successfully');
      
      // Test 2: Verify OTP (we need to get the actual OTP from the database)
      console.log('\n🔍 Test 2: Checking OTP in database...');
      const response2 = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: '1234567890',
          email: 'test@example.com',
          otp: '123456', // This will likely fail, but let's see the response
          type: 'registration'
        })
      });

      const data2 = await response2.json();
      console.log('Verification response:', data2);
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

// Run the test
testOTP();
