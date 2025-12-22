/**
 * Today Summary Hook - Hangover Shield
 * Provides daily check-in status, hydration, micro-step, recovery score, and streak
 *
 * TODO: Replace mock data with Firebase integration once backend is ready
 */

import { useState, useEffect } from 'react';
import { useUserDataStore } from '../stores/useUserDataStore';
import { useAuth } from '../providers/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CheckInStatus = 'not_started' | 'in_progress' | 'completed';

export interface TodayHydration {
  loggedMl: number;
  goalMl: number;
  percentage: number;
}

export interface StreakData {
  current: number;
  longest: number;
}

export interface TodaySummary {
  userName?: string;
  todayCheckInStatus: CheckInStatus;
  todayHydration: TodayHydration;
  todayMicroStep: string | null;
  todayRecoveryScore: number | null;
  streak: StreakData;
  microStepCompleted: boolean;
}

export interface UseTodaySummaryReturn extends TodaySummary {
  addWater: (amountMl: number) => void;
  markMicroStepDone: () => void;
  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to get today's summary data for the Home screen
 */
export const useTodaySummary = (): UseTodaySummaryReturn => {
  const { user } = useAuth();
  const {
    hydrationGoal,
    todayHydrationTotal,
    checkInToday,
    microStepToday,
    streak: currentStreak,
    computeRecoveryScore,
  } = useUserDataStore();

  const [microStepCompleted, setMicroStepCompleted] = useState(false);
  const [isLoading] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);

  // Load user name from Firestore
  useEffect(() => {
    const loadUserName = async () => {
      try {
        // TODO: REMOVE THIS MOCK - Replace with real Firestore data
        // Mock name for demo purposes
        setUserName('Victor');
        return;

        // Only run real Firestore code if user exists
        if (!user?.uid) return;

        // Real Firestore code (will be enabled when backend is ready):
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // if (userDoc.exists()) {
        //   const data = userDoc.data();
        //   const displayName = data.displayName;
        //   if (displayName) {
        //     // Extract first name
        //     setUserName(displayName.split(' ')[0]);
        //   } else if (user.email) {
        //     // Fallback to email username
        //     setUserName(user.email.split('@')[0]);
        //   }
        // } else if (user.email) {
        //   // Fallback if no Firestore doc
        //   setUserName(user.email.split('@')[0]);
        // }
      } catch (error) {
        console.error('[useTodaySummary] Error loading user name:', error);
        // Fallback to email if error
        if (user?.email) {
          setUserName(user.email.split('@')[0]);
        }
      }
    };

    loadUserName();
  }, [user?.uid, user?.email]);

  // Compute check-in status
  const todayCheckInStatus: CheckInStatus = checkInToday?.completed
    ? 'completed'
    : checkInToday
    ? 'in_progress'
    : 'not_started';

  // Compute hydration data
  const todayHydration: TodayHydration = {
    loggedMl: todayHydrationTotal,
    goalMl: hydrationGoal,
    percentage: Math.min((todayHydrationTotal / hydrationGoal) * 100, 100),
  };

  // Get recovery score
  // TODO: REMOVE THIS MOCK - Replace with real computed score from check-in data
  const todayRecoveryScore = 75; // Mock score for demo (0-100)
  // Real code (will be enabled when check-in flow is connected):
  // const todayRecoveryScore = checkInToday?.completed ? computeRecoveryScore() : null;

  // Streak data
  // TODO: Replace with actual longest streak from Firebase
  const streak: StreakData = {
    current: currentStreak,
    longest: Math.max(currentStreak, 7), // Mock longest streak
  };

  // Handlers
  const addWater = (amountMl: number) => {
    // This is handled by the component itself via hydrationService
    // Just a placeholder for the interface
    console.log(`[useTodaySummary] Add water: ${amountMl}ml`);
  };

  const markMicroStepDone = () => {
    setMicroStepCompleted(true);
    console.log('[useTodaySummary] Micro-step marked as done');
    // TODO: Save to Firebase when backend is ready
  };

  return {
    userName,
    todayCheckInStatus,
    todayHydration,
    todayMicroStep: microStepToday,
    todayRecoveryScore,
    streak,
    microStepCompleted,
    addWater,
    markMicroStepDone,
    isLoading,
  };
};
