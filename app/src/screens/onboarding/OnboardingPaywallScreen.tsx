/**
 * Onboarding Recovery Plan Intro Screen - Hangover Shield
 * Introduction screen before showing the recovery plan
 * No paywall here - paywall appears mid-plan in TodayRecoveryPlanScreen
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
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { typography } from '../../design-system/typography';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type OnboardingPaywallRouteProp = RouteProp<
  OnboardingStackParamList,
  'OnboardingPaywall'
>;

export const OnboardingPaywallScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<OnboardingPaywallRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();

  // Get assessment data from route params
  const feeling = route.params?.feeling ?? 'none';
  const symptoms = route.params?.symptoms ?? [];

  const handleContinue = () => {
    // Navigate directly to PlanLoading (which then goes to TodayRecoveryPlan)
    navigation.replace('PlanLoading', {
      feeling,
      symptoms,
    });
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
          <Text style={styles.subtitle}>
            Based on your symptoms today, here's how you can recover faster.
          </Text>
          <Text style={styles.subtitle}>
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

        {/* Social Proof */}
        <View style={styles.socialProofSection}>
          <Text style={styles.socialProofText}>
            People who follow personalized recovery guidance feel better 30–50% faster.
          </Text>
          <Text style={styles.planReadyText}>Your recovery plan for today is ready.</Text>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Continue to today's recovery plan</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
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
    fontSize: 30,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
    maxWidth: '90%',
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    marginHorizontal: 12,
    marginBottom: 32,
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
    lineHeight: 22,
    flex: 1,
  },
  socialProofSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  socialProofText: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.75)',
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 32,
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
    gap: 8,
    width: '100%',
  },
  ctaText: {
    ...typography.button,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
