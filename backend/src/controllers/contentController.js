import { nanoid } from 'nanoid';
import Content from '../models/Content.js';
import { uploadFileToStorage } from '../services/storageService.js';

/**
 * Upload text or file content
 * POST /api/upload
 */
export const uploadContent = async (req, res) => {
  try {
    const { type, content, expiryDate } = req.body;
    
    // Generate unique ID (12 characters)
    const uniqueId = nanoid(12);
    
    // Calculate expiry date (default: 10 minutes from now)
    let expiresAt;
    if (expiryDate) {
      expiresAt = new Date(expiryDate);
    } else {
      expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }
    
    let contentData = {
      uniqueId,
      type,
      expiresAt
    };
    
    if (type === 'text') {
      // Sanitize text content to prevent XSS - escape HTML entities
      const sanitizedContent = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      contentData.content = sanitizedContent;
    } else if (type === 'file') {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      // Upload file to Cloudinary
      const uploadResult = await uploadFileToStorage(req.file);
      
      contentData.fileName = uploadResult.fileName;
      contentData.fileSize = uploadResult.fileSize;
      contentData.fileUrl = uploadResult.url;
      contentData.storagePath = uploadResult.storagePath;
    }
    
    // Save to database
    const newContent = new Content(contentData);
    await newContent.save();
    
    // Generate shareable URL
    const shareUrl = `${process.env.FRONTEND_URL}/share/${uniqueId}`;
    
    res.status(201).json({
      success: true,
      shareUrl,
      uniqueId,
      expiresAt
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};

/**
 * Retrieve content by unique ID
 * GET /api/content/:uniqueId
 */
export const getContent = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    
    // Find content by unique ID
    const content = await Content.findOne({ uniqueId });
    
    if (!content) {
      return res.status(403).json({
        success: false,
        message: 'Content not found or invalid link'
      });
    }
    
    // Check if content has expired
    if (content.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Content has expired'
      });
    }
    
    // Return appropriate response based on content type
    if (content.type === 'text') {
      res.json({
        success: true,
        type: 'text',
        content: content.content,
        expiresAt: content.expiresAt
      });
    } else if (content.type === 'file') {
      res.json({
        success: true,
        type: 'file',
        fileName: content.fileName,
        fileSize: content.fileSize,
        downloadUrl: content.fileUrl,
        expiresAt: content.expiresAt
      });
    }
    
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve content',
      error: error.message
    });
  }
};
