/**
 * Onboarding Paywall Screen - Hangover Shield
 * Premium paywall screen matching modern high-conversion wellness apps
 * Matches Step 3 styling for seamless experience
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { typography } from '../../design-system/typography';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type SubscriptionPlan = 'yearly' | 'monthly';

type OnboardingPaywallRouteProp = RouteProp<
  OnboardingStackParamList,
  'OnboardingPaywall'
>;

export const OnboardingPaywallScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<OnboardingPaywallRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');

  // Get assessment data from route params (with fallback for direct navigation)
  const feeling = route.params?.feeling ?? 'none';
  const symptoms = route.params?.symptoms ?? [];

  const handleContinue = () => {
    // TODO: Connect actual purchase logic here
    // For now, simulate successful purchase and navigate to loading screen
    console.log('Selected plan:', selectedPlan);
    console.log('Processing purchase...');

    // After successful purchase, navigate to PlanLoading screen
    // This simulates the purchase success flow
    navigation.replace('PlanLoading', {
      feeling,
      symptoms,
    });
  };

  const handleRestorePurchases = () => {
    // TODO: Implement restore purchases
    console.log('Restore purchases');
  };

  const handlePrivacyPolicy = () => {
    // TODO: Open privacy policy modal or web view
    console.log('Privacy Policy');
  };

  const handleTermsOfUse = () => {
    // TODO: Open terms modal or web view
    console.log('Terms of Use');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

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
          <Text style={styles.headline}>Feel better faster — starting today.</Text>
          <Text style={styles.mirrorText}>
            Based on your symptoms today, here's how you can recover faster.
          </Text>
          <Text style={styles.subheadline}>
            Your personalized recovery plan is ready — tailored to how your body feels right now.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresCard}>
          <FeatureRow
            icon="sparkles-outline"
            text="Personalized daily recovery plan — made for how your body feels each morning."
          />
          <FeatureRow
            icon="flask-outline"
            text="Clear, science-based steps — know exactly what to do next."
          />
          <FeatureRow
            icon="time-outline"
            text="Recovery timeline tracking — see your improvement in real time."
          />
          <FeatureRow
            icon="water-outline"
            text="Hydration + nervous system tools — feel calmer and more balanced."
          />
        </View>

        {/* Social Proof - Moved above pricing */}
        <View style={styles.socialProofSection}>
          <Text style={styles.socialProofText}>
            People who follow personalized recovery guidance feel better 30–50% faster.
          </Text>
          <Text style={styles.planReadyText}>Your recovery plan for today is ready.</Text>
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
          >
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>MOST POPULAR</Text>
              </View>
            </View>
            <View style={styles.radioContainer}>
              <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioSelected]}>
                {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.pricingAmount}>$29.99</Text>
            <Text style={styles.pricingPeriod}>/ year</Text>
            <Text style={styles.pricingSubtext}>Save 58% — feel better all year.</Text>
            <Text style={styles.pricingMicrocopy}>Most users choose this option for faster long-term results.</Text>
          </Pressable>

          {/* Monthly Option */}
          <Pressable
            style={[
              styles.pricingCard,
              selectedPlan === 'monthly' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioSelected]}>
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.pricingAmount}>$4.99</Text>
            <Text style={styles.pricingPeriod}>/ month</Text>
            <Text style={styles.pricingSubtext}>Try it risk-free — full access, cancel anytime.</Text>
          </Pressable>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Unlock Today's Recovery Plan</Text>
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>Start feeling better within minutes, your body will thank you.</Text>
          <Text style={styles.anxietyReductionText}>
            No risk. Cancel anytime. Your health comes first.
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
          <Pressable onPress={handleRestorePurchases} style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Restore Purchases</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

// Feature Row Component
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32, // +32 spacing
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24, // +24 spacing
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(15, 61, 62, 0.08)', // Soft glow effect
    zIndex: -1,
  },
  headline: {
    ...typography.sectionTitle,
    fontSize: 30,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 16, // +16 spacing
    lineHeight: 36,
  },
  mirrorText: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8, // +8 spacing between paragraphs
    maxWidth: '90%',
  },
  subheadline: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    marginHorizontal: 12,
    marginBottom: 32, // +32 spacing
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 22.08, // 1.38 line-height for readability
    flex: 1,
  },
  pricingSection: {
    marginBottom: 40, // Increased spacing to make pricing visually higher priority than CTA
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    marginBottom: 16, // +16 spacing between cards
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Gray light border for monthly (no shadow)
    shadowColor: 'transparent', // No shadow for monthly
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 0,
    elevation: 0, // No elevation for monthly
    position: 'relative',
    minHeight: 140,
  },
  pricingCardHighlighted: {
    borderColor: '#0F4C44', // Dark green border for yearly
    borderWidth: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: 'rgba(0, 0, 0, 0.06)', // Soft shadow for yearly
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  pricingCardSelected: {
    borderColor: '#0A3F37',
    borderWidth: 3,
    shadowColor: 'rgba(0, 0, 0, 0.06)', // Add shadow when selected
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    left: 20,
    zIndex: 1,
  },
  badge: {
    backgroundColor: '#0F4C44',
    paddingVertical: 3, // Reduced padding for smaller, more discrete badge
    paddingHorizontal: 10, // Reduced padding for smaller badge
    borderRadius: 10,
  },
  badgeText: {
    ...typography.labelSmall,
    fontSize: 10, // Smaller font size for more discrete badge
    color: '#FFFFFF',
    letterSpacing: 0.3, // Reduced letter spacing
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
    fontSize: 32,
    color: 'rgba(0, 0, 0, 0.9)',
    marginTop: 8,
    marginBottom: 4,
  },
  pricingPeriod: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 8,
  },
  pricingSubtext: {
    ...typography.bodySmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 20,
    marginBottom: 4,
  },
  pricingMicrocopy: {
    ...typography.bodySmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 4,
  },
  socialProofSection: {
    alignItems: 'center',
    marginBottom: 24, // +24 spacing before pricing cards
    paddingHorizontal: 16,
  },
  socialProofText: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.75)',
    textAlign: 'center',
    lineHeight: 22.08,
    marginBottom: 12,
    maxWidth: '90%',
  },
  planReadyText: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaSection: {
    marginBottom: 32, // +32 spacing
  },
  ctaButton: {
    backgroundColor: '#0A3F37', // Dark teal matching Step 3
    borderRadius: 15,
    height: 56, // 54-58px height
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
  ctaText: {
    ...typography.button,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600', // Semibold
  },
  ctaSubtext: {
    ...typography.bodySmall,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '85%',
    alignSelf: 'center',
    marginBottom: 8, // +8 spacing
  },
  anxietyReductionText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: '85%',
    alignSelf: 'center',
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

