import { getCloudinary } from '../config/cloudinary.js';
import { nanoid } from 'nanoid';

/**
 * Upload file to Cloudinary
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} - Object containing file URL and metadata
 */
export const uploadFileToStorage = async (file) => {
  try {
    const cloudinary = getCloudinary();
    
    // Generate unique public ID
    const uniqueId = nanoid();
    
    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      public_id: uniqueId,
      resource_type: 'auto', // Automatically detect file type
      folder: 'vaultlink' // Organize files in a folder
    });

    return {
      url: result.secure_url,
      fileName: file.originalname,
      fileSize: file.size,
      storagePath: result.public_id // Store public_id for deletion
    };
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} storagePath - Public ID of the file
 */
export const deleteFileFromStorage = async (storagePath) => {
  try {
    const cloudinary = getCloudinary();
    
    await cloudinary.uploader.destroy(storagePath);
    console.log(`Deleted file: ${storagePath}`);
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
    // Don't throw - cleanup should continue even if file deletion fails
  }
};