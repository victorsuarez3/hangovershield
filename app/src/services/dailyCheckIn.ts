/**
 * Daily Check-In Service - Hangover Shield
 * Firestore helpers for daily check-in persistence
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
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
  moderate: 'Heavy head, low energy, maybe nausea.',
  severe: 'Very rough morning. I need full guidance.',
  none: 'Just checking in and building healthy habits.',
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

