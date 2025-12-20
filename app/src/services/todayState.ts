/**
 * Today State Service
 * Single source of truth for today's check-in + plan.
 * - If user is logged in: Firestore is source of truth, local is cache.
 * - If no user or Firestore fails: local is source of truth.
 */

import { getTodayId } from '../utils/dateUtils';
import {
  DailyCheckInData,
  getTodayDailyCheckIn,
  markPlanCompletedForToday,
} from './dailyCheckIn';
import {
  getLocalDailyCheckIn,
  getLocalPlanCompletion,
  getLocalPlanStepsState,
  saveLocalDailyCheckIn,
  saveLocalPlanCompletion,
  saveLocalPlanStepsState,
} from './dailyCheckInStorage';
import { generatePlan } from '../domain/recovery/planGenerator';
import { RecoveryAction } from '../screens/TodayRecoveryPlanScreen';
import { SHOW_DEV_TOOLS } from '../config/flags';

export const getTodayKey = () => getTodayId();

export interface LoadedTodayState {
  dateId: string;
  source: 'firestore' | 'local';
  recoveryWindowLabel: string;
  symptomLabels: string[];
  levelLabel?: string;
  actions: RecoveryAction[];
  planCompleted: boolean;
  stepsCompleted: number;
  totalSteps: number;
}

const applyStepsState = (
  actions: RecoveryAction[],
  planCompleted: boolean,
  stepsState?: Record<string, boolean>
): RecoveryAction[] => {
  if (planCompleted) {
    return actions.map((a) => ({ ...a, completed: true }));
  }

  if (!stepsState) {
    return actions;
  }

  return actions.map((a) => ({ ...a, completed: stepsState[a.id] || false }));
};

const persistLocalCacheFromRemote = async (
  dateId: string,
  checkIn: DailyCheckInData,
  actions: RecoveryAction[],
  planCompleted: boolean,
  stepsCompleted: number,
  totalSteps: number
) => {
  // Save lightweight local check-in cache (used for offline)
  await saveLocalDailyCheckIn({
    id: dateId,
    level: checkIn.severity,
    symptoms: checkIn.symptoms,
    source: 'daily_checkin',
    drankLastNight: checkIn.drankLastNight,
    drinkingToday: checkIn.drinkingToday,
  });

  // Persist completion locally so reopening shows completed state even offline
  if (planCompleted) {
    await saveLocalPlanCompletion(dateId, stepsCompleted, totalSteps);
    const allSteps: Record<string, boolean> = {};
    actions.forEach((a) => {
      allSteps[a.id] = true;
    });
    await saveLocalPlanStepsState(dateId, allSteps);
  }
};

export const loadTodayState = async (uid?: string): Promise<LoadedTodayState | null> => {
  const dateId = getTodayKey();

  try {
    // 1) Try Firestore first if we have a user
    if (uid) {
      const remote = await getTodayDailyCheckIn(uid);
      if (remote && remote.generatedPlan) {
        const actions = remote.generatedPlan.steps as RecoveryAction[];
        const totalSteps = actions.length;
        const planCompleted =
          remote.planCompleted === true || remote.planCompletedAt !== undefined;
        const stepsCompleted =
          remote.stepsCompleted ?? (planCompleted ? totalSteps : 0);

        // Apply local step state if plan not completed remotely
        const localStepsState = await getLocalPlanStepsState(dateId);
        const localCompletion = await getLocalPlanCompletion(dateId);
        const isCompleted = planCompleted || localCompletion?.completed === true;
        const actionsWithState = applyStepsState(
          actions,
          isCompleted,
          localStepsState?.steps
        );

        // Keep local cache in sync with remote
        await persistLocalCacheFromRemote(
          dateId,
          remote,
          actions,
          isCompleted,
          stepsCompleted,
          totalSteps
        );

        if (SHOW_DEV_TOOLS) {
          console.log('[todayState] Loaded from Firestore', {
            dateId,
            planCompleted: isCompleted,
            stepsCompleted,
            totalSteps,
          });
        }

        return {
          dateId,
          source: 'firestore',
          recoveryWindowLabel: remote.generatedPlan.recoveryWindowLabel,
          symptomLabels: remote.generatedPlan.symptomLabels,
          levelLabel: remote.generatedPlan.levelLabel || remote.severityLabel,
          actions: actionsWithState,
          planCompleted: isCompleted,
          stepsCompleted: isCompleted ? totalSteps : stepsCompleted,
          totalSteps,
        };
      }
    }

    // 2) Fallback to local cache
    const localCheckIn = await getLocalDailyCheckIn(dateId);
    if (!localCheckIn) {
      return null;
    }

    // Build plan from local check-in
    const plan = generatePlan({
      level: localCheckIn.level as any,
      symptoms: localCheckIn.symptoms as any[],
      drankLastNight: localCheckIn.drankLastNight,
      drinkingToday: localCheckIn.drinkingToday,
    });

    const totalSteps = plan.steps.length;
    const localCompletion = await getLocalPlanCompletion(dateId);
    const planCompleted = localCompletion?.completed === true;
    const stepsState = await getLocalPlanStepsState(dateId);
    const actionsWithState = applyStepsState(
      plan.steps as RecoveryAction[],
      planCompleted,
      stepsState?.steps
    );

    if (SHOW_DEV_TOOLS) {
      console.log('[todayState] Loaded from local', {
        dateId,
        planCompleted,
        totalSteps,
        stepsCompleted: planCompleted ? totalSteps : actionsWithState.filter((a) => a.completed).length,
      });
    }

    return {
      dateId,
      source: 'local',
      recoveryWindowLabel: plan.recoveryWindowLabel,
      symptomLabels: plan.symptomLabels,
      levelLabel: plan.levelLabel,
      actions: actionsWithState,
      planCompleted,
      stepsCompleted: planCompleted
        ? totalSteps
        : actionsWithState.filter((a) => a.completed).length,
      totalSteps,
    };
  } catch (error) {
    console.error('[todayState] loadTodayState error:', error);
    return null;
  }
};

export interface MarkTodayPlanCompletedParams {
  uid?: string;
  stepsCompleted: number;
  totalSteps: number;
  actions?: RecoveryAction[];
}

export const markTodayPlanCompleted = async ({
  uid,
  stepsCompleted,
  totalSteps,
  actions,
}: MarkTodayPlanCompletedParams): Promise<void> => {
  const dateId = getTodayKey();

  // Persist locally
  await saveLocalPlanCompletion(dateId, stepsCompleted, totalSteps);
  if (actions && actions.length > 0) {
    const allSteps: Record<string, boolean> = {};
    actions.forEach((a) => {
      allSteps[a.id] = true;
    });
    await saveLocalPlanStepsState(dateId, allSteps);
  }

  // Persist remotely if possible
  if (uid) {
    try {
      await markPlanCompletedForToday({
        uid,
        dateId,
        stepsCompleted,
        totalSteps,
      });
    } catch (error) {
      console.error('[todayState] Error marking plan completed remotely:', error);
    }
  }
};

