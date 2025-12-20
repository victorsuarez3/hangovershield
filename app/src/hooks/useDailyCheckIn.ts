/**
 * useDailyCheckIn Hook - Hangover Shield
 * Manages daily check-in state and routing logic
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getTodayDailyCheckIn,
  DailyCheckInData,
  DailyCheckInSeverity,
} from '../services/dailyCheckIn';
import { getLocalDailyCheckIn } from '../services/dailyCheckInStorage';
import { getTodayId } from '../utils/dateUtils';
import { SHOW_DEV_TOOLS } from '../config/flags';

export type DailyCheckInStatus = 
  | 'loading'
  | 'needs_checkin'
  | 'completed_today';

interface UseDailyCheckInReturn {
  status: DailyCheckInStatus;
  todayCheckIn: DailyCheckInData | null;
  isLoading: boolean;
  refreshCheckInStatus: () => Promise<void>;
  markCheckInCompleted: (severity: DailyCheckInSeverity, symptoms: string[]) => void;
}

// Helper to get severity label
const getSeverityLabel = (severity: DailyCheckInSeverity): string => {
  const labels: Record<DailyCheckInSeverity, string> = {
    mild: 'Mild hangover',
    moderate: 'Moderate hangover',
    severe: 'Severe hangover',
    none: 'Not hungover today',
  };
  return labels[severity];
};

/**
 * Hook to manage daily check-in status for a user
 * Used to determine if user needs to complete today's check-in
 */
export const useDailyCheckIn = (userId: string | null): UseDailyCheckInReturn => {
  const [status, setStatus] = useState<DailyCheckInStatus>('loading');
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckInData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has completed today's check-in
  // Priority: AsyncStorage (local) first, then Firestore
  const checkTodayStatus = useCallback(async () => {
    setIsLoading(true);

    try {
      // First check AsyncStorage (local) - this is the source of truth when Firestore isn't available
      const localCheckIn = await getLocalDailyCheckIn();
      const todayId = getTodayId();
      
      if (localCheckIn && localCheckIn.id === todayId) {
        // Local check-in exists for today - mark as completed
        setTodayCheckIn({
          date: localCheckIn.id,
          createdAt: null, // Local storage doesn't have Firestore timestamp
          severity: localCheckIn.level,
          severityLabel: getSeverityLabel(localCheckIn.level),
          symptoms: localCheckIn.symptoms,
          isHungover: localCheckIn.level !== 'none',
          drankLastNight: localCheckIn.drankLastNight,
          drinkingToday: localCheckIn.drinkingToday,
        });
        setStatus('completed_today');
        if (SHOW_DEV_TOOLS) {
          console.log('[useDailyCheckIn] Check-in completed (from AsyncStorage):', {
            todayId,
            severity: localCheckIn.level,
            source: 'AsyncStorage',
          });
        }
        setIsLoading(false);
        return;
      }

      // Fallback to Firestore if no local check-in found
      if (userId) {
        try {
          const checkIn = await getTodayDailyCheckIn(userId);
          
          // Check-in is completed only if it exists AND has completedAt timestamp
          if (checkIn && checkIn.completedAt) {
            setTodayCheckIn(checkIn);
            setStatus('completed_today');
            if (SHOW_DEV_TOOLS) {
              console.log('[useDailyCheckIn] Check-in completed (from Firestore):', {
                todayId,
                source: 'Firestore',
              });
            }
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('[useDailyCheckIn] Error checking Firestore:', error);
          // Continue to set needs_checkin
        }
      }

      // No check-in found in either source
      setTodayCheckIn(null);
      setStatus('needs_checkin');
      if (SHOW_DEV_TOOLS) {
        console.log('[useDailyCheckIn] No check-in found:', {
          todayId,
          hasLocal: !!localCheckIn,
          localDateId: localCheckIn?.id,
        });
      }
    } catch (error) {
      console.error('[useDailyCheckIn] Error checking daily check-in status:', error);
      // Default to needs check-in if we cannot verify
      setStatus('needs_checkin');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial check on mount and when userId changes
  useEffect(() => {
    checkTodayStatus();
  }, [checkTodayStatus]);

  // Refresh the check-in status (can be called after saving)
  const refreshCheckInStatus = useCallback(async () => {
    await checkTodayStatus();
  }, [checkTodayStatus]);

  // Mark check-in as completed locally (optimistic update)
  const markCheckInCompleted = useCallback((
    severity: DailyCheckInSeverity,
    symptoms: string[]
  ) => {
    const todayId = getTodayId();
    setTodayCheckIn({
      date: todayId,
      createdAt: null, // Will be set by Firestore
      severity,
      severityLabel: getSeverityLabel(severity),
      symptoms,
      isHungover: severity !== 'none',
    });
    setStatus('completed_today');
  }, []);

  return {
    status,
    todayCheckIn,
    isLoading,
    refreshCheckInStatus,
    markCheckInCompleted,
  };
};

export default useDailyCheckIn;

