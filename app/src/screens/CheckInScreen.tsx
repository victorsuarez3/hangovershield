/**
 * Check-In Screen - Hangover Shield
 * Daily check-in experience matching existing design exactly
 */

import React, { useState, useCallback } from 'react';
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
import { useAuth } from '../providers/AuthProvider';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import {
  DailyCheckInSeverity,
  SEVERITY_LABELS,
  SEVERITY_DESCRIPTIONS,
  SYMPTOM_OPTIONS,
  saveTodayDailyCheckIn,
} from '../services/dailyCheckIn';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const SymptomChip: React.FC<SymptomChipProps> = ({ label, isSelected, onToggle }) => (
  <TouchableOpacity
    style={[styles.symptomChip, isSelected && styles.symptomChipSelected]}
    onPress={onToggle}
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const CheckInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [selectedSeverity, setSelectedSeverity] = useState<DailyCheckInSeverity | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle severity selection
  const handleSeveritySelect = useCallback((severity: DailyCheckInSeverity) => {
    setSelectedSeverity(severity);
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
    if (!selectedSeverity || !user?.uid) return;

    setIsSubmitting(true);

    try {
      // Save to Firestore
      const success = await saveTodayDailyCheckIn(user.uid, {
        severity: selectedSeverity,
        severityLabel: SEVERITY_LABELS[selectedSeverity],
        symptoms: selectedSymptoms,
      });

      if (!success) {
        console.warn('Failed to save daily check-in to Firestore, continuing anyway');
      }

      // TODO: Navigate back or to recovery plan
      // For now, just save and stay on screen
    } catch (error) {
      console.error('Error in daily check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSeverity, selectedSymptoms, user?.uid]);

  const canContinue = selectedSeverity !== null;

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
          <Text style={styles.title}>How are you feeling today?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your recovery for today.
          </Text>
        </View>

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
            <Text style={styles.symptomsLabel}>Any symptoms right now?</Text>
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
          disabled={!canContinue || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.ctaButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.footerText}>
          You can update this later from your Daily Check-In.
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

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    backgroundColor: '#0F4C44',
    borderColor: '#0F4C44',
  },
  symptomChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F4C44',
  },
  symptomChipTextSelected: {
    color: '#FFFFFF',
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
});
