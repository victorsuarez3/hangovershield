/**
 * Login Screen - Hangover Shield Premium 11/10
 * Apple-grade wellness experience with sea foam glass design
 * 
 * Legal Note: By tapping the Google or Apple sign-in buttons, we consider the user
 * to have accepted the Terms of Service and Privacy Policy, which are accessible
 * via links on this screen. No checkbox or additional acceptance step is required.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';
import { HANGOVER_GRADIENT_WITH_WHITE } from '../../theme/gradients';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { AppleSignInButton } from '../../components/AppleSignInButton';
import { LegalModal } from '../../components/LegalModal';
import { BrandLogoAnimated } from '../../components/BrandLogoAnimated';
import {
  TermsOfServiceContent,
  PrivacyPolicyContent,
} from '../../components/LegalContent';
import { useSkipAuth } from '../../contexts/SkipAuthContext';

interface LoginScreenProps {
  onGoogleSignIn: () => void;
  onAppleSignIn: () => Promise<void>;
  loading?: boolean;
  onSkipAuth?: () => void; // Temporary: skip auth for testing
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSignIn,
  onAppleSignIn,
  loading = false,
  onSkipAuth,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  
  // Get skip auth from global context (bypasses React Navigation prop issues)
  const skipAuthContext = useSkipAuth();

  // Legal modals state
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);

  // Animations - Title
  const titleFadeAnim = useRef(new Animated.Value(0)).current;

  // Animations - Card (delayed)
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(20)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    // Title animation - fade-in 0.4s (slight delay after logo)
    Animated.timing(titleFadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Card animation - fade-in 0.8s with slight upward motion
    Animated.parallel([
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 9,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Premium sea foam gradient background */}
      <LinearGradient
        colors={HANGOVER_GRADIENT_WITH_WHITE}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Content - Centered vertically */}
      <View style={styles.content}>
        {/* Top Branding Section */}
        <View style={styles.brandSection}>
          {/* Premium HS Logo with one-time ripple + breathing glow */}
          <BrandLogoAnimated variant="login" />

          {/* Title */}
          <Animated.View style={{ opacity: titleFadeAnim, marginTop: 40 }}>
            <Text style={styles.brandTitle}>Hangover Shield</Text>

            {/* Subtitle */}
            <Text style={styles.brandTagline}>
              Recovery designed for real people.
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Frosted Glass Auth Card */}
        <Animated.View
          style={[
            styles.glassPanel,
            {
              opacity: cardFadeAnim,
              transform: [
                { translateY: cardSlideAnim },
                { scale: cardScaleAnim },
              ],
            },
          ]}
        >
          <BlurView intensity={50} tint="light" style={styles.blurContainer}>
            <View style={styles.signInSection}>
              {/* Card Heading */}
              <Text style={styles.signInLabel}>Sign in</Text>

              {/* Social Buttons */}
              <View style={styles.socialButtons}>
                <GoogleSignInButton
                  onPress={onGoogleSignIn}
                  disabled={loading}
                />

                {Platform.OS === 'ios' && (
                  <AppleSignInButton
                    onSuccess={onAppleSignIn}
                    onError={(error) => {
                      console.error('Apple sign-in error:', error);
                    }}
                  />
                )}
              </View>

              {/* Trust Microcopy */}
              <Text style={styles.trustLine}>
              Drink sometimes. Feel better, every time.
              </Text>

              {/* Legal Text */}
              <View style={styles.legalContainer}>
                <Text style={styles.legalText}>
                  By signing in, you agree to our{' '}
                  <Pressable
                    onPress={() => setIsTermsVisible(true)}
                    accessibilityLabel="Terms of Service"
                    accessibilityRole="link"
                  >
                    <Text style={styles.legalLink}>Terms of Service</Text>
                  </Pressable>
                  {' and '}
                  <Pressable
                    onPress={() => setIsPrivacyVisible(true)}
                    accessibilityLabel="Privacy Policy"
                    accessibilityRole="link"
                  >
                    <Text style={styles.legalLink}>Privacy Policy</Text>
                  </Pressable>
                  .
                </Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Testing Buttons */}
        <View style={styles.testingButtonsContainer}>
          {/* Skip Auth Button */}
          {skipAuthContext && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                console.log('🟢 Skip button PRESSED - using context');
                skipAuthContext.skipAuth();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip Auth</Text>
            </TouchableOpacity>
          )}

          {/* Reset Onboarding Button */}
          <TouchableOpacity
            style={[styles.skipButton, styles.resetButton]}
            onPress={async () => {
              try {
                await AsyncStorage.multiRemove([
                  '@hangovershield_intro_onboarding_completed',
                  '@hangovershield_feeling_onboarding_completed',
                ]);
                Alert.alert(
                  '✅ Onboarding Reset',
                  'Close and reopen the app to see the onboarding again.',
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('Error resetting onboarding:', error);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Reset Onboarding</Text>
          </TouchableOpacity>

          {/* Toggle Premium Button */}
          <TouchableOpacity
            style={[styles.skipButton, styles.premiumButton]}
            onPress={async () => {
              try {
                const DEV_PREMIUM_KEY = '@hangovershield_dev_premium_enabled';
                const currentEnabled = await AsyncStorage.getItem(DEV_PREMIUM_KEY);
                
                if (currentEnabled === 'true') {
                  // Disable premium
                  await AsyncStorage.removeItem(DEV_PREMIUM_KEY);
                  Alert.alert(
                    '✅ Dev Premium Disabled',
                    'Premium features are now disabled for dev. Restart the app to see changes.',
                    [{ text: 'OK' }]
                  );
                } else {
                  // Enable premium
                  await AsyncStorage.setItem(DEV_PREMIUM_KEY, 'true');
                  Alert.alert(
                    '✅ Dev Premium Enabled',
                    'Premium features are now enabled for dev. Restart the app to see changes.',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error) {
                console.error('Error toggling dev premium:', error);
                Alert.alert('Error', 'Failed to toggle dev premium');
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Toggle Premium</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal Modals */}
      <LegalModal
        visible={isTermsVisible}
        onClose={() => setIsTermsVisible(false)}
        title="Terms of Service"
        content={<TermsOfServiceContent />}
      />

      <LegalModal
        visible={isPrivacyVisible}
        onClose={() => setIsPrivacyVisible(false)}
        title="Privacy Policy"
        content={<PrivacyPolicyContent />}
      />
    </View>
  );
};

const createStyles = (theme: any, topInset: number, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingTop: topInset + 20,
      paddingBottom: bottomInset + 32,
      paddingHorizontal: 24,
    },
    brandSection: {
      alignItems: 'center',
      paddingHorizontal: 32,
      marginBottom: 60,
    },
    brandTitle: {
      fontSize: 48,
      color: theme.colors.deepTealDark, // Darker for better contrast
      marginBottom: 16,
      textAlign: 'center',
      fontFamily: 'CormorantGaramond_700Bold',
      letterSpacing: -1,
      lineHeight: 56,
    },
    brandTagline: {
      fontSize: 18,
      fontWeight: '400',
      color: theme.colors.deepTealDark, // Darker for better contrast
      textAlign: 'center',
      opacity: 0.85, // Increased from 0.7 for better readability
      fontFamily: 'Inter_400Regular',
      letterSpacing: 0.2,
      lineHeight: 26,
      paddingHorizontal: 32,
    },
    glassPanel: {
      borderRadius: 32,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.8)',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      shadowColor: 'rgba(0, 0, 0, 0.06)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.98, // 2% más suave
      shadowRadius: 20,
      elevation: 8,
    },
    blurContainer: {
      paddingVertical: 40,
      paddingHorizontal: 32,
    },
    signInSection: {
      gap: 32,
    },
    signInLabel: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.deepTealDark, // Darker for better contrast
      textAlign: 'center',
      fontFamily: 'CormorantGaramond_600SemiBold',
      letterSpacing: -0.4,
    },
    socialButtons: {
      gap: 16,
    },
    trustLine: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.deepTealDark, // Darker for better contrast
      textAlign: 'center',
      opacity: 0.75, // Increased from 0.65 for better readability
      fontFamily: 'Inter_400Regular',
      letterSpacing: 0.2,
      lineHeight: 22,
      paddingHorizontal: 8,
    },
    legalContainer: {
      paddingTop: 8,
    },
    legalText: {
      fontSize: 11,
      fontWeight: '400',
      color: theme.colors.deepTealDark, // Darker for better contrast
      textAlign: 'center',
      opacity: 0.7, // Increased from 0.6 for better readability
      fontFamily: 'Inter_400Regular',
      lineHeight: 17,
      paddingHorizontal: 8,
    },
    legalLink: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.deepTealDark, // Darker for better contrast
      fontFamily: 'Inter_600SemiBold',
      textDecorationLine: 'underline',
      opacity: 0.9, // Increased from 0.8 for better readability
    },
    testingButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginTop: 24,
      flexWrap: 'wrap',
    },
    skipButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: 'rgba(15, 63, 70, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(15, 63, 70, 0.3)',
      alignItems: 'center',
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    skipButtonText: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.deepTealDark,
      opacity: 0.9,
    },
    resetButton: {
      backgroundColor: 'rgba(200, 100, 50, 0.15)',
      borderColor: 'rgba(200, 100, 50, 0.3)',
    },
    premiumButton: {
      backgroundColor: 'rgba(100, 200, 100, 0.15)',
      borderColor: 'rgba(100, 200, 100, 0.3)',
    },
    debugContainer: {
      marginTop: 16,
      padding: 8,
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      borderRadius: 8,
      alignSelf: 'center',
    },
    debugText: {
      fontSize: 12,
      color: 'red',
      fontFamily: 'Inter_400Regular',
    },
  });
