/**
 * First Login Onboarding Navigator
 * Stack navigator for first-login onboarding flow (runs ONCE after first auth)
 *
 * Flow:
 * 1. FirstLoginCheckIn - Merged severity + symptoms selection
 * 2. FirstLoginAnalysis - Personalized insight based on state
 * 3. FirstLoginPlanReady - "Plan ready" transition with checklist
 * → Navigate to TodayRecoveryPlan (inside main app)
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FirstLoginCheckInScreen } from '../screens/FirstLogin/FirstLoginCheckInScreen';
import { FirstLoginAnalysisScreen } from '../screens/FirstLogin/FirstLoginAnalysisScreen';
import { FirstLoginPlanReadyScreen } from '../screens/FirstLogin/FirstLoginPlanReadyScreen';
import { TodayRecoveryPlanScreen } from '../screens/TodayRecoveryPlanScreen';
import { PlanCompleteScreen } from '../screens/PlanCompleteScreen';
import { DailyWaterLogScreen } from '../screens/DailyWaterLogScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTodayDailyCheckIn } from '../services/dailyCheckIn';
import { useAuth } from '../providers/AuthProvider';
import { getLocalDailyCheckIn } from '../services/dailyCheckInStorage';
import { generatePlan } from '../domain/recovery/planGenerator';
import {
  FirstLoginCheckInData,
  SymptomKey,
} from '../screens/FirstLogin/FirstLoginCheckInScreen';
import {
  FirstLoginAnalysisParams,
} from '../screens/FirstLogin/FirstLoginAnalysisScreen';
import {
  FirstLoginPlanReadyParams,
} from '../screens/FirstLogin/FirstLoginPlanReadyScreen';
import { PlanCompleteScreenParams } from '../screens/PlanCompleteScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Types
// ─────────────────────────────────────────────────────────────────────────────

export type FirstLoginOnboardingStackParamList = {
  FirstLoginCheckIn: undefined;
  FirstLoginAnalysis: FirstLoginAnalysisParams;
  FirstLoginPlanReady: FirstLoginPlanReadyParams;
  // Include screens that can be navigated to after completing onboarding
  TodayRecoveryPlan: undefined;
  PlanComplete: PlanCompleteScreenParams;
  DailyWaterLog: undefined;
  Paywall: { source?: string; contextScreen?: string };
};

const Stack = createNativeStackNavigator<FirstLoginOnboardingStackParamList>();

// ─────────────────────────────────────────────────────────────────────────────
// TodayRecoveryPlan Wrapper - Loads plan from saved check-in data
// ─────────────────────────────────────────────────────────────────────────────

const TodayRecoveryPlanWrapper: React.FC = () => {
  const route = useRoute<RouteProp<FirstLoginOnboardingStackParamList, 'TodayRecoveryPlan'>>();
  const navigation = useNavigation<NativeStackNavigationProp<FirstLoginOnboardingStackParamList>>();
  const { user } = useAuth();
  const [planData, setPlanData] = React.useState<{
    date: string;
    recoveryWindowLabel: string;
    symptomLabels: string[];
    levelLabel?: string;
    hydrationGoalLiters: number;
    actions: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load plan from saved check-in data
  React.useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        // Try to load from Firestore first if user is authenticated
        let checkIn = null;
        if (user?.uid) {
          checkIn = await getTodayDailyCheckIn(user.uid);
        }
        
        // Fallback to local check-in if no Firestore check-in found
        if (!checkIn || !checkIn.generatedPlan) {
          const localCheckIn = await getLocalDailyCheckIn();
          
          if (localCheckIn) {
            // Generate plan from local check-in
            const plan = generatePlan({
              level: localCheckIn.level,
              symptoms: localCheckIn.symptoms as SymptomKey[],
            });
            
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
              levelLabel: plan.levelLabel,
              hydrationGoalLiters: plan.hydrationGoalLiters,
              actions: plan.steps,
            });
            setIsLoading(false);
            return;
          }
        }
        
        // If we have a check-in from Firestore with a plan, use it
        if (checkIn && checkIn.generatedPlan && checkIn.completedAt) {
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
            hydrationGoalLiters: checkIn.generatedPlan.hydrationGoalLiters,
            levelLabel: checkIn.generatedPlan.levelLabel || checkIn.severityLabel,
            actions: checkIn.generatedPlan.steps,
          });
        } else {
          // Fallback: generate plan on the fly
          const localCheckIn = await getLocalDailyCheckIn();
          if (localCheckIn) {
            const plan = generatePlan({
              level: localCheckIn.level,
              symptoms: localCheckIn.symptoms as SymptomKey[],
            });
            
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
              hydrationGoalLiters: plan.hydrationGoalLiters,
              levelLabel: plan.levelLabel,
              actions: plan.steps,
            });
          }
        }
      } catch (error) {
        console.error('[TodayRecoveryPlanWrapper] Error loading plan:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlan();
  }, [user?.uid]);

  if (isLoading || !planData) {
    // Show loading state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E4F2EF' }}>
        <ActivityIndicator size="large" color="#0F4C44" />
      </View>
    );
  }

  return (
    <TodayRecoveryPlanScreen
      mode="onboarding"
      date={planData.date}
      recoveryWindowLabel={planData.recoveryWindowLabel}
      symptomLabels={planData.symptomLabels}
        levelLabel={planData.levelLabel}
      hydrationGoalLiters={planData.hydrationGoalLiters}
      hydrationProgress={0}
      actions={planData.actions}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const FirstLoginOnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#E4F2EF',
        },
      }}
      initialRouteName="FirstLoginCheckIn"
    >
      {/* Step 1: Check-in (severity + symptoms merged) */}
      <Stack.Screen
        name="FirstLoginCheckIn"
        component={FirstLoginCheckInScreen}
      />

      {/* Step 2: Analysis/Insight */}
      <Stack.Screen
        name="FirstLoginAnalysis"
        component={FirstLoginAnalysisScreen}
      />

      {/* Step 3: Plan Ready transition */}
      <Stack.Screen
        name="FirstLoginPlanReady"
        component={FirstLoginPlanReadyScreen}
      />

      {/* Recovery Plan (navigated to after onboarding completes) */}
      <Stack.Screen
        name="TodayRecoveryPlan"
        component={TodayRecoveryPlanWrapper}
      />

      {/* Plan Complete (can be reached from TodayRecoveryPlan) */}
      <Stack.Screen
        name="PlanComplete"
        component={PlanCompleteScreen}
      />

      {/* Water Log (can be accessed from plan) */}
      <Stack.Screen
        name="DailyWaterLog"
        component={DailyWaterLogScreen}
      />

      {/* Paywall (can be accessed from soft gates) */}
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
      />
    </Stack.Navigator>
  );
};

export default FirstLoginOnboardingNavigator;
