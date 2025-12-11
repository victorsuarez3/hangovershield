/**
 * Legal Content Components
 * Terms of Service and Privacy Policy content for modals
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export const TermsOfServiceContent: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>
        Welcome to Hangover Shield. By using our app and services, you agree to
        these Terms of Service. Please read them carefully.
      </Text>

      <Section title="Use of the App" styles={styles}>
        Hangover Shield provides wellness guidance and recovery protocols based
        on scientific research. The app is designed to support your recovery
        journey and is not a substitute for professional medical advice,
        diagnosis, or treatment.
      </Section>

      <Section title="Not Medical Advice" styles={styles}>
        The information provided by Hangover Shield is for general wellness
        purposes only. Always consult with a qualified healthcare provider for
        medical concerns, especially if you have underlying health conditions.
        Never disregard professional medical advice or delay seeking it because
        of something you read in the app.
      </Section>

      <Section title="User Responsibilities" styles={styles}>
        You are responsible for maintaining the confidentiality of your account
        and for all activities that occur under your account. You agree to use
        the app only for lawful purposes and in accordance with these Terms.
        You must not misuse the app or attempt to gain unauthorized access.
      </Section>

      <Section title="Subscriptions & Billing" styles={styles}>
        Access to Smart Plan features requires a paid subscription. Subscriptions
        automatically renew unless cancelled at least 24 hours before the
        renewal date. Refunds are handled according to App Store and Google
        Play policies. You can manage your subscription through your device's
        settings.
      </Section>

      <Section title="Limitation of Liability" styles={styles}>
        Hangover Shield is provided "as is" without warranties of any kind.
        We do not guarantee that the app will be error-free or uninterrupted.
        To the fullest extent permitted by law, Hangover Shield shall not be
        liable for any indirect, incidental, or consequential damages arising
        from your use of the app.
      </Section>

      <Section title="Contact" styles={styles}>
        If you have questions about these Terms, please contact us at{' '}
        <Text style={styles.link}>support@hangovershield.co</Text>
      </Section>

      <Text style={styles.lastUpdated}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Text>
    </View>
  );
};

export const PrivacyPolicyContent: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>
        At Hangover Shield, we take your privacy seriously. This Privacy Policy
        explains how we collect, use, and protect your personal information when
        you use our app and services.
      </Text>

      <Section title="Information We Collect" styles={styles}>
        We collect information you provide directly to us, including your email
        address (for account creation via Google/Apple Sign-In), display name, and
        profile photo. We also collect usage data such as recovery plans
        accessed, settings preferences, and app interactions to improve your
        experience.
      </Section>

      <Section title="How We Use Your Data" styles={styles}>
        Your information is used to provide and improve our services, send you
        important updates about the app, and personalize your recovery
        experience. We use your data to generate personalized recovery plans
        and track your progress. We never sell your personal data to third
        parties.
      </Section>

      <Section title="Third-Party Services" styles={styles}>
        We use third-party services to operate the app:
        {'\n\n'}
        • Google Sign-In and Apple Sign-In for authentication
        {'\n'}
        • Firebase (Google) for data storage and analytics
        {'\n'}
        • App Store and Google Play for subscription management
        {'\n\n'}
        These services have their own privacy policies governing the use of your
        information.
      </Section>

      <Section title="Data Security" styles={styles}>
        We implement appropriate security measures to protect your personal
        information. All data transmission is encrypted, and we use Firebase's
        secure infrastructure. However, no method of transmission over the
        internet is 100% secure, and we cannot guarantee absolute security.
      </Section>

      <Section title="Data Retention" styles={styles}>
        We retain your personal information for as long as your account is active
        or as needed to provide services. If you delete your account, we will
        delete or anonymize your personal data within 30 days, except where we
        are required to retain it by law.
      </Section>

      <Section title="Your Rights" styles={styles}>
        You have the right to access, update, or delete your personal
        information at any time through the app settings or by contacting us.
        You can also opt out of certain data collection by adjusting your
        device settings.
      </Section>

      <Section title="Contact" styles={styles}>
        For privacy-related questions or requests, contact us at{' '}
        <Text style={styles.link}>privacy@hangovershield.co</Text>
      </Section>

      <Text style={styles.lastUpdated}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Text>
    </View>
  );
};

const Section: React.FC<{ title: string; styles: any; children: React.ReactNode }> = ({
  title,
  styles,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionText}>{children}</Text>
  </View>
);

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      gap: 24,
      minHeight: 200,
    },
    intro: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.deepTeal,
      fontFamily: 'Inter_400Regular',
      opacity: 0.9,
    },
    section: {
      gap: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.deepTeal,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: -0.2,
      marginTop: 4,
    },
    sectionText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.deepTeal,
      fontFamily: 'Inter_400Regular',
      opacity: 0.8,
    },
    link: {
      color: theme.colors.deepTeal,
      fontFamily: 'Inter_600SemiBold',
      textDecorationLine: 'underline',
    },
    lastUpdated: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.deepTeal,
      fontFamily: 'Inter_400Regular',
      opacity: 0.6,
      marginTop: 8,
      fontStyle: 'italic',
    },
  });

