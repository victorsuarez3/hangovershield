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
import { AppHeader } from '../components/AppHeader';
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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const CheckInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const [selectedSeverity, setSelectedSeverity] = useState<DailyCheckInSeverity | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [drankLastNight, setDrankLastNight] = useState<boolean | undefined>(undefined);
  const [drinkingToday, setDrinkingToday] = useState<boolean | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  // If yes, redirect to CheckInCompleteScreen instead of showing duplicate state
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
            // User already checked in - redirect to CheckInCompleteScreen
            // This avoids duplicate "You're checked in" screens
            navigation.replace('CheckInComplete');
            return;
          }
        }

        // If logged in, also check Firestore (but don't block UI)
        if (user?.uid) {
          try {
            const { getTodayDailyCheckIn } = await import('../services/dailyCheckIn');
            const firestoreCheckIn = await getTodayDailyCheckIn(user.uid);
            
            if (firestoreCheckIn) {
              // User already checked in - redirect to CheckInCompleteScreen
              navigation.replace('CheckInComplete');
              return;
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
  }, [user?.uid, navigation]);

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
        drankLastNight: drankLastNight,
        drinkingToday: drinkingToday,
      };

      await saveLocalDailyCheckIn(localCheckIn);

      // Save to Firestore if logged in (best-effort, don't block)
      if (user?.uid) {
        try {
          await saveTodayDailyCheckIn(user.uid, {
            severity: selectedSeverity,
            severityLabel: SEVERITY_LABELS[selectedSeverity],
            symptoms: selectedSymptoms,
            drankLastNight: drankLastNight,
            drinkingToday: drinkingToday,
          });
        } catch (error) {
          console.error('[CheckInScreen] Error saving to Firestore:', error);
          // Continue anyway - local save succeeded
        }
      }

      // Small delay to show "Preparing..." state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to CheckInComplete screen
      navigation.navigate('CheckInComplete');
    } catch (error) {
      console.error('[CheckInScreen] Error in check-in flow:', error);
      setValidationError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSeverity, selectedSymptoms, drankLastNight, drinkingToday, user?.uid, navigation, isSubmitting]);

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

  // Main check-in flow
  // Note: If user already checked in, we redirect to CheckInCompleteScreen in useEffect
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <AppHeader
        title="Daily Check-In"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 16, paddingBottom: insets.bottom + 120 },
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

        {/* Alcohol Section */}
        {selectedSeverity && (
          <View style={styles.alcoholSection}>
            {selectedSeverity !== 'none' ? (
              <>
                <Text style={styles.alcoholLabel}>Alcohol</Text>
                <View style={styles.alcoholQuestions}>
                  <View style={styles.alcoholQuestion}>
                    <Text style={styles.alcoholQuestionText}>Did you drink last night?</Text>
                    <View style={styles.alcoholButtons}>
                      <TouchableOpacity
                        style={[
                          styles.alcoholButton,
                          drankLastNight === true && styles.alcoholButtonSelected,
                        ]}
                        onPress={() => setDrankLastNight(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.alcoholButtonText,
                          drankLastNight === true && styles.alcoholButtonTextSelected,
                        ]}>
                          Yes
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.alcoholButton,
                          drankLastNight === false && styles.alcoholButtonSelected,
                        ]}
                        onPress={() => setDrankLastNight(false)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.alcoholButtonText,
                          drankLastNight === false && styles.alcoholButtonTextSelected,
                        ]}>
                          No
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.alcoholQuestion}>
                    <Text style={styles.alcoholQuestionText}>Are you planning to drink today?</Text>
                    <View style={styles.alcoholButtons}>
                      <TouchableOpacity
                        style={[
                          styles.alcoholButton,
                          drinkingToday === true && styles.alcoholButtonSelected,
                        ]}
                        onPress={() => setDrinkingToday(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.alcoholButtonText,
                          drinkingToday === true && styles.alcoholButtonTextSelected,
                        ]}>
                          Yes
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.alcoholButton,
                          drinkingToday === false && styles.alcoholButtonSelected,
                        ]}
                        onPress={() => setDrinkingToday(false)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.alcoholButtonText,
                          drinkingToday === false && styles.alcoholButtonTextSelected,
                        ]}>
                          No
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.alcoholQuestion}>
                <Text style={styles.alcoholQuestionText}>Planning to drink later?</Text>
                <View style={styles.alcoholButtons}>
                  <TouchableOpacity
                    style={[
                      styles.alcoholButton,
                      drinkingToday === true && styles.alcoholButtonSelected,
                    ]}
                    onPress={() => setDrinkingToday(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.alcoholButtonText,
                      drinkingToday === true && styles.alcoholButtonTextSelected,
                    ]}>
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.alcoholButton,
                      drinkingToday === false && styles.alcoholButtonSelected,
                    ]}
                    onPress={() => setDrinkingToday(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.alcoholButtonText,
                      drinkingToday === false && styles.alcoholButtonTextSelected,
                    ]}>
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    marginBottom: 16,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F4C44',
  },
  symptomsChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  symptomChipDisplay: {
    backgroundColor: 'rgba(15,76,68,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  symptomChipDisplayText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
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

  // Alcohol Section
  alcoholSection: {
    marginBottom: 24,
  },
  alcoholLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.7)',
    marginBottom: 14,
  },
  alcoholQuestions: {
    gap: 16,
  },
  alcoholQuestion: {
    gap: 10,
  },
  alcoholQuestionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.8)',
  },
  alcoholButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  alcoholButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  alcoholButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: '#0F4C44',
  },
  alcoholButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.7)',
  },
  alcoholButtonTextSelected: {
    color: '#0F4C44',
    fontFamily: 'Inter_600SemiBold',
  },
  
  // Micro-Action Card
  microActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  
  // Micro-Actions Checklist
  microActionsChecklist: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  checklistTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistIcon: {
    marginRight: 12,
  },
  checklistText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.8)',
    flex: 1,
    lineHeight: 22,
  },
});
