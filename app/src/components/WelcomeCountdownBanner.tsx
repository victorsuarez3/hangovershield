/**
 * Welcome Countdown Banner - Hangover Shield
 * Shows access status and countdown for welcome unlock
 *
 * States:
 * - Welcome active: "Welcome access: HHh MMm remaining" + CTA "Unlock permanently"
 * - Free: "Unlock premium features" + CTA "Upgrade"
 * - Premium: "Premium active" (simple, no CTA)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PaywallSource } from '../constants/paywallSources';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { formatWelcomeUnlockTimeRemaining } from '../services/welcomeUnlock';
import { Analytics } from '../utils/analytics';

export const WelcomeCountdownBanner: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const accessInfo = useAccessStatus();

  const handleUpgradeTap = () => {
    const source = accessInfo.isWelcome ? PaywallSource.WELCOME_BANNER : PaywallSource.HOME_UPGRADE_BANNER;
    Analytics.paywallCTAClicked(source, 'upgrade', 'HomeScreen');

    navigation.navigate('Paywall', {
      source,
      contextScreen: 'HomeScreen',
    });
  };

  // Don't show for premium users (they don't need reminders)
  if (accessInfo.isPremium) {
    return null;
  }

  // Welcome active state
  if (accessInfo.isWelcome) {
    const timeRemaining = formatWelcomeUnlockTimeRemaining(accessInfo.welcomeRemainingMs);

    return (
      <View style={styles.container}>
        <View style={styles.welcomeContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="gift-outline" size={20} color="#0F4C44" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.welcomeTitle}>Welcome access</Text>
            <Text style={styles.welcomeSubtitle}>
              {timeRemaining} remaining
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleUpgradeTap}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Unlock permanently</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Free state
  return (
    <View style={styles.container}>
      <View style={styles.freeContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="rgba(15, 76, 68, 0.6)" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.freeTitle}>Unlock premium features</Text>
          <Text style={styles.freeSubtitle}>
            Evening check-ins, insights & more
          </Text>
        </View>
        <TouchableOpacity
          style={styles.ctaButtonOutline}
          onPress={handleUpgradeTap}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaTextOutline}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },

  // Welcome state
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.15)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F4C44',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Free state
  freeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.1)',
  },
  freeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 2,
  },
  freeSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.5)',
  },
  ctaButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0F4C44',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ctaTextOutline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0F4C44',
  },
});
