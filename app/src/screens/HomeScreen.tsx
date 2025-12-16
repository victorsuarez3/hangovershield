/**
 * Home Screen - Hangover Shield
 * Main dashboard with widgets for daily check-in, water log, progress, recovery plan, and evening check-in
 * Premium design consistent with app's calm, soothing aesthetic
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppMenuSheet, CurrentScreen } from '../components/AppMenuSheet';
import { AppHeader } from '../components/AppHeader';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { useDailyCheckIn } from '../hooks/useDailyCheckIn';
import { useAuth } from '../providers/AuthProvider';
import { useAppNavigation } from '../contexts/AppNavigationContext';
import { WelcomeCountdownBanner } from '../components/WelcomeCountdownBanner';
import { PaywallSource } from '../constants/paywallSources';
import { Analytics } from '../utils/analytics';
import {
  getTodayHydrationLog,
  getHydrationGoal,
} from '../services/hydrationService';
import {
  getRecentCheckIns,
  calculateStreak,
  countCompletedInLastDays,
} from '../services/dailyCheckIn';
import { getTodayId } from '../utils/dateUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type WidgetType =
  | 'daily_checkin'
  | 'water_log'
  | 'progress'
  | 'recovery_plan'
  | 'evening_checkin';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const accessInfo = useAccessStatus();
  const appNav = useAppNavigation();

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentScreen] = useState<CurrentScreen>('home');

  // Daily check-in status
  const dailyCheckIn = useDailyCheckIn(user?.uid || null);

  // Hydration state
  const [hydrationGoal, setHydrationGoal] = useState(1500);
  const [hydrationLogged, setHydrationLogged] = useState(0);

  // Progress state
  const [streak, setStreak] = useState(0);
  const [completedLast7Days, setCompletedLast7Days] = useState(0);

  // Load hydration data
  useEffect(() => {
    const loadHydrationData = async () => {
      if (!user?.uid) return;

      try {
        const goal = await getHydrationGoal(user.uid);
        setHydrationGoal(goal);

        const todayLogs = await getTodayHydrationLog(user.uid);
        const totalMl = todayLogs.reduce((sum, entry) => sum + entry.amountMl, 0);
        setHydrationLogged(totalMl);
      } catch (error) {
        console.error('[HomeScreen] Error loading hydration data:', error);
      }
    };

    loadHydrationData();
  }, [user?.uid]);

  // Load progress data
  useEffect(() => {
    const loadProgressData = async () => {
      if (!user?.uid) return;

      try {
        const checkIns = await getRecentCheckIns({ uid: user.uid, limit: 14 });
        const todayId = getTodayId();
        const currentStreak = calculateStreak(checkIns, todayId);
        const completed7Days = countCompletedInLastDays(checkIns, todayId, 7);

        setStreak(currentStreak);
        setCompletedLast7Days(completed7Days);
      } catch (error) {
        console.error('[HomeScreen] Error loading progress data:', error);
      }
    };

    loadProgressData();
  }, [user?.uid]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Analytics Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const logWidgetClick = useCallback((widget: WidgetType) => {
    Analytics.homeWidgetClicked(widget, accessInfo.status, 'HomeScreen');
  }, [accessInfo.status]);

  const navigateToPaywall = useCallback((source: string) => {
    Analytics.paywallOpened(source, 'HomeScreen', accessInfo.status);
    navigation.navigate('Paywall', {
      source,
      contextScreen: 'HomeScreen',
    });
  }, [navigation, accessInfo.status]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Navigation Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleGoToHome = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeMain' }],
      })
    );
  }, [navigation]);

  const handleGoToToday = useCallback(() => {
    navigation.navigate('SmartPlan');
  }, [navigation]);

  const handleGoToProgress = useCallback(() => {
    navigation.navigate('Progress');
  }, [navigation]);

  const handleGoToCheckIn = useCallback(() => {
    // Use global navigation to ensure it works from any context
    appNav.goToDailyCheckIn();
  }, [appNav]);

  const handleGoToWaterLog = useCallback(() => {
    navigation.navigate('DailyWaterLog');
  }, [navigation]);

  const handleGoToEveningCheckIn = useCallback(() => {
    if (accessInfo.hasFullAccess) {
      navigation.navigate('EveningCheckIn');
    } else {
      navigateToPaywall(PaywallSource.EVENING_CHECKIN_LOCKED);
    }
  }, [navigation, accessInfo.hasFullAccess, navigateToPaywall]);

  const handleGoToEveningCheckInLocked = useCallback(() => {
    navigateToPaywall(PaywallSource.EVENING_CHECKIN_LOCKED);
  }, [navigateToPaywall]);

  const handleGoToSubscription = useCallback((source: string) => {
    navigateToPaywall(source);
  }, [navigateToPaywall]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Widget Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleDailyCheckInPress = useCallback(() => {
    logWidgetClick('daily_checkin');
    handleGoToCheckIn();
  }, [logWidgetClick, handleGoToCheckIn]);

  const handleWaterLogPress = useCallback(() => {
    logWidgetClick('water_log');
    handleGoToWaterLog();
  }, [logWidgetClick, handleGoToWaterLog]);

  const handleProgressPress = useCallback(() => {
    logWidgetClick('progress');
    handleGoToProgress();
  }, [logWidgetClick, handleGoToProgress]);

  const handleRecoveryPlanPress = useCallback(() => {
    logWidgetClick('recovery_plan');
    handleGoToToday();
  }, [logWidgetClick, handleGoToToday]);

  const handleEveningCheckInPress = useCallback(() => {
    logWidgetClick('evening_checkin');
    handleGoToEveningCheckIn();
  }, [logWidgetClick, handleGoToEveningCheckIn]);

  const handleUpgradePress = useCallback(() => {
    navigateToPaywall(PaywallSource.HOME_UPGRADE_BANNER);
  }, [navigateToPaywall]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────────

  const hydrationProgressText = useMemo(() => {
    const liters = (hydrationLogged / 1000).toFixed(1);
    const goalLiters = (hydrationGoal / 1000).toFixed(1);
    return `${liters}L of ${goalLiters}L`;
  }, [hydrationLogged, hydrationGoal]);

  const isCheckInCompleted = dailyCheckIn.status === 'completed_today';

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.deepTeal + '20', 'transparent']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* App Header with Menu */}
      <AppHeader
        title="Hangover Shield"
        showMenuButton
        onMenuPress={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome 24h Banner */}
        <WelcomeCountdownBanner />

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            QUICK ACTIONS
          </Text>

          {/* Daily Check-In Widget */}
          <TouchableOpacity
            style={[styles.widgetCard, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={handleDailyCheckInPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="heart-outline" size={24} color={theme.colors.deepTeal} />
            </View>
            <View style={styles.widgetContent}>
              <Text style={[styles.widgetTitle, { color: theme.colors.text }]}>
                Daily check-in
              </Text>
              <Text style={[styles.widgetSubtitle, { color: theme.colors.textSecondary }]}>
                Update how you're feeling today.
              </Text>
            </View>
            {isCheckInCompleted ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>Completed</Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            )}
          </TouchableOpacity>

          {/* Water Log Widget */}
          <TouchableOpacity
            style={[styles.widgetCard, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={handleWaterLogPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="water-outline" size={24} color={theme.colors.deepTeal} />
            </View>
            <View style={styles.widgetContent}>
              <Text style={[styles.widgetTitle, { color: theme.colors.text }]}>
                Water log
              </Text>
              <Text style={[styles.widgetSubtitle, { color: theme.colors.textSecondary }]}>
                {hydrationLogged > 0 ? hydrationProgressText : 'Tap to log water.'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          {/* Progress & History Widget */}
          <TouchableOpacity
            style={[styles.widgetCard, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={handleProgressPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="stats-chart-outline" size={24} color={theme.colors.deepTeal} />
            </View>
            <View style={styles.widgetContent}>
              <Text style={[styles.widgetTitle, { color: theme.colors.text }]}>
                Progress & history
              </Text>
              <Text style={[styles.widgetSubtitle, { color: theme.colors.textSecondary }]}>
                {streak > 0 || completedLast7Days > 0
                  ? `${streak} day streak • ${completedLast7Days} check-ins this week`
                  : 'Track your streak and recent days.'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          {/* Today's Recovery Plan Widget */}
          <TouchableOpacity
            style={[styles.widgetCard, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={handleRecoveryPlanPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="sunny-outline" size={24} color={theme.colors.deepTeal} />
            </View>
            <View style={styles.widgetContent}>
              <Text style={[styles.widgetTitle, { color: theme.colors.text }]}>
                Today's recovery plan
              </Text>
              <Text style={[styles.widgetSubtitle, { color: theme.colors.textSecondary }]}>
                See today's steps and hydration goals.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          {/* Evening Check-In Widget */}
          <TouchableOpacity
            style={[styles.widgetCard, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={handleEveningCheckInPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="moon-outline" size={24} color={theme.colors.deepTeal} />
            </View>
            <View style={styles.widgetContent}>
              <Text style={[styles.widgetTitle, { color: theme.colors.text }]}>
                Evening check-in
              </Text>
              <Text style={[styles.widgetSubtitle, { color: theme.colors.textSecondary }]}>
                {accessInfo.hasFullAccess
                  ? 'Track your evening recovery.'
                  : 'Premium feature • Unlock to access'}
              </Text>
            </View>
            {!accessInfo.hasFullAccess && (
              <View style={styles.lockIcon}>
                <Ionicons name="lock-closed" size={16} color={theme.colors.textTertiary} />
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Premium Hook (for free users) */}
        {accessInfo.isFree && (
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={handleUpgradePress}
            activeOpacity={0.7}
          >
            <View style={styles.upgradeIconContainer}>
              <Ionicons name="sparkles-outline" size={24} color={theme.colors.deepTeal} />
            </View>
            <View style={styles.upgradeContent}>
              <Text style={[styles.upgradeTitle, { color: theme.colors.text }]}>
                Upgrade to Premium
              </Text>
              <Text style={[styles.upgradeSubtitle, { color: theme.colors.textSecondary }]}>
                Unlock evening check-ins, insights & more
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.deepTeal} />
          </TouchableOpacity>
        )}
      </ScrollView>

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

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  quickActionsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  widgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  widgetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 63, 70, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  widgetContent: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  widgetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusPill: {
    backgroundColor: 'rgba(122, 180, 139, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7AB48B',
  },
  lockIcon: {
    marginRight: 8,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(15, 63, 70, 0.2)',
  },
  upgradeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 63, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  upgradeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
