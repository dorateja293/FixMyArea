const fileUpload = require('express-fileupload');
const cloudinary = require('../config/cloudinary');

// Supported image formats
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadOptions = fileUpload({
  limits: { fileSize: MAX_FILE_SIZE },
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: true, // Enable debug logging
  parseNested: true, // Parse nested objects
  // Remove fileFilter as it might cause issues with FormData
});

const uploadToCloudinary = async (req, res, next) => {
  console.log('📁 File upload middleware - Request files:', req.files);
  console.log('📁 File upload middleware - Request body:', req.body);
  
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('📁 No files uploaded, proceeding...');
    req.body.images = [];
    return next();
  }

  req.body.images = [];
  const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

  try {
    console.log(`📤 Uploading ${files.length} images to Cloudinary...`);
    
    for (const file of files) {
      console.log(`📁 Processing file: ${file.name} (${file.mimetype}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Validate file format
      if (!SUPPORTED_FORMATS.includes(file.mimetype.toLowerCase())) {
        throw new Error(`File ${file.name} has unsupported format. Supported formats: ${SUPPORTED_FORMATS.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'fixmyarea',
        resource_type: 'image',
        // Remove format: 'auto' as it's causing the error
        quality: 'auto', // Let Cloudinary optimize quality
      });
      
      console.log(`✅ Uploaded: ${file.name} -> ${result.secure_url}`);
      req.body.images.push(result.secure_url);
    }
    
    console.log(`🎉 Successfully uploaded ${req.body.images.length} images`);
    next();
  } catch (error) {
    console.error('🚨 Image upload error:', error);
    return res.status(400).json({ 
      success: false,
      message: 'Image upload failed', 
      error: error.message 
    });
  }
};

module.exports = { uploadOptions, uploadToCloudinary };