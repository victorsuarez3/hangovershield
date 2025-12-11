/**
 * Home Header Component - Ultra-Premium Casa Latina
 * Editorial-grade header with luxury typography and spacing
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../i18n';

interface HomeHeaderProps {
  userName?: string;
  city?: string;
  onNotificationPress?: () => void;
  onCityPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Victor',
  city = 'Miami',
  onNotificationPress,
  onCityPress,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top);

  return (
    <View style={styles.container}>
      {/* CASA LATINA · MIAMI - Premium typography */}
      <Text style={styles.brandLabel}>
        {t('home_location_label')}
      </Text>

      {/* Good evening, {firstName} - Primary hero heading */}
      <Text style={styles.primaryGreeting}>
        {t('home_greeting', { name: userName })}
      </Text>

      {/* Home of Latin Culture & Creators - Subheadline */}
      <Text style={styles.cultureSubtitle}>
        {t('home_subtitle')}
      </Text>

      {/* Founding member badge - Enhanced premium design */}
      <View style={styles.badgeContainer}>
        <View style={styles.memberBadge}>
          <Ionicons name="diamond" size={12} color={theme.colors.primary} style={styles.badgeIcon} />
          <Text style={styles.memberBadgeText}>{t('member_founder')}</Text>
          <View style={styles.badgeGlow} />
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any, topInset: number) => StyleSheet.create({
  container: {
    paddingTop: topInset + theme.spacing.lg, // More breathing room
    paddingBottom: theme.spacing.lg, // Increased
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  // CASA LATINA · MIAMI - Premium typography with small caps effect
  brandLabel: {
    ...theme.typography.labelSmall,
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5, // Premium letter spacing
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm, // Reduced from md to sm for tighter cohesion
    opacity: 0.85, // Slightly reduced opacity for luxury feel
  },
  // Primary hero heading - "Good evening, Victor"
  primaryGreeting: {
    ...theme.typography.heroTitle,
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 48, // Increased line-height for elegance
    letterSpacing: -0.5,
    marginBottom: 14, // 12-16px spacing to subheadline
  },
  // "Home of Latin Culture & Creators" - New subheadline
  cultureSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    marginBottom: 18, // 16-20px spacing to city selector
    opacity: 0.85, // Slightly reduced opacity for luxury feel
  },
  // Founding member badge - Premium enhanced design
  badgeContainer: {
    alignItems: 'flex-start',
  },
  memberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '12', // Ultra subtle background
    borderWidth: 1,
    borderColor: theme.colors.primary + '25',
    paddingHorizontal: theme.spacing.md + 6,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    position: 'relative',
    overflow: 'hidden',
    ...theme.shadows.glow, // Premium glow effect
  },
  badgeIcon: {
    marginTop: 1, // Slight vertical adjustment for perfect alignment
  },
  badgeGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: theme.colors.primary + '05', // Subtle radial glow
    borderRadius: theme.borderRadius.xl,
  },
  memberBadgeText: {
    ...theme.typography.labelSmall,
    color: theme.colors.primary,
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
});
