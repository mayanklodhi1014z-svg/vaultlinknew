import express from 'express';
import { uploadContent, getContent } from '../controllers/contentController.js';
import upload from '../middleware/upload.js';
import { validateUpload, validateUniqueId } from '../middleware/validation.js';
import { uploadLimiter, contentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload text or file content
 * @access  Public (rate-limited)
 */
router.post('/upload', uploadLimiter, upload.single('file'), validateUpload, uploadContent);

/**
 * @route   GET /api/content/:uniqueId
 * @desc    Retrieve content by unique ID
 * @access  Public (rate-limited)
 */
router.get('/content/:uniqueId', contentLimiter, validateUniqueId, getContent);

export default router;
