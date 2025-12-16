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
import { getRecoveryAnalysis, getKeySymptomLabels } from '../utils/recoveryAnalysis';
import { getTodayId } from '../utils/dateUtils';
import { markPlanCompletedForToday } from '../services/dailyCheckIn';

// Map DailyCheckInSeverity to FeelingOption
type FeelingOption = 'mild' | 'moderate' | 'severe' | 'none';
type SymptomKey =
  | 'headache'
  | 'nausea'
  | 'dryMouth'
  | 'dizziness'
  | 'fatigue'
  | 'anxiety'
  | 'brainFog'
  | 'poorSleep'
  | 'noSymptoms';

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
            };
          }
        }

        // If no check-in found, redirect to check-in screen
        if (!checkIn) {
          // Navigate to check-in if no plan exists
          // For now, generate a default "none" plan as fallback
          const feeling: FeelingOption = 'none';
          const symptoms: SymptomKey[] = [];
          generatePlan(feeling, symptoms);
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

        generatePlan(feeling, symptomKeys);
      } catch (error) {
        console.error('[SmartPlanWrapper] Error loading plan:', error);
        // Fallback to default plan
        generatePlan('none', []);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [user?.uid]);

  const generatePlan = (feeling: FeelingOption, symptoms: SymptomKey[]) => {
    // Generate recovery analysis
    const analysis = getRecoveryAnalysis(feeling, symptoms);
    const baseSymptomLabels = getKeySymptomLabels(symptoms);
    
    // Add feeling label at the start
    const symptomLabels = feeling !== 'none' 
      ? [FEELING_DISPLAY_LABELS[feeling], ...baseSymptomLabels]
      : baseSymptomLabels.length > 0 
        ? baseSymptomLabels 
        : ['Feeling okay'];

    // Check if user reported poor sleep
    const hasPoorSleep = symptoms.includes('poorSleep');

    // Base actions - ordered by importance for recovery
    const allActions: RecoveryAction[] = [
      {
        id: 'morning-1',
        timeOfDay: 'morning',
        time: '6:00 AM',
        title: 'Soft light & breathing',
        description: 'Gentle light exposure and slow breathing help calm the nervous system and reduce early morning hangover stress.',
        durationMinutes: 2,
        icon: 'sunny-outline',
        completed: false,
      },
      {
        id: 'morning-2',
        timeOfDay: 'morning',
        time: '8:00 AM',
        title: 'Water + electrolytes',
        description: 'Rehydrate early to support liver detox and reduce symptoms.',
        durationMinutes: 1,
        icon: 'water-outline',
        completed: false,
      },
      {
        id: 'morning-3',
        timeOfDay: 'morning',
        time: '9:00 AM',
        title: 'Light breakfast',
        description: 'Easy-to-digest foods stabilize blood sugar and ease nausea (toast, banana, eggs).',
        durationMinutes: 15,
        icon: 'cafe-outline',
        completed: false,
      },
      {
        id: 'midday-1',
        timeOfDay: 'midday',
        time: '11:00 AM',
        title: 'Short walk & check-in',
        description: 'Light movement boosts circulation and improves cognitive clarity.',
        durationMinutes: 15,
        icon: 'walk-outline',
        completed: false,
      },
      {
        id: 'afternoon-1',
        timeOfDay: 'afternoon',
        time: '2:00 PM',
        title: 'Light meal + rest',
        description: 'Refuel gently; avoid heavy or greasy foods.',
        durationMinutes: 20,
        icon: 'restaurant-outline',
        completed: false,
      },
    ];

    // Power nap action
    const powerNapAction: RecoveryAction = hasPoorSleep
      ? {
          id: 'midday-nap',
          timeOfDay: 'midday',
          time: '1:00 PM',
          title: 'Restorative power nap',
          description: 'Your sleep was disrupted; a short nap helps your body catch up.',
          durationMinutes: 25,
          icon: 'moon-outline',
          completed: false,
        }
      : {
          id: 'midday-nap',
          timeOfDay: 'midday',
          time: '11:30 AM',
          title: 'Power nap',
          description: 'Short rest helps reset your nervous system and reduce brain fog.',
          durationMinutes: 15,
          icon: 'moon-outline',
          completed: false,
        };

    // Build actions based on severity
    let actions: RecoveryAction[] = [];
    
    if (feeling === 'severe') {
      actions = [
        ...allActions.slice(0, 4),
        powerNapAction,
        allActions[4],
      ];
    } else if (feeling === 'moderate') {
      actions = [
        ...allActions.slice(0, 4),
        powerNapAction,
        allActions[4],
      ];
    } else if (feeling === 'mild') {
      if (hasPoorSleep) {
        actions = [
          ...allActions.slice(0, 4),
          powerNapAction,
          allActions[4],
        ];
      } else {
        actions = [...allActions];
      }
    } else {
      if (hasPoorSleep) {
        actions = [
          ...allActions.slice(0, 3),
          powerNapAction,
        ];
      } else {
        actions = allActions.slice(0, 4);
      }
    }

    // Get today's date
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    // Convert recovery hours range object to string
    const { min, max } = analysis.estimatedRecoveryHoursRange;
    const recoveryWindowLabel = `${min}–${max} hours`;

    setPlanData({
      date: dateString,
      recoveryWindowLabel,
      symptomLabels,
      actions,
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

