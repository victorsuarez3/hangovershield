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
 */
export const deleteLocalDailyCheckIn = async (dateId?: string): Promise<boolean> => {
  try {
    const targetDateId = dateId || getLocalDayId();
    const storageKey = getStorageKey(targetDateId);
    await AsyncStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('[dailyCheckInStorage] Error deleting local check-in:', error);
    return false;
  }
};

