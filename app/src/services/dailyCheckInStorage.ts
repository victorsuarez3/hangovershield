/**
 * Daily Check-In Local Storage Service
 * Handles local caching of daily check-ins for fast access
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayId } from '../utils/dateUtils';
import { DailyCheckInSeverity } from './dailyCheckIn';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LocalDailyCheckIn {
  id: string; // YYYY-MM-DD
  createdAt: number; // Unix timestamp
  level: DailyCheckInSeverity;
  symptoms: string[];
  source: 'daily_checkin' | 'other';
  version: number;
  // Alcohol flags (optional for backward compatibility)
  drankLastNight?: boolean;
  drinkingToday?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage Keys
// ─────────────────────────────────────────────────────────────────────────────

const getStorageKey = (dateId: string): string => {
  return `dailyCheckin:${dateId}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Local Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get local day ID (YYYY-MM-DD) robustly
 */
export const getLocalDayId = (): string => {
  return getTodayId();
};

/**
 * Save daily check-in to local storage
 */
export const saveLocalDailyCheckIn = async (
  checkIn: Omit<LocalDailyCheckIn, 'createdAt' | 'version'>
): Promise<boolean> => {
  try {
    const dateId = checkIn.id || getLocalDayId();
    const storageKey = getStorageKey(dateId);
    
    const localCheckIn: LocalDailyCheckIn = {
      ...checkIn,
      id: dateId,
      createdAt: Date.now(),
      version: 1,
    };

    await AsyncStorage.setItem(storageKey, JSON.stringify(localCheckIn));
    return true;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error saving local check-in:', error);
    return false;
  }
};

/**
 * Get daily check-in from local storage
 */
export const getLocalDailyCheckIn = async (
  dateId?: string
): Promise<LocalDailyCheckIn | null> => {
  try {
    const targetDateId = dateId || getLocalDayId();
    const storageKey = getStorageKey(targetDateId);
    
    const stored = await AsyncStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as LocalDailyCheckIn;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error getting local check-in:', error);
    return null;
  }
};

/**
 * Check if user has checked in today (local check - fast)
 */
export const hasCheckedInTodayLocal = async (): Promise<boolean> => {
  const todayCheckIn = await getLocalDailyCheckIn();
  return todayCheckIn !== null;
};

/**
 * Delete local check-in (for testing or reset)
 * Also clears plan completion and step states
 */
export const deleteLocalDailyCheckIn = async (dateId?: string): Promise<boolean> => {
  try {
    const targetDateId = dateId || getLocalDayId();
    const storageKey = getStorageKey(targetDateId);
    await AsyncStorage.removeItem(storageKey);
    
    // Also delete plan completion status
    const planCompletionKey = `planCompleted:${targetDateId}`;
    await AsyncStorage.removeItem(planCompletionKey);
    
    // Also delete plan steps state
    const planStepsKey = `planSteps:${targetDateId}`;
    await AsyncStorage.removeItem(planStepsKey);
    
    // Also delete CheckInComplete shown flag
    const checkInCompleteShownKey = `checkInCompleteShown:${targetDateId}`;
    await AsyncStorage.removeItem(checkInCompleteShownKey);
    
    if (__DEV__) {
      console.log('[dailyCheckInStorage] Cleared all local data for:', targetDateId);
    }
    
    return true;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error deleting local check-in:', error);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Plan Completion Storage
// ─────────────────────────────────────────────────────────────────────────────

export interface LocalPlanCompletion {
  dateId: string; // YYYY-MM-DD
  completed: boolean;
  completedAt: number; // Unix timestamp
  stepsCompleted: number;
  totalSteps: number;
}

/**
 * Save plan completion status to local storage
 */
export const saveLocalPlanCompletion = async (
  dateId: string,
  stepsCompleted: number,
  totalSteps: number
): Promise<boolean> => {
  try {
    const storageKey = `planCompleted:${dateId}`;
    const completion: LocalPlanCompletion = {
      dateId,
      completed: true,
      completedAt: Date.now(),
      stepsCompleted,
      totalSteps,
    };
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(completion));
    if (__DEV__) {
      console.log('[dailyCheckInStorage] Saved plan completion:', {
        dateId,
        stepsCompleted,
        totalSteps,
      });
    }
    return true;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error saving plan completion:', error);
    return false;
  }
};

/**
 * Get plan completion status from local storage
 */
export const getLocalPlanCompletion = async (
  dateId?: string
): Promise<LocalPlanCompletion | null> => {
  try {
    const targetDateId = dateId || getLocalDayId();
    const storageKey = `planCompleted:${targetDateId}`;
    
    const stored = await AsyncStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }
    
    return JSON.parse(stored) as LocalPlanCompletion;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error getting plan completion:', error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Plan Steps State Storage (Individual step completion tracking)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map of step ID to completion status for a given day
 */
export interface LocalPlanStepsState {
  dateId: string; // YYYY-MM-DD
  steps: Record<string, boolean>; // stepId -> completed
  updatedAt: number; // Unix timestamp
}

/**
 * Save individual step completion states for a day
 */
export const saveLocalPlanStepsState = async (
  dateId: string,
  steps: Record<string, boolean>
): Promise<boolean> => {
  try {
    const storageKey = `planSteps:${dateId}`;
    const state: LocalPlanStepsState = {
      dateId,
      steps,
      updatedAt: Date.now(),
    };
    
    await AsyncStorage.setItem(storageKey, JSON.stringify(state));
    if (__DEV__) {
      console.log('[dailyCheckInStorage] Saved plan steps state:', {
        dateId,
        stepsCount: Object.keys(steps).length,
        completedCount: Object.values(steps).filter(Boolean).length,
      });
    }
    return true;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error saving plan steps state:', error);
    return false;
  }
};

/**
 * Get individual step completion states for a day
 */
export const getLocalPlanStepsState = async (
  dateId?: string
): Promise<LocalPlanStepsState | null> => {
  try {
    const targetDateId = dateId || getLocalDayId();
    const storageKey = `planSteps:${targetDateId}`;
    
    const stored = await AsyncStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }
    
    return JSON.parse(stored) as LocalPlanStepsState;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error getting plan steps state:', error);
    return null;
  }
};

/**
 * Update a single step's completion state
 */
export const updateLocalPlanStepState = async (
  dateId: string,
  stepId: string,
  completed: boolean
): Promise<boolean> => {
  try {
    // Get current state
    const currentState = await getLocalPlanStepsState(dateId);
    const steps = currentState?.steps || {};
    
    // Update the specific step
    steps[stepId] = completed;
    
    // Save updated state
    return await saveLocalPlanStepsState(dateId, steps);
  } catch (error) {
    console.error('[dailyCheckInStorage] Error updating plan step state:', error);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CheckInComplete Screen Tracking (show only once per day)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark that CheckInComplete screen was shown for today
 */
export const markCheckInCompleteShown = async (dateId?: string): Promise<boolean> => {
  try {
    const targetDateId = dateId || getLocalDayId();
    const storageKey = `checkInCompleteShown:${targetDateId}`;
    await AsyncStorage.setItem(storageKey, 'true');
    return true;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error marking CheckInComplete as shown:', error);
    return false;
  }
};

/**
 * Check if CheckInComplete screen was already shown today
 */
export const wasCheckInCompleteShown = async (dateId?: string): Promise<boolean> => {
  try {
    const targetDateId = dateId || getLocalDayId();
    const storageKey = `checkInCompleteShown:${targetDateId}`;
    const shown = await AsyncStorage.getItem(storageKey);
    return shown === 'true';
  } catch (error) {
    console.error('[dailyCheckInStorage] Error checking CheckInComplete shown status:', error);
    return false;
  }
};

