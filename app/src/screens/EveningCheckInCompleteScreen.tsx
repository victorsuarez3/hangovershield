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
import { useAuth } from '../providers/AuthProvider';
import { Analytics } from '../utils/analytics';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const EveningCheckInCompleteScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Animations
  const fadeOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Track analytics event
    if (user?.uid) {
      Analytics.eveningClosureViewed(user.uid);
    }

    // Subtle fade in
    Animated.timing(fadeOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Subtle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 0.95,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [user?.uid]);

  const handleReturnHome = () => {
    navigation.navigate('HomeMain');
  };

  return (
    <View style={styles.container}>
      {/* Dark night tone background */}
      <LinearGradient
        colors={['#1A3A3A', '#0F2626', '#0A1919']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeOpacity,
          },
        ]}
      >
        {/* Subtle glow icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: glowScale }],
            },
          ]}
        >
          <View style={styles.glowCircle}>
            <Ionicons name="moon" size={56} color="#4A7C7A" />
          </View>
        </Animated.View>

        {/* Primary message */}
        <Text style={styles.mainMessage}>Day complete.</Text>

        {/* Secondary message */}
        <Text style={styles.subMessage}>Rest well. We'll take it from here.</Text>
      </Animated.View>

      {/* Discrete bottom CTA */}
      <Animated.View
        style={[
          styles.ctaContainer,
          { paddingBottom: insets.bottom + 24, opacity: fadeOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.returnButton}
          onPress={handleReturnHome}
          activeOpacity={0.7}
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
    paddingHorizontal: 32,
  },

  // Icon
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  glowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 124, 122, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(74, 124, 122, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    shadowOpacity: 1,
  },

  // Text
  mainMessage: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#E4F2EF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  subMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(228, 242, 239, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },

  // CTA
  ctaContainer: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  returnButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(228, 242, 239, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: 'rgba(228, 242, 239, 0.8)',
    letterSpacing: 0.2,
  },
});

export default EveningCheckInCompleteScreen;

