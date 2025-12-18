/**
 * Evening Check-In Complete Screen - Hangover Shield
 * Closure screen shown after completing evening check-in
 * Reinforces closure, identity, and calm anticipation for tomorrow
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HANGOVER_GRADIENT_WITH_WHITE } from '../theme/gradients';
import { AppHeader } from '../components/AppHeader';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const EveningCheckInCompleteScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Animations
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // Icon fades in and scales up
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Content fades in
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Button fades in last
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 400,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Subtle pulsing halo around moon icon
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const handleReturnHome = () => {
    navigation.navigate('HomeMain');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT_WITH_WHITE}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <AppHeader
        showBackButton
        onBackPress={() => navigation.goBack()}
        title="Evening complete"
      />

      <View style={styles.content}>
        {/* Moon icon with pulsing halo */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          {/* Pulsing halo */}
          <Animated.View
            style={[
              styles.halo,
              {
                transform: [{ scale: haloScale }],
                opacity: haloOpacity,
              },
            ]}
          />
          
          <View style={styles.iconCircle}>
            <Ionicons name="moon" size={64} color="#0F4C44" />
          </View>
        </Animated.View>

        {/* Text content */}
        <Animated.View style={[styles.textContainer, { opacity: contentOpacity }]}>
          <Text style={styles.mainMessage}>You showed up today.</Text>
          
          <Text style={styles.subMessage}>Come back tomorrow.</Text>
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <Animated.View
        style={[
          styles.ctaContainer,
          { paddingBottom: insets.bottom + 24, opacity: buttonOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.returnButton}
          onPress={handleReturnHome}
          activeOpacity={0.8}
        >
          <Text style={styles.returnButtonText}>Return to Home</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // Icon
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 48,
  },
  halo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 76, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.15)',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(206, 229, 225, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 4,
  },

  // Text
  textContainer: {
    alignItems: 'center',
  },
  mainMessage: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
  },

  // CTA
  ctaContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  returnButton: {
    backgroundColor: '#0F4C44',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  returnButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default EveningCheckInCompleteScreen;

