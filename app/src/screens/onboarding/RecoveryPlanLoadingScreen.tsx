/**
 * Recovery Plan Loading Screen - Hangover Shield
 * Premium loading screen shown after successful purchase
 * Calm / Levels / Oura quality experience with micro-animations
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { typography } from '../../design-system/typography';

export type RecoveryPlanLoadingScreenProps = {
  onFinished?: () => void;
};

export const RecoveryPlanLoadingScreen: React.FC<RecoveryPlanLoadingScreenProps> = ({
  onFinished,
}) => {
  const insets = useSafeAreaInsets();

  // Shield icon animations
  const shieldOpacity = useRef(new Animated.Value(0)).current;
  const shieldScale = useRef(new Animated.Value(0.9)).current;
  const breathingScale = useRef(new Animated.Value(1.0)).current;

  // Background animation (subtle opacity change)
  const backgroundOpacity = useRef(new Animated.Value(0.95)).current;

  // Card fade-in
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Step completion state
  const [completedSteps, setCompletedSteps] = useState(0);
  const [processingStep, setProcessingStep] = useState(1); // Current step being processed

  // Spinner rotation animation
  const spinnerRotation = useRef(new Animated.Value(0)).current;

  // Step text opacity animations
  const step1TextOpacity = useRef(new Animated.Value(0.7)).current;
  const step2TextOpacity = useRef(new Animated.Value(0.7)).current;
  const step3TextOpacity = useRef(new Animated.Value(0.7)).current;

  // Checkmark animations (scale bounce)
  const step1CheckScale = useRef(new Animated.Value(0)).current;
  const step2CheckScale = useRef(new Animated.Value(0)).current;
  const step3CheckScale = useRef(new Animated.Value(0)).current;

  // Final message opacity
  const readyMessageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial shield fade-in and scale-up
    Animated.parallel([
      Animated.timing(shieldOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(shieldScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Breathing animation (looped)
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingScale, {
          toValue: 1.03,
          duration: 1250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathingScale, {
          toValue: 1.0,
          duration: 1250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    // Subtle background animation
    const backgroundAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundOpacity, {
          toValue: 1.0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // opacity on background
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0.95,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    backgroundAnimation.start();

    // Spinner rotation animation (continuous)
    const spinnerAnimation = Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinnerAnimation.start();

    // Step 1 completion at ~1.5s
    const step1Timeout = setTimeout(() => {
      setCompletedSteps(1);
      setProcessingStep(2);
      // Checkmark bounce animation
      Animated.sequence([
        Animated.timing(step1CheckScale, {
          toValue: 1.15,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(step1CheckScale, {
          toValue: 1.0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      // Text fade to full opacity
      Animated.timing(step1TextOpacity, {
        toValue: 1.0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 1500);

    // Step 2 completion at ~3.0s
    const step2Timeout = setTimeout(() => {
      setCompletedSteps(2);
      setProcessingStep(3);
      Animated.sequence([
        Animated.timing(step2CheckScale, {
          toValue: 1.15,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(step2CheckScale, {
          toValue: 1.0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      Animated.timing(step2TextOpacity, {
        toValue: 1.0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 3000);

    // Step 3 completion at ~4.5s
    const step3Timeout = setTimeout(() => {
      setCompletedSteps(3);
      setProcessingStep(0); // No more processing
      Animated.sequence([
        Animated.timing(step3CheckScale, {
          toValue: 1.15,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(step3CheckScale, {
          toValue: 1.0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      Animated.timing(step3TextOpacity, {
        toValue: 1.0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 4500);

    // Ready message at ~5.0s
    const readyMessageTimeout = setTimeout(() => {
      Animated.timing(readyMessageOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 5000);

    // Call onFinished callback at ~6.0s
    const finishedTimeout = setTimeout(() => {
      if (onFinished) {
        onFinished();
      }
    }, 6000);

    return () => {
      clearTimeout(step1Timeout);
      clearTimeout(step2Timeout);
      clearTimeout(step3Timeout);
      clearTimeout(readyMessageTimeout);
      clearTimeout(finishedTimeout);
      breathingAnimation.stop();
      backgroundAnimation.stop();
      spinnerAnimation.stop();
    };
  }, [onFinished]);

  // Interpolate spinner rotation
  const spinDegree = spinnerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: backgroundOpacity },
        ]}
      >
        <LinearGradient
          colors={HANGOVER_GRADIENT}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <View style={styles.content}>
        {/* Shield Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: shieldOpacity,
              transform: [
                { scale: Animated.multiply(shieldScale, breathingScale) },
              ],
            },
          ]}
        >
          <View style={styles.iconGlow} />
          <Ionicons name="shield-checkmark" size={64} color="#0F3D3E" />
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>
          Feel better faster — starting today.
        </Text>

        {/* Subtitle Block */}
        <View style={styles.subtitleBlock}>
          <Text style={styles.subtitle}>
            Based on your symptoms today, here's how you can recover faster.
          </Text>
          <Text style={styles.subtitle}>
            Your personalized recovery plan is ready — tailored to how your body feels right now.
          </Text>
        </View>

        {/* Steps Card */}
        <Animated.View style={[styles.stepsCard, { opacity: cardOpacity }]}>
          <LoadingStepRow
            stepNumber={1}
            title="Analyzing your symptoms —"
            subtitle="understanding how your body feels today."
            isCompleted={completedSteps >= 1}
            isProcessing={processingStep === 1}
            checkScale={step1CheckScale}
            textOpacity={step1TextOpacity}
            spinDegree={spinDegree}
          />
          <LoadingStepRow
            stepNumber={2}
            title="Calculating your recovery window —"
            subtitle="estimating how long your body needs."
            isCompleted={completedSteps >= 2}
            isProcessing={processingStep === 2}
            checkScale={step2CheckScale}
            textOpacity={step2TextOpacity}
            spinDegree={spinDegree}
          />
          <LoadingStepRow
            stepNumber={3}
            title="Designing today's step-by-step plan —"
            subtitle="clear actions to feel better faster."
            isCompleted={completedSteps >= 3}
            isProcessing={processingStep === 3}
            checkScale={step3CheckScale}
            textOpacity={step3TextOpacity}
            spinDegree={spinDegree}
          />
        </Animated.View>

        {/* Ready Message */}
        <Animated.View style={{ opacity: readyMessageOpacity }}>
          <Text style={styles.readyText}>Your plan is ready!</Text>
        </Animated.View>
      </View>
    </View>
  );
};

// Loading Step Row Component
interface LoadingStepRowProps {
  stepNumber: number;
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isProcessing: boolean;
  checkScale: Animated.Value;
  textOpacity: Animated.Value;
  spinDegree: Animated.AnimatedInterpolation<string>;
}

const LoadingStepRow: React.FC<LoadingStepRowProps> = ({
  title,
  subtitle,
  isCompleted,
  isProcessing,
  checkScale,
  textOpacity,
  spinDegree,
}) => {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIconContainer}>
        {isCompleted ? (
          <AnimatedCheck checkScale={checkScale} />
        ) : isProcessing ? (
          <AnimatedSpinner spinDegree={spinDegree} />
        ) : (
          <View style={styles.pendingIcon}>
            <View style={styles.pendingCircle} />
          </View>
        )}
      </View>
      <Animated.View style={[styles.stepTextContainer, { opacity: textOpacity }]}>
        <Text style={[styles.stepTitle, isProcessing && styles.stepTitleProcessing]}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </Animated.View>
    </View>
  );
};

// Animated Spinner Component
interface AnimatedSpinnerProps {
  spinDegree: Animated.AnimatedInterpolation<string>;
}

const AnimatedSpinner: React.FC<AnimatedSpinnerProps> = ({ spinDegree }) => {
  return (
    <Animated.View
      style={[
        styles.spinnerContainer,
        {
          transform: [{ rotate: spinDegree }],
        },
      ]}
    >
      <View style={styles.spinnerCircle}>
        <View style={styles.spinnerDot} />
      </View>
    </Animated.View>
  );
};

// Animated Check Component
interface AnimatedCheckProps {
  checkScale: Animated.Value;
}

const AnimatedCheck: React.FC<AnimatedCheckProps> = ({ checkScale }) => {
  return (
    <Animated.View
      style={[
        styles.checkmarkContainer,
        {
          transform: [{ scale: checkScale }],
        },
      ]}
    >
      <View style={styles.checkmarkBackground}>
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      </View>
    </Animated.View>
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
    backgroundColor: 'rgba(15, 61, 62, 0.08)',
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
  subtitleBlock: {
    alignItems: 'center',
    marginBottom: 32,
    maxWidth: 320,
  },
  subtitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
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
    marginBottom: 24,
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  pendingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(15, 61, 62, 0.2)',
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F3D3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.9)',
    lineHeight: 22,
    marginBottom: 2,
  },
  stepTitleProcessing: {
    color: '#0F3D3E',
  },
  spinnerContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'rgba(15, 61, 62, 0.15)',
    borderTopColor: '#0F3D3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerDot: {
    display: 'none', // Hidden, using border trick for spinner
  },
  stepSubtitle: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 21,
  },
  readyText: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
});


