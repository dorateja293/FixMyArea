const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 Testing MongoDB Connection...');
console.log('📡 MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixmyarea', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Test creating a simple document
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    const testDoc = new TestModel({ name: 'test' });
    await testDoc.save();
    console.log('✅ Document saved successfully!');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Please install MongoDB or use MongoDB Atlas');
  }
}

testConnection();
