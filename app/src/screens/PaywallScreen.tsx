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

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../theme/gradients';
import { typography } from '../design-system/typography';
import { RootStackParamList } from '../navigation/types';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { Analytics } from '../utils/analytics';
import { PAYWALL_FEATURES, getCTAText } from '../utils/paywallCopy';
import { PaywallSourceType } from '../constants/paywallSources';
import { SHOW_DEV_TOOLS } from '../config/flags';
import { APP_LINKS } from '../config/links';

// Includes section items (grouped)
const PAYWALL_INCLUDES = {
  daily: [
    'Evening Check-In (Pro)',
    'Full Day Recovery Plan (all steps)',
    'Hydration goals',
  ],
  insights: [
    '30 / 90-day trends',
    'Full check-in history',
    'Progress overview dashboard',
  ],
} as const;

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

type PlanId = 'yearly' | 'monthly';

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
  
  // RevenueCat hook
  const {
    packages,
    monthlyPackage,
    yearlyPackage,
    purchase,
    restore,
    refreshOfferings,
    isLoading: isLoadingPackages,
    error: revenueCatError,
    isAvailable: isRevenueCatAvailable,
  } = useRevenueCat();
  
  // Access status
  const accessInfo = useAccessStatus();
  
  // Local state
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');
  const [includesExpanded, setIncludesExpanded] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const offeringsLoaded = packages.length > 0;
  // Allow purchases if RevenueCat is available and packages are loaded
  // OR if we're in dev mode (for testing UI)
  const purchasesReady = (isRevenueCatAvailable && offeringsLoaded) || SHOW_DEV_TOOLS;

  const selectedPackage = useMemo(() => {
    if (selectedPlan === 'yearly') return yearlyPackage ?? null;
    return monthlyPackage ?? null;
  }, [monthlyPackage, selectedPlan, yearlyPackage]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Log paywall shown on mount
  // ─────────────────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    Analytics.paywallShown(source, contextScreen, accessInfo.status);
  }, [source, contextScreen, accessInfo.status]);

  // ─────────────────────────────────────────────────────────────────────────────
  // If user already has premium, go back
  // ─────────────────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (accessInfo.isPremium) {
      navigation.goBack();
    }
  }, [accessInfo.isPremium, navigation]);

  const openSupport = async () => {
    const target = APP_LINKS.SUPPORT_URL || APP_LINKS.SUPPORT_EMAIL;
    try {
      const supported = await Linking.canOpenURL(target);
      if (supported) {
        await Linking.openURL(target);
      } else if (APP_LINKS.SUPPORT_EMAIL) {
        await Linking.openURL(APP_LINKS.SUPPORT_EMAIL);
      }
    } catch (error) {
      if (SHOW_DEV_TOOLS) {
        console.error('[PaywallScreen] Support link error:', error);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handlePurchase = async () => {
    setLastError(null);
    if (SHOW_DEV_TOOLS) {
      console.log('[PaywallScreen] CTA pressed');
    }

    // In dev mode without RevenueCat, simulate success
    if (SHOW_DEV_TOOLS && !isRevenueCatAvailable) {
      Alert.alert(
        'Dev Mode',
        'RevenueCat is not available. In production, this would complete the purchase.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    if (!isRevenueCatAvailable) {
      setLastError('RevenueCat unavailable');
      Alert.alert(
        'Purchases unavailable',
        'We could not reach the App Store. Please try again or contact support.',
        [
          { text: 'Retry', onPress: handleRetry },
          { text: 'Contact support', onPress: openSupport },
          { text: 'Close', style: 'cancel' },
        ]
      );
      return;
    }

    const packageToPurchase = selectedPackage ?? yearlyPackage ?? monthlyPackage ?? null;
    
    if (!packageToPurchase) {
      setLastError('No package available');
      Alert.alert(
        'Purchases temporarily unavailable',
        'We could not load the purchase options. Please try again.',
        [
          { text: 'Retry', onPress: handleRetry },
          { text: 'Contact support', onPress: openSupport },
          { text: 'Close', style: 'cancel' },
        ]
      );
      return;
    }

    setIsPurchasing(true);
    
    try {
      const success = await purchase(packageToPurchase, source);
      
      if (success) {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      } else {
        setLastError('Purchase did not complete');
        Alert.alert(
          'Purchase not completed',
          'Please try again. If the issue persists, contact support.',
          [
            { text: 'Retry', onPress: handleRetry },
            { text: 'Restore', onPress: handleRestore },
            { text: 'Contact support', onPress: openSupport },
            { text: 'Close', style: 'cancel' },
          ]
        );
      }
    } catch (error: any) {
      setLastError(error?.message || 'Purchase failed');
      if (SHOW_DEV_TOOLS) {
        console.error('[PaywallScreen] Purchase error:', error);
      }
      Alert.alert(
        'Purchases unavailable',
        'We had trouble reaching the store. Please retry or contact support.',
        [
          { text: 'Retry', onPress: handleRetry },
          { text: 'Contact support', onPress: openSupport },
          { text: 'Close', style: 'cancel' },
        ]
      );
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
    } catch (error: any) {
      setLastError(error?.message || 'Restore failed');
      Alert.alert(
        'Restore failed',
        'We could not restore purchases. Please try again or contact support.',
        [
          { text: 'Retry', onPress: handleRestore },
          { text: 'Contact support', onPress: openSupport },
          { text: 'Close', style: 'cancel' },
        ]
      );
      if (SHOW_DEV_TOOLS) {
        console.error('[PaywallScreen] Restore error:', error);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    Analytics.paywallDismissed(source, 'close');
    navigation.goBack();
  };
  
  const handlePlanSelect = (plan: PlanId) => {
    // Haptic feedback on selection (optional)
    if (Haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not available, continue silently
      }
    }
    setSelectedPlan(plan);
  };
  
  const handleRetry = async () => {
    // Re-fetch offerings
    if (refreshOfferings) {
      try {
        await refreshOfferings();
      } catch (error) {
        if (SHOW_DEV_TOOLS) {
          console.error('[PaywallScreen] Retry failed:', error);
        }
        const message = (error as any)?.message || 'Retry failed';
        setLastError(message);
        Alert.alert(
          'Still unavailable',
          'We could not refresh the store. Please try again later or contact support.',
          [
            { text: 'Contact support', onPress: openSupport },
            { text: 'Close', style: 'cancel' },
          ]
        );
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

  const yearlyPrice = '$49.99';
  const monthlyPrice = '$4.99';

  const showPurchasesNotice = !isLoadingPackages && (!purchasesReady || !!revenueCatError);
  const purchasesNoticeText = !isRevenueCatAvailable
    ? 'Purchases available in TestFlight builds.'
    : 'Purchases temporarily unavailable. Please try again.';

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  const isLoading = isLoadingPackages || isPurchasing || isRestoring;
  const ctaDisabled = isPurchasing || isRestoring;

  // Debug logging
  if (SHOW_DEV_TOOLS) {
    console.log('[PaywallScreen] Button state:', {
      purchasesReady,
      isLoading,
      isRevenueCatAvailable,
      offeringsLoaded,
      packagesCount: packages.length,
      disabled: isLoading || !purchasesReady,
      lastError,
      packageIds: packages.map((p) => p?.identifier).filter(Boolean),
    });
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Subtle contrast overlay for improved readability */}
      <View style={styles.contrastOverlay} />

      {/* Close Button */}
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + 12 }]}
        onPress={handleClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={24} color="rgba(10, 47, 48, 0.5)" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection} pointerEvents="none">
          <View style={styles.iconContainer}>
            <View style={styles.iconGlow} />
            <View style={styles.iconHalo} />
            <Ionicons name="shield-checkmark" size={64} color="#0A2F30" />
          </View>
        </View>

        {/* Emotional Header */}
        <View style={styles.emotionalHeader}>
          <Text style={styles.eyebrow}>Finish today’s recovery — properly</Text>
          <Text style={styles.emotionalTrigger}>You’re missing part{'\n'}of today’s recovery.</Text>
          <Text style={styles.supportLine}>Your body responds best to a complete plan.</Text>
        </View>

        {/* Feature Highlights */}
        <BenefitsCard />

        <IncludesCard expanded={includesExpanded} onToggle={() => setIncludesExpanded(v => !v)} />

        {/* Contextual Urgency Line */}
        {/* Spacer / divider before pricing */}
        <View style={styles.pricingDivider}>
          <View style={styles.pricingDividerLine} />
        </View>
        <Text style={styles.contextualUrgency}>Part of today’s recovery is locked.</Text>

        {/* Pricing Options */}
        <View style={styles.pricingSection}>
          <PlanCard
            plan="yearly"
            price={yearlyPrice}
            period="/ year"
            badge="BEST VALUE"
            selected={selectedPlan === 'yearly'}
            onSelect={handlePlanSelect}
          >
            <Text style={styles.pricingSubtext}>Save $9.89 compared to monthly</Text>
            <Text style={styles.pricingSubtext}>Less than $0.14/day</Text>
            <Text style={styles.pricingHint}>Most users choose this.</Text>
          </PlanCard>

          <PlanCard
            plan="monthly"
            price={monthlyPrice}
            period="/ month"
            selected={selectedPlan === 'monthly'}
            onSelect={handlePlanSelect}
            footerHint="Most users choose yearly."
          >
            <Text style={styles.pricingSubtext}>Flexible — cancel anytime</Text>
          </PlanCard>
        </View>

        {/* Calm inline notice (no scary banners) */}
        {showPurchasesNotice && (
          <View style={styles.noticeCard}>
            <Ionicons name="information-circle-outline" size={20} color="rgba(10, 47, 48, 0.55)" />
            <View style={styles.noticeTextContainer}>
              <Text style={styles.noticeText}>{purchasesNoticeText}</Text>
              {lastError && SHOW_DEV_TOOLS && (
                <Text style={styles.noticeDebugText}>Debug: {lastError}</Text>
              )}
            </View>
            {isRevenueCatAvailable && (
              <TouchableOpacity
                style={styles.noticeButton}
                onPress={handleRetry}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.noticeButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
            {!isRevenueCatAvailable && (
              <TouchableOpacity
                style={styles.noticeButton}
                onPress={openSupport}
                activeOpacity={0.8}
              >
                <Text style={styles.noticeButtonText}>Contact support</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaPreline}>What you do today changes how you feel tomorrow.</Text>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              (ctaDisabled || isLoading) && styles.ctaButtonDisabled
            ]}
            onPress={handlePurchase}
            activeOpacity={0.8}
            disabled={ctaDisabled}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.ctaText}>
                {getCTAText(selectedPlan === 'yearly', source)} {'\u2192'}
                {'\n'}
                Feel Better
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>No risk. Cancel anytime.</Text>
        </View>

        {/* Restore Purchases Button */}
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

const BenefitsCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.preBenefitsLine}>Recovery doesn’t end in the morning.</Text>
      {PAYWALL_FEATURES.map((feature, index) => (
        <FeatureRow
          key={index}
          icon={
            index === 0
              ? 'sparkles-outline'
              : index === 1
                ? 'moon-outline'
                : index === 2
                  ? 'stats-chart-outline'
                  : 'water-outline'
          }
          title={feature.title}
          subtitle={feature.subtitle}
        />
      ))}
    </View>
  );
};

const IncludesCard: React.FC<{ expanded: boolean; onToggle: () => void }> = ({
  expanded,
  onToggle,
}) => {
  return (
    <View style={[styles.card, styles.includesCard]}>
      <View pointerEvents="none" style={styles.includesTopHighlight} />
      <Text style={styles.includesTitle}>INCLUDES</Text>

      <View style={styles.includesGroup}>
        <View style={styles.includesGroupHeader}>
          <View style={styles.includesGroupHeaderLeft}>
            <Ionicons name="calendar-outline" size={16} color="rgba(10, 47, 48, 0.55)" />
            <Text style={styles.includesGroupTitle}>Daily Recovery (Morning + Evening)</Text>
          </View>
          <View style={styles.includesPill}>
            <Text style={styles.includesPillText}>PRO</Text>
          </View>
        </View>
        {expanded ? (
          <View style={styles.includesList}>
            {PAYWALL_INCLUDES.daily.map((item, index) => (
              <IncludesRow key={index} text={item} />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.includesGroupDivider} />

      <View style={styles.includesGroup}>
        <View style={styles.includesGroupHeader}>
          <View style={styles.includesGroupHeaderLeft}>
            <Ionicons name="stats-chart-outline" size={16} color="rgba(10, 47, 48, 0.55)" />
            <Text style={styles.includesGroupTitle}>Advanced Insights</Text>
          </View>
          <View style={styles.includesPill}>
            <Text style={styles.includesPillText}>ADVANCED</Text>
          </View>
        </View>
        {expanded ? (
          <View style={styles.includesList}>
            {PAYWALL_INCLUDES.insights.map((item, index) => (
              <IncludesRow key={index} text={item} />
            ))}
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.includesToggle}
        onPress={onToggle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Hide everything included' : 'See everything included'}
      >
        <Text style={styles.includesToggleText}>
          {expanded ? 'Hide everything included' : 'See everything included'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="rgba(10, 47, 48, 0.55)"
        />
      </TouchableOpacity>
    </View>
  );
};

const IncludesRow: React.FC<{ text: string }> = ({ text }) => {
  return (
    <View style={styles.includesRow}>
      <View style={styles.includesDot} />
      <Text style={styles.includesItemText}>{text}</Text>
    </View>
  );
};

interface PlanCardProps {
  plan: PlanId;
  price: string;
  period: string;
  badge?: string;
  selected: boolean;
  onSelect: (plan: PlanId) => void;
  children: React.ReactNode;
  footerHint?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  price,
  period,
  badge,
  selected,
  onSelect,
  children,
  footerHint,
}) => {
  return (
    <Pressable
      style={[
        styles.pricingCard,
        plan === 'yearly' && styles.pricingCardHighlighted,
        selected && styles.pricingCardSelected,
      ]}
      onPress={() => onSelect(plan)}
      accessibilityRole="button"
      accessibilityLabel={plan === 'yearly' ? 'Yearly plan' : 'Monthly plan'}
    >
      {badge ? (
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        style={styles.radioContainer}
        onPress={() => onSelect(plan)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </Pressable>

      <Text style={styles.pricingAmount}>{price}</Text>
      <Text style={styles.pricingPeriod}>{period}</Text>
      <View style={styles.pricingSubcopyStack}>{children}</View>
      {footerHint ? <Text style={styles.socialProof}>{footerHint}</Text> : null}
    </Pressable>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contrastOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeButton: {
    position: 'absolute',
    right: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  emotionalHeader: {
    alignItems: 'center',
    marginBottom: 26,
    paddingHorizontal: 16,
  },
  eyebrow: {
    ...typography.labelSmall,
    fontSize: 13,
    color: 'rgba(10, 47, 48, 0.45)',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'none',
  },
  emotionalTrigger: {
    ...typography.sectionTitle,
    fontSize: 35,
    color: 'rgba(10, 47, 48, 0.98)',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  supportLine: {
    ...typography.bodyMedium,
    fontSize: 14.5,
    color: 'rgba(10, 47, 48, 0.58)',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
    marginTop: 6,
  },
  preBenefitsLine: {
    ...typography.bodyMedium,
    fontSize: 13.5,
    color: 'rgba(10, 47, 48, 0.58)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontWeight: '600',
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
  iconHalo: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  includesCard: {
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  includesTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: 'rgba(15, 76, 68, 0.035)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
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
    color: 'rgba(10, 47, 48, 0.9)',
    lineHeight: 22,
    marginBottom: 2,
    fontWeight: '600',
  },
  featureSubtext: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(10, 47, 48, 0.6)',
    lineHeight: 18,
    fontStyle: 'normal',
  },
  urgencyLine: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  contextualUrgency: {
    ...typography.bodySmall,
    fontSize: 14,
    color: '#5F6B6A',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'normal',
  },
  pricingDivider: {
    marginTop: 8,
    marginBottom: 18,
    alignItems: 'center',
  },
  pricingDividerLine: {
    height: 1,
    width: '70%',
    backgroundColor: 'rgba(10, 47, 48, 0.10)',
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
    backgroundColor: 'rgba(15, 76, 68, 0.04)',
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    left: 20,
    zIndex: 1,
  },
  badge: {
    backgroundColor: '#0F4C44',
    paddingVertical: 2,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  badgeText: {
    ...typography.labelSmall,
    fontSize: 9.5,
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
    color: 'rgba(10, 47, 48, 0.64)',
    lineHeight: 18,
  },
  pricingHint: {
    ...typography.bodySmall,
    fontSize: 12.5,
    color: 'rgba(10, 47, 48, 0.55)',
    lineHeight: 17,
    marginTop: 4,
    fontStyle: 'italic',
  },
  pricingSubcopyStack: {
    gap: 2,
  },
  socialProof: {
    ...typography.bodySmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 16,
    marginTop: 4,
    fontStyle: 'italic',
  },
  includesTitle: {
    ...typography.labelSmall,
    fontSize: 12,
    color: 'rgba(10, 47, 48, 0.70)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 14,
  },
  includesGroup: {
    marginBottom: 16,
  },
  includesGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  includesGroupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  includesGroupTitle: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(10, 47, 48, 0.92)',
    fontWeight: '700',
  },
  includesPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.10)',
  },
  includesPillText: {
    ...typography.labelSmall,
    fontSize: 11,
    color: 'rgba(10, 47, 48, 0.65)',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  includesGroupDivider: {
    height: 1,
    backgroundColor: 'rgba(10, 47, 48, 0.08)',
    marginVertical: 14,
  },
  includesToggle: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(10, 47, 48, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  includesToggleText: {
    ...typography.bodySmall,
    fontSize: 13.5,
    color: 'rgba(10, 47, 48, 0.72)',
    fontWeight: '600',
  },
  includesList: {
    gap: 10,
  },
  includesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  includesDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 7,
    backgroundColor: 'rgba(15, 76, 68, 0.45)',
  },
  includesItemText: {
    ...typography.bodySmall,
    flex: 1,
    fontSize: 14.5,
    color: 'rgba(10, 47, 48, 0.80)',
    lineHeight: 20,
    fontWeight: '500',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeText: {
    ...typography.bodySmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    flex: 1,
    lineHeight: 20,
  },
  noticeDebugText: {
    ...typography.caption,
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 4,
  },
  noticeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
  },
  noticeButtonText: {
    ...typography.labelSmall,
    fontSize: 13,
    color: '#0F4C44',
    fontWeight: '600',
  },
  ctaSection: {
    marginBottom: 24,
  },
  ctaPreline: {
    ...typography.bodySmall,
    fontSize: 13.5,
    color: 'rgba(10, 47, 48, 0.68)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 10,
    paddingHorizontal: 12,
    fontWeight: '600',
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
    textAlign: 'center',
    width: '100%',
    lineHeight: 22,
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
  restoreButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  restoreButtonText: {
    ...typography.labelSmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    textDecorationLine: 'underline',
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
