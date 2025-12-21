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
  query,
  orderBy,
  limit as firestoreLimit,
  runTransaction,
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
    if (__DEV__) {
      console.log('[HydrationService] Error getting hydration goal:', error);
    }
    return 1500;
  }
};

/**
 * Set user's hydration goal in Firebase
 */
export const setHydrationGoal = async (userId: string, goalMl: number): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        hydration: {
          dailyGoal: goalMl,
        },
      },
      { merge: true }
    );
    if (__DEV__) {
      console.log('[HydrationService] Hydration goal updated:', goalMl);
    }
  } catch (error) {
    console.error('[HydrationService] Error setting hydration goal:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Hydration Logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get recent hydration logs for a user (subcollection /users/{uid}/waterLogs/{dayId})
 * ordered by updatedAt desc, limited.
 */
export const getRecentWaterLogs = async (
  userId: string,
  limitDays = 30
): Promise<HydrationLog> => {
  try {
    const colRef = collection(db, 'users', userId, 'waterLogs');
    const q = query(colRef, orderBy('updatedAt', 'desc'), firestoreLimit(limitDays));
    const snap = await getDocs(q);
    const logs: HydrationLog = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data() as { entries?: WaterEntry[] };
      logs[docSnap.id] = data.entries || [];
    });
    return logs;
  } catch (error) {
    if (__DEV__) {
      console.log('[HydrationService] Error getting recent water logs:', error);
    }
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
    if (__DEV__) {
      console.log('[HydrationService] Error getting today hydration log:', error);
    }
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

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(docRef);
      const existing = snap.exists() ? ((snap.data().entries as WaterEntry[]) || []) : [];
      const nextEntries = [...existing, entry];
      tx.set(docRef, { entries: nextEntries, updatedAt: serverTimestamp() }, { merge: true });
    });

    if (__DEV__) {
      console.log('[HydrationService] Water entry added:', entry.amountMl, 'ml');
    }
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

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists()) {
        return;
      }
      const data = snap.data() as { entries?: WaterEntry[] };
      const filtered = (data.entries || []).filter((entry) => entry.id !== entryId);
      tx.set(docRef, { entries: filtered, updatedAt: serverTimestamp() }, { merge: true });
    });

    if (__DEV__) {
      console.log('[HydrationService] Water entry deleted:', entryId);
    }
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

    if (__DEV__) {
      console.log('[HydrationService] Hydration data initialized');
    }
  } catch (error) {
    console.error('[HydrationService] Error initializing hydration data:', error);
    throw error;
  }
};
