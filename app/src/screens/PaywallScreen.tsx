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
import { getPaywallCopy, PAYWALL_FEATURES, getCTAText, calculateDailyPrice } from '../utils/paywallCopy';
import { PaywallSourceType } from '../constants/paywallSources';

// Optional haptics - gracefully handle if not available
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch {
  // Haptics not available, continue without it
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;
type PaywallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

// Package identifier type for selection
type PackageIdentifier = string | null;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const PaywallScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<PaywallScreenRouteProp>();
  const navigation = useNavigation<PaywallScreenNavigationProp>();
  
  // Get source for analytics and copy
  const source = (route.params?.source || 'default') as PaywallSourceType;
  const contextScreen = route.params?.contextScreen || 'unknown';
  
  // Get dynamic copy based on source
  const copy = getPaywallCopy(source);
  
  // RevenueCat hook
  const {
    packages,
    monthlyPackage,
    yearlyPackage,
    purchase,
    restore,
    refresh,
    refreshOfferings,
    isLoading: isLoadingPackages,
    error: revenueCatError,
    isAvailable: isRevenueCatAvailable,
  } = useRevenueCat();
  
  // Access status
  const accessInfo = useAccessStatus();
  
  // Local state
  const [selectedPackageId, setSelectedPackageId] = useState<PackageIdentifier>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<'yearly' | 'monthly'>('yearly'); // Fallback selection
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [offeringsLoaded, setOfferingsLoaded] = useState(false);
  
  // Determine if purchases are ready (SDK available AND offerings loaded)
  const purchasesReady = isRevenueCatAvailable && offeringsLoaded;
  
  // Calculate daily price for yearly plan
  const yearlyPriceNumber = yearlyPackage?.product.price || 29.99;
  const yearlyCurrencyCode = yearlyPackage?.product.currencyCode || 'USD';
  const dailyPrice = calculateDailyPrice(yearlyPriceNumber, yearlyCurrencyCode);
  
  // Set default selection when packages are available
  useEffect(() => {
    if (yearlyPackage && !selectedPackageId) {
      setSelectedPackageId(yearlyPackage.identifier);
    } else if (monthlyPackage && !selectedPackageId) {
      setSelectedPackageId(monthlyPackage.identifier);
    }
  }, [yearlyPackage, monthlyPackage, selectedPackageId]);
  
  // Track when offerings are loaded
  useEffect(() => {
    if (packages.length > 0) {
      setOfferingsLoaded(true);
    }
  }, [packages]);

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
    // Find selected package by identifier or fallback to plan type
    const packageToPurchase = 
      (selectedPackageId && packages.find(pkg => pkg.identifier === selectedPackageId)) ||
      (selectedPlanType === 'yearly' ? yearlyPackage : monthlyPackage) ||
      yearlyPackage ||
      monthlyPackage;
    
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
  
  const handlePlanSelect = (packageId: string | null, planType: 'yearly' | 'monthly') => {
    // Haptic feedback on selection (optional)
    if (Haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not available, continue silently
      }
    }
    // Always update selection, even if packageId is null
    setSelectedPlanType(planType);
    if (packageId) {
      setSelectedPackageId(packageId);
    }
  };
  
  const handleRetry = async () => {
    setOfferingsLoaded(false);
    // Re-fetch offerings
    if (refreshOfferings) {
      try {
        await refreshOfferings();
        // After refresh, check if packages are available
        // The packages will update via the hook, triggering the useEffect
        setTimeout(() => {
          if (packages.length > 0) {
            setOfferingsLoaded(true);
          }
        }, 500);
      } catch (error) {
        console.error('[PaywallScreen] Retry failed:', error);
      }
    }
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
          <Text style={styles.headline}>{copy.headline}</Text>
          <Text style={styles.subheadline}>
            {copy.subheadline}
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresCard}>
          {PAYWALL_FEATURES.map((feature, index) => (
            <FeatureRow
              key={index}
              icon={index === 0 ? 'sparkles-outline' : index === 1 ? 'moon-outline' : index === 2 ? 'stats-chart-outline' : 'water-outline'}
              title={feature.title}
              subtitle={feature.subtitle}
            />
          ))}
        </View>

        {/* Urgency Line */}
        {!accessInfo.isPremium && (
          <Text style={styles.urgencyLine}>{copy.urgencyLine}</Text>
        )}

        {/* Pricing Options */}
        <View style={styles.pricingSection}>
          {/* Yearly Option - Highlighted */}
          <Pressable
            style={[
              styles.pricingCard,
              styles.pricingCardHighlighted,
              (selectedPlanType === 'yearly' || (yearlyPackage && selectedPackageId === yearlyPackage.identifier)) && styles.pricingCardSelected,
            ]}
            onPress={() => handlePlanSelect(yearlyPackage?.identifier || null, 'yearly')}
            disabled={isLoading}
          >
            <View style={styles.badgeContainer} pointerEvents="none">
              <View style={styles.badge}>
                <Text style={styles.badgeText}>BEST VALUE</Text>
              </View>
            </View>
            <View style={styles.radioContainer} pointerEvents="none">
              <View style={[styles.radio, (selectedPlanType === 'yearly' || (yearlyPackage && selectedPackageId === yearlyPackage.identifier)) && styles.radioSelected]}>
                {(selectedPlanType === 'yearly' || (yearlyPackage && selectedPackageId === yearlyPackage.identifier)) && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.pricingAmount}>{yearlyPrice}</Text>
            <Text style={styles.pricingPeriod}>/ year</Text>
            <Text style={styles.pricingSubtext}>
              Less than {dailyPrice}/day to recover properly.
            </Text>
          </Pressable>

          {/* Monthly Option */}
          <Pressable
            style={[
              styles.pricingCard,
              (selectedPlanType === 'monthly' || (monthlyPackage && selectedPackageId === monthlyPackage.identifier)) && styles.pricingCardSelected,
            ]}
            onPress={() => handlePlanSelect(monthlyPackage?.identifier || null, 'monthly')}
            disabled={isLoading}
          >
            <View style={styles.radioContainer} pointerEvents="none">
              <View style={[styles.radio, (selectedPlanType === 'monthly' || (monthlyPackage && selectedPackageId === monthlyPackage.identifier)) && styles.radioSelected]}>
                {(selectedPlanType === 'monthly' || (monthlyPackage && selectedPackageId === monthlyPackage.identifier)) && <View style={styles.radioInner} />}
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
        
        {/* Purchases Unavailable Messages */}
        {isRevenueCatAvailable && !offeringsLoaded && (
          <View style={styles.sdkNotAvailableCard}>
            <Ionicons name="information-circle-outline" size={20} color="rgba(0, 0, 0, 0.5)" />
            <View style={styles.sdkNotAvailableTextContainer}>
              <Text style={styles.sdkNotAvailableTitle}>Purchases temporarily unavailable</Text>
              <Text style={styles.sdkNotAvailableSubtitle}>Please try again in a moment.</Text>
            </View>
          </View>
        )}
        
        {!isRevenueCatAvailable && __DEV__ && (
          <View style={styles.devNoteCard}>
            <Text style={styles.devNoteText}>Purchases available in TestFlight builds.</Text>
          </View>
        )}

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[
              styles.ctaButton, 
              (!purchasesReady || isLoading) && styles.ctaButtonDisabled
            ]}
            onPress={!purchasesReady ? handleRetry : handlePurchase}
            activeOpacity={0.8}
            disabled={isLoading || (!purchasesReady && !isPurchasing)}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : !purchasesReady ? (
              <Text style={styles.ctaText}>Try Again</Text>
            ) : (
              <Text style={styles.ctaText}>
                {getCTAText(selectedPlanType === 'yearly' || selectedPackageId === yearlyPackage?.identifier, source)}
              </Text>
            )}
          </TouchableOpacity>
          {purchasesReady && (
            <>
              <Text style={styles.ctaSubtext}>
                No risk. Cancel anytime.
              </Text>
              <Text style={styles.ctaSubtextSecondary}>
                Most users cancel after they feel better.
              </Text>
            </>
          )}
        </View>

        {/* Restore Purchases Button */}
        {purchasesReady && (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring || isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.restoreButtonText}>
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Footer Links */}
        <View style={styles.footer}>
          <Pressable onPress={handlePrivacyPolicy} style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.footerSeparator}>|</Text>
          <Pressable onPress={handleTermsOfUse} style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Terms of Use</Text>
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
  title: string;
  subtitle: string;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ icon, title, subtitle }) => {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={20} color="#0F3D3E" />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureText}>{title}</Text>
        {subtitle ? (
          <Text style={styles.featureSubtext}>{subtitle}</Text>
        ) : null}
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
  featureTextContainer: {
    flex: 1,
  },
  featureText: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22,
    marginBottom: 2,
  },
  featureSubtext: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  urgencyLine: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
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
  includesSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  includesTitle: {
    ...typography.labelSmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  includesList: {
    gap: 4,
  },
  includesItem: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 20,
  },
  devNoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  devNoteText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
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
  sdkNotAvailableTextContainer: {
    flex: 1,
  },
  sdkNotAvailableTitle: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
    marginBottom: 2,
  },
  sdkNotAvailableSubtitle: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 18,
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
    marginBottom: 4,
  },
  ctaSubtextSecondary: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
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
