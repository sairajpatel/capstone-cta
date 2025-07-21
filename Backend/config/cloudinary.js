const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

// Verify required environment variables
const requiredEnvVars = ['CLOUDINARY_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_KEY_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required Cloudinary environment variables:', missingEnvVars);
    throw new Error('Missing required Cloudinary configuration');
}

// Configure Cloudinary
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_KEY_SECRET
    });
    
    console.log('Cloudinary configured successfully');
} catch (error) {
    console.error('Error configuring Cloudinary:', error);
    throw error;
}

module.exports = cloudinary; 