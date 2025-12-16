/**
 * Locked Section - Hangover Shield
 * Wrapper that shows content with blur/opacity for free users
 *
 * Design: Subtle visual hint that content exists but is locked
 * UX: User can see shape/structure but not read details
 *
 * CRITICAL: Shows unlocked for Premium AND Welcome (24h) users
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { Analytics } from '../utils/analytics';

interface LockedSectionProps {
  children: React.ReactNode;
  feature: string; // For analytics (e.g., "recovery_plan_advanced")
  contextScreen: string;
  style?: ViewStyle;
  blurIntensity?: number;
}

export const LockedSection: React.FC<LockedSectionProps> = ({
  children,
  feature,
  contextScreen,
  style,
  blurIntensity = 20,
}) => {
  const accessInfo = useAccessStatus();
  const hasLoggedImpression = useRef(false);

  // If user has full access (Premium OR Welcome 24h), show content normally
  if (accessInfo.hasFullAccess) {
    return <View style={style}>{children}</View>;
  }

  // Log locked section impression (ONCE per mount - prevent duplicate events)
  useEffect(() => {
    if (!hasLoggedImpression.current) {
      Analytics.logAnalyticsEvent('locked_section_shown', {
        feature,
        contextScreen,
        accessStatus: accessInfo.status,
      });
      hasLoggedImpression.current = true;
    }
  }, [feature, contextScreen, accessInfo.status]);

  const handleTap = () => {
    Analytics.logAnalyticsEvent('locked_section_tapped', {
      feature,
      contextScreen,
      accessStatus: accessInfo.status,
    });
  };

  // For free users, show blurred content
  return (
    <View style={[styles.container, style]} onTouchEnd={handleTap}>
      <View style={styles.contentWrapper}>
        <View style={{ opacity: 0.3 }}>{children}</View>
      </View>
      <BlurView
        intensity={blurIntensity}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  contentWrapper: {
    pointerEvents: 'none',
  },
});
