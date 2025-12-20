/**
 * Onboarding Screen - Hangover Shield
 * Simple onboarding flow explaining what the app does
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={[theme.colors.deepTeal, theme.colors.deepTealDark]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.pureWhite }]}>
          Hangover Shield
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.serenityMint }]}>
          Your intelligent recovery companion
        </Text>
        
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Get personalized recovery plans based on how you feel. 
            Before, during, and after drinking.
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.serenityMint }]}
          onPress={onComplete}
        >
          <Text style={[styles.buttonText, { color: theme.colors.deepTeal }]}>
            Get Started
          </Text>
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
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 48,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: 64,
    maxWidth: width * 0.8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});







