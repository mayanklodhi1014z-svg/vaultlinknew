import { nanoid } from 'nanoid';
import Content from '../models/Content.js';
import { uploadFileToStorage } from '../services/storageService.js';
import https from 'https';
import http from 'http';

/**
 * Upload text or file content
 * POST /api/upload
 */
export const uploadContent = async (req, res) => {
  try {
    const { type, content, expiryDate, oneTimeView } = req.body;
    
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
      expiresAt,
      oneTimeView: oneTimeView === true || oneTimeView === 'true'
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
      
      // Upload file to Firebase Storage
      const uploadResult = await uploadFileToStorage(req.file);
      
      contentData.fileName = uploadResult.fileName;
      contentData.fileSize = uploadResult.fileSize;
      contentData.fileUrl = uploadResult.url;
      contentData.storagePath = uploadResult.storagePath;
      contentData.resourceType = uploadResult.resourceType || 'auto';
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
    
    // Check if it's a one-time view and has already been viewed
    if (content.oneTimeView && content.viewCount > 0) {
      return res.status(410).json({
        success: false,
        message: 'This content was a one-time view link and has already been accessed'
      });
    }
    
    // Increment view count
    content.viewCount += 1;
    await content.save();
    
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
        downloadUrl: `/api/download/${uniqueId}`,
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

/**
 * Download file by unique ID
 * GET /api/download/:uniqueId
 */
export const downloadFile = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    
    // Find content by unique ID
    const content = await Content.findOne({ uniqueId });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Check if content has expired
    if (content.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'File has expired'
      });
    }
    
    // Check if it's a file type
    if (content.type !== 'file') {
      return res.status(400).json({
        success: false,
        message: 'This content is not a file'
      });
    }
    
    // Fetch file from Cloudinary and stream to client
    const protocol = content.fileUrl.startsWith('https') ? https : http;
    
    protocol.get(content.fileUrl, (fileStream) => {
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(content.fileName)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', content.fileSize);
      
      // Pipe the file stream to response
      fileStream.pipe(res);
    }).on('error', (error) => {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    });
    
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};
