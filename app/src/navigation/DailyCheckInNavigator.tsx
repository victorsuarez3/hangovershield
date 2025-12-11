/**
 * Daily Check-In Navigator - Hangover Shield
 * Stack navigator for returning users daily check-in flow
 * Reuses the same Recovery Plan generation logic as onboarding
 */

import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RouteProp, useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DailyCheckInScreen } from '../screens/DailyCheckInScreen';
import { RecoveryPlanLoadingScreen } from '../screens/onboarding/RecoveryPlanLoadingScreen';
import { TodayRecoveryPlanScreen } from '../screens/TodayRecoveryPlanScreen';
import { PlanCompleteScreen } from '../screens/PlanCompleteScreen';
import { getRecoveryAnalysis, getKeySymptomLabels } from '../utils/recoveryAnalysis';
import { DailyCheckInSeverity, markPlanCompletedForToday } from '../services/dailyCheckIn';
import { getTodayId } from '../utils/dateUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// Map DailyCheckInSeverity to FeelingOption (same values but different types for clarity)
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

export type DailyCheckInStackParamList = {
  DailyCheckIn: undefined;
  DailyPlanLoading: {
    feeling: FeelingOption;
    symptoms: SymptomKey[];
  };
  DailyRecoveryPlan: {
    feeling: FeelingOption;
    symptoms: SymptomKey[];
  };
  PlanComplete: {
    stepsCompleted: number;
    totalSteps: number;
  };
};

interface DailyCheckInNavigatorProps {
  userId: string;
  onComplete?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feeling Display Labels
// ─────────────────────────────────────────────────────────────────────────────

const FEELING_DISPLAY_LABELS: Record<FeelingOption, string> = {
  mild: 'Mild hangover',
  moderate: 'Moderate hangover',
  severe: 'Severe hangover',
  none: 'Not hungover',
};

// ─────────────────────────────────────────────────────────────────────────────
// Daily Check-In Screen Wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface DailyCheckInScreenWrapperProps {
  userId: string;
}

const DailyCheckInScreenWrapper: React.FC<DailyCheckInScreenWrapperProps> = ({ userId }) => {
  const navigation = useNavigation<NativeStackNavigationProp<DailyCheckInStackParamList>>();

  const handleComplete = useCallback((
    severity: DailyCheckInSeverity,
    symptoms: string[]
  ) => {
    // Map severity to FeelingOption and symptoms to SymptomKey[]
    const feeling = severity as FeelingOption;
    const symptomKeys = symptoms as SymptomKey[];

    // Navigate to loading screen with the check-in data
    navigation.navigate('DailyPlanLoading', {
      feeling,
      symptoms: symptomKeys,
    });
  }, [navigation]);

  return (
    <DailyCheckInScreen
      userId={userId}
      onComplete={handleComplete}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Plan Loading Screen Wrapper
// ─────────────────────────────────────────────────────────────────────────────

const PlanLoadingScreenWrapper: React.FC = () => {
  const route = useRoute<RouteProp<DailyCheckInStackParamList, 'DailyPlanLoading'>>();
  const navigation = useNavigation<NativeStackNavigationProp<DailyCheckInStackParamList>>();
  const { feeling, symptoms } = route.params;

  const handleFinished = useCallback(() => {
    // Navigate to the daily recovery plan
    navigation.replace('DailyRecoveryPlan', { feeling, symptoms });
  }, [navigation, feeling, symptoms]);

  return <RecoveryPlanLoadingScreen onFinished={handleFinished} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// Daily Recovery Plan Screen Wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface DailyRecoveryPlanWrapperProps {
  userId: string;
}

const DailyRecoveryPlanWrapper: React.FC<DailyRecoveryPlanWrapperProps> = ({ userId }) => {
  const route = useRoute<RouteProp<DailyCheckInStackParamList, 'DailyRecoveryPlan'>>();
  const navigation = useNavigation<NativeStackNavigationProp<DailyCheckInStackParamList>>();
  const { feeling, symptoms } = route.params;

  // Generate recovery analysis from feeling + symptoms
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
  const allActions = [
    {
      id: 'morning-1',
      timeOfDay: 'morning' as const,
      time: '6:00 AM',
      title: 'Soft light & breathing',
      description: 'Gentle light exposure and slow breathing help calm the nervous system and reduce early morning hangover stress.',
      durationMinutes: 2,
      icon: 'sunny-outline',
      completed: false,
    },
    {
      id: 'morning-2',
      timeOfDay: 'morning' as const,
      time: '8:00 AM',
      title: 'Water + electrolytes',
      description: 'Rehydrate early to support liver detox and reduce symptoms.',
      durationMinutes: 1,
      icon: 'water-outline',
      completed: false,
    },
    {
      id: 'morning-3',
      timeOfDay: 'morning' as const,
      time: '9:00 AM',
      title: 'Light breakfast',
      description: 'Easy-to-digest foods stabilize blood sugar and ease nausea (toast, banana, eggs).',
      durationMinutes: 15,
      icon: 'cafe-outline',
      completed: false,
    },
    {
      id: 'midday-1',
      timeOfDay: 'midday' as const,
      time: '11:00 AM',
      title: 'Short walk & check-in',
      description: 'Light movement boosts circulation and improves cognitive clarity.',
      durationMinutes: 15,
      icon: 'walk-outline',
      completed: false,
    },
    {
      id: 'afternoon-1',
      timeOfDay: 'afternoon' as const,
      time: '2:00 PM',
      title: 'Light meal + rest',
      description: 'Refuel gently; avoid heavy or greasy foods.',
      durationMinutes: 20,
      icon: 'restaurant-outline',
      completed: false,
    },
  ];

  // Power nap action - included based on severity or poor sleep
  const powerNapAction = hasPoorSleep
    ? {
        id: 'midday-nap',
        timeOfDay: 'midday' as const,
        time: '1:00 PM',
        title: 'Restorative power nap',
        description: 'Your sleep was disrupted; a short nap helps your body catch up.',
        durationMinutes: 25,
        icon: 'moon-outline',
        completed: false,
      }
    : {
        id: 'midday-nap',
        timeOfDay: 'midday' as const,
        time: '11:30 AM',
        title: 'Power nap',
        description: 'Short rest helps reset your nervous system and reduce brain fog.',
        durationMinutes: 15,
        icon: 'moon-outline',
        completed: false,
      };

  // Build actions based on severity
  let actions = [];
  
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
  const dateString = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Convert recovery hours range object to string
  const { min, max } = analysis.estimatedRecoveryHoursRange;
  const recoveryWindowLabel = `${min}–${max} hours`;

  // Handler for completing the plan
  const handleCompletePlan = useCallback(async (stepsCompleted: number, totalSteps: number) => {
    // Save completion to Firestore
    const dateId = getTodayId();
    try {
      await markPlanCompletedForToday({
        uid: userId,
        dateId,
        stepsCompleted,
        totalSteps,
      });
    } catch (error) {
      console.error('Error saving plan completion:', error);
      // Continue to celebration screen even if save fails
    }

    // Navigate to celebration screen
    navigation.navigate('PlanComplete', { stepsCompleted, totalSteps });
  }, [userId, navigation]);

  return (
    <TodayRecoveryPlanScreen
      date={dateString}
      recoveryWindowLabel={recoveryWindowLabel}
      symptomLabels={symptomLabels}
      hydrationGoalLiters={1.5}
      hydrationProgress={0}
      actions={actions}
      onToggleAction={(id, completed) => {
        console.log(`Action ${id} toggled to ${completed}`);
      }}
      onCompletePlan={handleCompletePlan}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Stack Navigator
// ─────────────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<DailyCheckInStackParamList>();

export const DailyCheckInNavigator: React.FC<DailyCheckInNavigatorProps> = ({
  userId,
}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="DailyCheckIn">
        {() => <DailyCheckInScreenWrapper userId={userId} />}
      </Stack.Screen>
      <Stack.Screen
        name="DailyPlanLoading"
        component={PlanLoadingScreenWrapper}
      />
      <Stack.Screen name="DailyRecoveryPlan">
        {() => <DailyRecoveryPlanWrapper userId={userId} />}
      </Stack.Screen>
      <Stack.Screen
        name="PlanComplete"
        component={PlanCompleteScreen}
      />
    </Stack.Navigator>
  );
};

export default DailyCheckInNavigator;

