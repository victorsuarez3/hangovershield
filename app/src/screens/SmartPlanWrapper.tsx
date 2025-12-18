/**
 * Smart Plan Wrapper - Hangover Shield
 * Wrapper for TodayRecoveryPlanScreen that reads today's check-in and generates plan
 * This allows SmartPlan to work from both Daily Check-In and direct navigation
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import { TodayRecoveryPlanScreen, RecoveryAction } from './TodayRecoveryPlanScreen';
import { getTodayDailyCheckIn } from '../services/dailyCheckIn';
import { getLocalDailyCheckIn } from '../services/dailyCheckInStorage';
import { getTodayId } from '../utils/dateUtils';
import { markPlanCompletedForToday } from '../services/dailyCheckIn';
import { FeelingOption, SymptomKey } from '../navigation/OnboardingNavigator';
import { generatePlan } from '../domain/recovery/planGenerator';

const FEELING_DISPLAY_LABELS: Record<FeelingOption, string> = {
  mild: 'Mild hangover',
  moderate: 'Moderate hangover',
  severe: 'Severe hangover',
  none: 'Not hungover',
};

export const SmartPlanWrapper: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [planData, setPlanData] = useState<{
    date: string;
    recoveryWindowLabel: string;
    symptomLabels: string[];
    actions: RecoveryAction[];
  } | null>(null);

  // Load plan from unified service (single source of truth)
  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);

      try {
        // Read from unified service (single source of truth)
        if (!user?.uid) {
          console.warn('[SmartPlanWrapper] No user ID, cannot load plan');
          setIsLoading(false);
          return;
        }

        const checkIn = await getTodayDailyCheckIn(user.uid);
        
        if (checkIn && checkIn.generatedPlan && checkIn.completedAt) {
          // Use saved plan from unified service
          const today = new Date();
          const dateString = today.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          setPlanData({
            date: dateString,
            recoveryWindowLabel: checkIn.generatedPlan.recoveryWindowLabel,
            symptomLabels: checkIn.generatedPlan.symptomLabels,
            actions: checkIn.generatedPlan.steps,
          });
          console.log('[SmartPlanWrapper] Loaded plan from unified service');
        } else {
          // No check-in found - redirect to check-in screen
          console.warn('[SmartPlanWrapper] No check-in found, redirecting to check-in');
          navigation.navigate('CheckIn');
        }
      } catch (error) {
        console.error('[SmartPlanWrapper] Error loading plan:', error);
        // Fallback: try to navigate to check-in
        navigation.navigate('CheckIn');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [user?.uid, navigation]);

  const generatePlanData = (feeling: FeelingOption, symptoms: SymptomKey[], drankLastNight?: boolean, drinkingToday?: boolean) => {
    // Use centralized plan generator
    const plan = generatePlan({
      level: feeling,
      symptoms,
      drankLastNight,
      drinkingToday,
    });

    console.log('[SmartPlanWrapper] Generated plan:', {
      feeling,
      symptoms,
      stepsCount: plan.steps.length,
      steps: plan.steps.map(s => s.title),
    });

    // Get today's date
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    setPlanData({
      date: dateString,
      recoveryWindowLabel: plan.recoveryWindowLabel,
      symptomLabels: plan.symptomLabels,
      actions: plan.steps,
    });
  };

  const handleCompletePlan = useCallback(async (stepsCompleted: number, totalSteps: number) => {
    // Save completion to Firestore if user is authenticated
    if (user?.uid) {
      const dateId = getTodayId();
      try {
        await markPlanCompletedForToday({
          uid: user.uid,
          dateId,
          stepsCompleted,
          totalSteps,
        });
      } catch (error) {
        console.error('Error saving plan completion:', error);
        // Continue to celebration screen even if save fails
      }
    }

    // Navigate to celebration screen
    navigation.navigate('PlanComplete', { stepsCompleted, totalSteps });
  }, [user?.uid, navigation]);

  if (isLoading || !planData) {
    // Show loading state or TodayRecoveryPlanScreen with default data
    return (
      <TodayRecoveryPlanScreen
        date={planData?.date}
        recoveryWindowLabel={planData?.recoveryWindowLabel}
        symptomLabels={planData?.symptomLabels}
        hydrationGoalLiters={1.5}
        hydrationProgress={0}
        actions={planData?.actions || []}
        onToggleAction={(id, completed) => {
          console.log(`Action ${id} toggled to ${completed}`);
        }}
        onCompletePlan={handleCompletePlan}
      />
    );
  }

  return (
    <TodayRecoveryPlanScreen
      date={planData.date}
      recoveryWindowLabel={planData.recoveryWindowLabel}
      symptomLabels={planData.symptomLabels}
      hydrationGoalLiters={1.5}
      hydrationProgress={0}
      actions={planData.actions}
      onToggleAction={(id, completed) => {
        console.log(`Action ${id} toggled to ${completed}`);
      }}
      onCompletePlan={handleCompletePlan}
    />
  );
};

