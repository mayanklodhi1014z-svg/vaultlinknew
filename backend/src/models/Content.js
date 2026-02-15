import mongoose from 'mongoose';

/**
 * Content Schema for storing uploaded text and file metadata
 * Supports both text and file uploads with expiry management
 */
const contentSchema = new mongoose.Schema({
  // Unique identifier for sharing links (generated using nanoid)
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Type of content: 'text' or 'file'
  type: {
    type: String,
    required: true,
    enum: ['text', 'file']
  },
  
  // For text uploads: stores the actual text content
  content: {
    type: String,
    required: function() {
      return this.type === 'text';
    }
  },
  
  // For file uploads: original file name
  fileName: {
    type: String,
    required: function() {
      return this.type === 'file';
    }
  },
  
  // For file uploads: file size in bytes
  fileSize: {
    type: Number,
    required: function() {
      return this.type === 'file';
    }
  },
  
  // For file uploads: Firebase Storage URL
  fileUrl: {
    type: String,
    required: function() {
      return this.type === 'file';
    }
  },
  
  // For file uploads: Firebase Storage path (for deletion)
  storagePath: {
    type: String,
    required: function() {
      return this.type === 'file';
    }
  },
  
  // For file uploads: Cloudinary resource type (auto, raw, image, video)
  resourceType: {
    type: String,
    default: 'auto'
  },
  
  // Expiration timestamp - content becomes inaccessible after this
  expiresAt: {
    type: Date,
    required: true,
    index: true // Index for efficient cleanup queries
  },
  
  // One-time view flag - if true, content can only be viewed once
  oneTimeView: {
    type: Boolean,
    default: false
  },
  
  // View count - tracks how many times content has been accessed
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Creation timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Content = mongoose.model('Content', contentSchema);

export default Content;
