/**
 * Check-In Complete Screen - Hangover Shield
 * Post-check-in celebration with micro-action and summary
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import { AppHeader } from '../components/AppHeader';
import { 
  getLocalDailyCheckIn, 
  wasCheckInCompleteShown,
  markCheckInCompleteShown,
  getLocalDayId,
} from '../services/dailyCheckInStorage';
import { SEVERITY_LABELS, SYMPTOM_OPTIONS } from '../services/dailyCheckIn';
import { generatePlan } from '../domain/recovery/planGenerator';
import { FeelingOption, SymptomKey } from '../navigation/OnboardingNavigator';
import { getTodayId } from '../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Optional haptics
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch {
  // Haptics not available
}

// Processing messages (shown sequentially)
const PROCESSING_MESSAGES = [
  'Evaluating your check-in',
  'Reviewing your symptoms',
  'Understanding your recovery needs',
  'Preparing today\'s plan',
];

export const CheckInCompleteScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as { skipProcessing?: boolean } | undefined;
  const skipProcessing = params?.skipProcessing || false;
  
  const [checkIn, setCheckIn] = useState<any>(null);
  const [microAction, setMicroAction] = useState<any>(null);
  const [symptomLabels, setSymptomLabels] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(!skipProcessing);
  const [processingStep, setProcessingStep] = useState(0);

  // Load check-in data and generate micro-action
  // Only show this screen once per day - if already shown, navigate to Home
  useEffect(() => {
    let processingInterval: NodeJS.Timeout | null = null;
    let processingTimeout: NodeJS.Timeout | null = null;

    const loadData = async () => {
      try {
        const todayId = getTodayId();
        
        const localCheckIn = await getLocalDailyCheckIn();
        if (!localCheckIn) {
          // No check-in found, navigate back to check-in
          navigation.replace('CheckIn');
          return;
        }

        // Verify it's for today
        if (localCheckIn.id !== todayId) {
          // Check-in is not for today, navigate to Home
          navigation.replace('HomeMain');
          return;
        }
        
        // Check if this screen was already shown today
        // Only redirect if NOT skipping processing (i.e., coming from check-in flow, not from Home)
        const alreadyShown = await wasCheckInCompleteShown(todayId);
        if (alreadyShown && !skipProcessing) {
          // Already shown today and coming from check-in flow, navigate to Home instead
          // This prevents showing the screen twice after completing check-in
          if (__DEV__) {
            console.log('[CheckInCompleteScreen] Already shown today, navigating to Home');
          }
          navigation.replace('HomeMain');
          return;
        }
        
        // If skipping processing (coming from Home), don't mark as shown again
        // This allows users to view the screen multiple times from Home

        setCheckIn(localCheckIn);

        // Generate plan to get micro-action
        const feeling = localCheckIn.level as FeelingOption;
        const symptomKeys = localCheckIn.symptoms.filter((s: string): s is SymptomKey => {
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

        const plan = generatePlan({
          level: feeling,
          symptoms: symptomKeys,
          drankLastNight: localCheckIn.drankLastNight,
          drinkingToday: localCheckIn.drinkingToday,
        });

        setMicroAction(plan.microAction);
        setSymptomLabels(plan.symptomLabels);

        // Mark as shown for today (only if coming from check-in flow, not from Home)
        if (!skipProcessing) {
          await markCheckInCompleteShown(todayId);
        }

        // Start processing animation (2-3 seconds total) only if not skipping
        if (!skipProcessing) {
          // Cycle through processing messages
          let currentStep = 0;
          processingInterval = setInterval(() => {
            currentStep += 1;
            if (currentStep < PROCESSING_MESSAGES.length) {
              setProcessingStep(currentStep);
            }
          }, 600); // Change message every 600ms

          // After 2.5 seconds, show results
          processingTimeout = setTimeout(() => {
            if (processingInterval) {
              clearInterval(processingInterval);
            }
            setIsProcessing(false);
            
            // Haptic feedback when showing results
            if (Haptics) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }, 2500);
        } else {
          // Skip processing - show results immediately
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('[CheckInCompleteScreen] Error loading data:', error);
        navigation.replace('CheckIn');
      }
    };

    loadData();

    // Cleanup function
    return () => {
      if (processingInterval) {
        clearInterval(processingInterval);
      }
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
    };
  }, [navigation]);

  const handleViewPlan = useCallback(() => {
    navigation.navigate('SmartPlan');
  }, [navigation]);

  // Show loading state while data is being loaded
  if (!checkIn || !microAction) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={HANGOVER_GRADIENT}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Show processing/evaluation state before results
  if (isProcessing) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={HANGOVER_GRADIENT}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.processingContainer}>
          <View style={styles.processingIconCircle}>
            <Ionicons name="analytics-outline" size={48} color="#0F4C44" />
          </View>
          <Text style={styles.processingTitle}>
            {PROCESSING_MESSAGES[processingStep] || PROCESSING_MESSAGES[0]}
          </Text>
          <Text style={styles.processingSubtitle}>
            {processingStep === 0 && 'Reviewing your symptoms'}
            {processingStep === 1 && 'Understanding your recovery needs'}
            {processingStep === 2 && 'Preparing today\'s plan'}
            {processingStep >= 3 && 'Almost ready...'}
          </Text>
        </View>
      </View>
    );
  }

  const severityLabel = SEVERITY_LABELS[checkIn.level];
  const symptomsCount = checkIn.symptoms.filter((s: string) => s !== 'noSymptoms').length;
  const displayedSymptoms = checkIn.symptoms
    .filter((s: string) => s !== 'noSymptoms')
    .slice(0, 3);
  const remainingSymptoms = Math.max(0, symptomsCount - 3);

  // Get symptom labels
  const symptomDisplayLabels = displayedSymptoms.map((key: string) => {
    const option = SYMPTOM_OPTIONS.find((opt) => opt.key === key);
    return option?.label || key;
  });

  // Format date for header (premium, human-readable format)
  const formatDateForHeader = (): string => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const headerDate = formatDateForHeader();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <AppHeader
        title={headerDate}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color="#0F4C44" />
        </View>

        {/* Title */}
        <Text style={styles.title}>You're checked in for today.</Text>
        <Text style={styles.subtitle}>
          Nice work. Your plan is ready — let's take it step by step.
        </Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Today's check-in</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Level</Text>
            <Text style={styles.summaryValue}>{severityLabel}</Text>
          </View>

          {symptomsCount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Symptoms</Text>
              <View style={styles.symptomsChips}>
                {symptomDisplayLabels.map((label, idx) => (
                  <View key={idx} style={styles.symptomChip}>
                    <Text style={styles.symptomChipText}>{label}</Text>
                  </View>
                ))}
                {remainingSymptoms > 0 && (
                  <View style={styles.symptomChip}>
                    <Text style={styles.symptomChipText}>+{remainingSymptoms}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Alcohol info */}
          {(checkIn.drankLastNight !== undefined || checkIn.drinkingToday !== undefined) && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Alcohol</Text>
              <View style={styles.alcoholInfo}>
                {checkIn.drankLastNight !== undefined && (
                  <Text style={styles.alcoholText}>
                    Last night: {checkIn.drankLastNight ? 'Yes' : 'No'}
                  </Text>
                )}
                {checkIn.drinkingToday !== undefined && (
                  <Text style={styles.alcoholText}>
                    {checkIn.drankLastNight !== undefined ? ' · ' : ''}
                    Today: {checkIn.drinkingToday ? 'Yes' : 'No'}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Micro-Action Card */}
        <View style={styles.microActionCard}>
          <View style={styles.microActionHeader}>
            <Text style={styles.microActionTitle}>Start here</Text>
            <Text style={styles.microActionSubtitle}>Takes ~{microAction.seconds} seconds</Text>
          </View>
          <Text style={styles.microActionBody}>{microAction.body}</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleViewPlan}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0F4C44', '#0A3F37']}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Continue to today's plan</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          Next check-in unlocks tomorrow. You're building the habit.
        </Text>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
  },
  
  // Processing State
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  processingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  processingTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
  },
  processingSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: SCREEN_WIDTH * 0.8,
  },

  // Icon
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(15, 76, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  // Title
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: SCREEN_WIDTH * 0.85,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 22,
    marginBottom: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  summaryCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#0F3D3E',
    marginBottom: 18,
  },
  summaryRow: {
    marginBottom: 14,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.75)',
    marginBottom: 6,
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F4C44',
  },
  symptomsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  symptomChip: {
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  symptomChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#0F4C44',
  },
  alcoholInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  alcoholText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.7)',
  },

  // Micro-Action Card
  microActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.12)',
    shadowColor: 'rgba(15, 76, 68, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  microActionHeader: {
    marginBottom: 12,
  },
  microActionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#0F3D3E',
    marginBottom: 4,
  },
  microActionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
  },
  microActionBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.8)',
    lineHeight: 22,
  },

  // CTA
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },

  // Footer
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
  },
});

