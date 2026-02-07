import { v2 as cloudinary } from 'cloudinary';

/**
 * Initialize Cloudinary
 */
const initializeCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log('Cloudinary initialized successfully');
  } catch (error) {
    console.error('Cloudinary initialization error:', error.message);
    throw error;
  }
};

/**
 * Get Cloudinary instance
 */
const getCloudinary = () => {
  return cloudinary;
};

export { initializeCloudinary, getCloudinary };