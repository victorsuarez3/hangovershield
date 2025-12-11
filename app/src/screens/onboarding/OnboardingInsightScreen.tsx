/**
 * Onboarding Insight Screen - Hangover Shield
 * Premium onboarding step 3: Personalized recovery insight
 * Shows science-based analysis, recovery timeline, and recommendations
 */

import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { typography } from '../../design-system/typography';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  OnboardingStackParamList,
  FeelingOption,
  SymptomKey,
} from '../../navigation/OnboardingNavigator';
import {
  getRecoveryAnalysis,
  getRecoveryTimeline,
  getDailyRecommendations,
} from '../../utils/recoveryAnalysis';

/**
 * Get recovery severity level for visual timeline bar
 * Returns a percentage value based on feeling severity and symptoms
 */
function getRecoverySeverityLevel(feeling: FeelingOption, symptoms: SymptomKey[]): number {
  const hasOtherSymptoms = symptoms.some((s) => s !== 'noSymptoms');

  // Determine severity state
  if (feeling === 'severe') {
    return 0.85; // severe → 85%
  } else if (feeling === 'moderate') {
    return 0.65; // moderate → 65%
  } else if (feeling === 'mild') {
    return 0.45; // mild → 45%
  } else if (feeling === 'none' && hasOtherSymptoms) {
    return 0.3; // recalibrating → 30%
  } else {
    return 0.1; // stable → 10%
  }
}

type OnboardingInsightRouteProp = RouteProp<
  OnboardingStackParamList,
  'OnboardingInsight'
>;

export const OnboardingInsightScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const route = useRoute<OnboardingInsightRouteProp>();
  const { feeling, symptoms } = route.params;

  // Build insight using memoization for performance
  const insight = useMemo(() => getRecoveryAnalysis(feeling, symptoms), [feeling, symptoms]);

  // Fade-in animations
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const tagsOpacity = useRef(new Animated.Value(0)).current;
  const timelineOpacity = useRef(new Animated.Value(0)).current;
  
  // Timeline bar animation
  const timelineProgress = useRef(new Animated.Value(0)).current;
  const severityRatio = getRecoverySeverityLevel(feeling, symptoms);
  
  const barWidth = timelineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${severityRatio * 100}%`],
  });

  useEffect(() => {
    // Staggered fade-in animations
    Animated.sequence([
      // Tags fade-in first
      Animated.timing(tagsOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Card fade-in
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Timeline fade-in and bar animation
      Animated.parallel([
        Animated.timing(timelineOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(timelineProgress, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // width animation requires false
        }),
      ]),
    ]).start();
  }, []);

  const handleContinue = () => {
    // Navigate to paywall with assessment data
    navigation.navigate('OnboardingPaywall', {
      feeling,
      symptoms,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header with progress indicator */}
        <View style={styles.header}>
          <Text style={styles.stepText}>Step 3 of 3</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{insight.headerTitle}</Text>
          <Text style={styles.subtitle}>
            We analyzed your answers to understand exactly what your body needs today.
          </Text>
        </View>

        {/* Main Insight Card */}
        <Animated.View style={[styles.card, { opacity: cardOpacity }]}>
          {/* Small label */}
          <Text style={styles.cardLabel}>BASED ON YOUR SYMPTOMS</Text>

          {/* Selected tags row with fade-in */}
          <Animated.View style={[styles.tagsRow, { opacity: tagsOpacity }]}>
            {insight.feelingLabel ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{insight.feelingLabel}</Text>
              </View>
            ) : null}
            {insight.keySymptomLabels.map((label, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Microcopy under symptoms */}
          <Text style={styles.analysisMicrocopy}>
            Analysis generated specifically for your current symptoms.
          </Text>

          {/* Insight headline */}
          <Text style={styles.headline}>{insight.summaryTitle}</Text>

          {/* Insight body text */}
          <Text style={styles.bodyText}>{insight.summaryBody}</Text>
        </Animated.View>

        {/* Recovery Estimate with fade-in - increased spacing */}
        <Animated.View style={[styles.estimateCard, { opacity: timelineOpacity }]}>
          <Text style={styles.estimateLabel}>Estimated recovery timeline</Text>
          <Text style={styles.estimateValue}>
            {insight.estimatedRecoveryHoursRange.min}–{insight.estimatedRecoveryHoursRange.max}{' '}
            hours
          </Text>
          {/* Timeline bar with animation */}
          <View style={styles.timelineBarContainer}>
            <Animated.View
              style={[
                styles.timelineBarFill,
                { width: barWidth },
              ]}
            />
          </View>
          <Text style={styles.estimateSubtext}>
            If you follow today's recommendations.
          </Text>
        </Animated.View>

        {/* Today's Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsLabel}>Today's recovery focus</Text>
          <Text style={styles.recommendationsIntro}>
            These recommendations were generated specifically for your current condition today.
          </Text>
          {insight.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Emotional closing line */}
        <Text style={styles.recoveryNote}>
          Small improvements throughout the day will make the biggest difference.
        </Text>

        {/* CTA + Disclaimer */}
        <View style={styles.bottom}>
          {/* Benefit-oriented microcopy above CTA */}
          <Text style={styles.ctaMicrocopy}>
            Feel better faster — your personalized recovery plan is ready and can change how you feel today.
          </Text>
          
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Get my personalized recovery plan</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            Personalized using science-based guidelines. This is not medical advice.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40, // Increased for more breathing room
  },
  header: {
    marginBottom: 32, // 32px above main header
  },
  stepText: {
    ...typography.labelSmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40, // Increased for more breathing room between title → subtitle → symptoms
    paddingHorizontal: 16,
  },
  title: {
    ...typography.sectionTitle, // Serif font
    fontSize: 30,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 18, // Increased spacing between title and subtitle
    lineHeight: 36,
  },
  subtitle: {
    ...typography.bodyMedium, // Sans serif, medium weight
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%', // Increased width for better text wrapping
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 24, // Increased horizontal padding for better text width (~90%)
    paddingTop: 40, // Increased top padding before "BASED ON YOUR SYMPTOMS"
    paddingBottom: 32, // Increased bottom padding before timeline
    marginHorizontal: 12,
    marginTop: 24,
    marginBottom: 0,
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  cardLabel: {
    ...typography.labelSmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.6)',
    letterSpacing: 1,
    marginBottom: 16, // Increased spacing before pills
    textTransform: 'uppercase',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16, // Increased spacing before analysis microcopy
    // Consistent horizontal spacing between pills handled by tag marginRight (8-10px)
  },
  analysisMicrocopy: {
    ...typography.labelSmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    fontStyle: 'italic',
    marginTop: 0,
    marginBottom: 18, // Increased bottom padding before analysis paragraph
    textAlign: 'left',
  },
  tag: {
    backgroundColor: 'rgba(15, 61, 62, 0.08)',
    borderRadius: 9999,
    paddingVertical: 8, // Increased for more rounded, padded appearance
    paddingHorizontal: 14, // Increased for better pill shape
    marginRight: 10, // Consistent 8-10px spacing
    marginBottom: 8,
  },
  tagText: {
    ...typography.labelSmall,
    fontSize: 15, // Increased 30% from 13 (13 * 1.15 ≈ 15) for better readability
    color: '#0F3D3E',
  },
  headline: {
    ...typography.subsectionTitle, // Serif font with correct weight
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: 16, // Increased paragraph spacing (+2-4px)
    lineHeight: 28.56,
  },
  bodyText: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22.08, // Increased for readability (1.38 line-height: 16 * 1.38 = 22.08)
    paddingRight: 4, // Ensure text wraps cleanly at ~90% width
  },
  estimateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)', // Faint rounded background
    borderRadius: 20,
    paddingTop: 18, // Increased top padding before "Estimated recovery timeline"
    paddingBottom: 18, // Increased bottom padding after timeline bar
    paddingHorizontal: 20,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 8, // Increased spacing from analysis block
    marginBottom: 36, // Increased spacing before recommendations
    minWidth: 200,
    width: '100%',
    maxWidth: 280,
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  estimateLabel: {
    ...typography.labelSmall,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.65)',
    marginBottom: 8, // Increased spacing
  },
  estimateValue: {
    ...typography.sectionTitle,
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: 4,
  },
  timelineBarContainer: {
    marginTop: 10, // Increased spacing
    marginBottom: 12, // Increased spacing after bar
    height: 15,
    borderRadius: 15, // 100% borderRadius for smooth rounding
    backgroundColor: '#E1EEEC', // Light mint/gray track tone matching reference
    overflow: 'hidden',
    width: '100%',
  },
  timelineBarFill: {
    height: '100%',
    borderRadius: 15, // 100% borderRadius for smooth rounding
    backgroundColor: '#0F4C44', // Dark green fill matching reference screenshots
  },
  estimateSubtext: {
    ...typography.bodySmall,
    fontSize: 15, // Increased 30% from 12 (12 * 1.25 = 15) - UX standard minimum
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginTop: 0,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  recommendationsLabel: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: 12, // Increased spacing (8-10px) between section title and descriptive sentence
  },
  recommendationsIntro: {
    ...typography.bodySmall,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 20, // Increased spacing before bullets
    lineHeight: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 22, // Increased by +4px (from 18) for more spacing between bullets
    paddingRight: 8,
    paddingLeft: 4, // Increased left indentation so bullets align visually with text block
  },
  recommendationBullet: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    marginRight: 10, // Increased spacing for better alignment
    lineHeight: 22,
  },
  recommendationText: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22,
    flex: 1,
  },
  recoveryNote: {
    marginTop: 12,
    paddingHorizontal: 24,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 32, // Increased spacing before CTA area
  },
  bottom: {
    marginTop: 'auto',
    paddingTop: 0,
  },
  ctaMicrocopy: {
    ...typography.bodySmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)', // Lighter gray
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 10,
    marginBottom: 0,
    maxWidth: '85%', // Constrained width for readability
    alignSelf: 'center',
  },
  ctaButton: {
    backgroundColor: '#0A3F37', // Dark teal matching reference exactly
    borderRadius: 15, // 14-16px radius
    height: 56, // 54-58px height (56px)
    paddingVertical: 0, // Height handled by height property
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 24, // Increased top spacing (20-28px) before button
    marginBottom: 12, // Spacing before subtext
    width: '100%',
  },
  ctaText: {
    ...typography.button,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600', // Semibold matching reference
  },
  disclaimer: {
    ...typography.labelSmall,
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.35)', // Reduced opacity to ~70%
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 12, // Spaced 10-14px from CTA subtext
    maxWidth: '85%', // Constrained horizontal width to match reference layout
    alignSelf: 'center',
  },
});
