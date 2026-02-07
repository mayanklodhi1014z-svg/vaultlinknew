import multer from 'multer';

// Configure multer to use memory storage
// Files are stored in memory as Buffer objects
const storage = multer.memoryStorage();

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// File filter - can be extended to restrict file types
const fileFilter = (req, file, cb) => {
  // Accept all file types for now
  // Can add restrictions here if needed
  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

export default upload;
