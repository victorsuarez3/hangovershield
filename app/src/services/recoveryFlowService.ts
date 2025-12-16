/**
 * Recovery Flow Service - Hangover Shield
 * Shared entry point for starting recovery flow from any source
 * Reuses existing recovery plan generation logic
 */

import { NavigationContainerRef } from '@react-navigation/native';
import { DailyCheckInSeverity } from './dailyCheckIn';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StartRecoveryFlowParams {
  level: DailyCheckInSeverity;
  symptoms: string[];
  source: 'daily_checkin' | 'onboarding' | 'other';
  userId?: string;
}

// Map DailyCheckInSeverity to FeelingOption (same values)
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared Recovery Flow Entry Point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Start the recovery flow - shared entry point for all sources
 * This function routes to the existing recovery plan generation flow
 */
export const startRecoveryFlow = async (
  params: StartRecoveryFlowParams,
  navigation: any
): Promise<void> => {
  const { level, symptoms, source, userId } = params;

  // Map severity to FeelingOption (same values)
  const feeling = level as FeelingOption;
  
  // Map symptoms to SymptomKey[] (validate and filter)
  const symptomKeys = symptoms.filter((s): s is SymptomKey => {
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

  // Navigate based on source
  if (source === 'daily_checkin') {
    // For daily check-in, navigate to SmartPlan screen which will generate the plan
    // We'll pass params via navigation state or use a shared service
    // For now, navigate directly to SmartPlan - it will use the saved check-in data
    navigation.navigate('SmartPlan');
  } else {
    // For onboarding or other sources, use existing navigators
    // This maintains backward compatibility
    if (navigation.getParent) {
      // If we're in a nested navigator, navigate to the recovery plan
      navigation.navigate('DailyRecoveryPlan', {
        feeling,
        symptoms: symptomKeys,
      });
    } else {
      // Fallback: navigate to SmartPlan
      navigation.navigate('SmartPlan');
    }
  }
};

