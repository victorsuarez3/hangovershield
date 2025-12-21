/**
 * Hydration Service - Hangover Shield
 * Firebase operations for hydration tracking
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { WaterEntry } from '../features/water/waterTypes';
import { HydrationLog } from '../stores/useUserDataStore';
import { getTodayId } from '../utils/dateUtils';

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
 * Get all hydration logs for a user (subcollection /users/{uid}/waterLogs/{dayId})
 */
export const getHydrationLogs = async (userId: string): Promise<HydrationLog> => {
  try {
    const colRef = collection(db, 'users', userId, 'waterLogs');
    const snap = await getDocs(colRef);
    const logs: HydrationLog = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data() as { entries?: WaterEntry[] };
      logs[docSnap.id] = data.entries || [];
    });
    return logs;
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
    const docSnap = await getDoc(doc(db, 'users', userId, 'waterLogs', todayId));
    if (docSnap.exists()) {
      const data = docSnap.data() as { entries?: WaterEntry[] };
      return data.entries || [];
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
    const docRef = doc(db, 'users', userId, 'waterLogs', todayId);
    const docSnap = await getDoc(docRef);
    const existing = docSnap.exists() ? (docSnap.data().entries as WaterEntry[] | undefined) : [];
    const nextEntries = [...(existing || []), entry];

    await setDoc(docRef, { entries: nextEntries, updatedAt: serverTimestamp() }, { merge: true });

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
    const docRef = doc(db, 'users', userId, 'waterLogs', dateId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return;
    }
    const data = docSnap.data() as { entries?: WaterEntry[] };
    const filtered = (data.entries || []).filter((entry) => entry.id !== entryId);
    await setDoc(docRef, { entries: filtered, updatedAt: serverTimestamp() }, { merge: true });

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
        },
      });
    } else {
      const data = userDoc.data();
      if (!data.hydration) {
        await updateDoc(userDocRef, {
          hydration: {
            dailyGoal: 1500,
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
