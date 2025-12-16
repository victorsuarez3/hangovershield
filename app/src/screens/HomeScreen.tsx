/**
 * Home Screen - Hangover Shield
 * Main entry point with call to action for check-in
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppMenuSheet, CurrentScreen } from '../components/AppMenuSheet';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { WelcomeCountdownBanner } from '../components/WelcomeCountdownBanner';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const accessInfo = useAccessStatus();
  
  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentScreen] = useState<CurrentScreen>('home');

  const handleCheckIn = () => {
    navigation.navigate('CheckIn');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Menu Navigation Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleGoToHome = useCallback(() => {
    // Reset to Home tab root
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  }, [navigation]);

  const handleGoToToday = useCallback(() => {
    // Navigate to SmartPlan tab
    navigation.navigate('SmartPlan');
  }, [navigation]);

  const handleGoToProgress = useCallback(() => {
    navigation.navigate('Progress');
  }, [navigation]);

  const handleGoToCheckIn = useCallback(() => {
    // Navigate to CheckIn screen in Home stack
    navigation.navigate('CheckIn');
  }, [navigation]);

  const handleGoToWaterLog = useCallback(() => {
    // Navigate to DailyWaterLog screen in Home stack
    navigation.navigate('DailyWaterLog');
  }, [navigation]);

  const handleGoToEveningCheckIn = useCallback(() => {
    // Navigate to EveningCheckIn screen in Home stack
    // Screen will redirect to paywall if no access
    navigation.navigate('EveningCheckIn');
  }, [navigation]);

  const handleGoToEveningCheckInLocked = useCallback(() => {
    // Not used anymore - EveningCheckIn handles paywall redirect
    navigation.navigate('EveningCheckIn');
  }, [navigation]);

  const handleGoToSubscription = useCallback((source: string) => {
    // Navigate to Paywall screen in Home stack
    navigation.navigate('Paywall', { source });
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.deepTeal + '20', 'transparent']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header with Menu Button */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Hangover Shield
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surfaceElevated }]}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color={theme.colors.deepTeal} />
        </TouchableOpacity>
      </View>

      {/* Welcome Countdown Banner */}
      <WelcomeCountdownBanner />

      <View style={styles.content}>
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
              <Ionicons name="sunny-outline" size={24} color={theme.colors.deepTeal} style={styles.actionIcon} />
              <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>
                Recovery Plan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.surfaceElevated }]}
              onPress={() => navigation.navigate('Progress')}
            >
              <Ionicons name="stats-chart-outline" size={24} color={theme.colors.deepTeal} style={styles.actionIcon} />
              <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>
                Progress
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* App Menu Sheet */}
      <AppMenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onGoToHome={handleGoToHome}
        onGoToToday={handleGoToToday}
        onGoToProgress={handleGoToProgress}
        onGoToCheckIn={handleGoToCheckIn}
        onGoToWaterLog={handleGoToWaterLog}
        onGoToEveningCheckIn={handleGoToEveningCheckIn}
        onGoToEveningCheckInLocked={handleGoToEveningCheckInLocked}
        onGoToSubscription={handleGoToSubscription}
        currentScreen={currentScreen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
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
  actionIcon: {
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
