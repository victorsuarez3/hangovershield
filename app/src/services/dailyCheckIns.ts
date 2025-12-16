/**
 * Daily Check-In Service - Hangover Shield
 * Firestore operations for daily check-ins and habit tracking
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DailyCheckIn, HabitStats, HangoverSeverity } from '../types/checkins';

// ─────────────────────────────────────────────────────────────────────────────
// Daily Check-In Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save a new daily check-in to Firestore
 * Creates a new document in users/{userId}/dailyCheckIns
 */
export const saveDailyCheckIn = async (
  userId: string,
  payload: Omit<DailyCheckIn, 'id' | 'createdAt'>
): Promise<DailyCheckIn> => {
  try {
    const checkInsRef = collection(db, 'users', userId, 'dailyCheckIns');
    const newDocRef = doc(checkInsRef);

    const checkIn: DailyCheckIn = {
      ...payload,
      id: newDocRef.id,
      createdAt: Date.now(),
    };

    await setDoc(newDocRef, checkIn);
    console.log('[DailyCheckIn] Saved check-in:', checkIn.id, 'for date:', checkIn.date);

    return checkIn;
  } catch (error) {
    console.error('[DailyCheckIn] Error saving check-in:', error);
    throw error;
  }
};

/**
 * Get the latest check-in for a specific date
 * Returns null if no check-in exists for that date
 */
export const getLatestDailyCheckInForDate = async (
  userId: string,
  date: string
): Promise<DailyCheckIn | null> => {
  try {
    const checkInsRef = collection(db, 'users', userId, 'dailyCheckIns');
    const q = query(
      checkInsRef,
      where('date', '==', date),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as DailyCheckIn;
  } catch (error) {
    console.error('[DailyCheckIn] Error fetching check-in for date:', date, error);
    throw error;
  }
};

/**
 * Get recent check-ins for the user
 */
export const getRecentCheckIns = async (
  userId: string,
  limitCount: number = 30
): Promise<DailyCheckIn[]> => {
  try {
    const checkInsRef = collection(db, 'users', userId, 'dailyCheckIns');
    const q = query(checkInsRef, orderBy('createdAt', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as DailyCheckIn);
  } catch (error) {
    console.error('[DailyCheckIn] Error fetching recent check-ins:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Habit Stats Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current habit stats for a user
 * Returns default stats if none exist
 */
export const getHabitStats = async (userId: string): Promise<HabitStats> => {
  try {
    const statsRef = doc(db, 'users', userId, 'habitStats', 'stats');
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      // Return default stats
      return {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        monthlyCheckIns: 0,
        updatedAt: Date.now(),
      };
    }

    return statsDoc.data() as HabitStats;
  } catch (error) {
    console.error('[DailyCheckIn] Error fetching habit stats:', error);
    throw error;
  }
};

/**
 * Update habit stats after a check-in
 * Calculates streaks and monthly counts
 */
export const updateHabitStatsAfterCheckIn = async (
  userId: string,
  checkInDate: string
): Promise<HabitStats> => {
  try {
    // Get current stats
    const currentStats = await getHabitStats(userId);

    // Parse dates for comparison
    const checkInDateObj = new Date(checkInDate);
    const lastCheckInDateObj = currentStats.lastCheckInDate
      ? new Date(currentStats.lastCheckInDate)
      : null;

    let newStreak = currentStats.currentStreak;

    // Calculate streak
    if (!lastCheckInDateObj) {
      // First check-in ever
      newStreak = 1;
      console.log('[HabitStats] First check-in - starting streak at 1');
    } else {
      const daysDiff = Math.floor(
        (checkInDateObj.getTime() - lastCheckInDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Same day - keep streak unchanged
        newStreak = currentStats.currentStreak;
        console.log('[HabitStats] Same day check-in - streak unchanged:', newStreak);
      } else if (daysDiff === 1) {
        // Next consecutive day - increment streak
        newStreak = currentStats.currentStreak + 1;
        console.log('[HabitStats] Consecutive day - streak incremented:', newStreak);
      } else {
        // Gap > 1 day - reset streak to 1
        newStreak = 1;
        console.log('[HabitStats] Streak broken - reset to 1 (gap:', daysDiff, 'days)');
      }
    }

    // Calculate monthly check-ins
    const currentMonth = checkInDateObj.getMonth();
    const currentYear = checkInDateObj.getFullYear();
    const lastCheckInMonth = lastCheckInDateObj?.getMonth();
    const lastCheckInYear = lastCheckInDateObj?.getFullYear();

    let monthlyCheckIns = currentStats.monthlyCheckIns;

    if (
      !lastCheckInDateObj ||
      currentMonth !== lastCheckInMonth ||
      currentYear !== lastCheckInYear
    ) {
      // First check-in of a new month - reset count
      monthlyCheckIns = 1;
      console.log('[HabitStats] New month - monthly count reset to 1');
    } else if (lastCheckInDateObj && checkInDate !== currentStats.lastCheckInDate) {
      // Same month, different day - increment
      monthlyCheckIns = currentStats.monthlyCheckIns + 1;
      console.log('[HabitStats] Same month, new day - monthly count:', monthlyCheckIns);
    }
    // If same day, keep monthlyCheckIns unchanged

    // Update longest streak if current exceeds it
    const longestStreak = Math.max(newStreak, currentStats.longestStreak);

    // Build updated stats
    const updatedStats: HabitStats = {
      userId,
      currentStreak: newStreak,
      longestStreak,
      monthlyCheckIns,
      lastCheckInDate: checkInDate,
      updatedAt: Date.now(),
    };

    // Save to Firestore
    const statsRef = doc(db, 'users', userId, 'habitStats', 'stats');
    await setDoc(statsRef, updatedStats);

    console.log('[HabitStats] Updated stats:', updatedStats);

    return updatedStats;
  } catch (error) {
    console.error('[DailyCheckIn] Error updating habit stats:', error);
    throw error;
  }
};
