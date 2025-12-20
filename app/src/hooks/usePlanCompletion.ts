/**
 * Hook to check if today's plan is completed
 * Single source of truth: reads from Firestore dailyCheckIns/{todayId}
 */

import { useState, useEffect, useCallback } from 'react';
import { getTodayDailyCheckIn } from '../services/dailyCheckIn';
import { getLocalPlanCompletion } from '../services/dailyCheckInStorage';
import { getTodayId } from '../utils/dateUtils';
import { SHOW_DEV_TOOLS } from '../config/flags';

export interface UsePlanCompletionReturn {
  isPlanCompleted: boolean;
  isLoading: boolean;
  refreshPlanStatus: () => Promise<void>;
  todayId: string;
}

/**
 * Hook to check if today's recovery plan is completed
 * Reads planCompleted flag from today's daily check-in document
 */
export const usePlanCompletion = (userId: string | null): UsePlanCompletionReturn => {
  const [isPlanCompleted, setIsPlanCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate todayId inside the callback to avoid recreating it on every render
  // This prevents infinite loops when used as a dependency

  const checkPlanStatus = useCallback(async () => {
    setIsLoading(true);
    
    // Calculate todayId inside the callback to ensure it's always current
    const todayId = getTodayId();

    try {
      // First check AsyncStorage (local) - this is the source of truth when Firestore isn't available
      const localCompletion = await getLocalPlanCompletion();
      
      if (localCompletion && localCompletion.dateId === todayId && localCompletion.completed) {
        // Local plan completion exists for today
        setIsPlanCompleted(true);
        if (SHOW_DEV_TOOLS) {
          console.log('[usePlanCompletion] Plan completed (from AsyncStorage):', {
            todayId,
            stepsCompleted: localCompletion.stepsCompleted,
            totalSteps: localCompletion.totalSteps,
            source: 'AsyncStorage',
          });
        }
        setIsLoading(false);
        return;
      }

      // Fallback to Firestore if no local completion found
      if (userId) {
        try {
          const checkIn = await getTodayDailyCheckIn(userId);
          
          // Plan is completed if check-in exists AND planCompleted flag is true
          const completed = checkIn?.planCompleted === true;
          setIsPlanCompleted(completed);
          
          if (SHOW_DEV_TOOLS) {
            console.log('[usePlanCompletion] Plan status checked (from Firestore):', {
              todayId,
              checkInExists: !!checkIn,
              planCompleted: completed,
              sourceDocPath: `users/${userId}/dailyCheckIns/${todayId}`,
              source: 'Firestore',
            });
          }
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('[usePlanCompletion] Error checking Firestore:', error);
          // Continue to set false
        }
      }

      // No plan completion found in either source
      setIsPlanCompleted(false);
      if (SHOW_DEV_TOOLS) {
        console.log('[usePlanCompletion] Plan not completed:', {
          todayId,
          hasLocal: !!localCompletion,
          localDateId: localCompletion?.dateId,
        });
      }
    } catch (error) {
      console.error('[usePlanCompletion] Error checking plan completion status:', error);
      setIsPlanCompleted(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Removed todayId from dependencies - it's calculated inside the callback

  // Initial check on mount and when userId changes
  useEffect(() => {
    checkPlanStatus();
  }, [checkPlanStatus]);

  // Calculate todayId for return value (only used for display/logging)
  const todayId = getTodayId();

  return {
    isPlanCompleted,
    isLoading,
    refreshPlanStatus: checkPlanStatus,
    todayId,
  };
};

