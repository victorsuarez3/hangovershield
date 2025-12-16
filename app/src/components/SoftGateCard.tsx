/**
 * Soft Gate Card - Hangover Shield
 * Inline upgrade prompt that appears within content to drive conversions
 *
 * Usage: Show at the boundary between free and premium content
 * Design: Calm, minimal, non-intrusive
 *
 * CRITICAL: Only use PaywallSource constants for source param
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Analytics } from '../utils/analytics';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { PaywallSourceType } from '../constants/paywallSources';

interface SoftGateCardProps {
  title: string;
  description: string;
  source: PaywallSourceType; // MUST use PaywallSource constants
  contextScreen: string; // Screen name for analytics
}

export const SoftGateCard: React.FC<SoftGateCardProps> = ({
  title,
  description,
  source,
  contextScreen,
}) => {
  const navigation = useNavigation();
  const accessInfo = useAccessStatus();
  const hasLoggedImpression = useRef(false);

  // Don't show if user has full access (Premium OR Welcome 24h)
  if (accessInfo.hasFullAccess) {
    return null;
  }

  const handleUpgrade = () => {
    Analytics.logAnalyticsEvent('soft_gate_cta_clicked', {
      source,
      contextScreen,
      accessStatus: accessInfo.status,
    });

    navigation.navigate('Paywall' as any, {
      source,
      contextScreen,
    });
  };

  // Log soft gate shown (ONCE per mount - prevent duplicate events)
  useEffect(() => {
    if (!hasLoggedImpression.current) {
      Analytics.logAnalyticsEvent('soft_gate_shown', {
        source,
        contextScreen,
        accessStatus: accessInfo.status,
      });
      hasLoggedImpression.current = true;
    }
  }, [source, contextScreen, accessInfo.status]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed" size={18} color="rgba(15, 76, 68, 0.5)" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleUpgrade}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>Unlock</Text>
        <Ionicons name="arrow-forward" size={14} color="#0F4C44" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.12)',
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0F3D3E',
    marginBottom: 2,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.6)',
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0F4C44',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0F4C44',
  },
});
