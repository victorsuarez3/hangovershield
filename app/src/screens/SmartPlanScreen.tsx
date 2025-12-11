/**
 * Smart Plan Screen - Hangover Shield
 * Placeholder for Today's Recovery Plan
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SmartPlanScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Today's Recovery Plan
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Your personalized recovery schedule
        </Text>
        <View style={[styles.placeholder, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.placeholderText, { color: theme.colors.textTertiary }]}>
            Smart Plan coming soon
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
  },
  placeholder: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
});



