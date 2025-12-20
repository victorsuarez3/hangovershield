/**
 * Smart Plan Wrapper - Hangover Shield
 * Centralizes loading of today's plan from a single source of truth.
 * - If user is logged in: Firestore is the source, local is cache.
 * - If not logged in or offline: local is the source.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import { TodayRecoveryPlanScreen, RecoveryAction } from './TodayRecoveryPlanScreen';
import { getTodayId } from '../utils/dateUtils';
import { SHOW_DEV_TOOLS } from '../config/flags';
import { updateLocalPlanStepState, saveLocalPlanStepsState } from '../services/dailyCheckInStorage';
import { loadTodayState, markTodayPlanCompleted } from '../services/todayState';

export const SmartPlanWrapper: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [planData, setPlanData] = useState<{
    date: string;
    recoveryWindowLabel: string;
    symptomLabels: string[];
    levelLabel?: string;
    actions: RecoveryAction[];
    totalSteps: number;
  } | null>(null);

  // Load plan from unified service (single source of truth)
  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);

      try {
        const loaded = await loadTodayState(user?.uid);

        if (!loaded) {
          console.warn('[SmartPlanWrapper] No plan found, redirecting to check-in');
          navigation.navigate('CheckIn');
          return;
        }

        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        setPlanData({
          date: dateString,
          recoveryWindowLabel: loaded.recoveryWindowLabel,
          symptomLabels: loaded.symptomLabels,
          levelLabel: loaded.levelLabel,
          actions: loaded.actions,
          totalSteps: loaded.totalSteps,
        });

        if (SHOW_DEV_TOOLS) {
          console.log('[SmartPlanWrapper] Plan loaded', {
            source: loaded.source,
            planCompleted: loaded.planCompleted,
            totalSteps: loaded.totalSteps,
            completedSteps: loaded.actions.filter((a) => a.completed).length,
          });
        }
      } catch (error) {
        console.error('[SmartPlanWrapper] Error loading plan:', error);
        navigation.navigate('CheckIn');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [user, navigation]);

  const handleToggleAction = useCallback(
    async (stepId: string, completed: boolean) => {
      setPlanData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          actions: prev.actions.map((action) =>
            action.id === stepId ? { ...action, completed } : action
          ),
        };
      });

      // Save to AsyncStorage to keep state consistent across flows
      try {
        await updateLocalPlanStepState(getTodayId(), stepId, completed);
        if (SHOW_DEV_TOOLS) {
          console.log('[SmartPlanWrapper] Saved step state:', { stepId, completed });
        }
      } catch (error) {
        console.error('[SmartPlanWrapper] Error saving step state:', error);
      }
    },
    []
  );

  const handleCompletePlan = useCallback(
    async (stepsCompleted: number, totalSteps: number) => {
      const dateId = getTodayId();

      // Ensure all steps are persisted as completed locally
      if (planData) {
        const allStepsCompleted: Record<string, boolean> = {};
        planData.actions.forEach((action) => {
          allStepsCompleted[action.id] = true;
        });

        try {
          await saveLocalPlanStepsState(dateId, allStepsCompleted);
          if (SHOW_DEV_TOOLS) {
            console.log('[SmartPlanWrapper] Saved all steps as completed');
          }
        } catch (error) {
          console.error('[SmartPlanWrapper] Error saving completed steps:', error);
        }
      }

      // Mark completion in both stores (Firestore if available, local always)
      await markTodayPlanCompleted({
        uid: user?.uid,
        stepsCompleted,
        totalSteps,
        actions: planData?.actions,
      });

      navigation.navigate('PlanComplete', { stepsCompleted, totalSteps });
    },
    [navigation, planData, user?.uid]
  );

  if (isLoading || !planData) {
    return null;
  }

  return (
    <TodayRecoveryPlanScreen
      mode="app"
      date={planData.date}
      recoveryWindowLabel={planData.recoveryWindowLabel}
      symptomLabels={planData.symptomLabels}
      levelLabel={planData.levelLabel}
      hydrationGoalLiters={1.5}
      hydrationProgress={0}
      actions={planData.actions}
      onToggleAction={handleToggleAction}
      onCompletePlan={handleCompletePlan}
    />
  );
};
