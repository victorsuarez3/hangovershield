/**
 * Casa Latina Ultra-Premium Animation System
 * Apple-style micro-animations
 */

import { Animated } from 'react-native';

export const animations = {
  // Timing functions
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
  
  // Durations
  duration: {
    fast: 120,
    standard: 180,
    slow: 300,
  },
  
  // Button press animation
  buttonPress: (animValue: Animated.Value) => {
    return Animated.sequence([
      Animated.spring(animValue, {
        toValue: 0.96,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
      }),
      Animated.spring(animValue, {
        toValue: 1.0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
      }),
    ]);
  },
  
  // Card fade-in with upward translation
  cardFadeIn: (opacity: Animated.Value, translateY: Animated.Value, delay: number = 0) => {
    return Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        delay,
        useNativeDriver: true,
      }),
    ]);
  },
  
  // Tab transition
  tabTransition: (opacity: Animated.Value) => {
    return Animated.timing(opacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    });
  },
  
  // Glow pulse for avatar
  glowPulse: (opacity: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
  },
};




