/**
 * Daily Check-In Service - Hangover Shield
 * Firestore helpers for daily check-in persistence
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getTodayId } from '../utils/dateUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DailyCheckInSeverity = 'mild' | 'moderate' | 'severe' | 'none';

export interface DailyCheckInData {
  date: string; // "YYYY-MM-DD"
  createdAt: Timestamp | null;
  severity: DailyCheckInSeverity;
  severityLabel: string;
  symptoms: string[];
  isHungover: boolean;
  // Alcohol flags (optional for backward compatibility)
  drankLastNight?: boolean;
  drinkingToday?: boolean;
  // Plan completion tracking
  planCompleted?: boolean;
  completedAt?: Timestamp | null;
  stepsCompleted?: number;
  totalSteps?: number;
}

export interface DailyCheckInInput {
  severity: DailyCheckInSeverity;
  severityLabel: string;
  symptoms: string[];
  drankLastNight?: boolean;
  drinkingToday?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Severity Labels Map
// ─────────────────────────────────────────────────────────────────────────────

export const SEVERITY_LABELS: Record<DailyCheckInSeverity, string> = {
  mild: 'Mild hangover',
  moderate: 'Moderate hangover',
  severe: 'Severe hangover',
  none: 'Not hungover today',
};

export const SEVERITY_DESCRIPTIONS: Record<DailyCheckInSeverity, string> = {
  mild: 'Slight headache, a bit tired.',
  moderate: 'Heavy head, low energy, some nausea.',
  severe: 'Very rough morning. I want full guidance.',
  none: 'Just checking in and building healthier habits.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Symptom Options
// ─────────────────────────────────────────────────────────────────────────────

export const SYMPTOM_OPTIONS = [
  { key: 'headache', label: 'Headache' },
  { key: 'nausea', label: 'Nausea' },
  { key: 'dryMouth', label: 'Dry mouth' },
  { key: 'dizziness', label: 'Dizziness' },
  { key: 'fatigue', label: 'Low energy' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'brainFog', label: 'Brain fog' },
  { key: 'poorSleep', label: 'Poor sleep' },
  { key: 'noSymptoms', label: 'No symptoms, just checking in' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Firestore Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the daily check-in for a specific date
 */
export const getDailyCheckIn = async (
  uid: string,
  dateId: string
): Promise<DailyCheckInData | null> => {
  try {
    const docRef = doc(db, 'users', uid, 'dailyCheckIns', dateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as DailyCheckInData;
    }
    return null;
  } catch (error) {
    console.error('Error getting daily check-in:', error);
    return null;
  }
};

/**
 * Get today's daily check-in for a user
 */
export const getTodayDailyCheckIn = async (
  uid: string
): Promise<DailyCheckInData | null> => {
  const todayId = getTodayId();
  return getDailyCheckIn(uid, todayId);
};

/**
 * Save a daily check-in (overwrites if same date exists)
 */
export const saveDailyCheckIn = async (
  uid: string,
  dateId: string,
  input: DailyCheckInInput
): Promise<boolean> => {
  try {
    const docRef = doc(db, 'users', uid, 'dailyCheckIns', dateId);

    const data: Omit<DailyCheckInData, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      date: dateId,
      createdAt: serverTimestamp(),
      severity: input.severity,
      severityLabel: input.severityLabel,
      symptoms: input.symptoms,
      isHungover: input.severity !== 'none',
      drankLastNight: input.drankLastNight,
      drinkingToday: input.drinkingToday,
    };

    await setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error('Error saving daily check-in:', error);
    return false;
  }
};

/**
 * Save today's daily check-in
 */
export const saveTodayDailyCheckIn = async (
  uid: string,
  input: DailyCheckInInput
): Promise<boolean> => {
  const todayId = getTodayId();
  return saveDailyCheckIn(uid, todayId, input);
};

/**
 * Check if user has completed today's check-in
 */
export const hasTodayCheckIn = async (uid: string): Promise<boolean> => {
  const checkIn = await getTodayDailyCheckIn(uid);
  return checkIn !== null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Plan Completion Helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface MarkPlanCompletedParams {
  uid: string;
  dateId: string; // "YYYY-MM-DD"
  stepsCompleted: number;
  totalSteps: number;
}

/**
 * Mark today's recovery plan as completed
 * Uses merge: true to preserve existing check-in data
 */
export const markPlanCompletedForToday = async (
  params: MarkPlanCompletedParams
): Promise<boolean> => {
  const { uid, dateId, stepsCompleted, totalSteps } = params;

  try {
    const docRef = doc(db, 'users', uid, 'dailyCheckIns', dateId);

    const completionData = {
      date: dateId,
      planCompleted: true,
      completedAt: serverTimestamp(),
      stepsCompleted,
      totalSteps,
    };

    // Use merge: true to not overwrite existing check-in data
    await setDoc(docRef, completionData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error marking plan as completed:', error);
    return false;
  }
};

/**
 * Check if today's plan has been completed
 */
export const hasTodayPlanCompleted = async (uid: string): Promise<boolean> => {
  const checkIn = await getTodayDailyCheckIn(uid);
  return checkIn?.planCompleted === true;
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress & History Helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyCheckInSummary {
  id: string; // same as dateId "YYYY-MM-DD"
  date: string;
  planCompleted: boolean;
  stepsCompleted: number;
  totalSteps: number;
  completedAt: Timestamp | null;
  severity?: DailyCheckInSeverity;
}

export interface GetRecentCheckInsParams {
  uid?: string;
  limit?: number; // default 14
}

/**
 * Get recent daily check-ins for progress history
 * Returns array sorted by date descending (most recent first)
 */
export const getRecentCheckIns = async (
  params?: GetRecentCheckInsParams
): Promise<DailyCheckInSummary[]> => {
  const limit = params?.limit ?? 14;
  const uid = params?.uid;

  if (!uid) {
    console.warn('[getRecentCheckIns] No user ID provided');
    return [];
  }

  try {
    const collectionRef = collection(db, 'users', uid, 'dailyCheckIns');
    const q = query(
      collectionRef,
      orderBy('date', 'desc'),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(q);
    
    const summaries: DailyCheckInSummary[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        date: data.date || docSnap.id,
        planCompleted: data.planCompleted === true,
        stepsCompleted: data.stepsCompleted ?? 0,
        totalSteps: data.totalSteps ?? 0,
        completedAt: data.completedAt ?? null,
        severity: data.severity,
      };
    });

    // Sort by date descending (most recent first)
    return summaries.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error getting recent check-ins:', error);
    return [];
  }
};

/**
 * Calculate current streak (consecutive days with planCompleted === true)
 * Starting from today going backwards
 */
export const calculateStreak = (
  checkIns: DailyCheckInSummary[],
  todayId: string
): number => {
  if (checkIns.length === 0) return 0;

  // Create a map for quick lookup
  const checkInMap = new Map<string, DailyCheckInSummary>();
  checkIns.forEach((ci) => checkInMap.set(ci.date, ci));

  let streak = 0;
  let currentDate = new Date(todayId + 'T00:00:00');

  // Go backwards day by day
  for (let i = 0; i < 365; i++) {
    const dateId = currentDate.toISOString().split('T')[0];
    const checkIn = checkInMap.get(dateId);

    if (checkIn && checkIn.planCompleted) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
  }

  return streak;
};

/**
 * Count completed days in the last N days
 */
export const countCompletedInLastDays = (
  checkIns: DailyCheckInSummary[],
  todayId: string,
  days: number = 7
): number => {
  // Get date IDs for last N days
  const targetDates = new Set<string>();
  const currentDate = new Date(todayId + 'T00:00:00');
  
  for (let i = 0; i < days; i++) {
    const dateId = currentDate.toISOString().split('T')[0];
    targetDates.add(dateId);
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count completed in those dates
  return checkIns.filter(
    (ci) => targetDates.has(ci.date) && ci.planCompleted
  ).length;
};

