import cron from 'node-cron';
import Content from '../models/Content.js';
import { deleteFileFromStorage } from './storageService.js';

/**
 * Cleanup expired content from database and storage
 * Runs every 5 minutes
 */
export const startCleanupJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running cleanup job for expired content...');
      
      // Find all expired content
      const expiredContent = await Content.find({
        expiresAt: { $lt: new Date() }
      });

      if (expiredContent.length === 0) {
        console.log('No expired content found');
        return;
      }

      console.log(`Found ${expiredContent.length} expired items`);

      // Delete files from Firebase Storage and remove from database
      for (const item of expiredContent) {
        try {
          // Delete file from storage if it's a file upload
          if (item.type === 'file' && item.storagePath) {
            await deleteFileFromStorage(item.storagePath, item.resourceType || 'auto');
          }
          
          // Delete from database
          await Content.findByIdAndDelete(item._id);
          console.log(`Cleaned up content: ${item.uniqueId}`);
        } catch (error) {
          console.error(`Error cleaning up ${item.uniqueId}:`, error.message);
        }
      }

      console.log('Cleanup job completed');
    } catch (error) {
      console.error('Cleanup job error:', error.message);
    }
  });

  console.log('Cleanup job scheduled to run every 5 minutes');
};
