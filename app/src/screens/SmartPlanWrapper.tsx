/**
 * Smart Plan Wrapper - Hangover Shield
 * Wrapper for TodayRecoveryPlanScreen that reads today's check-in and generates plan
 * This allows SmartPlan to work from both Daily Check-In and direct navigation
 */

import React, { useEffect, useState, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [planData, setPlanData] = useState<{
    date: string;
    recoveryWindowLabel: string;
    symptomLabels: string[];
    actions: RecoveryAction[];
  } | null>(null);

  // Load check-in and generate plan
  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);

      try {
        // Try to get check-in from Firestore first, then local
        let checkIn = null;
        if (user?.uid) {
          checkIn = await getTodayDailyCheckIn(user.uid);
        }
        
        if (!checkIn) {
          // Fallback to local storage
          const localCheckIn = await getLocalDailyCheckIn();
          if (localCheckIn) {
            checkIn = {
              date: localCheckIn.id,
              severity: localCheckIn.level,
              severityLabel: '', // Will be set below
              symptoms: localCheckIn.symptoms,
              drankLastNight: localCheckIn.drankLastNight,
              drinkingToday: localCheckIn.drinkingToday,
            };
          }
        }

        // If no check-in found, redirect to check-in screen
        if (!checkIn) {
          // Navigate to check-in if no plan exists
          // For now, generate a default "none" plan as fallback
          const feeling: FeelingOption = 'none';
          const symptoms: SymptomKey[] = [];
          generatePlanData(feeling, symptoms);
          return;
        }

        // Map severity to feeling
        const feeling = checkIn.severity as FeelingOption;
        const symptomKeys = checkIn.symptoms.filter((s): s is SymptomKey => {
          return [
            'headache',
            'nausea',
            'dryMouth',
            'dizziness',
            'fatigue',
            'anxiety',
            'brainFog',
            'poorSleep',
            'noSymptoms',
          ].includes(s);
        }) as SymptomKey[];

        generatePlanData(feeling, symptomKeys, checkIn.drankLastNight, checkIn.drinkingToday);
      } catch (error) {
        console.error('[SmartPlanWrapper] Error loading plan:', error);
        // Fallback to default plan
        generatePlanData('none', []);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [user?.uid]);

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
    if (!user?.uid) return;

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
    }
  }, [user?.uid]);

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

