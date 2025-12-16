/**
 * Evening Check-In Locked Screen - Hangover Shield
 * Premium feature gate for Evening Check-In
 * 
 * Design: Calm, premium, emotionally resonant
 * UX: Show value → create desire → contextual paywall
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import { PaywallSource } from '../constants/paywallSources';
import { logAnalyticsEvent } from '../utils/analytics';
import { AppHeader } from '../components/AppHeader';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const EveningCheckInLockedScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleUpgrade = () => {
    logAnalyticsEvent('premium_feature_locked_tapped', {
      feature: 'evening_checkin',
      source: PaywallSource.EVENING_CHECKIN_LOCKED,
      contextScreen: 'EveningCheckIn',
    });

    navigation.navigate('Paywall' as any, {
      source: PaywallSource.EVENING_CHECKIN_LOCKED,
      contextScreen: 'EveningCheckIn',
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSkip = () => {
    // Dev skip: navigate directly to Evening Check-In flow
    navigation.navigate('EveningCheckIn' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* App Header */}
      <AppHeader
        title="Evening Check-In"
        showBackButton
        onBackPress={handleGoBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.subheadline}>
            Reflect on your recovery progress and prepare for tomorrow.
          </Text>
        </View>

        {/* Premium Feature Card */}
        <View style={styles.benefitsCard}>
          {/* Premium Feature Header */}
          <View style={styles.premiumHeader}>
            <Ionicons name="moon" size={24} color="#0F4C44" />
            <Text style={styles.premiumLabel}>Premium Feature</Text>
          </View>

          {/* Benefits List */}
          <BenefitRow
            icon="checkmark-circle"
            text="Evening reflection questions"
          />
          <BenefitRow
            icon="checkmark-circle"
            text="Recovery progress assessment"
          />
          <BenefitRow
            icon="checkmark-circle"
            text="Next day preparation"
          />
          <BenefitRow
            icon="checkmark-circle"
            text="Smart sleep recommendations"
          />

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Upgrade to Premium</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Dev Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip (Dev)</Text>
          </TouchableOpacity>

          {/* Explanation Text */}
          <Text style={styles.explanationText}>
            Evening check-ins help you reflect on your recovery, track improvements, and prepare for optimal rest and recovery.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Benefit Row Component
// ─────────────────────────────────────────────────────────────────────────────

interface BenefitRowProps {
  icon: string;
  text: string;
}

const BenefitRow: React.FC<BenefitRowProps> = ({ icon, text }) => {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIconContainer}>
        <Ionicons name={icon as any} size={20} color="#0F4C44" />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  subheadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    marginBottom: 32,
    shadowColor: 'rgba(15, 76, 68, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  premiumLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F4C44',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.8)',
    lineHeight: 22,
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F4C44',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  explanationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 76, 68, 0.3)',
    shadowColor: 'rgba(15, 76, 68, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 2,
  },
  skipButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.8)',
    textAlign: 'center',
  },
});

export default EveningCheckInLockedScreen;
