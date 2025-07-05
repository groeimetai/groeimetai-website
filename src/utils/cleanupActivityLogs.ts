#!/usr/bin/env node

/**
 * Cleanup utility for activity logs
 * Run this script periodically (e.g., via cron job or scheduled cloud function)
 * to remove activity logs older than the retention period
 */

import { activityLogger } from '@/services/activityLogger';

async function cleanupActivityLogs() {
  console.log('Starting activity log cleanup...');
  
  try {
    const deletedCount = await activityLogger.cleanupOldLogs();
    console.log(`Successfully cleaned up ${deletedCount} old activity logs.`);
    
    // Force flush any pending logs before exit
    await activityLogger.flush();
    
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupActivityLogs();
}

export { cleanupActivityLogs };