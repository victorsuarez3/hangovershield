/**
 * Onboarding Navigator
 * Stack navigator for onboarding flow screens
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingFeelingScreen } from '../screens/onboarding/OnboardingFeelingScreen';
import { OnboardingSymptomsScreen } from '../screens/onboarding/OnboardingSymptomsScreen';
import { OnboardingInsightScreen } from '../screens/onboarding/OnboardingInsightScreen';
import { OnboardingPaywallScreen } from '../screens/onboarding/OnboardingPaywallScreen';
import { RecoveryPlanLoadingScreen } from '../screens/onboarding/RecoveryPlanLoadingScreen';
import { TodayRecoveryPlanScreen } from '../screens/TodayRecoveryPlanScreen';
import { PlanCompleteScreen } from '../screens/PlanCompleteScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { PaywallSourceType } from '../constants/paywallSources';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { getRecoveryAnalysis, getKeySymptomLabels } from '../utils/recoveryAnalysis';
import { markPlanCompletedForToday } from '../services/dailyCheckIn';
import { getTodayId } from '../utils/dateUtils';
import { useAuth } from '../providers/AuthProvider';
import { grantWelcomeUnlock } from '../services/welcomeUnlock';
import { logAnalyticsEvent } from '../utils/analytics';

const FEELING_ONBOARDING_KEY = '@hangovershield_feeling_onboarding_completed';

// Wrapper component to handle navigation integration
const PlanLoadingScreenWrapper: React.FC = () => {
  const route = useRoute<RouteProp<OnboardingStackParamList, 'PlanLoading'>>();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const { user } = useAuth();
  const { feeling, symptoms } = route.params;

  const handleFinished = async () => {
    // Mark feeling onboarding as completed
    try {
      await AsyncStorage.setItem(FEELING_ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }

    // Grant 24h Welcome Unlock for authenticated users (idempotent)
    if (user?.uid) {
      try {
        await grantWelcomeUnlock(user.uid);
        logAnalyticsEvent('welcome_unlock_granted', {
          trigger: 'feeling_onboarding_complete',
          userId: user.uid,
        });
        console.log('[OnboardingNavigator] Welcome unlock granted for user:', user.uid);
      } catch (error) {
        console.error('[OnboardingNavigator] Error granting welcome unlock:', error);
        // Non-blocking - continue to recovery plan even if unlock fails
      }
    }

    // Navigate to Today's Recovery Plan screen
    navigation.replace('TodayRecoveryPlan', { feeling, symptoms });
  };

  return <RecoveryPlanLoadingScreen onFinished={handleFinished} />;
};

// Feeling labels for display
const FEELING_DISPLAY_LABELS: Record<FeelingOption, string> = {
  mild: 'Mild hangover',
  moderate: 'Moderate hangover',
  severe: 'Severe hangover',
  none: 'Not hungover',
};

// Wrapper component for Today's Recovery Plan with data generation
const TodayRecoveryPlanWrapper: React.FC = () => {
  const route = useRoute<RouteProp<OnboardingStackParamList, 'TodayRecoveryPlan'>>();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const { user } = useAuth();
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

  // Generate actions based on recommendations + standard recovery steps
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
  // Power nap is ALWAYS included for moderate/severe OR if user has poor sleep
  const shouldIncludePowerNap = feeling === 'severe' || feeling === 'moderate' || hasPoorSleep;

  let actions = [];
  
  if (feeling === 'severe') {
    // Severe: All 5 base actions + power nap (6 total)
    actions = [
      ...allActions.slice(0, 4), // morning + midday walk
      powerNapAction,            // power nap after walk
      allActions[4],             // light meal (afternoon)
    ];
  } else if (feeling === 'moderate') {
    // Moderate: 5 base actions + power nap (6 total)
    actions = [
      ...allActions.slice(0, 4), // morning + midday walk
      powerNapAction,            // power nap
      allActions[4],             // light meal (afternoon)
    ];
  } else if (feeling === 'mild') {
    // Mild: 5 base actions, power nap only if poor sleep
    if (hasPoorSleep) {
      actions = [
        ...allActions.slice(0, 4), // morning + midday walk
        powerNapAction,             // power nap (due to poor sleep)
        allActions[4],              // light meal (afternoon)
      ];
    } else {
      // No power nap, but include afternoon
      actions = [...allActions]; // all 5 actions
    }
  } else {
    // None: lighter plan, power nap only if poor sleep
    if (hasPoorSleep) {
      actions = [
        ...allActions.slice(0, 3), // morning basics
        powerNapAction,             // power nap (due to poor sleep)
      ];
    } else {
      actions = allActions.slice(0, 4); // morning + walk
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


export type FeelingOption = 'mild' | 'moderate' | 'severe' | 'none';

export type SymptomKey =
  | 'headache'
  | 'nausea'
  | 'dryMouth'
  | 'dizziness'
  | 'fatigue'
  | 'anxiety'
  | 'brainFog'
  | 'poorSleep'
  | 'noSymptoms';

export type OnboardingStackParamList = {
  OnboardingFeeling: undefined;
  OnboardingSymptoms: { feeling: FeelingOption };
  OnboardingInsight: {
    feeling: FeelingOption;
    symptoms: SymptomKey[];
  };
  OnboardingPaywall: {
    feeling: FeelingOption;
    symptoms: SymptomKey[];
  };
  PlanLoading: {
    feeling: FeelingOption;
    symptoms: SymptomKey[];
  };
  TodayRecoveryPlan: {
    feeling: FeelingOption;
    symptoms: SymptomKey[];
  };
  PlanComplete: {
    stepsCompleted: number;
    totalSteps: number;
  };
  Paywall: {
    source: PaywallSourceType;
    contextScreen?: string;
  };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="OnboardingFeeling"
        component={OnboardingFeelingScreen}
      />
      <Stack.Screen
        name="OnboardingSymptoms"
        component={OnboardingSymptomsScreen}
      />
      <Stack.Screen
        name="OnboardingInsight"
        component={OnboardingInsightScreen}
      />
      <Stack.Screen
        name="OnboardingPaywall"
        component={OnboardingPaywallScreen}
      />
      <Stack.Screen
        name="PlanLoading"
        component={PlanLoadingScreenWrapper}
      />
      <Stack.Screen
        name="TodayRecoveryPlan"
        component={TodayRecoveryPlanWrapper}
      />
      <Stack.Screen
        name="PlanComplete"
        component={PlanCompleteScreen}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
      />
    </Stack.Navigator>
  );
}

