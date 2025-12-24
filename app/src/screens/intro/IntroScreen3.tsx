/**
 * Intro Onboarding Screen 3 - Hangover Shield
 * "Feel better faster, every day"
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../../theme/gradients';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface IntroScreen3Props {
  onNext: () => void;
}

export const IntroScreen3: React.FC<IntroScreen3Props> = ({ onNext }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 }]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles-outline" size={48} color="#0F4C44" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Feel better faster, every day</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Your daily recovery plan adapts in seconds to support how you feel.
        </Text>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTA Button */}
        <TouchableOpacity style={styles.button} onPress={onNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
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
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 34,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 48,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(15, 76, 68, 0.2)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#0F4C44',
  },
  spacer: {
    flex: 1,
  },
  button: {
    backgroundColor: '#0A3F37',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: 'rgba(10, 63, 55, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    shadowOpacity: 1,
    elevation: 8,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
});

export default IntroScreen3;






