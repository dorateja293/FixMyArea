const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');

async function testComplaintSubmissionWithFormData() {
  try {
    console.log('🧪 Testing complaint submission with FormData...');
    
    // First, let's login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '7702382578',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.success);
    
    if (!loginData.success || !loginData.data.token) {
      throw new Error('No token received from login');
    }

    const token = loginData.data.token;
    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    // Create FormData for complaint submission
    const formData = new FormData();
    formData.append('category', 'stray_dogs');
    formData.append('description', 'Test complaint description - there are stray dogs in the area');
    formData.append('location', JSON.stringify({
      lat: 20.5937,
      lng: 78.9629,
      address: 'Test Address, India',
      state: 'Test State',
      district: 'Test District',
      village: 'Test Village'
    }));

    console.log('📤 Submitting complaint with FormData...');
    console.log('📦 FormData entries:', formData.getHeaders());

    const complaintResponse = await fetch('http://localhost:5000/api/complaints', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📥 Complaint response status:', complaintResponse.status);
    console.log('📥 Complaint response headers:', Object.fromEntries(complaintResponse.headers.entries()));
    
    if (!complaintResponse.ok) {
      const errorText = await complaintResponse.text();
      console.error('❌ Complaint submission failed:', errorText);
      throw new Error(`Complaint submission failed: ${complaintResponse.status} ${complaintResponse.statusText}`);
    }

    const complaintResult = await complaintResponse.json();
    console.log('✅ Complaint submission successful:', complaintResult);
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

// Run the test
testComplaintSubmissionWithFormData();
