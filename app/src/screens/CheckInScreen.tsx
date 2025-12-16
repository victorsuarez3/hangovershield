/**
 * Check-In Screen - Hangover Shield
 * Complete daily check-in experience with persistence and recovery flow routing
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import {
  DailyCheckInSeverity,
  SEVERITY_LABELS,
  SEVERITY_DESCRIPTIONS,
  SYMPTOM_OPTIONS,
  saveTodayDailyCheckIn,
} from '../services/dailyCheckIn';
import {
  saveLocalDailyCheckIn,
  getLocalDailyCheckIn,
  hasCheckedInTodayLocal,
  LocalDailyCheckIn,
} from '../services/dailyCheckInStorage';
import { getLocalDayId } from '../services/dailyCheckInStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Optional haptics
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch {
  // Haptics not available
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Severity Card Component
// ─────────────────────────────────────────────────────────────────────────────

interface SeverityCardProps {
  severity: DailyCheckInSeverity;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  icon: string;
}

const SeverityCard: React.FC<SeverityCardProps> = ({
  label,
  description,
  isSelected,
  onSelect,
  icon,
}) => (
  <TouchableOpacity
    style={[styles.severityCard, isSelected && styles.severityCardSelected]}
    onPress={onSelect}
    activeOpacity={0.8}
  >
    <View style={[styles.severityIconContainer, isSelected && styles.severityIconContainerSelected]}>
      <Ionicons
        name={icon as any}
        size={24}
        color={isSelected ? '#FFFFFF' : '#0F4C44'}
      />
    </View>
    <View style={styles.severityTextContainer}>
      <Text style={[styles.severityLabel, isSelected && styles.severityLabelSelected]}>
        {label}
      </Text>
      <Text style={[styles.severityDescription, isSelected && styles.severityDescriptionSelected]}>
        {description}
      </Text>
    </View>
    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// Symptom Chip Component
// ─────────────────────────────────────────────────────────────────────────────

interface SymptomChipProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}

const SymptomChip: React.FC<SymptomChipProps> = ({ label, isSelected, onToggle }) => {
  const handlePress = () => {
    if (Haptics && isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  return (
    <TouchableOpacity
      style={[styles.symptomChip, isSelected && styles.symptomChipSelected]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[styles.symptomChipText, isSelected && styles.symptomChipTextSelected]}>
        {label}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
      )}
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Completed State Component
// ─────────────────────────────────────────────────────────────────────────────

interface CompletedStateProps {
  checkIn: LocalDailyCheckIn;
  onViewPlan: () => void;
}

const CompletedState: React.FC<CompletedStateProps> = ({ checkIn, onViewPlan }) => {
  const symptomsCount = checkIn.symptoms.filter(s => s !== 'noSymptoms').length;
  const severityLabel = SEVERITY_LABELS[checkIn.level];

  return (
    <View style={styles.completedContainer}>
      <View style={styles.completedIconCircle}>
        <Ionicons name="checkmark-circle" size={48} color="#7AB48B" />
      </View>
      
      <Text style={styles.completedTitle}>You're checked in for today.</Text>
      <Text style={styles.completedSubtitle}>
        Nice work. Your recovery plan is ready whenever you need it.
      </Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Level:</Text>
          <Text style={styles.summaryValue}>{severityLabel}</Text>
        </View>
        {symptomsCount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Symptoms:</Text>
            <Text style={styles.summaryValue}>{symptomsCount}</Text>
          </View>
        )}
      </View>

      {/* Primary CTA */}
      <TouchableOpacity
        style={styles.viewPlanButton}
        onPress={onViewPlan}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#0F4C44', '#0A3F37']}
          style={styles.viewPlanGradient}
        >
          <Text style={styles.viewPlanText}>View Today's Plan</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Secondary Text */}
      <Text style={styles.nextCheckInText}>
        Next check-in unlocks tomorrow.
      </Text>

      {/* Streak Seed */}
      <Text style={styles.streakSeedText}>
        You're building the habit.
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const CheckInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const [selectedSeverity, setSelectedSeverity] = useState<DailyCheckInSeverity | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [todayCheckIn, setTodayCheckIn] = useState<LocalDailyCheckIn | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Severity options with icons
  const severityOptions: Array<{
    severity: DailyCheckInSeverity;
    icon: string;
  }> = [
    { severity: 'mild', icon: 'partly-sunny-outline' },
    { severity: 'moderate', icon: 'cloudy-outline' },
    { severity: 'severe', icon: 'thunderstorm-outline' },
    { severity: 'none', icon: 'sunny-outline' },
  ];

  // Check if user has already checked in today
  useEffect(() => {
    const checkTodayStatus = async () => {
      setIsLoading(true);
      
      try {
        // Check local storage first (fast)
        const localCheckIn = await getLocalDailyCheckIn();
        
        if (localCheckIn) {
          const todayId = getLocalDayId();
          // Verify it's for today
          if (localCheckIn.id === todayId) {
            setTodayCheckIn(localCheckIn);
            setIsLoading(false);
            return;
          }
        }

        // If logged in, also check Firestore (but don't block UI)
        if (user?.uid) {
          try {
            const { getTodayDailyCheckIn } = await import('../services/dailyCheckIn');
            const firestoreCheckIn = await getTodayDailyCheckIn(user.uid);
            
            if (firestoreCheckIn) {
              // Convert to local format and save locally
              const localFormat: LocalDailyCheckIn = {
                id: firestoreCheckIn.date,
                createdAt: firestoreCheckIn.createdAt?.toMillis() || Date.now(),
                level: firestoreCheckIn.severity,
                symptoms: firestoreCheckIn.symptoms,
                source: 'daily_checkin',
                version: 1,
              };
              
              // Save to local for fast access next time
              await saveLocalDailyCheckIn(localFormat);
              setTodayCheckIn(localFormat);
            }
          } catch (error) {
            console.error('[CheckInScreen] Error checking Firestore:', error);
            // Continue - local check is sufficient
          }
        }
      } catch (error) {
        console.error('[CheckInScreen] Error checking today status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTodayStatus();
  }, [user?.uid]);

  // Handle severity selection
  const handleSeveritySelect = useCallback((severity: DailyCheckInSeverity) => {
    setSelectedSeverity(severity);
    setValidationError(null);
    
    // If "none" is selected, clear symptoms
    if (severity === 'none') {
      setSelectedSymptoms([]);
    }
  }, []);

  // Handle symptom toggle
  const handleSymptomToggle = useCallback((symptomKey: string) => {
    setSelectedSymptoms((prev) => {
      // "No symptoms" is exclusive
      if (symptomKey === 'noSymptoms') {
        return prev.includes('noSymptoms') ? [] : ['noSymptoms'];
      }
      
      // Remove "noSymptoms" if selecting another symptom
      const filtered = prev.filter((s) => s !== 'noSymptoms');
      
      if (filtered.includes(symptomKey)) {
        return filtered.filter((s) => s !== symptomKey);
      } else {
        return [...filtered, symptomKey];
      }
    });
  }, []);

  // Handle continue
  const handleContinue = useCallback(async () => {
    if (!selectedSeverity) {
      setValidationError('Please select how you\'re feeling');
      return;
    }

    // Prevent double-tap
    if (isSubmitting) return;

    setIsSubmitting(true);
    setValidationError(null);

    // Haptic feedback
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const todayId = getLocalDayId();

      // Save locally immediately (optimistic)
      const localCheckIn: Omit<LocalDailyCheckIn, 'createdAt' | 'version'> = {
        id: todayId,
        level: selectedSeverity,
        symptoms: selectedSymptoms,
        source: 'daily_checkin',
      };

      await saveLocalDailyCheckIn(localCheckIn);
      
      // Update local state
      const savedCheckIn: LocalDailyCheckIn = {
        ...localCheckIn,
        createdAt: Date.now(),
        version: 1,
      };
      setTodayCheckIn(savedCheckIn);

      // Save to Firestore if logged in (best-effort, don't block)
      if (user?.uid) {
        try {
          await saveTodayDailyCheckIn(user.uid, {
            severity: selectedSeverity,
            severityLabel: SEVERITY_LABELS[selectedSeverity],
            symptoms: selectedSymptoms,
          });
        } catch (error) {
          console.error('[CheckInScreen] Error saving to Firestore:', error);
          // Continue anyway - local save succeeded
        }
      }

      // Small delay to show "Preparing..." state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to recovery plan
      navigation.navigate('SmartPlan');
    } catch (error) {
      console.error('[CheckInScreen] Error in check-in flow:', error);
      setValidationError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSeverity, selectedSymptoms, user?.uid, navigation, isSubmitting]);

  const handleViewPlan = useCallback(() => {
    navigation.navigate('SmartPlan');
  }, [navigation]);

  const canContinue = selectedSeverity !== null && !isSubmitting;

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={HANGOVER_GRADIENT}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C44" />
        </View>
      </View>
    );
  }

  // Completed state
  if (todayCheckIn) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={HANGOVER_GRADIENT}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <CompletedState checkIn={todayCheckIn} onViewPlan={handleViewPlan} />
        </ScrollView>
      </View>
    );
  }

  // Main check-in flow
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling right now?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize today's recovery for your body.
          </Text>
        </View>

        {/* Validation Error */}
        {validationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        )}

        {/* Severity Section */}
        <View style={styles.section}>
          {severityOptions.map(({ severity, icon }) => (
            <SeverityCard
              key={severity}
              severity={severity}
              label={SEVERITY_LABELS[severity]}
              description={SEVERITY_DESCRIPTIONS[severity]}
              isSelected={selectedSeverity === severity}
              onSelect={() => handleSeveritySelect(severity)}
              icon={icon}
            />
          ))}
        </View>

        {/* Symptoms Section (only show if severity is selected and not "none") */}
        {selectedSeverity && selectedSeverity !== 'none' && (
          <View style={styles.symptomsSection}>
            <Text style={styles.symptomsLabel}>Any symptoms right now? (Optional)</Text>
            <View style={styles.symptomsGrid}>
              {SYMPTOM_OPTIONS.map(({ key, label }) => (
                <SymptomChip
                  key={key}
                  label={label}
                  isSelected={selectedSymptoms.includes(key)}
                  onToggle={() => handleSymptomToggle(key)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.ctaButton, !canContinue && styles.ctaButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={canContinue ? 0.85 : 1}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.ctaButtonText, { marginLeft: 8 }]}>
                Preparing your plan…
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.ctaButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.footerText}>
          You can update this anytime from your Daily Check-In.
        </Text>
      </View>
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
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0A2E2F',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: SCREEN_WIDTH * 0.8,
  },

  // Error
  errorContainer: {
    backgroundColor: 'rgba(204, 92, 108, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(204, 92, 108, 0.2)',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#CC5C6C',
    textAlign: 'center',
  },

  // Section
  section: {
    gap: 12,
    marginBottom: 28,
  },

  // Severity Card
  severityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  severityCardSelected: {
    borderColor: '#0F4C44',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    shadowColor: 'rgba(15, 76, 68, 0.12)',
    shadowOpacity: 1.2,
  },
  severityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  severityIconContainerSelected: {
    backgroundColor: '#0F4C44',
  },
  severityTextContainer: {
    flex: 1,
  },
  severityLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
    marginBottom: 4,
  },
  severityLabelSelected: {
    color: '#0F4C44',
  },
  severityDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    lineHeight: 18,
  },
  severityDescriptionSelected: {
    color: 'rgba(15, 76, 68, 0.7)',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderColor: '#0F4C44',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0F4C44',
  },

  // Symptoms Section
  symptomsSection: {
    marginBottom: 20,
  },
  symptomsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.7)',
    marginBottom: 14,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // Symptom Chip
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.15)',
  },
  symptomChipSelected: {
    backgroundColor: '#0A3F37',
    borderColor: '#0A3F37',
  },
  symptomChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F4C44',
  },
  symptomChipTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(223, 244, 241, 0.95)',
  },
  ctaButton: {
    backgroundColor: '#0A3F37',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(10, 63, 55, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    shadowOpacity: 1,
    elevation: 8,
  },
  ctaButtonDisabled: {
    backgroundColor: 'rgba(15, 76, 68, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    marginTop: 12,
  },

  // Completed State
  completedContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  completedIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(122, 180, 139, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
  },
  completedSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F4C44',
  },
  viewPlanButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
  },
  viewPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  viewPlanText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  nextCheckInText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    marginBottom: 8,
  },
  streakSeedText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
