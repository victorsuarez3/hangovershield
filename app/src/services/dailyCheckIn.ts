/**
 * Daily Check-In Service - Hangover Shield
 * Firestore helpers for daily check-in persistence
 * Single source of truth for daily check-ins and recovery plans
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getTodayId } from '../utils/dateUtils';
// Import plan types for unified storage
import { RecoveryPlan, MicroAction } from '../domain/recovery/planGenerator';
import { RecoveryAction } from '../screens/TodayRecoveryPlanScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DailyCheckInSeverity = 'mild' | 'moderate' | 'severe' | 'none';

export interface DailyCheckInData {
  date: string; // "YYYY-MM-DD"
  createdAt: Timestamp | null;
  completedAt?: Timestamp | null; // When check-in was completed (not plan completion)
  severity: DailyCheckInSeverity;
  severityLabel: string;
  symptoms: string[];
  isHungover: boolean;
  // Alcohol flags (optional for backward compatibility)
  drankLastNight?: boolean;
  drinkingToday?: boolean;
  // Generated plan (single source of truth)
  generatedPlan?: {
    recoveryWindow: { min: number; max: number };
    recoveryWindowLabel: string;
    hydrationGoalLiters: number;
    steps: RecoveryAction[];
    symptomLabels: string[];
  };
  microStep?: MicroAction;
  recoveryScore?: number; // Inputs for recovery score calculation
  // Plan completion tracking
  planCompleted?: boolean;
  planCompletedAt?: Timestamp | null;
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

export interface DailyCheckInWithPlan extends DailyCheckInData {
  generatedPlan: {
    recoveryWindow: { min: number; max: number };
    recoveryWindowLabel: string;
    hydrationGoalLiters: number;
    steps: RecoveryAction[];
    symptomLabels: string[];
    levelLabel?: string;
  };
  microStep: MicroAction;
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
 * Get today's date key (YYYY-MM-DD) in local timezone
 * Single source of truth for date keys
 */
export const getTodayKey = (): string => {
  return getTodayId();
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
 * Create or update today's check-in with generated plan
 * Single source of truth: both onboarding and daily check-in use this
 */
export const createOrUpdateTodayCheckIn = async (
  uid: string,
  input: DailyCheckInInput,
  plan: RecoveryPlan
): Promise<boolean> => {
  try {
    const todayId = getTodayId();
    const docRef = doc(db, 'users', uid, 'dailyCheckIns', todayId);

    const completionTimestamp = serverTimestamp();
    const data: Omit<DailyCheckInData, 'createdAt' | 'completedAt'> & { 
      createdAt: ReturnType<typeof serverTimestamp>;
      completedAt: ReturnType<typeof serverTimestamp>;
      checkInCompletedAt: ReturnType<typeof serverTimestamp>;
    } = {
      date: todayId, // invariant: date matches docId
      createdAt: completionTimestamp,
      completedAt: completionTimestamp, // legacy field
      checkInCompletedAt: completionTimestamp, // source of truth for check-in completion
      severity: input.severity,
      severityLabel: input.severityLabel,
      symptoms: input.symptoms,
      isHungover: input.severity !== 'none',
      drankLastNight: input.drankLastNight,
      drinkingToday: input.drinkingToday,
      // Store generated plan (single source of truth)
      generatedPlan: {
        recoveryWindow: plan.recoveryWindow,
        recoveryWindowLabel: plan.recoveryWindowLabel,
        hydrationGoalLiters: plan.hydrationGoalLiters,
        steps: plan.steps,
        symptomLabels: plan.symptomLabels,
        levelLabel: plan.levelLabel,
      },
      microStep: plan.microAction,
    };

    await setDoc(docRef, data);
    console.log('[createOrUpdateTodayCheckIn] Saved check-in with plan for:', todayId);
    return true;
  } catch (error) {
    console.error('[createOrUpdateTodayCheckIn] Error:', error);
    return false;
  }
};

/**
 * Ensure today's plan exists - create if missing, return existing if present
 * Prevents regenerating different plans for the same day
 */
export const ensureTodayPlan = async (
  uid: string,
  input: DailyCheckInInput
): Promise<DailyCheckInWithPlan | null> => {
  try {
    // Check if today's check-in already exists
    const existing = await getTodayDailyCheckIn(uid);
    
    if (existing && existing.generatedPlan && existing.microStep) {
      // Plan already exists, return it
      console.log('[ensureTodayPlan] Using existing plan for today');
      return existing as DailyCheckInWithPlan;
    }

    // Generate new plan using centralized generator
    const { generatePlan } = await import('../domain/recovery/planGenerator');
    
    // Map severity to FeelingOption and symptoms to SymptomKey[]
    const feeling = input.severity as 'mild' | 'moderate' | 'severe' | 'none';
    const symptomKeys = input.symptoms.filter((s): s is 'headache' | 'nausea' | 'dryMouth' | 'dizziness' | 'fatigue' | 'anxiety' | 'brainFog' | 'poorSleep' | 'noSymptoms' => {
      return ['headache', 'nausea', 'dryMouth', 'dizziness', 'fatigue', 'anxiety', 'brainFog', 'poorSleep', 'noSymptoms'].includes(s);
    }) as any[];

    const plan = generatePlan({
      level: feeling,
      symptoms: symptomKeys,
      drankLastNight: input.drankLastNight,
      drinkingToday: input.drinkingToday,
    });

    // Save check-in with plan
    const saved = await createOrUpdateTodayCheckIn(uid, input, plan);
    if (!saved) {
      return null;
    }

    // Return the saved data
    const savedCheckIn = await getTodayDailyCheckIn(uid);
    if (savedCheckIn && savedCheckIn.generatedPlan && savedCheckIn.microStep) {
      return savedCheckIn as DailyCheckInWithPlan;
    }

    return null;
  } catch (error) {
    console.error('[ensureTodayPlan] Error:', error);
    return null;
  }
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
      planCompletedAt: serverTimestamp(),
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

/**
 * Delete today's daily check-in (for testing/reset)
 * Deletes from both Firestore and local storage
 */
export const deleteTodayDailyCheckIn = async (uid?: string): Promise<boolean> => {
  try {
    const todayId = getTodayId();
    
    // Delete from local storage
    const { deleteLocalDailyCheckIn } = await import('./dailyCheckInStorage');
    await deleteLocalDailyCheckIn(todayId);
    
    // Delete from Firestore if user is logged in
    if (uid) {
      try {
        const docRef = doc(db, 'users', uid, 'dailyCheckIns', todayId);
        await deleteDoc(docRef);
        console.log('[deleteTodayDailyCheckIn] Deleted from Firestore');
      } catch (error) {
        console.error('[deleteTodayDailyCheckIn] Error deleting from Firestore:', error);
        // Continue anyway - local deletion succeeded
      }
    }
    
    return true;
  } catch (error) {
    console.error('[deleteTodayDailyCheckIn] Error:', error);
    return false;
  }
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

