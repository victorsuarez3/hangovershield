/**
 * Today's Recovery Plan Screen - Hangover Shield
 * Premium vertical timeline with guided recovery steps
 * Calm / Whoop / Levels quality
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { AppMenuSheet } from '../components/AppMenuSheet';
import { useAppNavigation } from '../contexts/AppNavigationContext';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { SoftGateCard } from '../components/SoftGateCard';
import { LockedSection } from '../components/LockedSection';
import { PaywallSource } from '../constants/paywallSources';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type RecoveryActionTimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening';

export type RecoveryAction = {
  id: string;
  timeOfDay: RecoveryActionTimeOfDay;
  time: string;
  title: string;
  description: string;
  durationMinutes?: number;
  icon?: string; // Ionicons name
  completed: boolean;
};

export type TodayRecoveryPlanScreenProps = {
  date?: string;
  recoveryWindowLabel?: string;
  symptomLabels?: string[];
  hydrationGoalLiters?: number;
  hydrationProgress?: number;
  actions?: RecoveryAction[];
  onToggleAction?: (id: string, completed: boolean) => void;
  // Plan completion props
  onCompletePlan?: (stepsCompleted: number, totalSteps: number) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_MOCK_DATA: Required<Omit<TodayRecoveryPlanScreenProps, 'onToggleAction'>> = {
  date: 'Wed, Dec 10',
  recoveryWindowLabel: '6–12 hours',
  symptomLabels: ['Mild hangover', 'Fatigue', 'Dry mouth'],
  hydrationGoalLiters: 1.5,
  hydrationProgress: 0,
  actions: [
    {
      id: '1',
      timeOfDay: 'morning',
      time: '6:00 AM',
      title: 'Soft light & breathing',
      description: 'Gentle light exposure and slow breathing help calm the nervous system and reduce early morning hangover stress.',
      durationMinutes: 2,
      icon: 'sunny-outline',
      completed: false,
    },
    {
      id: '2',
      timeOfDay: 'morning',
      time: '8:00 AM',
      title: 'Water + electrolytes',
      description: 'Rehydrate early to support liver detox and reduce symptoms.',
      durationMinutes: 1,
      icon: 'water-outline',
      completed: false,
    },
    {
      id: '3',
      timeOfDay: 'morning',
      time: '9:00 AM',
      title: 'Light breakfast',
      description: 'Easy-to-digest foods stabilize blood sugar and ease nausea (toast, banana, eggs).',
      durationMinutes: 15,
      icon: 'cafe-outline',
      completed: false,
    },
    {
      id: '4',
      timeOfDay: 'midday',
      time: '11:00 AM',
      title: 'Short walk & check-in',
      description: 'Light movement boosts circulation and improves cognitive clarity.',
      durationMinutes: 15,
      icon: 'walk-outline',
      completed: false,
    },
    {
      id: '5',
      timeOfDay: 'midday',
      time: '11:30 AM',
      title: 'Power nap',
      description: 'A short reset reduces fatigue, improves mood, and supports recovery.',
      durationMinutes: 15,
      icon: 'moon-outline',
      completed: false,
    },
    {
      id: '6',
      timeOfDay: 'afternoon',
      time: '2:00 PM',
      title: 'Light meal + rest',
      description: 'Refuel gently; avoid heavy or greasy foods.',
      durationMinutes: 20,
      icon: 'restaurant-outline',
      completed: false,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TIME_OF_DAY_ORDER: RecoveryActionTimeOfDay[] = ['morning', 'midday', 'afternoon', 'evening'];

const TIME_OF_DAY_LABELS: Record<RecoveryActionTimeOfDay, string> = {
  morning: 'MORNING',
  midday: 'MIDDAY',
  afternoon: 'AFTERNOON',
  evening: 'EVENING',
};

function groupActionsByTimeOfDay(actions: RecoveryAction[]): Map<RecoveryActionTimeOfDay, RecoveryAction[]> {
  const groups = new Map<RecoveryActionTimeOfDay, RecoveryAction[]>();
  for (const time of TIME_OF_DAY_ORDER) {
    const filtered = actions.filter((a) => a.timeOfDay === time);
    if (filtered.length > 0) groups.set(time, filtered);
  }
  return groups;
}

function getMotivationalText(completed: number, total: number): string {
  if (completed === 0) {
    return 'Start with your first step to help your body recover faster.';
  } else if (completed < total) {
    return 'Nice work — keep going, your body is already thanking you.';
  } else {
    return "You've completed today's plan. Your body has what it needs to recover.";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// Symptom Chip
const SymptomChip: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.symptomChip}>
    <Text style={styles.symptomChipText}>{label}</Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Hydration Log Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

interface HydrationSheetProps {
  visible: boolean;
  onClose: () => void;
  onLogAmount: (amount: number) => void;
  goalLiters: number;
  currentLiters: number;
}

const HydrationLogSheet: React.FC<HydrationSheetProps> = ({
  visible,
  onClose,
  onLogAmount,
  goalLiters,
  currentLiters,
}) => {
  const [customAmount, setCustomAmount] = useState('');
  const insets = useSafeAreaInsets();

  // Preset amounts for quick logging
  const presetAmounts = [0.25, 0.5, 0.75];

  const handlePresetPress = (amount: number) => {
    onLogAmount(amount);
    onClose();
  };

  const handleCustomSave = () => {
    const parsed = parseFloat(customAmount);
    if (!isNaN(parsed) && parsed > 0) {
      onLogAmount(parsed);
      setCustomAmount('');
      onClose();
    }
  };

  const handleClose = () => {
    setCustomAmount('');
    onClose();
  };

  const remaining = Math.max(0, goalLiters - currentLiters);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetKeyboardView}
        >
          <Pressable
            style={[styles.sheetContainer, { paddingBottom: insets.bottom + 20 }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <Text style={styles.sheetTitle}>Log today's water</Text>
            <Text style={styles.sheetSubtitle}>
              Your goal today: {goalLiters.toFixed(1)}L
              {remaining > 0 && ` • ${remaining.toFixed(2)}L remaining`}
            </Text>

            {/* Preset Buttons */}
            <View style={styles.presetContainer}>
              {presetAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.presetButton}
                  onPress={() => handlePresetPress(amount)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetButtonText}>+{amount}L</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.sheetDivider}>
              <View style={styles.sheetDividerLine} />
              <Text style={styles.sheetDividerText}>or</Text>
              <View style={styles.sheetDividerLine} />
            </View>

            {/* Custom Input */}
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputLabel}>Custom amount (L)</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="rgba(15,76,68,0.3)"
                />
                <TouchableOpacity
                  style={[
                    styles.customSaveButton,
                    (!customAmount || parseFloat(customAmount) <= 0) && styles.customSaveButtonDisabled,
                  ]}
                  onPress={handleCustomSave}
                  disabled={!customAmount || parseFloat(customAmount) <= 0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.customSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cancel */}
            <TouchableOpacity style={styles.sheetCancelButton} onPress={handleClose}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

// Today at a Glance Card
interface GlanceCardProps {
  recoveryWindow: string;
  symptoms: string[];
  hydrationGoal: number;
  hydrationLogged: number;
  onHydrationPress: () => void;
}

const GlanceCard: React.FC<GlanceCardProps> = ({
  recoveryWindow,
  symptoms,
  hydrationGoal,
  hydrationLogged,
  onHydrationPress,
}) => {
  // Calculate hydration progress (capped at 1.0 for progress bar)
  const hydrationProgress = Math.min(hydrationLogged / hydrationGoal, 1);
  const percentage = hydrationProgress * 100;
  
  // Check if goal is reached
  const goalReached = hydrationLogged >= hydrationGoal;

  // Dynamic label text
  const hydrationLabelText = goalReached
    ? `Goal reached — ${hydrationLogged.toFixed(1)}L logged`
    : `${hydrationLogged.toFixed(1)}L logged of ${hydrationGoal.toFixed(1)}L`;

  // Dynamic hint text
  const hydrationHintText = goalReached
    ? 'Hydration goal reached — your body is rebalancing.'
    : 'Logging your water helps your body recover within this window.';

  return (
    <View style={styles.glanceCard}>
      <Text style={styles.glanceLabel}>TODAY AT A GLANCE</Text>

      {/* Recovery Window */}
      <View style={styles.glanceRow}>
        <View style={styles.glanceRowLeft}>
          <View style={styles.glanceIconBox}>
            <Ionicons name="time-outline" size={18} color="#0F4C44" />
          </View>
          <Text style={styles.glanceRowLabel}>Recovery window</Text>
        </View>
        <Text style={styles.glanceRowValue}>{recoveryWindow}</Text>
      </View>

      <View style={styles.glanceDivider} />

      {/* Symptoms */}
      <View style={styles.symptomsSection}>
        <View style={styles.glanceRowLeft}>
          <View style={styles.glanceIconBox}>
            <Ionicons name="pulse-outline" size={18} color="#0F4C44" />
          </View>
          <Text style={styles.glanceRowLabel}>Symptoms</Text>
        </View>
        <View style={styles.symptomsChips}>
          {symptoms.map((s, i) => (
            <SymptomChip key={i} label={s} />
          ))}
        </View>
      </View>

      <View style={styles.glanceDivider} />

      {/* Hydration - Tappable */}
      <TouchableOpacity
        style={styles.hydrationSection}
        onPress={onHydrationPress}
        activeOpacity={0.7}
      >
        <View style={styles.hydrationHeader}>
          <View style={styles.glanceRowLeft}>
            <View style={[styles.glanceIconBox, goalReached && styles.glanceIconBoxSuccess]}>
              <Ionicons
                name={goalReached ? 'checkmark-circle' : 'water-outline'}
                size={18}
                color={goalReached ? '#FFF' : '#0F4C44'}
              />
            </View>
            <Text style={[styles.glanceRowLabel, goalReached && styles.glanceRowLabelSuccess]}>
              Hydration goal
            </Text>
            {goalReached && (
              <View style={styles.goalReachedBadge}>
                <Ionicons name="checkmark" size={10} color="#FFF" />
              </View>
            )}
          </View>
          <View style={styles.hydrationTargetRow}>
            <Text style={styles.hydrationTarget}>Aim for ~{hydrationGoal}L today</Text>
            <Ionicons name="add-circle-outline" size={18} color="rgba(15,76,68,0.4)" style={{ marginLeft: 6 }} />
          </View>
        </View>
        <View style={[styles.hydrationBarOuter, goalReached && styles.hydrationBarOuterSuccess]}>
          <View
            style={[
              styles.hydrationBarFill,
              { width: `${percentage}%` },
              goalReached && styles.hydrationBarFillSuccess,
            ]}
          />
        </View>
        <Text style={[styles.hydrationLogged, goalReached && styles.hydrationLoggedSuccess]}>
          {hydrationLabelText}
        </Text>
        <Text style={styles.hydrationTapHint}>Tap to log water</Text>
      </TouchableOpacity>

      {/* Hint */}
      <View style={styles.glanceHint}>
        <Ionicons
          name={goalReached ? 'checkmark-circle-outline' : 'information-circle-outline'}
          size={14}
          color={goalReached ? 'rgba(26,107,92,0.6)' : 'rgba(15,76,68,0.4)'}
        />
        <Text style={[styles.glanceHintText, goalReached && styles.glanceHintTextSuccess]}>
          {hydrationHintText}
        </Text>
      </View>
    </View>
  );
};

// Recovery Step Card with Timeline
interface RecoveryStepCardProps {
  action: RecoveryAction;
  isFirst: boolean;
  isLast: boolean;
  isNextStep: boolean;
  onToggle: (id: string, completed: boolean) => void;
}

const RecoveryStepCard: React.FC<RecoveryStepCardProps> = ({
  action,
  isFirst,
  isLast,
  isNextStep,
  onToggle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 50, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 400, friction: 12, useNativeDriver: true }),
    ]).start();
    onToggle(action.id, !action.completed);
  }, [action.id, action.completed, onToggle, scaleAnim]);

  return (
    <View style={styles.stepWrapper}>
      {/* Timeline Column */}
      <View style={styles.timelineColumn}>
        {/* Top connector line */}
        {!isFirst && (
          <View style={[styles.timelineLine, action.completed && styles.timelineLineCompleted]} />
        )}
        {/* Node */}
        <View style={[
          styles.timelineNode,
          action.completed && styles.timelineNodeCompleted,
          isNextStep && !action.completed && styles.timelineNodeNext,
        ]}>
          {action.completed && <Ionicons name="checkmark" size={12} color="#FFF" />}
        </View>
        {/* Bottom connector line */}
        {!isLast && (
          <View style={[
            styles.timelineLine,
            styles.timelineLineBottom,
            action.completed && styles.timelineLineCompleted,
          ]} />
        )}
      </View>

      {/* Step Card */}
      <Animated.View style={[styles.stepCard, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.stepCardInner,
            isNextStep && !action.completed && styles.stepCardNext,
          ]}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          {/* Next Step Badge */}
          {isNextStep && !action.completed && (
            <View style={styles.nextStepBadge}>
              <Text style={styles.nextStepBadgeText}>NEXT STEP</Text>
            </View>
          )}

          {/* Content Row */}
          <View style={styles.stepContentRow}>
            {/* Left: Icon + Time + Title + Description */}
            <View style={styles.stepTextColumn}>
              <View style={styles.stepHeaderWithIcon}>
                {action.icon && (
                  <View style={[styles.stepIconBox, action.completed && styles.stepIconBoxCompleted]}>
                    <Ionicons
                      name={action.icon as any}
                      size={14}
                      color={action.completed ? 'rgba(15,76,68,0.4)' : '#0F4C44'}
                    />
                  </View>
                )}
                <Text style={[styles.stepTime, action.completed && styles.stepTimeCompleted]}>
                  {action.time}
                </Text>
              </View>
              <Text style={[styles.stepTitle, action.completed && styles.stepTitleCompleted]}>
                {action.title}
              </Text>
              <Text style={[styles.stepDescription, action.completed && styles.stepDescriptionCompleted]}>
                {action.description}
              </Text>
              {action.durationMinutes && (
                <View style={styles.durationChip}>
                  <Ionicons name="time-outline" size={12} color="rgba(15,76,68,0.5)" />
                  <Text style={styles.durationText}>~{action.durationMinutes} min</Text>
                </View>
              )}
            </View>

            {/* Right: Check Control */}
            <View style={styles.checkControlContainer}>
              <View style={[styles.checkControl, action.completed && styles.checkControlCompleted]}>
                {action.completed && <Ionicons name="checkmark" size={18} color="#FFF" />}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Section Header
const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLine} />
    <Text style={styles.sectionHeaderText}>{label}</Text>
    <View style={styles.sectionHeaderLine} />
  </View>
);

// Progress Section
interface ProgressSectionProps {
  completed: number;
  total: number;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ completed, total }) => {
  const progress = total > 0 ? completed / total : 0;
  const motivationalText = getMotivationalText(completed, total);

  return (
    <View style={styles.progressSection}>
      <Text style={styles.progressCount}>
        <Text style={styles.progressCountNumber}>{completed}</Text>
        <Text style={styles.progressCountText}> of {total} steps completed</Text>
      </Text>
      <View style={styles.progressBarOuter}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressMotivation}>{motivationalText}</Text>
      
      {/* Inspirational footer copy */}
      <Text style={styles.progressFooterCopy}>
        Small improvements throughout the day make the biggest difference.
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const TodayRecoveryPlanScreen: React.FC<TodayRecoveryPlanScreenProps> = (props) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const appNav = useAppNavigation();
  const accessInfo = useAccessStatus();
  
  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    date = DEFAULT_MOCK_DATA.date,
    recoveryWindowLabel = DEFAULT_MOCK_DATA.recoveryWindowLabel,
    symptomLabels = DEFAULT_MOCK_DATA.symptomLabels,
    // Hydration goal - can be made dynamic in the future by passing via props
    hydrationGoalLiters = DEFAULT_MOCK_DATA.hydrationGoalLiters,
    hydrationProgress: initialHydrationProgress = DEFAULT_MOCK_DATA.hydrationProgress,
    actions: initialActions = DEFAULT_MOCK_DATA.actions,
    onToggleAction,
    onCompletePlan,
  } = props;

  const [localActions, setLocalActions] = useState<RecoveryAction[]>(initialActions);

  // Update localActions when initialActions prop changes (e.g., when plan loads)
  useEffect(() => {
    if (initialActions && initialActions.length > 0) {
      console.log('[TodayRecoveryPlanScreen] Updating actions:', initialActions.length, 'actions');
      setLocalActions(initialActions);
    } else {
      console.warn('[TodayRecoveryPlanScreen] No actions provided or empty array');
    }
  }, [initialActions]);

  // ─────────────────────────────────────────────────────────────────────────
  // Hydration State
  // Today's hydration tracking - stored in liters
  // ─────────────────────────────────────────────────────────────────────────
  const [hydrationLoggedLiters, setHydrationLoggedLiters] = useState<number>(
    initialHydrationProgress * hydrationGoalLiters
  );
  const [isHydrationSheetVisible, setHydrationSheetVisible] = useState(false);

  // Helper: Log hydration from a step completion (e.g., "Hydration check-in")
  // Can be called when specific steps are completed
  const logHydrationFromStep = useCallback((amount: number) => {
    setHydrationLoggedLiters((prev) => prev + amount);
  }, []);

  // Handler for logging hydration from the sheet
  const handleLogHydration = useCallback((amount: number) => {
    setHydrationLoggedLiters((prev) => prev + amount);
  }, []);

  // Derived values
  const totalActions = localActions.length;
  const completedActions = localActions.filter((a) => a.completed).length;
  const allCompleted = completedActions >= totalActions;
  const groupedActions = useMemo(() => groupActionsByTimeOfDay(localActions), [localActions]);

  // Find the first incomplete action (next step)
  const nextStepId = useMemo(() => {
    const firstIncomplete = localActions.find((a) => !a.completed);
    return firstIncomplete?.id || null;
  }, [localActions]);

  // Toggle handler
  // Automatically logs hydration when completing hydration-related steps
  const handleToggleAction = useCallback(
    (id: string, completed: boolean) => {
      setLocalActions((prev) =>
        prev.map((action) => (action.id === id ? { ...action, completed } : action))
      );

      // If completing a hydration-related step, auto-log water
      // Map step IDs to hydration amounts - adjust as needed
      const hydrationSteps: Record<string, number> = {
        '2': 0.5, // "Water + electrolytes" step
        'morning-2': 0.5, // ID used in navigator
      };

      if (completed && hydrationSteps[id]) {
        logHydrationFromStep(hydrationSteps[id]);
      }

      onToggleAction?.(id, completed);
    },
    [onToggleAction, logHydrationFromStep]
  );

  // CTA text - changes based on completion status
  const ctaText = allCompleted 
    ? "I've completed today's plan" 
    : completedActions === 0 
      ? 'Start My First Step'
      : 'Continue My Plan';

  // Handler for completing the plan
  const handleCompletePlan = useCallback(() => {
    const doComplete = () => {
      if (onCompletePlan) {
        onCompletePlan(completedActions, totalActions);
      } else {
        // Fallback alert if no handler provided
        Alert.alert(
          '🎉 Amazing work!',
          "You've completed all your recovery steps. Your body thanks you!",
          [{ text: 'Awesome' }]
        );
      }
    };

    // If not all steps completed, ask for confirmation
    if (completedActions < totalActions && totalActions > 0) {
      Alert.alert(
        "Finish today's plan?",
        `You've only completed ${completedActions} of ${totalActions} steps. Are you sure you want to finish today's plan?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Finish anyway',
            style: 'default',
            onPress: doComplete,
          },
        ]
      );
    } else {
      doComplete();
    }
  }, [completedActions, totalActions, onCompletePlan]);

  // CTA handler - mark next step or complete plan
  const handleCtaPress = useCallback(() => {
    if (allCompleted) {
      // All steps done - trigger completion
      handleCompletePlan();
    } else if (nextStepId) {
      // Not all done - mark next step as completed
      handleToggleAction(nextStepId, true);
    }
  }, [allCompleted, nextStepId, handleToggleAction, handleCompletePlan]);

  // Build flat list with section markers
  const timelineItems = useMemo(() => {
    const items: Array<{ type: 'header'; timeOfDay: RecoveryActionTimeOfDay } | { type: 'step'; action: RecoveryAction; isFirst: boolean; isLast: boolean }> = [];
    let globalIndex = 0;
    const totalSteps = localActions.length;

    Array.from(groupedActions.entries()).forEach(([timeOfDay, actions]) => {
      items.push({ type: 'header', timeOfDay });
      actions.forEach((action, idx) => {
        items.push({
          type: 'step',
          action,
          isFirst: globalIndex === 0,
          isLast: globalIndex === totalSteps - 1,
        });
        globalIndex++;
      });
    });

    return items;
  }, [groupedActions, localActions.length]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* App Header with Menu */}
      <AppHeader
        showMenuButton
        onMenuPress={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{date.toUpperCase()}</Text>
          <Text style={styles.title}>Today's Recovery Plan</Text>
          <Text style={styles.subtitle}>Tailored to how your body feels this morning.</Text>
        </View>

        {/* Today at a Glance */}
        <GlanceCard
          recoveryWindow={recoveryWindowLabel}
          symptoms={symptomLabels}
          hydrationGoal={hydrationGoalLiters}
          hydrationLogged={hydrationLoggedLiters}
          onHydrationPress={() => setHydrationSheetVisible(true)}
        />

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineSectionTitle}>Today's key steps</Text>
          <Text style={styles.timelineSectionSubtitle}>
            Simple, guided actions you can take today to feel better faster.
          </Text>

          {/* Timeline Items */}
          {timelineItems.map((item, index) => {
            if (item.type === 'header') {
              // Check if this is the first non-morning header (where we insert soft gate)
              const isFirstNonMorningHeader = item.timeOfDay !== 'morning' && 
                timelineItems.slice(0, index).every(i => i.type === 'header' ? i.timeOfDay === 'morning' : true);
              
              return (
                <React.Fragment key={`header-${item.timeOfDay}`}>
                  {/* Insert SoftGateCard before first non-morning section if user doesn't have full access */}
                  {isFirstNonMorningHeader && !accessInfo.hasFullAccess && (
                    <SoftGateCard
                      title="Unlock full recovery plan"
                      description="See midday, afternoon, and evening steps tailored to your recovery."
                      source={PaywallSource.RECOVERY_PLAN_SOFT_GATE}
                      contextScreen="TodayRecoveryPlan"
                    />
                  )}
                  <SectionHeader label={TIME_OF_DAY_LABELS[item.timeOfDay]} />
                </React.Fragment>
              );
            } else {
              // Wrap non-morning actions in LockedSection if user doesn't have full access
              const shouldLock = !accessInfo.hasFullAccess && item.action.timeOfDay !== 'morning';
              
              const stepCard = (
                <RecoveryStepCard
                  key={item.action.id}
                  action={item.action}
                  isFirst={item.isFirst}
                  isLast={item.isLast}
                  isNextStep={item.action.id === nextStepId}
                  onToggle={handleToggleAction}
                />
              );
              
              if (shouldLock) {
                return (
                  <LockedSection
                    key={`locked-${item.action.id}`}
                    feature={`recovery_plan_${item.action.timeOfDay}`}
                    contextScreen="TodayRecoveryPlan"
                  >
                    {stepCard}
                  </LockedSection>
                );
              }
              
              return stepCard;
            }
          })}
        </View>

        {/* Progress */}
        <ProgressSection completed={completedActions} total={totalActions} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.ctaButton, allCompleted && styles.ctaButtonCompleted]}
          onPress={handleCtaPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaButtonText}>{ctaText}</Text>
          {!allCompleted && (
            <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
        
        {/* Secondary action - Finish plan early */}
        {!allCompleted && completedActions > 0 && (
          <TouchableOpacity
            style={styles.finishEarlyButton}
            onPress={handleCompletePlan}
            activeOpacity={0.7}
          >
            <Text style={styles.finishEarlyText}>Finish today's plan</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hydration Log Bottom Sheet */}
      <HydrationLogSheet
        visible={isHydrationSheetVisible}
        onClose={() => setHydrationSheetVisible(false)}
        onLogAmount={handleLogHydration}
        goalLiters={hydrationGoalLiters}
        currentLiters={hydrationLoggedLiters}
      />

      {/* App Menu Sheet */}
      <AppMenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        currentScreen="today"
        onGoToHome={() => {
          setMenuVisible(false);
          appNav.goToHome();
        }}
        onGoToToday={() => {
          // Already on today's plan during onboarding; keep it instant
          setMenuVisible(false);
        }}
        onGoToProgress={() => {
          setMenuVisible(false);
          appNav.goToProgress();
        }}
        onGoToCheckIn={() => {
          setMenuVisible(false);
          appNav.goToDailyCheckIn();
        }}
        onGoToWaterLog={() => {
          setMenuVisible(false);
          appNav.goToWaterLog();
        }}
        onGoToEveningCheckIn={() => {
          setMenuVisible(false);
          appNav.goToEveningCheckIn();
        }}
        onGoToEveningCheckInLocked={() => {
          setMenuVisible(false);
          appNav.goToEveningCheckIn();
        }}
        onGoToSubscription={(source) => {
          setMenuVisible(false);
          appNav.goToSubscription(source, 'TodayRecoveryPlan');
        }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  // Header
  header: { alignItems: 'center', marginBottom: 24 },
  dateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(15,76,68,0.5)',
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15,61,62,0.6)',
    textAlign: 'center',
    lineHeight: 21,
  },

  // Glance Card
  glanceCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: 'rgba(15,76,68,0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
  },
  glanceLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: 'rgba(15,76,68,0.45)',
    letterSpacing: 1.5,
    marginBottom: 18,
  },
  glanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glanceRowLeft: { flexDirection: 'row', alignItems: 'center' },
  glanceIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(15,76,68,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  glanceRowLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15,61,62,0.7)',
  },
  glanceRowValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F4C44',
  },
  glanceDivider: {
    height: 1,
    backgroundColor: 'rgba(15,76,68,0.06)',
    marginVertical: 16,
  },

  // Symptoms
  symptomsSection: { marginBottom: 4 },
  symptomsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginLeft: 44,
    gap: 8,
  },
  symptomChip: {
    backgroundColor: 'rgba(15,76,68,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  symptomChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#0F4C44',
  },

  // Hydration
  hydrationSection: { marginBottom: 4 },
  hydrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hydrationTarget: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15,76,68,0.5)',
  },
  hydrationBarOuter: {
    height: 6,
    backgroundColor: 'rgba(15,76,68,0.08)',
    borderRadius: 3,
    marginTop: 12,
    marginLeft: 44,
    overflow: 'hidden',
  },
  hydrationBarFill: {
    height: '100%',
    backgroundColor: '#0F4C44',
    borderRadius: 3,
  },
  hydrationLogged: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(15,76,68,0.4)',
    marginTop: 6,
    marginLeft: 44,
  },
  hydrationLoggedSuccess: {
    color: '#1A6B5C',
    fontFamily: 'Inter_500Medium',
  },
  hydrationTapHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(15,76,68,0.3)',
    marginTop: 4,
    marginLeft: 44,
  },
  hydrationTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hydrationBarOuterSuccess: {
    backgroundColor: 'rgba(26,107,92,0.15)',
  },
  hydrationBarFillSuccess: {
    backgroundColor: '#1A6B5C',
  },
  glanceIconBoxSuccess: {
    backgroundColor: '#1A6B5C',
  },
  glanceRowLabelSuccess: {
    color: '#1A6B5C',
    fontFamily: 'Inter_500Medium',
  },
  goalReachedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1A6B5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  glanceHintTextSuccess: {
    color: 'rgba(26,107,92,0.7)',
  },

  // Glance Hint
  glanceHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,76,68,0.06)',
    gap: 8,
  },
  glanceHintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15,76,68,0.45)',
    flex: 1,
    lineHeight: 17,
  },

  // Timeline Section
  timelineSection: { marginBottom: 8 },
  timelineSectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#0F3D3E',
    marginBottom: 6,
  },
  timelineSectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15,61,62,0.55)',
    lineHeight: 20,
    marginBottom: 20,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(15,76,68,0.1)',
  },
  sectionHeaderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: 'rgba(15,76,68,0.4)',
    letterSpacing: 1.5,
  },

  // Step Wrapper (Timeline + Card)
  stepWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  // Timeline Column
  timelineColumn: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(15,76,68,0.12)',
  },
  timelineLineBottom: {
    marginTop: 0,
  },
  timelineLineCompleted: {
    backgroundColor: '#0F4C44',
  },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(15,76,68,0.2)',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineNodeCompleted: {
    backgroundColor: '#0F4C44',
    borderColor: '#0F4C44',
  },
  timelineNodeNext: {
    borderColor: '#0F4C44',
    borderWidth: 3,
  },

  // Step Card
  stepCard: {
    flex: 1,
  },
  stepCardInner: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: 'rgba(15,76,68,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  stepCardNext: {
    borderWidth: 2,
    borderColor: 'rgba(15,76,68,0.15)',
    backgroundColor: 'rgba(255,255,255,1)',
  },

  // Next Step Badge
  nextStepBadge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#0F4C44',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  nextStepBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#FFF',
    letterSpacing: 1,
  },

  // Step Content
  stepContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepTextColumn: {
    flex: 1,
    marginRight: 12,
  },
  stepHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  stepIconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(15,76,68,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconBoxCompleted: {
    backgroundColor: 'rgba(15,76,68,0.04)',
  },
  stepTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(15,61,62,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stepTimeCompleted: {
    color: 'rgba(15,61,62,0.35)',
  },
  stepTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 4,
    lineHeight: 20,
  },
  stepTitleCompleted: {
    textDecorationLine: 'line-through',
    textDecorationColor: 'rgba(15,61,62,0.25)',
    color: 'rgba(15,61,62,0.45)',
  },
  stepDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15,61,62,0.6)',
    lineHeight: 18,
    marginBottom: 8,
  },
  stepDescriptionCompleted: {
    color: 'rgba(15,61,62,0.4)',
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15,76,68,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  durationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(15,76,68,0.5)',
  },

  // Check Control
  checkControlContainer: {
    paddingTop: 20,
  },
  checkControl: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(15,76,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkControlCompleted: {
    backgroundColor: '#0F4C44',
    borderColor: '#0F4C44',
  },

  // Progress Section
  progressSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  progressCount: {
    marginBottom: 12,
  },
  progressCountNumber: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: '#0F4C44',
  },
  progressCountText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15,61,62,0.55)',
  },
  progressBarOuter: {
    width: SCREEN_WIDTH - 80,
    height: 6,
    backgroundColor: 'rgba(15,76,68,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0F4C44',
    borderRadius: 3,
  },
  progressMotivation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15,61,62,0.5)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  progressFooterCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15,61,62,0.4)',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
    paddingHorizontal: 24,
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(206,229,225,0.98)',
  },
  ctaButton: {
    backgroundColor: '#0A3F37',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(10,63,55,0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    shadowOpacity: 1,
    elevation: 8,
  },
  ctaButtonCompleted: {
    backgroundColor: '#1A6B5C',
  },
  ctaButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 0.2,
  },
  finishEarlyButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  finishEarlyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 76, 68, 0.6)',
    textDecorationLine: 'underline',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Hydration Log Sheet Styles
  // ─────────────────────────────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetKeyboardView: {
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(15,76,68,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15,61,62,0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: 'rgba(15,76,68,0.08)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(15,76,68,0.1)',
  },
  presetButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F4C44',
  },
  sheetDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  sheetDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(15,76,68,0.1)',
  },
  sheetDividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15,76,68,0.4)',
  },
  customInputContainer: {
    marginBottom: 20,
  },
  customInputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(15,61,62,0.6)',
    marginBottom: 10,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customInput: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(15,76,68,0.04)',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: '#0F3D3E',
    borderWidth: 1,
    borderColor: 'rgba(15,76,68,0.1)',
  },
  customSaveButton: {
    backgroundColor: '#0A3F37',
    paddingHorizontal: 28,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSaveButtonDisabled: {
    backgroundColor: 'rgba(15,76,68,0.2)',
  },
  customSaveButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFF',
  },
  sheetCancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: 'rgba(15,61,62,0.5)',
  },
});

export default TodayRecoveryPlanScreen;
