/**
 * Paywall Screen - Hangover Shield
 * Production-ready paywall with RevenueCat integration
 * 
 * Features:
 * - Real pricing from RevenueCat
 * - Monthly and Yearly plans
 * - Purchase and restore flows
 * - Analytics tracking
 * - Loading and error states
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesPackage } from 'react-native-purchases';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import { typography } from '../design-system/typography';
import { RootStackParamList } from '../navigation/types';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { Analytics } from '../utils/analytics';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;
type PaywallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

type SelectedPlan = 'yearly' | 'monthly';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const PaywallScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<PaywallScreenRouteProp>();
  const navigation = useNavigation<PaywallScreenNavigationProp>();
  
  // Get source for analytics
  const source = route.params?.source || 'unknown';
  const contextScreen = route.params?.contextScreen || 'unknown';
  
  // RevenueCat hook
  const {
    packages,
    monthlyPackage,
    yearlyPackage,
    purchase,
    restore,
    isLoading: isLoadingPackages,
    error: revenueCatError,
    isAvailable: isRevenueCatAvailable,
  } = useRevenueCat();
  
  // Access status
  const accessInfo = useAccessStatus();
  
  // Local state
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Log paywall shown on mount
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    Analytics.paywallShown(source, contextScreen, accessInfo.status);
  }, [source, contextScreen, accessInfo.status]);

  // ─────────────────────────────────────────────────────────────────────────────
  // If user already has premium, go back
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (accessInfo.isPremium) {
      navigation.goBack();
    }
  }, [accessInfo.isPremium, navigation]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handlePurchase = async () => {
    const packageToPurchase = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;
    
    if (!packageToPurchase) {
      Alert.alert('Error', 'No package available. Please try again later.');
      return;
    }

    setIsPurchasing(true);
    
    try {
      const success = await purchase(packageToPurchase, source);
      
      if (success) {
        // Navigate to success screen or go back
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        // The accessInfo will auto-update via RevenueCat listener
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    
    try {
      const hasPremium = await restore();
      
      if (hasPremium) {
        Alert.alert('Success', 'Your purchases have been restored!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    Analytics.paywallDismissed(source, 'close');
    navigation.goBack();
  };

  const handlePrivacyPolicy = () => {
    // TODO: Open privacy policy
    console.log('Privacy Policy');
  };

  const handleTermsOfUse = () => {
    // TODO: Open terms of use
    console.log('Terms of Use');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Get prices from RevenueCat packages
  // ─────────────────────────────────────────────────────────────────────────────

  const yearlyPrice = yearlyPackage?.product.priceString || '$29.99';
  const monthlyPrice = monthlyPackage?.product.priceString || '$4.99';

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  const isLoading = isLoadingPackages || isPurchasing || isRestoring;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Close Button */}
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + 16 }]}
        onPress={handleClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={24} color="rgba(0, 0, 0, 0.5)" />
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
            <Ionicons name="shield-checkmark" size={64} color="#0F3D3E" />
          </View>
          <Text style={styles.headline}>Unlock Full Recovery</Text>
          <Text style={styles.subheadline}>
            Get personalized recovery plans, evening check-ins, detailed insights, and more.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresCard}>
          <FeatureRow
            icon="sparkles-outline"
            text="Personalized daily recovery plan tailored to how you feel"
          />
          <FeatureRow
            icon="moon-outline"
            text="Evening check-ins to track your progress"
          />
          <FeatureRow
            icon="stats-chart-outline"
            text="Detailed trends and insights (30/90 day)"
          />
          <FeatureRow
            icon="water-outline"
            text="Advanced hydration tracking and goals"
          />
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingSection}>
          {/* Yearly Option - Highlighted */}
          <Pressable
            style={[
              styles.pricingCard,
              styles.pricingCardHighlighted,
              selectedPlan === 'yearly' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
            disabled={isLoading}
          >
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>BEST VALUE</Text>
              </View>
            </View>
            <View style={styles.radioContainer}>
              <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioSelected]}>
                {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.pricingAmount}>{yearlyPrice}</Text>
            <Text style={styles.pricingPeriod}>/ year</Text>
            <Text style={styles.pricingSubtext}>Save 58% — feel better all year</Text>
          </Pressable>

          {/* Monthly Option */}
          <Pressable
            style={[
              styles.pricingCard,
              selectedPlan === 'monthly' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            disabled={isLoading}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioSelected]}>
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.pricingAmount}>{monthlyPrice}</Text>
            <Text style={styles.pricingPeriod}>/ month</Text>
            <Text style={styles.pricingSubtext}>Flexible — cancel anytime</Text>
          </Pressable>
        </View>

        {/* Error Message */}
        {revenueCatError && (
          <Text style={styles.errorText}>{revenueCatError}</Text>
        )}
        
        {/* SDK Not Available Message */}
        {!isRevenueCatAvailable && (
          <View style={styles.sdkNotAvailableCard}>
            <Ionicons name="information-circle-outline" size={24} color="rgba(0, 0, 0, 0.6)" />
            <Text style={styles.sdkNotAvailableText}>
              Subscriptions coming soon! Install RevenueCat SDK to enable purchases.
            </Text>
          </View>
        )}

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
            onPress={handlePurchase}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.ctaText}>
                {selectedPlan === 'yearly' ? 'Get Premium Yearly' : 'Get Premium Monthly'}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>
            No risk. Cancel anytime.
          </Text>
        </View>

        {/* Footer Links */}
        <View style={styles.footer}>
          <Pressable onPress={handlePrivacyPolicy} style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.footerSeparator}>|</Text>
          <Pressable onPress={handleTermsOfUse} style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Terms of Use</Text>
          </Pressable>
          <Text style={styles.footerSeparator}>|</Text>
          <Pressable 
            onPress={handleRestore} 
            style={styles.footerLink}
            disabled={isRestoring}
          >
            <Text style={styles.footerLinkText}>
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Feature Row Component
// ─────────────────────────────────────────────────────────────────────────────

interface FeatureRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ icon, text }) => {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={20} color="#0F3D3E" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
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
  closeButton: {
    position: 'absolute',
    right: 20,
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
    paddingTop: 60,
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
    ...typography.sectionTitle,
    fontSize: 28,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subheadline: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 24,
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 61, 62, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  featureText: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22,
    flex: 1,
  },
  pricingSection: {
    marginBottom: 24,
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    position: 'relative',
    minHeight: 120,
  },
  pricingCardHighlighted: {
    borderColor: '#0F4C44',
    borderWidth: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  pricingCardSelected: {
    borderColor: '#0A3F37',
    borderWidth: 3,
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    left: 20,
    zIndex: 1,
  },
  badge: {
    backgroundColor: '#0F4C44',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  badgeText: {
    ...typography.labelSmall,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  radioContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#0A3F37',
    borderWidth: 2.5,
  },
  radioInner: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#0A3F37',
  },
  pricingAmount: {
    ...typography.sectionTitle,
    fontSize: 28,
    color: 'rgba(0, 0, 0, 0.9)',
    marginTop: 4,
    marginBottom: 4,
  },
  pricingPeriod: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 6,
  },
  pricingSubtext: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 18,
  },
  errorText: {
    ...typography.bodySmall,
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 16,
  },
  sdkNotAvailableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  sdkNotAvailableText: {
    ...typography.bodySmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    flex: 1,
    lineHeight: 20,
  },
  ctaSection: {
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#0A3F37',
    borderRadius: 15,
    height: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 12,
    width: '100%',
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    ...typography.button,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ctaSubtext: {
    ...typography.bodySmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 16,
  },
  footerLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  footerLinkText: {
    ...typography.labelSmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  footerSeparator: {
    ...typography.labelSmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 4,
  },
});
