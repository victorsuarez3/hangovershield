/**
 * Recovery Plan Generator - Hangover Shield
 * Centralized plan generation logic reused from onboarding
 * Generates micro-action, recovery window, hydration goal, and steps
 */

import { FeelingOption, SymptomKey } from '../../navigation/OnboardingNavigator';
import { getRecoveryAnalysis, getKeySymptomLabels } from '../../utils/recoveryAnalysis';
import { RecoveryAction } from '../../screens/TodayRecoveryPlanScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MicroAction {
  title: string;
  body: string;
  seconds: number;
}

export interface RecoveryPlan {
  recoveryWindow: { min: number; max: number };
  recoveryWindowLabel: string;
  hydrationGoalLiters: number;
  microAction: MicroAction;
  steps: RecoveryAction[];
  symptomLabels: string[];
  levelLabel: string;
}

export interface PlanGeneratorInput {
  level: FeelingOption;
  symptoms: SymptomKey[];
  drankLastNight?: boolean;
  drinkingToday?: boolean;
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
// Plan Generator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate complete recovery plan based on check-in data
 */
export function generatePlan(input: PlanGeneratorInput): RecoveryPlan {
  const { level, symptoms, drankLastNight, drinkingToday } = input;

  // Generate recovery analysis
  const analysis = getRecoveryAnalysis(level, symptoms);
  const baseSymptomLabels = getKeySymptomLabels(symptoms);
  const levelLabel = FEELING_DISPLAY_LABELS[level];
  const symptomLabels = baseSymptomLabels.length > 0 ? baseSymptomLabels : ['Feeling okay'];

  // Recovery window
  const recoveryWindow = analysis.estimatedRecoveryHoursRange;
  const recoveryWindowLabel = `${recoveryWindow.min}–${recoveryWindow.max} hours`;

  // Hydration goal (liters)
  let hydrationGoalLiters = 1.5; // Default
  if (level === 'severe') {
    hydrationGoalLiters = 2.0;
  } else if (level === 'moderate') {
    hydrationGoalLiters = 1.5;
  } else if (level === 'mild') {
    hydrationGoalLiters = 1.2;
  } else {
    hydrationGoalLiters = 1.0; // Not hungover
  }

  // Generate micro-action
  const microAction = generateMicroAction(level, symptoms, drinkingToday);

  // Generate steps
  const steps = generateSteps(level, symptoms);

  return {
    recoveryWindow,
    recoveryWindowLabel,
    hydrationGoalLiters,
    microAction,
    steps,
    symptomLabels,
    levelLabel,
  };
}

/**
 * Generate micro-action based on level, symptoms, and drinking plans
 */
function generateMicroAction(
  level: FeelingOption,
  symptoms: SymptomKey[],
  drinkingToday?: boolean
): MicroAction {
  const hasHeadache = symptoms.includes('headache');
  const hasNausea = symptoms.includes('nausea');
  const hasFatigue = symptoms.includes('fatigue');

  // If planning to drink today
  if (drinkingToday === true) {
    return {
      title: 'Set a water reminder',
      body: '1 glass before your first drink.',
      seconds: 30,
    };
  }

  // Level-based micro-actions
  if (level === 'mild') {
    if (hasHeadache) {
      return {
        title: 'Drink a full glass of water now',
        body: 'Headaches worsen with dehydration.',
        seconds: 30,
      };
    } else if (hasNausea) {
      return {
        title: 'Small sips of water + a pinch of salt',
        body: 'Gentle rehydration helps nausea.',
        seconds: 30,
      };
    } else {
      return {
        title: 'Drink 500ml of water',
        body: 'Early hydration supports recovery.',
        seconds: 30,
      };
    }
  } else if (level === 'moderate') {
    if (hasNausea) {
      return {
        title: 'Small sips of water + a pinch of salt',
        body: 'Gentle rehydration helps nausea.',
        seconds: 30,
      };
    } else if (hasHeadache) {
      return {
        title: 'Drink a full glass of water now',
        body: 'Headaches worsen with dehydration.',
        seconds: 30,
      };
    } else {
      return {
        title: 'Start with slow hydration',
        body: 'Your body needs steady rehydration.',
        seconds: 30,
      };
    }
  } else if (level === 'severe') {
    return {
      title: 'Start with slow hydration + sit upright for 2 minutes',
      body: 'Your nervous system needs calm first.',
      seconds: 60,
    };
  } else {
    // Not hungover
    return {
      title: 'Log water once today',
      body: 'It keeps recovery easy if you go out later.',
      seconds: 30,
    };
  }
}

/**
 * Generate recovery steps based on level and symptoms
 */
function generateSteps(level: FeelingOption, symptoms: SymptomKey[]): RecoveryAction[] {
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
  
  if (level === 'severe') {
    // Severe: All 5 base actions + power nap (6 total)
    actions = [
      ...allActions.slice(0, 4), // morning + midday walk
      powerNapAction,            // power nap after walk
      allActions[4],             // light meal (afternoon)
    ];
  } else if (level === 'moderate') {
    // Moderate: 5 base actions + power nap (6 total)
    actions = [
      ...allActions.slice(0, 4), // morning + midday walk
      powerNapAction,            // power nap
      allActions[4],             // light meal (afternoon)
    ];
  } else if (level === 'mild') {
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

  return actions;
}

