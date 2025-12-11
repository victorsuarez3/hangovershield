/**
 * Splash Screen - Hangover Shield Premium
 * Matches LoginScreen visual language exactly
 * Clean, minimal, premium Calm-style wellness aesthetics
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { BrandLogoAnimated } from '../components/BrandLogoAnimated';
import { HANGOVER_GRADIENT } from '../theme/gradients';

interface SplashScreenProps {
  onFinish: () => void;
  showContinueButton?: boolean;
  onContinue?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  showContinueButton = false,
  onContinue,
}) => {
  const { theme } = useTheme();

  // Logo breathing animation (subtle scale effect)
  const logoBreathingScale = useRef(new Animated.Value(1)).current;

  // Tagline animation
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Floating particles animations (3-5 particles)
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;
  const particle3Y = useRef(new Animated.Value(0)).current;
  const particle4Y = useRef(new Animated.Value(0)).current;
  const particle5Y = useRef(new Animated.Value(0)).current;

  // Screen fade out
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo breathing animation - subtle scale 0.98 ↔ 1.02, 3000ms cycle
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoBreathingScale, {
          toValue: 1.02,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoBreathingScale, {
          toValue: 0.98,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    // Floating particles - each with different duration and delay for natural movement
    const createFloatingAnimation = (
      animValue: Animated.Value,
      delay: number,
      duration: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 4, // Move down 4px
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: -4, // Move up 4px
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start floating animations for each particle with varied timings
    createFloatingAnimation(particle1Y, 0, 5000).start();
    createFloatingAnimation(particle2Y, 800, 4500).start();
    createFloatingAnimation(particle3Y, 1200, 5500).start();
    createFloatingAnimation(particle4Y, 600, 4800).start();
    createFloatingAnimation(particle5Y, 1000, 5200).start();

    // Tagline fade-in (200ms delay, 500ms duration for smooth appearance)
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Auto-navigate after 3 seconds (always, regardless of showContinueButton)
    const timer = setTimeout(() => {
      // Smooth fade out transition with eased animation
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease), // Smooth ease-out curve
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Same gradient as LoginScreen */}
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating particles - background layer (behind everything) */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {/* Particle 1 - Top left */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            {
              transform: [{ translateY: particle1Y }],
            },
          ]}
        />
        {/* Particle 2 - Mid right */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            {
              transform: [{ translateY: particle2Y }],
            },
          ]}
        />
        {/* Particle 3 - Bottom left */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            {
              transform: [{ translateY: particle3Y }],
            },
          ]}
        />
        {/* Particle 4 - Top right */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle4,
            {
              transform: [{ translateY: particle4Y }],
            },
          ]}
        />
        {/* Particle 5 - Mid bottom */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle5,
            {
              transform: [{ translateY: particle5Y }],
            },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Brand Logo with infinite ripple animation + subtle breathing effect */}
        <Animated.View
          style={{
            transform: [{ scale: logoBreathingScale }],
          }}
        >
          <BrandLogoAnimated variant="splash" />
        </Animated.View>

        {/* Tagline - matching LoginScreen typography */}
        <Animated.View style={{ opacity: taglineOpacity, marginTop: 32 }}>
          <Text style={styles.tagline}>Recovery starts now.</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFF6F0',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // Behind everything
  },
  particle: {
    position: 'absolute',
    borderRadius: 6, // Small circular particles
    backgroundColor: 'rgba(255, 255, 255, 0.18)', // White with low opacity
  },
  particle1: {
    width: 10,
    height: 10,
    top: '15%',
    left: '12%',
  },
  particle2: {
    width: 12,
    height: 12,
    top: '35%',
    right: '15%',
  },
  particle3: {
    width: 8,
    height: 8,
    bottom: '20%',
    left: '18%',
  },
  particle4: {
    width: 11,
    height: 11,
    top: '25%',
    right: '20%',
  },
  particle5: {
    width: 9,
    height: 9,
    bottom: '30%',
    right: '25%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1, // Above particles
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#0D2E33', // Darker teal for better contrast
    textAlign: 'center',
    opacity: 0.9, // Increased from 0.7 for better readability
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
    lineHeight: 26,
    paddingHorizontal: 32,
  },
});
