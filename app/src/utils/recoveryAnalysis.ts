/**
 * Recovery Analysis Utilities
 * Generates personalized recovery insights based on symptoms and feeling
 */

import { FeelingOption, SymptomKey } from '../screens/FirstLogin/FirstLoginCheckInScreen';

export type RecoveryAnalysis = {
  headerTitle: string;
  summaryTitle: string;
  summaryBody: string;
  feelingLabel: string;
  keySymptomLabels: string[];
  estimatedRecoveryHoursRange: { min: number; max: number };
  recommendations: string[];
};

const SYMPTOM_LABELS: Record<SymptomKey, string> = {
  headache: 'Headache',
  nausea: 'Nausea',
  dryMouth: 'Dry mouth',
  dizziness: 'Dizziness',
  fatigue: 'Low energy',
  anxiety: 'Anxiety',
  brainFog: 'Brain fog',
  poorSleep: 'Poor sleep',
  noSymptoms: 'No symptoms',
};

// Priority order for selecting which symptoms to show as pills (most impactful first)
// Note: 'noSymptoms' is excluded from priority list since it's filtered out before sorting
const SYMPTOM_PRIORITY: Exclude<SymptomKey, 'noSymptoms'>[] = [
  'poorSleep',
  'fatigue',
  'nausea',
  'headache',
  'anxiety',
  'brainFog',
  'dizziness',
  'dryMouth',
];

/**
 * Get the prioritized symptom labels (all selected, ordered by impact)
 */
export function getKeySymptomLabels(symptoms: SymptomKey[]): string[] {
  const filtered = symptoms.filter((s): s is Exclude<SymptomKey, 'noSymptoms'> => s !== 'noSymptoms');
  const prioritized = SYMPTOM_PRIORITY.filter((key) => filtered.includes(key));
  const remaining = filtered.filter((s) => !SYMPTOM_PRIORITY.includes(s));
  const ordered = [...prioritized, ...remaining];
  return ordered.map((key) => SYMPTOM_LABELS[key] || key);
}

/**
 * Get recovery timeline based on feeling and symptoms
 */
export function getRecoveryTimeline(
  feeling: FeelingOption,
  symptoms: SymptomKey[]
): { min: number; max: number } {
  const hasPoorSleep = symptoms.includes('poorSleep');
  const hasFatigue = symptoms.includes('fatigue');
  const hasNausea = symptoms.includes('nausea');
  const hasDizziness = symptoms.includes('dizziness');
  const hasAnxiety = symptoms.includes('anxiety');
  const hasBrainFog = symptoms.includes('brainFog');
  const hasNoSymptoms = symptoms.includes('noSymptoms');
  const hasOtherSymptoms = symptoms.some((s) => s !== 'noSymptoms');

  // Base hours by feeling
  let minHours = 6;
  let maxHours = 12;

  if (feeling === 'severe') {
    minHours = 24;
    maxHours = 36;
  } else if (feeling === 'moderate') {
    minHours = 14;
    maxHours = 28;
  } else if (feeling === 'mild') {
    minHours = 6;
    maxHours = 12;
  } else if (feeling === 'none') {
    if (!hasOtherSymptoms) {
      // Not hungover + No symptoms
      minHours = 0;
      maxHours = 4;
    } else {
      // Not hungover + Symptoms
      minHours = 4;
      maxHours = 14;
    }
  }

  // Adjust hours based on symptoms (except for severe and noSymptoms-only cases)
  if (feeling !== 'severe' && !(feeling === 'none' && !hasOtherSymptoms)) {
    if (hasPoorSleep) {
      minHours += 2;
      maxHours += 4;
    }

    if (hasFatigue) {
      maxHours += 2;
    }

    if (hasNausea || hasDizziness) {
      maxHours += 2;
    }

    if (hasAnxiety || hasBrainFog) {
      maxHours += 2;
    }
  }

  return { min: minHours, max: maxHours };
}

/**
 * Get daily recommendations based on feeling and symptoms
 */
export function getDailyRecommendations(
  feeling: FeelingOption,
  symptoms: SymptomKey[]
): string[] {
  const hasPoorSleep = symptoms.includes('poorSleep');
  const hasFatigue = symptoms.includes('fatigue');
  const hasNausea = symptoms.includes('nausea');
  const hasDizziness = symptoms.includes('dizziness');
  const hasHeadache = symptoms.includes('headache');
  const hasAnxiety = symptoms.includes('anxiety');
  const hasBrainFog = symptoms.includes('brainFog');
  const hasNoSymptoms = symptoms.includes('noSymptoms');
  const hasOtherSymptoms = symptoms.some((s) => s !== 'noSymptoms');

  const recommendations: string[] = [];

  // 1. Severe hangover (any symptoms)
  if (feeling === 'severe') {
    recommendations.push(
      'Hydration: Aim for around 1–1.5 L of water today, ideally with electrolytes.'
    );
    recommendations.push(
      'Avoid caffeine 60–90 mins: Give your body time to rehydrate before any stimulants.'
    );
    recommendations.push(
      'Full rest: Prioritize rest, consistent hydration, and avoid any additional stress on your body.'
    );
    recommendations.push(
      'Light meals: Choose light, easy-to-digest foods and avoid heavy, greasy meals.'
    );
  }
  // 2. Moderate hangover
  else if (feeling === 'moderate') {
    recommendations.push(
      'Hydration: Aim for around 1–1.5 L of water today, ideally with electrolytes.'
    );
    if (hasPoorSleep || hasFatigue) {
      recommendations.push(
        'Short breaks: Try to include short breaks and, if possible, a 20–30 minute nap.'
      );
    }
    if (hasNausea || hasDizziness) {
      recommendations.push(
        'Light nutrition: Choose light, easy-to-digest foods and avoid heavy, greasy meals this morning.'
      );
    } else {
      recommendations.push(
        'Light nutrition: Choose light, easy-to-digest foods to support recovery.'
      );
    }
    recommendations.push(
      'Avoid caffeine early in the day: Wait 60–90 minutes before any caffeine to give your body time to rehydrate.'
    );
  }
  // 3. Mild hangover
  else if (feeling === 'mild') {
    recommendations.push(
      'Hydration: Aim for around 1–1.5 L of water today, ideally with electrolytes.'
    );
    recommendations.push(
      'Light stretching: Gentle movement can help your body recover.'
    );
    recommendations.push(
      'Balanced breakfast: Choose light, easy-to-digest foods to support recovery.'
    );
    recommendations.push('Avoid heavy exertion: Keep physical activity light today.');
  }
  // 4. Not hungover + Symptoms (like poor sleep / low energy)
  else if (feeling === 'none' && hasOtherSymptoms) {
    recommendations.push(
      'Hydration: Keep a steady intake of water today to maintain your current state.'
    );
    if (hasPoorSleep || hasFatigue) {
      recommendations.push(
        'Short naps: If possible, include a 20–30 minute nap to help your nervous system reset.'
      );
    }
    if (hasAnxiety || hasBrainFog) {
      recommendations.push(
        'Nervous system calming: Do a 2-minute guided breathing session or take short breaks.'
      );
    } else {
      recommendations.push(
        'Nervous system calming: Take short breaks to help your body recalibrate.'
      );
    }
  }
  // 5. Not hungover + No symptoms
  else {
    recommendations.push(
      'Maintain hydration: Keep a steady intake of water today to maintain your current state.'
    );
    recommendations.push(
      'Keep habits consistent: Use today to notice what helped you feel better and repeat those behaviors.'
    );
    recommendations.push(
      'Optional: quick breathing reset: A 2-minute breathing session can help maintain balance.'
    );
  }

  // Limit to max 4 items
  return recommendations.slice(0, 4);
}

/**
 * Get analysis title based on severity level
 */
export function getAnalysisTitle(severity: FeelingOption): string {
  switch (severity) {
    case 'severe':
      return 'Your body is dealing with a heavy hangover.';
    case 'moderate':
      return 'Your body is in full recovery mode.';
    case 'mild':
      return 'Your body is showing mild hangover signs and needs support.';
    case 'none':
    default:
      return "You're not hungover, but your body is still recalibrating.";
  }
}

/**
 * Get complete recovery analysis based on feeling and symptoms
 */
export function getRecoveryAnalysis(
  feeling: FeelingOption,
  symptoms: SymptomKey[]
): RecoveryAnalysis {
  const headerTitle = "Here's what your body is experiencing today";

  const hasPoorSleep = symptoms.includes('poorSleep');
  const hasFatigue = symptoms.includes('fatigue');
  const hasNausea = symptoms.includes('nausea');
  const hasDizziness = symptoms.includes('dizziness');
  const hasAnxiety = symptoms.includes('anxiety');
  const hasBrainFog = symptoms.includes('brainFog');
  const hasNoSymptoms = symptoms.includes('noSymptoms');
  const hasOtherSymptoms = symptoms.some((s) => s !== 'noSymptoms');

  // Get analysis title from severity
  const summaryTitle = getAnalysisTitle(feeling);

  // Determine summary body and feeling label based on feeling + symptoms
  let summaryBody = '';
  let feelingLabel = '';

  // Special case: Not hungover + No symptoms (only if noSymptoms is explicitly selected)
  if (feeling === 'none' && hasNoSymptoms && !hasOtherSymptoms) {
    feelingLabel = 'Not hungover today';
    summaryBody =
      "You're not showing strong hangover symptoms right now. This is a good moment to reinforce healthy hydration, sleep and drinking habits so your future mornings stay this way.";
  }
  // Not hungover + Symptoms (like poor sleep / low energy)
  else if (feeling === 'none' && hasOtherSymptoms) {
    feelingLabel = 'Not hungover today';
    summaryBody =
      'Even without strong hangover symptoms, your body is finishing the recovery process from your last drinks and your recent sleep.';
  }
  // Not hungover but no symptoms selected
  else if (feeling === 'none' && symptoms.length === 0) {
    feelingLabel = 'Not hungover today';
    summaryBody =
      'Even without strong hangover symptoms, your body is finishing the recovery process from your last drinks and your recent sleep.';
  }
  // Severe hangover (any symptoms)
  else if (feeling === 'severe') {
    feelingLabel = 'Severe hangover';
    summaryBody =
      'Significant dehydration, nervous system overload and digestive strain are making today feel especially rough.';
  }
  // Moderate hangover
  else if (feeling === 'moderate') {
    feelingLabel = 'Moderate hangover';
    summaryBody =
      'Low energy, disrupted sleep and digestive stress indicate your nervous system is working hard to restore balance.';
  }
  // Mild hangover
  else {
    feelingLabel = 'Mild hangover';
    summaryBody =
      "You're experiencing a light recovery state. Mild dehydration and slight nervous system stress are present, but your body is already moving back to balance.";
  }

  // Enrich body text with symptom-specific sentences (except for noSymptoms-only)
  if (!(feeling === 'none' && !hasOtherSymptoms)) {
    if (hasNausea || hasDizziness) {
      summaryBody +=
        ' Your stomach and inner ear are still sensitive, so move slowly and choose very gentle foods.';
    }

    if (hasPoorSleep) {
      summaryBody +=
        ' Because your sleep was disrupted, your nervous system will benefit from small breaks and possibly a short nap.';
    }

    if (hasAnxiety || hasBrainFog) {
      summaryBody +=
        ' Anxiety and brain fog are signs that your nervous system is overstimulated and needs calm, slow breathing and low stimulation.';
    }

    // Add reassurance sentence
    const reassurance =
      ' This is completely normal and your body knows how to recover — it just needs the right support today.';
    summaryBody = summaryBody + reassurance;
  }

  const estimatedRecoveryHoursRange = getRecoveryTimeline(feeling, symptoms);
  const recommendations = getDailyRecommendations(feeling, symptoms);

  // IMPORTANT: Only show feelingLabel as a tag if:
  // 1. It's not "none" (always show mild/moderate/severe)
  // 2. OR it's "none" AND user explicitly selected "noSymptoms" in Step 2
  // Do NOT auto-inject "Not hungover today" - it must only appear if explicitly selected
  const shouldShowFeelingTag = feeling !== 'none' || (feeling === 'none' && hasNoSymptoms);
  const finalFeelingLabel = shouldShowFeelingTag ? feelingLabel : '';

  return {
    headerTitle,
    summaryTitle,
    summaryBody,
    feelingLabel: finalFeelingLabel,
    keySymptomLabels: getKeySymptomLabels(symptoms),
    estimatedRecoveryHoursRange,
    recommendations,
  };
}

