/**
 * Plan Loading Screen - Hangover Shield
 * Premium loading screen shown after successful purchase
 * Shows personalized plan generation progress
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { typography } from '../../design-system/typography';
import {
  OnboardingStackParamList,
  FeelingOption,
  SymptomKey,
} from '../../navigation/OnboardingNavigator';

const FEELING_ONBOARDING_KEY = '@hangovershield_feeling_onboarding_completed';

type PlanLoadingRouteProp = RouteProp<
  OnboardingStackParamList,
  'PlanLoading'
>;

type PlanLoadingNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'PlanLoading'
>;

export const PlanLoadingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<PlanLoadingRouteProp>();
  const navigation = useNavigation<PlanLoadingNavigationProp>();
  const { feeling, symptoms } = route.params;

  // States for tracking completed steps
  const [step1Completed, setStep1Completed] = React.useState(false);
  const [step2Completed, setStep2Completed] = React.useState(false);
  const [step3Completed, setStep3Completed] = React.useState(false);

  // Fade-in animation for icon
  const iconOpacity = React.useRef(new Animated.Value(0)).current;
  const cardOpacity = React.useRef(new Animated.Value(0)).current;

  // Animation values for checkmarks
  const step1CheckScale = React.useRef(new Animated.Value(0)).current;
  const step2CheckScale = React.useRef(new Animated.Value(0)).current;
  const step3CheckScale = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in animations
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Sequential step completion with ~2 second intervals
    const step1Timeout = setTimeout(() => {
      setStep1Completed(true);
      Animated.spring(step1CheckScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, 2000); // First step completes after 2 seconds

    const step2Timeout = setTimeout(() => {
      setStep2Completed(true);
      Animated.spring(step2CheckScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, 4000); // Second step completes after 4 seconds

    const step3Timeout = setTimeout(() => {
      setStep3Completed(true);
      Animated.spring(step3CheckScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, 6000); // Third step completes after 6 seconds

    // Navigate after all steps are completed (total ~7 seconds)
    const navigationTimeout = setTimeout(async () => {
      // Mark feeling onboarding as completed
      try {
        await AsyncStorage.setItem(FEELING_ONBOARDING_KEY, 'true');
      } catch (error) {
        console.error('Error saving onboarding status:', error);
      }

      // TODO: Navigate to the actual recovery plan screen
      // For now, we'll need to implement a proper navigation solution
      // Options:
      // 1. Create a RecoveryPlanScreen that shows the personalized plan
      // 2. Use a navigation reset to switch to AppNavigator
      // 3. Use a global state/event system to notify App.tsx
      
      // Temporary: The App.tsx will detect the AsyncStorage change on next render
      // In production, you should implement proper navigation handling
      // For now, we'll stay on this screen and let the user know the plan is ready
      // The app will transition to AppNavigator when App.tsx re-renders
      
      // Note: This is a temporary solution. In production, implement proper navigation
      // that either navigates to a RecoveryPlanScreen or resets navigation to AppNavigator
    }, 7000); // Navigate after ~7 seconds (all steps + buffer)

    return () => {
      clearTimeout(step1Timeout);
      clearTimeout(step2Timeout);
      clearTimeout(step3Timeout);
      clearTimeout(navigationTimeout);
    };
  }, [navigation, feeling, symptoms, iconOpacity, cardOpacity, step1CheckScale, step2CheckScale, step3CheckScale]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        {/* Icon */}
        <Animated.View style={[styles.iconContainer, { opacity: iconOpacity }]}>
          <View style={styles.iconGlow} />
          <Ionicons name="shield-checkmark" size={64} color="#0F3D3E" />
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>
          Feel better faster — we're building your plan.
        </Text>

        {/* Supporting paragraph */}
        <Text style={styles.subtitle}>
          We're using today's answers to tailor exactly what your body needs to recover faster.
        </Text>

        {/* Steps Card */}
        <Animated.View style={[styles.stepsCard, { opacity: cardOpacity }]}>
          <StepRow
            icon="sparkles-outline"
            text="Analyzing your symptoms — understanding how your body feels today."
            isCompleted={step1Completed}
            checkScale={step1CheckScale}
          />
          <StepRow
            icon="flask-outline"
            text="Calculating your recovery window — estimating how long your body needs."
            isCompleted={step2Completed}
            checkScale={step2CheckScale}
          />
          <StepRow
            icon="time-outline"
            text="Designing today's step-by-step plan — clear actions to feel better faster."
            isCompleted={step3Completed}
            checkScale={step3CheckScale}
          />
        </Animated.View>

        {/* Loading Indicator - only show if not all steps completed */}
        {!step3Completed && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#0F3D3E" />
          </View>
        )}

        {/* Reassurance text */}
        <Text style={styles.reassuranceText}>
          {step3Completed ? 'Your plan is ready!' : 'This only takes a few seconds.'}
        </Text>
      </View>
    </View>
  );
};

// Step Row Component
interface StepRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  isCompleted: boolean;
  checkScale: Animated.Value;
}

const StepRow: React.FC<StepRowProps> = ({ icon, text, isCompleted, checkScale }) => {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIconContainer}>
        {isCompleted ? (
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={24} color="#0F3D3E" />
          </Animated.View>
        ) : (
          <Ionicons name={icon} size={18} color="#0F3D3E" />
        )}
      </View>
      <Text style={[styles.stepText, isCompleted && styles.stepTextCompleted]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(15, 61, 62, 0.08)', // Soft glow effect
    zIndex: -1,
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 30,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    paddingHorizontal: 16,
  },
  subtitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: 32,
  },
  stepsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 61, 62, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22.08, // 1.38 line-height for readability
    flex: 1,
  },
  stepTextCompleted: {
    color: 'rgba(0, 0, 0, 0.6)', // Slightly lighter when completed
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    marginBottom: 16,
  },
  reassuranceText: {
    ...typography.bodySmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

