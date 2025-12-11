/**
 * Home Screen - Hangover Shield
 * Main entry point with call to action for check-in
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from '../navigation/types';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleCheckIn = () => {
    navigation.navigate('CheckIn');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.deepTeal + '20', 'transparent']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Hangover Shield
          </Text>
        </View>

        <View style={styles.ctaContainer}>
          <Text style={[styles.ctaTitle, { color: theme.colors.text }]}>
            How do you feel today?
          </Text>
          <Text style={[styles.ctaSubtitle, { color: theme.colors.textSecondary }]}>
            Start your personalized recovery plan
          </Text>
          
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: theme.colors.deepTeal }]}
            onPress={handleCheckIn}
          >
            <LinearGradient
              colors={[theme.colors.deepTeal, theme.colors.deepTealDark]}
              style={styles.buttonGradient}
            >
              <Text style={[styles.ctaButtonText, { color: theme.colors.pureWhite }]}>
                Start Check-In
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={[styles.quickActions, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.quickActionsTitle, { color: theme.colors.textSecondary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.surfaceElevated }]}
              onPress={() => navigation.navigate('SmartPlan')}
            >
              <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>
                Smart Plan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.surfaceElevated }]}
              onPress={() => navigation.navigate('Tools')}
            >
              <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>
                Tools
              </Text>
            </TouchableOpacity>
          </View>
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
  header: {
    marginBottom: 48,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
  },
  ctaContainer: {
    marginBottom: 32,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    borderRadius: 16,
    padding: 20,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
