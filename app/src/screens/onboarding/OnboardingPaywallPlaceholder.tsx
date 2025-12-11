/**
 * Onboarding Paywall Placeholder - Hangover Shield
 * Temporary placeholder screen for PRO paywall
 * TODO: Replace with actual paywall implementation
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { typography } from '../../design-system/typography';

export const OnboardingPaywallPlaceholder: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleSkip = () => {
    // TODO: Navigate to main app or mark onboarding as completed
    // For now, just log
    console.log('Skip paywall - navigate to main app');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Paywall Coming Soon</Text>
        <Text style={styles.subtitle}>
          The full recovery plan with personalized guidance will be available here.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleSkip}>
          <Text style={styles.buttonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 28,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#0F3F46',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    fontSize: 17,
    color: '#FFFFFF',
  },
});


