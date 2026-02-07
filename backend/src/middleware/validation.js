import { body, param, validationResult } from 'express-validator';

/**
 * Validation middleware for upload endpoint
 */
export const validateUpload = [
  body('type')
    .isIn(['text', 'file'])
    .withMessage('Type must be either "text" or "file"'),
  
  body('content')
    .if(body('type').equals('text'))
    .notEmpty()
    .withMessage('Content is required for text uploads')
    .isLength({ max: 50000 })
    .withMessage('Content exceeds maximum length of 50000 characters'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be in ISO 8601 format')
    .custom((value) => {
      const expiryDate = new Date(value);
      if (expiryDate <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation middleware for content retrieval endpoint
 */
export const validateUniqueId = [
  param('uniqueId')
    .notEmpty()
    .withMessage('Unique ID is required')
    .isLength({ min: 12, max: 12 })
    .withMessage('Invalid unique ID format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
