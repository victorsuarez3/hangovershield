/**
 * Purchase Success Screen - Hangover Shield
 * Post-paywall confirmation screen shown after successful purchase or trial start
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../theme/gradients';

interface PurchaseSuccessScreenProps {
  navigation: any;
  route: {
    params?: {
      plan?: 'monthly' | 'yearly';
    };
  };
}

export const PurchaseSuccessScreen: React.FC<PurchaseSuccessScreenProps> = ({ route }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const plan = route.params?.plan || 'monthly';

  const handleStartRecovery = () => {
    // Navigate back to home and trigger navigation to recovery plan
    navigation.navigate('Home', { screen: 'HomeMain' });
    // TODO: Add navigation to recovery plan after home loads
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 }]}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={56} color="#0F4C44" />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>You're all set 🌿</Text>
        <Text style={styles.subtitle}>
          Your full recovery plan is now unlocked. Let's start with your first step.
        </Text>

        {/* Plan Summary */}
        <View style={styles.planSummary}>
          <View style={styles.planSummaryRow}>
            <Ionicons name="diamond" size={18} color="#0F4C44" />
            <Text style={styles.planSummaryText}>
              {plan === 'yearly' ? 'Premium (Yearly)' : 'Premium (Monthly) - 7-day free trial'}
            </Text>
          </View>
          <Text style={styles.planSummarySubtext}>
            {plan === 'yearly'
              ? 'Full access to all premium features, billed annually.'
              : 'Start your free trial today. Cancel anytime before day 7.'}
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartRecovery}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Start my recovery plan</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Supportive Footer */}
        <Text style={styles.footerText}>
          You can manage your subscription anytime in Settings.
        </Text>
      </View>
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
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Success Icon
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 8,
  },

  // Text
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: 'rgba(15, 61, 62, 0.75)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    maxWidth: 320,
  },

  // Plan Summary
  planSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  planSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planSummaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
    marginLeft: 8,
  },
  planSummarySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.65)',
    lineHeight: 20,
  },

  // CTA
  ctaButton: {
    backgroundColor: '#0A3F37',
    paddingVertical: 18,
    paddingHorizontal: 32,
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
    marginBottom: 24,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },

  // Footer
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PurchaseSuccessScreen;
