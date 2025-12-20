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
import { PaywallScreen } from '../screens/PaywallScreen';
import { PaywallSourceType } from '../constants/paywallSources';
import { getRecoveryAnalysis, getKeySymptomLabels } from '../utils/recoveryAnalysis';
import { 
  DailyCheckInSeverity, 
  markPlanCompletedForToday,
  getTodayDailyCheckIn,
} from '../services/dailyCheckIn';
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
  Paywall: {
    source: PaywallSourceType;
    contextScreen?: string;
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
        // Load from unified service
        const checkIn = await getTodayDailyCheckIn(userId);
        
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
          console.log('[DailyRecoveryPlanWrapper] Loaded plan from unified service');
        } else {
          // Fallback: plan should have been created in DailyCheckInScreen
          console.warn('[DailyRecoveryPlanWrapper] Plan not found, generating fallback');
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
      } catch (error) {
        console.error('[DailyRecoveryPlanWrapper] Error loading plan:', error);
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
  }, [userId, feeling, symptoms]);

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

  if (isLoading || !planData) {
    // Show loading state or fallback
    return null; // Or a loading component
  }

  return (
    <TodayRecoveryPlanScreen
      mode="app"
      mode="app"
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
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
      />
    </Stack.Navigator>
  );
};

export default DailyCheckInNavigator;

