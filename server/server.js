const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const userRoutes = require('./src/routes/userRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const dogRoutes = require('./src/routes/dogRoutes');
const otpRoutes = require('./src/routes/otpRoutes');

dotenv.config();

const app = express();

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Remove duplicate file upload middleware - it's handled by route-specific middleware
// app.use(fileUpload({
//   useTempFiles: true,
//   tempFileDir: '/tmp/',
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   abortOnLimit: true,
//   responseOnLimit: 'File size limit has been reached'
// }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Debug environment variables
console.log('🔧 Environment Configuration:');
console.log('📡 PORT:', PORT);
console.log('🗄️ MONGO_URI:', MONGO_URI ? `${MONGO_URI.substring(0, 20)}...` : 'NOT SET');
console.log('🌐 CORS_ORIGIN:', process.env.CORS_ORIGIN || 'http://localhost:5173');
console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Connect to MongoDB with enhanced error handling
if (!MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is not set!');
  console.error('💡 Please create a .env file with MONGO_URI=mongodb://localhost:27017/fixmyarea');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🌐 Host: ${mongoose.connection.host}`);
  console.log(`🔌 Port: ${mongoose.connection.port}`);
  console.log(`🔗 Connection String: ${MONGO_URI}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('💡 Please ensure MongoDB is running:');
  console.error('   - Local: mongod');
  console.error('   - Docker: docker-compose up -d');
  console.error('   - Check if MONGO_URI is correct');
  process.exit(1);
});

// Test database connection
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Mount routers
console.log('🔗 Loading API routes...');

try {
  console.log('  📍 Loading auth routes...');
  app.use('/api/auth', authRoutes);
  console.log('  ✅ Auth routes loaded');
} catch (error) {
  console.error('  ❌ Error loading auth routes:', error);
}

try {
  console.log('  📍 Loading location routes...');
  app.use('/api/locations', locationRoutes);
  console.log('  ✅ Location routes loaded');
} catch (error) {
  console.error('  ❌ Error loading location routes:', error);
}

try {
  console.log('  📍 Loading complaint routes...');
  app.use('/api/complaints', complaintRoutes);
  console.log('  ✅ Complaint routes loaded');
} catch (error) {
  console.error('  ❌ Error loading complaint routes:', error);
}

try {
  console.log('  📍 Loading user routes...');
  app.use('/api/users', userRoutes);
  console.log('  ✅ User routes loaded');
} catch (error) {
  console.error('  ❌ Error loading user routes:', error);
}

try {
  console.log('  📍 Loading report routes...');
  app.use('/api/reports', reportRoutes);
  console.log('  ✅ Report routes loaded');
} catch (error) {
  console.error('  ❌ Error loading report routes:', error);
}

try {
  console.log('  📍 Loading dog routes...');
  app.use('/api/dogs', dogRoutes);
  console.log('  ✅ Dog routes loaded');
} catch (error) {
  console.error('  ❌ Error loading dog routes:', error);
}

try {
  console.log('  📍 Loading OTP routes...');
  app.use('/api/otp', otpRoutes);
  console.log('  ✅ OTP routes loaded');
} catch (error) {
  console.error('  ❌ Error loading OTP routes:', error);
}

console.log('🎉 All routes loaded successfully!');

// Health check route
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  };
  
  console.log('🏥 Health check:', health);
  res.json(health);
});

// Simple root route to confirm API is running
app.get('/', (req, res) => {
  res.json({
    message: 'FixMyArea API is running...',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      locations: '/api/locations',
      complaints: '/api/complaints',
      users: '/api/users',
      reports: '/api/reports',
      dogs: '/api/dogs'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.originalUrl}`);
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/health',
      '/api/auth',
      '/api/locations',
      '/api/complaints',
      '/api/users',
      '/api/reports',
      '/api/dogs'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global error handler:', err);
  console.error('📍 Request URL:', req.originalUrl);
  console.error('📦 Request Body:', req.body);
  console.error('🔑 Request Headers:', req.headers);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('📋 Available endpoints:');
  console.log('   GET  / - API info');
  console.log('   GET  /health - Health check');
  console.log('   POST /api/auth/register - User registration');
  console.log('   POST /api/auth/login - User login');
  console.log('   GET  /api/dogs - Dog records management');
});