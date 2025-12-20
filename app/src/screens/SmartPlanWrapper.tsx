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
import { 
  getLocalDailyCheckIn, 
  saveLocalPlanCompletion,
  getLocalPlanCompletion,
  getLocalPlanStepsState,
  updateLocalPlanStepState,
  saveLocalPlanStepsState,
} from '../services/dailyCheckInStorage';
import { getTodayId } from '../utils/dateUtils';
import { SHOW_DEV_TOOLS } from '../config/flags';
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
    levelLabel?: string;
    actions: RecoveryAction[];
  } | null>(null);

  // Load plan from unified service (single source of truth)
  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);

      try {
        // Try Firestore first if user is authenticated
        let checkIn = null;
        if (user?.uid) {
          checkIn = await getTodayDailyCheckIn(user.uid);
        }
        
        // Fallback to local check-in if no Firestore check-in found
        if (!checkIn || !checkIn.generatedPlan) {
          const localCheckIn = await getLocalDailyCheckIn();
          const todayId = getTodayId();
          
          if (localCheckIn && localCheckIn.id === todayId) {
            // Generate plan from local check-in
            const feeling = localCheckIn.level as FeelingOption;
            const symptomKeys = localCheckIn.symptoms.filter((s): s is SymptomKey => {
              return ['headache', 'nausea', 'dryMouth', 'dizziness', 'fatigue', 'anxiety', 'brainFog', 'poorSleep', 'noSymptoms'].includes(s);
            }) as SymptomKey[];
            
            const plan = generatePlan({
              level: feeling,
              symptoms: symptomKeys,
              drankLastNight: localCheckIn.drankLastNight,
              drinkingToday: localCheckIn.drinkingToday,
            });
            
            const today = new Date();
            const dateString = today.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            
            // Load step states from AsyncStorage
            const stepsState = await getLocalPlanStepsState(todayId);
            const planCompletion = await getLocalPlanCompletion(todayId);
            const isPlanCompleted = planCompletion?.completed === true;
            
            // Apply saved step states to actions
            const actionsWithState = plan.steps.map(step => {
              if (isPlanCompleted) {
                return { ...step, completed: true };
              } else if (stepsState?.steps) {
                return { ...step, completed: stepsState.steps[step.id] || false };
              }
              return step;
            });
            
            setPlanData({
              date: dateString,
              recoveryWindowLabel: plan.recoveryWindowLabel,
              symptomLabels: plan.symptomLabels,
              levelLabel: plan.levelLabel,
              actions: actionsWithState,
            });
            
            if (SHOW_DEV_TOOLS) {
              console.log('[SmartPlanWrapper] Loaded plan from local check-in:', {
                stepsCount: actionsWithState.length,
                completedSteps: actionsWithState.filter(a => a.completed).length,
                isPlanCompleted,
              });
            }
            setIsLoading(false);
            return;
          }
        }
        
        // If we have a check-in from Firestore with a plan, use it
        if (checkIn && checkIn.generatedPlan && checkIn.completedAt) {
          // Use saved plan from unified service
          const today = new Date();
          const dateString = today.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          // Load step states from AsyncStorage
          const todayId = getTodayId();
          const stepsState = await getLocalPlanStepsState(todayId);
          const planCompletion = await getLocalPlanCompletion(todayId);
          const isPlanCompleted = planCompletion?.completed === true;

          // Apply saved step states to actions, or mark all as completed if plan is completed
          const actionsWithState = checkIn.generatedPlan.steps.map(step => {
            if (isPlanCompleted) {
              // If plan is completed, all steps should be checked
              return { ...step, completed: true };
            } else if (stepsState?.steps) {
              // Apply saved state for this step
              return { ...step, completed: stepsState.steps[step.id] || false };
            }
            return step;
          });

          setPlanData({
            date: dateString,
            recoveryWindowLabel: checkIn.generatedPlan.recoveryWindowLabel,
            symptomLabels: checkIn.generatedPlan.symptomLabels,
            levelLabel: checkIn.generatedPlan.levelLabel || checkIn.severityLabel,
            actions: actionsWithState,
          });
          
          if (SHOW_DEV_TOOLS) {
            console.log('[SmartPlanWrapper] Loaded plan from unified service:', {
              stepsCount: actionsWithState.length,
              completedSteps: actionsWithState.filter(a => a.completed).length,
              isPlanCompleted,
            });
          }
          setIsLoading(false);
          return;
        }
        
        // If we reach here, we don't have a plan from Firestore
        // Check if we have a local check-in and generate plan from it
        const localCheckIn = await getLocalDailyCheckIn();
        const todayId = getTodayId();
        
        if (localCheckIn && localCheckIn.id === todayId) {
          // Generate plan from local check-in
          const feeling = localCheckIn.level as FeelingOption;
          const symptomKeys = localCheckIn.symptoms.filter((s): s is SymptomKey => {
            return ['headache', 'nausea', 'dryMouth', 'dizziness', 'fatigue', 'anxiety', 'brainFog', 'poorSleep', 'noSymptoms'].includes(s);
          }) as SymptomKey[];
          
          const plan = generatePlan({
            level: feeling,
            symptoms: symptomKeys,
            drankLastNight: localCheckIn.drankLastNight,
            drinkingToday: localCheckIn.drinkingToday,
          });
          
          const today = new Date();
          const dateString = today.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          
          // Load step states from AsyncStorage
          const stepsState = await getLocalPlanStepsState(todayId);
          const planCompletion = await getLocalPlanCompletion(todayId);
          const isPlanCompleted = planCompletion?.completed === true;
          
          // Apply saved step states to actions
          const actionsWithState = plan.steps.map(step => {
            if (isPlanCompleted) {
              return { ...step, completed: true };
            } else if (stepsState?.steps) {
              return { ...step, completed: stepsState.steps[step.id] || false };
            }
            return step;
          });
          
          setPlanData({
            date: dateString,
            recoveryWindowLabel: plan.recoveryWindowLabel,
            symptomLabels: plan.symptomLabels,
            levelLabel: plan.levelLabel,
            actions: actionsWithState,
          });
          
          if (SHOW_DEV_TOOLS) {
            console.log('[SmartPlanWrapper] Generated plan from local check-in:', {
              stepsCount: actionsWithState.length,
              completedSteps: actionsWithState.filter(a => a.completed).length,
              isPlanCompleted,
            });
          }
          setIsLoading(false);
          return;
        }
        
        // No check-in found at all - redirect to check-in screen
        console.warn('[SmartPlanWrapper] No check-in found, redirecting to check-in');
        navigation.navigate('CheckIn');
      } catch (error) {
        console.error('[SmartPlanWrapper] Error loading plan:', error);
        // Only redirect to check-in if we're sure there's no check-in
        // Otherwise, try to generate from local check-in
        const localCheckIn = await getLocalDailyCheckIn();
        if (!localCheckIn) {
          navigation.navigate('CheckIn');
        } else {
          // Try to generate plan from local check-in as fallback
          try {
            const feeling = localCheckIn.level as FeelingOption;
            const symptomKeys = localCheckIn.symptoms.filter((s): s is SymptomKey => {
              return ['headache', 'nausea', 'dryMouth', 'dizziness', 'fatigue', 'anxiety', 'brainFog', 'poorSleep', 'noSymptoms'].includes(s);
            }) as SymptomKey[];
            
            const plan = generatePlan({
              level: feeling,
              symptoms: symptomKeys,
              drankLastNight: localCheckIn.drankLastNight,
              drinkingToday: localCheckIn.drinkingToday,
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
              actions: plan.steps,
            });
          } catch (fallbackError) {
            console.error('[SmartPlanWrapper] Fallback plan generation failed:', fallbackError);
            navigation.navigate('CheckIn');
          }
        }
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
            levelLabel: plan.levelLabel,
      actions: plan.steps,
    });
  };

  // Handle step toggle - save state to AsyncStorage immediately
  const handleToggleAction = useCallback(async (stepId: string, completed: boolean) => {
    if (!planData) return;
    
    const dateId = getTodayId();
    
    // Update local state immediately for responsive UI
    setPlanData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        actions: prev.actions.map(action => 
          action.id === stepId ? { ...action, completed } : action
        ),
      };
    });
    
    // Save to AsyncStorage
    try {
      await updateLocalPlanStepState(dateId, stepId, completed);
      if (SHOW_DEV_TOOLS) {
        console.log('[SmartPlanWrapper] Saved step state:', { stepId, completed });
      }
    } catch (error) {
      console.error('[SmartPlanWrapper] Error saving step state:', error);
    }
  }, [planData]);

  const handleCompletePlan = useCallback(async (stepsCompleted: number, totalSteps: number) => {
    const dateId = getTodayId();
    
    // Save all step states as completed when plan is completed
    if (planData) {
      const allStepsCompleted: Record<string, boolean> = {};
      planData.actions.forEach(action => {
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
    
    // Save completion to AsyncStorage first (source of truth when Firestore isn't available)
    try {
      await saveLocalPlanCompletion(dateId, stepsCompleted, totalSteps);
      if (SHOW_DEV_TOOLS) {
        console.log('[SmartPlanWrapper] Saved plan completion to AsyncStorage:', {
          dateId,
          stepsCompleted,
          totalSteps,
        });
      }
    } catch (error) {
      console.error('[SmartPlanWrapper] Error saving plan completion to AsyncStorage:', error);
      // Continue anyway
    }
    
    // Save completion to Firestore if user is authenticated (best-effort, don't block)
    if (user?.uid) {
      try {
        await markPlanCompletedForToday({
          uid: user.uid,
          dateId,
          stepsCompleted,
          totalSteps,
        });
        if (SHOW_DEV_TOOLS) {
          console.log('[SmartPlanWrapper] Saved plan completion to Firestore');
        }
      } catch (error) {
        console.error('[SmartPlanWrapper] Error saving plan completion to Firestore:', error);
        // Continue to celebration screen even if save fails - AsyncStorage already saved
      }
    }

    // Navigate to celebration screen
    navigation.navigate('PlanComplete', { stepsCompleted, totalSteps });
  }, [user?.uid, navigation, planData]);

  if (isLoading || !planData) {
    // Show loading state or TodayRecoveryPlanScreen with default data
    return (
      <TodayRecoveryPlanScreen
        mode="app"
        date={planData?.date}
        recoveryWindowLabel={planData?.recoveryWindowLabel}
        symptomLabels={planData?.symptomLabels}
        levelLabel={planData?.levelLabel}
        hydrationGoalLiters={1.5}
        hydrationProgress={0}
        actions={planData?.actions || []}
        onToggleAction={handleToggleAction}
        onCompletePlan={handleCompletePlan}
      />
    );
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

