/**
 * Check-In Screen - Hangover Shield
 * Premium daily check-in experience - Step 1: Feeling selection
 * Calm, guided, emotionally safe
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../design-system/typography';

// Optional haptics - gracefully handle if not available
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch {
  // Haptics not available, continue without it
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FeelingOption = 'okay' | 'mild' | 'rough' | 'very_rough';

interface FeelingOptionData {
  value: FeelingOption;
  emoji: string;
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FEELING_OPTIONS: FeelingOptionData[] = [
  { value: 'okay', emoji: '😌', label: 'Okay' },
  { value: 'mild', emoji: '😣', label: 'Mild hangover' },
  { value: 'rough', emoji: '🤕', label: 'Rough' },
  { value: 'very_rough', emoji: '🤢', label: 'Very rough' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

interface FeelingOptionCardProps {
  option: FeelingOptionData;
  isSelected: boolean;
  onSelect: () => void;
}

const FeelingOptionCard: React.FC<FeelingOptionCardProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  const handlePress = useCallback(() => {
    // Light haptic feedback
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect();
  }, [onSelect]);

  return (
    <TouchableOpacity
      style={[
        styles.feelingCard,
        isSelected && styles.feelingCardSelected,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.feelingEmoji}>{option.emoji}</Text>
      <Text style={[
        styles.feelingLabel,
        isSelected && styles.feelingLabelSelected,
      ]}>
        {option.label}
      </Text>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const CheckInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingOption | null>(null);

  const handleFeelingSelect = useCallback((feeling: FeelingOption) => {
    setSelectedFeeling(feeling);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedFeeling) return;
    
    // TODO: Navigate to next step or save check-in
    // For now, just store in state
    console.log('[CheckInScreen] Selected feeling:', selectedFeeling);
    
    // In future: navigate to next step or complete check-in
    // navigation.navigate('CheckInStep2', { feeling: selectedFeeling });
  }, [selectedFeeling]);

  const canContinue = selectedFeeling !== null;

  return (
    <View style={styles.container}>
      {/* Premium gradient background with vignette */}
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Subtle vignette overlay for premium contrast */}
      <LinearGradient
        colors={['rgba(15,76,68,0.03)', 'transparent', 'rgba(15,76,68,0.05)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Check-In</Text>
          <Text style={styles.subtitle}>Take 30 seconds. We'll handle the rest.</Text>
        </View>

        {/* Main Interaction Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardQuestion}>How do you feel right now?</Text>
          
          {/* Feeling Options */}
          <View style={styles.optionsContainer}>
            {FEELING_OPTIONS.map((option) => (
              <FeelingOptionCard
                key={option.value}
                option={option}
                isSelected={selectedFeeling === option.value}
                onSelect={() => handleFeelingSelect(option.value)}
              />
            ))}
          </View>

          {/* Microcopy */}
          <Text style={styles.microcopy}>
            No judgment. This just helps us guide today's recovery.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            !canContinue && styles.ctaButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={canContinue ? ['#0F4C44', '#0A3F37'] : ['rgba(15,76,68,0.3)', 'rgba(10,63,55,0.3)']}
            style={styles.ctaGradient}
          >
            <Text style={[
              styles.ctaText,
              !canContinue && styles.ctaTextDisabled,
            ]}>
              Continue
            </Text>
            {canContinue && (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            )}
          </LinearGradient>
        </TouchableOpacity>
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
    ...typography.sectionTitle,
    fontSize: 32,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Main Card
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  cardQuestion: {
    ...typography.sectionTitle,
    fontSize: 22,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  feelingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 68, 0.04)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.08)',
    position: 'relative',
  },
  feelingCardSelected: {
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    borderColor: '#0F4C44',
    borderWidth: 2,
  },
  feelingEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  feelingLabel: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: '#0F3D3E',
    flex: 1,
  },
  feelingLabelSelected: {
    color: '#0F4C44',
    fontFamily: 'Inter_600SemiBold',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  microcopy: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaText: {
    ...typography.button,
    fontSize: 16,
    color: '#FFFFFF',
  },
  ctaTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
