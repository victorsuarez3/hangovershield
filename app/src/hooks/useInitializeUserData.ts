/**
 * User Data Initialization Hook - Hangover Shield
 * Loads user data from Firebase and populates Zustand store on app start
 */

import { useEffect, useState } from 'react';
import { useUserDataStore } from '../stores/useUserDataStore';
import {
  getHydrationGoal,
  getHydrationLogs,
  initializeHydrationData,
} from '../services/hydrationService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CheckInData } from '../stores/useUserDataStore';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseInitializeUserDataReturn {
  isLoading: boolean;
  error: Error | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

const getTodayId = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterdayId = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * Get check-in data for a specific date
 */
const getCheckInForDate = async (
  userId: string,
  dateId: string
): Promise<CheckInData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const checkins = data.checkins || {};
      return checkins[dateId] || null;
    }
    return null;
  } catch (error) {
    console.error('[useInitializeUserData] Error getting check-in:', error);
    return null;
  }
};

/**
 * Calculate streak based on check-in history
 */
const calculateStreak = async (userId: string): Promise<number> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return 0;

    const data = userDoc.data();
    const checkins = data.checkins || {};

    let streak = 0;
    let currentDate = new Date();

    // Check backwards from today
    while (true) {
      const dateId = currentDate.toISOString().split('T')[0];
      const checkIn = checkins[dateId];

      if (checkIn && checkIn.completed) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('[useInitializeUserData] Error calculating streak:', error);
    return 0;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to initialize user data from Firebase on app start
 * Loads hydration data, check-ins, and streak into Zustand store
 */
export const useInitializeUserData = (
  userId: string | null
): UseInitializeUserDataReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    setHydrationGoal,
    setHydrationLogs,
    setCheckInToday,
    setCheckInYesterday,
    setStreak,
    pickMotivationalHeader,
  } = useUserDataStore();

  useEffect(() => {
    const initializeData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('[useInitializeUserData] Initializing user data for:', userId);

        // Initialize hydration data if needed
        await initializeHydrationData(userId);

        // Load hydration goal
        const goal = await getHydrationGoal(userId);
        setHydrationGoal(goal);
        console.log('[useInitializeUserData] Loaded hydration goal:', goal);

        // Load hydration logs
        const logs = await getHydrationLogs(userId);
        setHydrationLogs(logs);
        console.log('[useInitializeUserData] Loaded hydration logs');

        // Load today's check-in
        const todayId = getTodayId();
        const todayCheckIn = await getCheckInForDate(userId, todayId);
        setCheckInToday(todayCheckIn);
        console.log('[useInitializeUserData] Loaded today check-in:', todayCheckIn);

        // Load yesterday's check-in
        const yesterdayId = getYesterdayId();
        const yesterdayCheckIn = await getCheckInForDate(userId, yesterdayId);
        setCheckInYesterday(yesterdayCheckIn);
        console.log('[useInitializeUserData] Loaded yesterday check-in:', yesterdayCheckIn);

        // Calculate and set streak
        const streak = await calculateStreak(userId);
        setStreak(streak);
        console.log('[useInitializeUserData] Calculated streak:', streak);

        // Pick random motivational header
        pickMotivationalHeader();

        console.log('[useInitializeUserData] Initialization complete');
        setIsLoading(false);
      } catch (err) {
        console.error('[useInitializeUserData] Error initializing user data:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    initializeData();
  }, [userId]);

  return { isLoading, error };
};
