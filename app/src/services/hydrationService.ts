/**
 * Hydration Service - Hangover Shield
 * Firebase operations for hydration tracking
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { WaterEntry } from '../features/water/waterTypes';
import { HydrationLog } from '../stores/useUserDataStore';

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

const getTodayId = (): string => {
  return new Date().toISOString().split('T')[0];
};

// ─────────────────────────────────────────────────────────────────────────────
// Hydration Goal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get user's hydration goal from Firebase
 */
export const getHydrationGoal = async (userId: string): Promise<number> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.hydration?.dailyGoal || 1500;
    }
    return 1500; // Default goal
  } catch (error) {
    console.error('[HydrationService] Error getting hydration goal:', error);
    return 1500;
  }
};

/**
 * Set user's hydration goal in Firebase
 */
export const setHydrationGoal = async (userId: string, goalMl: number): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'hydration.dailyGoal': goalMl,
    });
    console.log('[HydrationService] Hydration goal updated:', goalMl);
  } catch (error) {
    console.error('[HydrationService] Error setting hydration goal:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Hydration Logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all hydration logs for a user
 */
export const getHydrationLogs = async (userId: string): Promise<HydrationLog> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.hydration?.logs || {};
    }
    return {};
  } catch (error) {
    console.error('[HydrationService] Error getting hydration logs:', error);
    return {};
  }
};

/**
 * Get today's hydration log
 */
export const getTodayHydrationLog = async (userId: string): Promise<WaterEntry[]> => {
  try {
    const todayId = getTodayId();
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const logs = data.hydration?.logs || {};
      return logs[todayId] || [];
    }
    return [];
  } catch (error) {
    console.error('[HydrationService] Error getting today hydration log:', error);
    return [];
  }
};

/**
 * Add a water entry to today's log
 */
export const addWaterEntry = async (
  userId: string,
  entry: WaterEntry
): Promise<void> => {
  try {
    const todayId = getTodayId();
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    let logs: HydrationLog = {};
    if (userDoc.exists()) {
      const data = userDoc.data();
      logs = data.hydration?.logs || {};
    }

    // Add entry to today's log
    if (!logs[todayId]) {
      logs[todayId] = [];
    }
    logs[todayId].push(entry);

    // Update Firebase
    await updateDoc(userDocRef, {
      'hydration.logs': logs,
    });

    console.log('[HydrationService] Water entry added:', entry.amountMl, 'ml');
  } catch (error) {
    console.error('[HydrationService] Error adding water entry:', error);
    throw error;
  }
};

/**
 * Delete a water entry
 */
export const deleteWaterEntry = async (
  userId: string,
  dateId: string,
  entryId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const data = userDoc.data();
    const logs: HydrationLog = data.hydration?.logs || {};

    if (logs[dateId]) {
      logs[dateId] = logs[dateId].filter((entry) => entry.id !== entryId);
    }

    await updateDoc(userDocRef, {
      'hydration.logs': logs,
    });

    console.log('[HydrationService] Water entry deleted:', entryId);
  } catch (error) {
    console.error('[HydrationService] Error deleting water entry:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize hydration data for a new user
 */
export const initializeHydrationData = async (userId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        hydration: {
          dailyGoal: 1500,
          logs: {},
        },
      });
    } else {
      const data = userDoc.data();
      if (!data.hydration) {
        await updateDoc(userDocRef, {
          hydration: {
            dailyGoal: 1500,
            logs: {},
          },
        });
      }
    }

    console.log('[HydrationService] Hydration data initialized');
  } catch (error) {
    console.error('[HydrationService] Error initializing hydration data:', error);
    throw error;
  }
};
