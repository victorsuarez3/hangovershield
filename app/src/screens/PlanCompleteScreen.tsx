/**
 * Plan Complete Screen - Hangover Shield
 * Celebration screen shown after completing daily recovery plan
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import { Button } from '../components/Button';
import { useAppNavigation } from '../contexts/AppNavigationContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanCompleteScreenParams {
  stepsCompleted: number;
  totalSteps: number;
}

type PlanCompleteRouteProp = RouteProp<
  { PlanComplete: PlanCompleteScreenParams },
  'PlanComplete'
>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const PlanCompleteScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<PlanCompleteRouteProp>();
  const appNav = useAppNavigation();
  
  const { stepsCompleted = 0, totalSteps = 0 } = route.params || {};

  // Animations
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // Icon bounces in
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      // Content fades in
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti fades in with delay
    Animated.timing(confettiOpacity, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Button fades in last
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 400,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Subtle icon rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleDone = () => {
    // Navigate to HomeScreen using AppNavigationContext
    // This works from any navigator context (OnboardingNavigator or DailyCheckInNavigator)
    appNav.goToHome();
  };

  const rotateInterpolate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        {/* Confetti emojis */}
        <Animated.View style={[styles.confettiContainer, { opacity: confettiOpacity }]}>
          <Text style={[styles.confettiEmoji, styles.confettiLeft]}>✨</Text>
          <Text style={[styles.confettiEmoji, styles.confettiRight]}>🎊</Text>
        </Animated.View>

        {/* Main celebration icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: iconScale },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
          </View>
        </Animated.View>

        {/* Text content */}
        <Animated.View style={[styles.textContainer, { opacity: contentOpacity }]}>
          <Text style={styles.title}>Amazing work!</Text>
          
          <Text style={styles.subtitle}>
            You've completed all your recovery steps.{'\n'}
            Your body thanks you!
          </Text>

          {/* Steps summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#0F4C44" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Today's steps</Text>
              <Text style={styles.summaryValue}>
                {stepsCompleted} of {totalSteps} completed
              </Text>
            </View>
          </View>

          <Text style={styles.supportingText}>
            Stay hydrated and we'll be here again tomorrow{'\n'}
            with a fresh plan tailored to how you feel.
          </Text>
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <Animated.View
        style={[
          styles.ctaContainer,
          { paddingBottom: insets.bottom + 24, opacity: buttonOpacity },
        ]}
      >
        <View style={styles.ctaButtonWrapper}>
          <Button
            title="Done for today"
            onPress={handleDone}
            variant="primary"
            size="large"
            fullWidth
            textStyle={{ color: '#FFFFFF' }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Confetti
  confettiContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  confettiEmoji: {
    fontSize: 32,
  },
  confettiLeft: {
    transform: [{ rotate: '-15deg' }],
  },
  confettiRight: {
    transform: [{ rotate: '15deg' }],
  },

  // Icon
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
    elevation: 8,
  },
  celebrationEmoji: {
    fontSize: 56,
  },

  // Text
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 36,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: 'rgba(15, 61, 62, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 28,
  },

  // Summary card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 28,
    width: SCREEN_WIDTH - 64,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    marginBottom: 2,
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F4C44',
  },

  // Supporting text
  supportingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // CTA
  ctaContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  ctaButtonWrapper: {
    width: '100%',
  },
});

export default PlanCompleteScreen;

