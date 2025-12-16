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
import { Analytics } from '../utils/analytics';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const EveningCheckInLockedScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleUpgrade = () => {
    Analytics.logAnalyticsEvent('premium_feature_locked_tapped', {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 16 }]}
        onPress={handleGoBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-back" size={24} color="rgba(0, 0, 0, 0.6)" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <View style={styles.iconGlow} />
            <Ionicons name="moon-outline" size={64} color="#0F3D3E" />
          </View>
          <Text style={styles.headline}>Evening Check-In</Text>
          <Text style={styles.subheadline}>
            Track your recovery progress and build lasting habits with daily evening reflections.
          </Text>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>What you'll unlock:</Text>
          
          <BenefitRow
            icon="checkmark-circle"
            text="Reflect on your day's recovery progress"
          />
          <BenefitRow
            icon="checkmark-circle"
            text="Track symptoms and how you felt tonight"
          />
          <BenefitRow
            icon="checkmark-circle"
            text="Build consistency with daily check-ins"
          />
          <BenefitRow
            icon="checkmark-circle"
            text="See patterns over time in your insights"
          />
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Unlock Evening Check-In</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>
            Upgrade to Premium to access evening check-ins and all premium features.
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
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(15, 61, 62, 0.08)',
    zIndex: -1,
  },
  headline: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  subheadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  benefitsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 32,
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  benefitsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#0F3D3E',
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  benefitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22,
    flex: 1,
  },
  ctaSection: {
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A3F37',
    borderRadius: 15,
    height: 56,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 12,
    gap: 8,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ctaSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EveningCheckInLockedScreen;
