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
    
    // Determine resource type based on file type
    const mimeType = file.mimetype.toLowerCase();
    let resourceType = 'auto';
    
    // For documents (PDF, DOC, etc.), use 'raw' resource type
    if (mimeType.includes('pdf') || 
        mimeType.includes('document') || 
        mimeType.includes('msword') ||
        mimeType.includes('spreadsheet') ||
        mimeType.includes('presentation') ||
        mimeType.includes('text') ||
        mimeType.includes('zip') ||
        mimeType.includes('rar')) {
      resourceType = 'raw';
    }
    
    // Upload to Cloudinary
    const uploadOptions = {
      public_id: uniqueId,
      resource_type: resourceType,
      folder: 'vaultlink'
    };
    
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    return {
      url: result.secure_url, // Store the direct Cloudinary URL
      fileName: file.originalname,
      fileSize: file.size,
      storagePath: result.public_id,
      resourceType: resourceType
    };
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} storagePath - Public ID of the file
 * @param {String} resourceType - Resource type (auto, raw, image, video)
 */
export const deleteFileFromStorage = async (storagePath, resourceType = 'auto') => {
  try {
    const cloudinary = getCloudinary();
    
    await cloudinary.uploader.destroy(storagePath, {
      resource_type: resourceType
    });
    console.log(`Deleted file: ${storagePath} (${resourceType})`);
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
    // Don't throw - cleanup should continue even if file deletion fails
  }
};