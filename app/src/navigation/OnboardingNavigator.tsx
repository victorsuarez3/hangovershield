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
import { 
  markPlanCompletedForToday, 
  ensureTodayPlan,
  getTodayDailyCheckIn,
  DailyCheckInSeverity,
  SEVERITY_LABELS,
} from '../services/dailyCheckIn';
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

      // Save today's check-in with generated plan (single source of truth)
      try {
        const checkInInput = {
          severity: feeling as DailyCheckInSeverity,
          severityLabel: SEVERITY_LABELS[feeling as DailyCheckInSeverity],
          symptoms: symptoms as string[],
          drankLastNight: false, // Onboarding doesn't ask about this
          drinkingToday: false, // Onboarding doesn't ask about this
        };

        const savedCheckIn = await ensureTodayPlan(user.uid, checkInInput);
        if (savedCheckIn) {
          console.log('[OnboardingNavigator] Saved today check-in with plan');
        } else {
          console.error('[OnboardingNavigator] Failed to save check-in with plan');
        }
      } catch (error) {
        console.error('[OnboardingNavigator] Error saving check-in:', error);
        // Continue anyway - plan will be generated on the fly
      }
    }

    // Navigate to Today's Recovery Plan screen (it will read from saved record)
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

// Wrapper component for Today's Recovery Plan - reads from unified service
const TodayRecoveryPlanWrapper: React.FC = () => {
  const route = useRoute<RouteProp<OnboardingStackParamList, 'TodayRecoveryPlan'>>();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const { user } = useAuth();
  const { feeling, symptoms } = route.params;
  const [planData, setPlanData] = React.useState<{
    date: string;
    recoveryWindowLabel: string;
    symptomLabels: string[];
    hydrationGoalLiters: number;
    actions: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load plan from unified service (single source of truth)
  React.useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        if (!user?.uid) {
          // Fallback: generate plan on the fly if not authenticated
          const { generatePlan } = await import('../domain/recovery/planGenerator');
          const plan = generatePlan({
            level: feeling,
            symptoms: symptoms as any[],
          });
          
          const today = new Date();
          const dateString = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          
          setPlanData({
            date: dateString,
            recoveryWindowLabel: plan.recoveryWindowLabel,
            symptomLabels: plan.symptomLabels,
            hydrationGoalLiters: plan.hydrationGoalLiters,
            actions: plan.steps,
          });
          setIsLoading(false);
          return;
        }

        // Try to load from unified service
        const checkIn = await getTodayDailyCheckIn(user.uid);
        
        if (checkIn && checkIn.generatedPlan && checkIn.completedAt) {
          // Use saved plan (single source of truth)
          const today = new Date();
          const dateString = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          
          setPlanData({
            date: dateString,
            recoveryWindowLabel: checkIn.generatedPlan.recoveryWindowLabel,
            symptomLabels: checkIn.generatedPlan.symptomLabels,
            hydrationGoalLiters: checkIn.generatedPlan.hydrationGoalLiters,
            actions: checkIn.generatedPlan.steps,
          });
          console.log('[TodayRecoveryPlanWrapper] Loaded plan from unified service');
        } else {
          // Fallback: ensure plan exists (should have been created in PlanLoadingScreenWrapper)
          const checkInInput = {
            severity: feeling as DailyCheckInSeverity,
            severityLabel: SEVERITY_LABELS[feeling as DailyCheckInSeverity],
            symptoms: symptoms as string[],
            drankLastNight: false,
            drinkingToday: false,
          };
          
          const savedCheckIn = await ensureTodayPlan(user.uid, checkInInput);
          
          if (savedCheckIn && savedCheckIn.generatedPlan) {
            const today = new Date();
            const dateString = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            setPlanData({
              date: dateString,
              recoveryWindowLabel: savedCheckIn.generatedPlan.recoveryWindowLabel,
              symptomLabels: savedCheckIn.generatedPlan.symptomLabels,
              hydrationGoalLiters: savedCheckIn.generatedPlan.hydrationGoalLiters,
              actions: savedCheckIn.generatedPlan.steps,
            });
          } else {
            console.error('[TodayRecoveryPlanWrapper] Failed to load or create plan');
            // Fallback to generating on the fly
            const { generatePlan } = await import('../domain/recovery/planGenerator');
            const plan = generatePlan({
              level: feeling,
              symptoms: symptoms as any[],
            });
            
            const today = new Date();
            const dateString = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            setPlanData({
              date: dateString,
              recoveryWindowLabel: plan.recoveryWindowLabel,
              symptomLabels: plan.symptomLabels,
              hydrationGoalLiters: plan.hydrationGoalLiters,
              actions: plan.steps,
            });
          }
        }
      } catch (error) {
        console.error('[TodayRecoveryPlanWrapper] Error loading plan:', error);
        // Fallback to generating on the fly
        const { generatePlan } = await import('../domain/recovery/planGenerator');
        const plan = generatePlan({
          level: feeling,
          symptoms: symptoms as any[],
        });
        
        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        setPlanData({
          date: dateString,
          recoveryWindowLabel: plan.recoveryWindowLabel,
          symptomLabels: plan.symptomLabels,
          hydrationGoalLiters: plan.hydrationGoalLiters,
          actions: plan.steps,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [user?.uid, feeling, symptoms]);

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

  if (isLoading || !planData) {
    // Show loading state or fallback
    return null; // Or a loading component
  }

  return (
    <TodayRecoveryPlanScreen
      date={planData.date}
      recoveryWindowLabel={planData.recoveryWindowLabel}
      symptomLabels={planData.symptomLabels}
      hydrationGoalLiters={planData.hydrationGoalLiters}
      hydrationProgress={0}
      actions={planData.actions}
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

