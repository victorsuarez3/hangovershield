/**
 * Brand Logo Animated Component
 * Reusable animated HS logo with ripple and breathing effects
 * Supports 'splash' (infinite ripple) and 'login' (one-time ripple + breathing glow) variants
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface BrandLogoAnimatedProps {
  variant: 'splash' | 'login';
  size?: number; // Base size for the logo circle (default: 96)
}

export const BrandLogoAnimated: React.FC<BrandLogoAnimatedProps> = ({
  variant,
  size = 96,
}) => {
  const { theme } = useTheme();

  // Logo entrance animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

  // Breathing glow (only for login variant, after ripple completes)
  const breathingScale = useRef(new Animated.Value(1)).current;
  const breathingOpacity = useRef(new Animated.Value(0.95)).current;

  // Ripple layers
  // For splash: 3 concentric circles (infinite)
  // For login: 2 ripples simulating deep breathing (inhalar/exhalar)
  const ripple1Scale = useRef(new Animated.Value(0.8)).current;
  const ripple1Opacity = useRef(new Animated.Value(0.35)).current;
  const ripple2Scale = useRef(new Animated.Value(0.8)).current;
  const ripple2Opacity = useRef(new Animated.Value(0.35)).current;
  const ripple3Scale = useRef(new Animated.Value(0.8)).current;
  const ripple3Opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple animation logic
    if (variant === 'splash') {
      // Infinite loop for splash - 3 ripples
      const createRippleAnimation = (
        scaleAnim: Animated.Value,
        opacityAnim: Animated.Value,
        delay: number
      ) => {
        const scaleSequence = Animated.sequence([
          Animated.delay(delay),
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]);

        const opacitySequence = Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]);

        Animated.loop(scaleSequence).start();
        Animated.loop(opacitySequence).start();
      };

      // Start ripple animations with staggered delays
      createRippleAnimation(ripple1Scale, ripple1Opacity, 0);
      createRippleAnimation(ripple2Scale, ripple2Opacity, 1000);
      createRippleAnimation(ripple3Scale, ripple3Opacity, 2000);
    } else {
      // Login variant: 2 ripples simulating deep breathing (inhalar/exhalar)
      // First ripple: Inhalar (breath in) - slower, deeper expansion
      const inhalarScale = Animated.sequence([
        Animated.timing(ripple1Scale, {
          toValue: 1.4, // Deeper expansion
          duration: 2000, // Slower, like taking a deep breath
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ripple1Scale, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]);

      const inhalarOpacity = Animated.sequence([
        Animated.timing(ripple1Opacity, {
          toValue: 0.5, // More visible during inhalation
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ripple1Opacity, {
          toValue: 0,
          duration: 1200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]);

      // Second ripple: Exhalar (breath out) - starts after first ripple begins to fade
      const exhalarScale = Animated.sequence([
        Animated.delay(1000), // Start during the first ripple's fade
        Animated.timing(ripple2Scale, {
          toValue: 1.3, // Slightly smaller, like releasing breath
          duration: 1800, // Slightly faster exhalation
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ripple2Scale, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]);

      const exhalarOpacity = Animated.sequence([
        Animated.delay(1000),
        Animated.timing(ripple2Opacity, {
          toValue: 0.4, // Softer during exhalation
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ripple2Opacity, {
          toValue: 0,
          duration: 1200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]);

      // Start both breathing ripples
      inhalarScale.start();
      inhalarOpacity.start();
      exhalarScale.start();
      exhalarOpacity.start();
    }

    // Breathing glow (only for login variant, starts after ripple completes)
    if (variant === 'login') {
      const startBreathing = () => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(breathingScale, {
                toValue: 1.02,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(breathingOpacity, {
                toValue: 1.0,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(breathingScale, {
                toValue: 0.98,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(breathingOpacity, {
                toValue: 0.95,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      };

      // Start breathing after ripple completes (~2800ms - after both inhalar/exhalar)
      const breathingTimer = setTimeout(() => {
        startBreathing();
      }, 2800);

      return () => clearTimeout(breathingTimer);
    }
  }, [variant]);

  // Calculate sizes based on base size
  const logoCircleSize = size;
  const logoGlowSize = size * 1.15; // ~110 for size 96
  const rippleSize = size * 2.08; // ~200 for size 96
  const fontSize = size * 0.42; // ~40 for size 96

  const styles = createStyles(theme, logoCircleSize, logoGlowSize, rippleSize, fontSize);

  return (
    <View style={styles.container}>
      {/* Ripple layers container */}
      <View style={styles.rippleContainer}>
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: ripple1Scale }],
              opacity: ripple1Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: ripple2Scale }],
              opacity: ripple2Opacity,
            },
          ]}
        />
        {/* Third ripple only for splash variant */}
        {variant === 'splash' && (
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: ripple3Scale }],
                opacity: ripple3Opacity,
              },
            ]}
          />
        )}
      </View>

      {/* Logo container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* Static glow (always visible for login variant) */}
        {variant === 'login' && (
          <View style={styles.breathingGlow} />
        )}

        {/* Logo circle with breathing scale animation (login variant only) */}
        <Animated.View
          style={[
            styles.logoCircleContainer,
            variant === 'login' && {
              transform: [{ scale: breathingScale }],
              opacity: breathingOpacity,
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>HS</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const createStyles = (
  theme: any,
  logoSize: number,
  glowSize: number,
  rippleSize: number,
  fontSize: number
) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    rippleContainer: {
      position: 'absolute',
      width: rippleSize,
      height: rippleSize,
      justifyContent: 'center',
      alignItems: 'center',
      top: '50%',
      marginTop: -rippleSize / 2, // Centered vertically with logo
      alignSelf: 'center',
    },
    ripple: {
      position: 'absolute',
      width: rippleSize,
      height: rippleSize,
      borderRadius: rippleSize / 2,
      backgroundColor: 'rgba(15, 63, 70, 0.08)',
      shadowColor: 'rgba(15, 63, 70, 0.25)',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 8,
      shadowOpacity: 1,
      elevation: 0,
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    breathingGlow: {
      position: 'absolute',
      width: glowSize,
      height: glowSize,
      borderRadius: glowSize / 2,
      backgroundColor: 'rgba(214, 245, 234, 0.25)',
      shadowColor: '#D6F5EA',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 35,
      shadowOpacity: 0.3,
    },
    logoCircleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoCircle: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.75)', // Slightly more opaque for login variant
      borderWidth: 2,
      borderColor: 'rgba(15, 63, 70, 0.12)',
      shadowColor: '#0F3F46',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
      elevation: 12,
    },
    logoText: {
      fontSize: fontSize,
      color: theme.colors.deepTealDark,
      fontFamily: 'CormorantGaramond_700Bold',
      letterSpacing: -1,
    },
  });

