/**
 * Utility to clear today's check-in for testing
 * Can be called from console or dev menu
 */

import { deleteTodayDailyCheckIn } from '../services/dailyCheckIn';
import { deleteLocalDailyCheckIn } from '../services/dailyCheckInStorage';

/**
 * Clear today's check-in (local + Firestore if uid provided)
 * Usage: import { clearTodayCheckIn } from './utils/clearTodayCheckIn'; clearTodayCheckIn(uid);
 */
export const clearTodayCheckIn = async (uid?: string): Promise<void> => {
  try {
    console.log('[clearTodayCheckIn] Clearing today\'s check-in...');
    
    // Clear local storage
    await deleteLocalDailyCheckIn();
    console.log('[clearTodayCheckIn] ✓ Local storage cleared');
    
    // Clear Firestore if uid provided
    if (uid) {
      await deleteTodayDailyCheckIn(uid);
      console.log('[clearTodayCheckIn] ✓ Firestore cleared');
    }
    
    console.log('[clearTodayCheckIn] ✓ Done! Refresh the app to see changes.');
  } catch (error) {
    console.error('[clearTodayCheckIn] Error:', error);
  }
};

// Make it available globally for easy console access
if (typeof global !== 'undefined') {
  (global as any).clearTodayCheckIn = clearTodayCheckIn;
}

