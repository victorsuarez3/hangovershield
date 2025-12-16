/**
 * Home Screen - Hangover Shield
 * Premium dashboard with hero card and widget grid
 * Consistent with app's calm, premium aesthetic
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppMenuSheet, CurrentScreen } from '../components/AppMenuSheet';
import { AppHeader } from '../components/AppHeader';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { useDailyCheckIn } from '../hooks/useDailyCheckIn';
import { useAuth } from '../providers/AuthProvider';
import { useUserDataStore } from '../stores/useUserDataStore';
import { useAppNavigation } from '../contexts/AppNavigationContext';
import { WelcomeCountdownBanner } from '../components/WelcomeCountdownBanner';
import { PaywallSource } from '../constants/paywallSources';
import { Analytics } from '../utils/analytics';
import {
  getTodayHydrationLog,
  getHydrationGoal,
  addWaterEntry,
} from '../services/hydrationService';
import { createWaterEntry } from '../features/water/waterUtils';
import {
  getRecentCheckIns,
  calculateStreak,
  countCompletedInLastDays,
  getTodayDailyCheckIn,
  deleteTodayDailyCheckIn,
} from '../services/dailyCheckIn';
import { getLocalDailyCheckIn, deleteLocalDailyCheckIn } from '../services/dailyCheckInStorage';
import { getTodayId } from '../utils/dateUtils';
import { typography } from '../design-system/typography';

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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, userDoc } = useAuth();
  const accessInfo = useAccessStatus();
  const appNav = useAppNavigation();
  
  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentScreen] = useState<CurrentScreen>('home');

  // Get user's first name
  const firstName = useMemo(() => {
    const displayName = userDoc?.displayName || '';
    if (displayName) {
      return displayName.split(' ')[0];
    }
    return null;
  }, [userDoc]);

  // Daily check-in status
  const dailyCheckIn = useDailyCheckIn(user?.uid || null);

  // Hydration state
  const [hydrationGoal, setHydrationGoal] = useState(1500);
  const [hydrationLogged, setHydrationLogged] = useState(0);

  // Progress state
  const [streak, setStreak] = useState(0);
  const [completedLast7Days, setCompletedLast7Days] = useState(0);
  
  // Recovery plan state
  const [planStepsLeft, setPlanStepsLeft] = useState<number | null>(null);
  
  // Today's check-in data (for contextual feedback)
  const [todayCheckInData, setTodayCheckInData] = useState<{
    severity?: string;
    drankLastNight?: boolean;
    drinkingToday?: boolean;
  } | null>(null);

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

  // Daily check-in status (computed early for use in effects)
  const isCheckInCompleted = dailyCheckIn.status === 'completed_today';

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

  // Load recovery plan steps (if check-in completed)
  useEffect(() => {
    if (!isCheckInCompleted || !user?.uid) {
      setPlanStepsLeft(null);
      return;
    }

    // For now, we'll use a default value or fetch from service if available
    // In a real implementation, this would fetch from the recovery plan service
    // Default to showing "Pending" if we can't determine
    setPlanStepsLeft(null); // null means we'll show "Pending"
  }, [isCheckInCompleted, user?.uid]);

  // Load today's check-in data for contextual feedback
  useEffect(() => {
    const loadTodayCheckIn = async () => {
      try {
        // Try local first (fast)
        const localCheckIn = await getLocalDailyCheckIn();
        if (localCheckIn) {
          const todayId = getTodayId();
          if (localCheckIn.id === todayId) {
            setTodayCheckInData({
              severity: localCheckIn.level,
              drankLastNight: localCheckIn.drankLastNight,
              drinkingToday: localCheckIn.drinkingToday,
            });
            return;
          }
        }

        // Try Firestore if logged in
        if (user?.uid) {
          const firestoreCheckIn = await getTodayDailyCheckIn(user.uid);
          if (firestoreCheckIn) {
            setTodayCheckInData({
              severity: firestoreCheckIn.severity,
              drankLastNight: firestoreCheckIn.drankLastNight,
              drinkingToday: firestoreCheckIn.drinkingToday,
            });
          }
        }
      } catch (error) {
        console.error('[HomeScreen] Error loading today check-in:', error);
      }
    };

    loadTodayCheckIn();
  }, [user?.uid, isCheckInCompleted]);

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
    navigation.navigate('CheckIn');
  }, [navigation]);

  const handleGoToWaterLog = useCallback(() => {
    navigation.navigate('DailyWaterLog');
  }, [navigation]);

  const handleGoToEveningCheckIn = useCallback(() => {
    if (accessInfo.hasFullAccess) {
    navigation.navigate('EveningCheckIn');
    } else {
      // Navigate to locked screen first, which then shows paywall
      navigation.navigate('EveningCheckInLocked');
    }
  }, [navigation, accessInfo.hasFullAccess]);

  const handleGoToEveningCheckInLocked = useCallback(() => {
    navigateToPaywall(PaywallSource.EVENING_CHECKIN_LOCKED);
  }, [navigateToPaywall]);

  const handleGoToAccount = useCallback(() => {
    navigation.navigate('Account');
  }, [navigation]);

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

  // Quick add water handlers
  const handleQuickAddWater = useCallback(async (amountMl: number) => {
    if (!user?.uid) return;
    
    try {
      // Create water entry inline
      const newEntry = {
        id: `water_${Date.now()}`,
        amountMl,
        timestamp: Date.now(),
      };
      await addWaterEntry(user.uid, newEntry);
      
      // Refresh from service to ensure consistency
      const todayLogs = await getTodayHydrationLog(user.uid);
      const totalMl = todayLogs.reduce((sum, entry) => sum + entry.amountMl, 0);
      setHydrationLogged(totalMl);
    } catch (error) {
      console.error('[HomeScreen] Error adding water:', error);
    }
  }, [user?.uid]);

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

  // Dev function to clear today's check-in
  const handleClearTodayCheckIn = useCallback(async () => {
    try {
      // Clear local storage
      await deleteLocalDailyCheckIn();
      
      // Clear Firestore if logged in
      if (user?.uid) {
        await deleteTodayDailyCheckIn(user.uid);
      }
      
      // Refresh check-in status
      if (dailyCheckIn.refreshCheckInStatus) {
        await dailyCheckIn.refreshCheckInStatus();
      }
      
      // Reload today's check-in data
      setTodayCheckInData(null);
      
      console.log('✓ Today\'s check-in cleared!');
    } catch (error) {
      console.error('Error clearing check-in:', error);
    }
  }, [user?.uid, dailyCheckIn]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────────

  const hydrationProgressText = useMemo(() => {
    const liters = (hydrationLogged / 1000).toFixed(1);
    const goalLiters = (hydrationGoal / 1000).toFixed(1);
    return `${liters}L / ${goalLiters}L`;
  }, [hydrationLogged, hydrationGoal]);

  const hydrationPercent = hydrationGoal > 0 ? (hydrationLogged / hydrationGoal) * 100 : 0;

  // Generate contextual daily feedback
  const contextualFeedback = useMemo(() => {
    const hour = new Date().getHours();
    const isMorning = hour >= 5 && hour < 12;
    const isAfternoon = hour >= 12 && hour < 17;
    const isEvening = hour >= 17;

    if (isCheckInCompleted) {
      if (streak > 0) {
        if (streak >= 3) {
          return "Good choice checking in early.";
        } else if (streak >= 1) {
          return "You're building the habit.";
        }
      }
      
      if (todayCheckInData?.severity === 'none') {
        return "Today looks light — focus on hydration.";
      } else if (todayCheckInData?.severity === 'mild') {
        return "Recovery day ahead. Go slow.";
      } else if (todayCheckInData?.severity === 'moderate' || todayCheckInData?.severity === 'severe') {
        return "Recovery day ahead. Go slow.";
      }
      
      return "Your plan is ready.";
    } else {
      // Not checked in yet
      if (isMorning) {
        return "Start your day right — check in now.";
      } else if (isAfternoon) {
        return "Take a moment to check in.";
      } else {
        return "Check in to see your plan.";
      }
    }
  }, [isCheckInCompleted, streak, todayCheckInData]);

  // Generate progress signal
  const progressSignal = useMemo(() => {
    if (streak > 0) {
      if (streak === 1) {
        return "You checked in yesterday";
      } else {
        return `${streak}-day check-in streak`;
      }
    } else if (completedLast7Days > 0) {
      return "Recovery habit: building";
    }
    return null;
  }, [streak, completedLast7Days]);

  // Generate contextual alcohol question (not always shown)
  const contextualAlcoholQuestion = useMemo(() => {
    // Only show if:
    // 1. Not checked in yet
    // 2. It's afternoon/evening (more relevant)
    // 3. Random chance (30%) to not be annoying
    if (isCheckInCompleted) return null;
    
    const hour = new Date().getHours();
    const isAfternoonOrEvening = hour >= 14;
    
    if (!isAfternoonOrEvening) return null;
    
    // 30% chance to show
    if (Math.random() > 0.3) return null;

    const questions = [
      "Planning to drink later today?",
      "Recovery day or prep day?",
    ];
    
    return questions[Math.floor(Math.random() * questions.length)];
  }, [isCheckInCompleted]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Premium gradient background with vignette for depth */}
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Subtle vignette overlay for premium contrast */}
      <LinearGradient
        colors={['rgba(15,76,68,0.03)', 'transparent', 'rgba(15,76,68,0.05)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* App Header with Menu */}
      <AppHeader
        title="Today"
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
        {/* Premium Header */}
        <View style={styles.premiumHeader}>
          <Text style={styles.welcomeText}>
            Welcome back{firstName ? `, ${firstName}` : ''}
          </Text>
          <Text style={styles.contextualFeedback}>{contextualFeedback}</Text>
          {progressSignal && (
            <Text style={styles.progressSignal}>{progressSignal}</Text>
          )}
          {contextualAlcoholQuestion && (
            <Text style={styles.contextualQuestion}>{contextualAlcoholQuestion}</Text>
          )}
        </View>

        {/* Welcome Banner (only for welcome users, small) */}
        {accessInfo.isWelcome && (
          <View style={styles.welcomeBannerContainer}>
            <WelcomeCountdownBanner />
        </View>
        )}

        {/* Hero Card - Main Focus */}
        <TouchableOpacity
          style={[
            styles.heroCard,
            !isCheckInCompleted && styles.heroCardPending,
          ]}
          onPress={isCheckInCompleted ? handleRecoveryPlanPress : handleDailyCheckInPress}
          activeOpacity={0.9}
        >
          {/* Accent strip for pending state */}
          {!isCheckInCompleted && <View style={styles.heroAccentStrip} />}
          
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroTitle}>
                {isCheckInCompleted ? "You're on track" : "Check in for today"}
              </Text>
              <Text style={styles.heroSubtitle}>
                {isCheckInCompleted
                  ? "Follow your personalized steps to feel better faster."
                  : "Complete your daily check-in to get your personalized recovery plan."}
              </Text>
            </View>

            {/* Status Chips */}
            <View style={styles.heroChips}>
              <View style={styles.chip}>
                <Ionicons
                  name={isCheckInCompleted ? 'checkmark-circle' : 'time-outline'}
                  size={14}
                  color={isCheckInCompleted ? '#7AB48B' : 'rgba(15,76,68,0.5)'}
                />
                <Text style={[
                  styles.chipText,
                  isCheckInCompleted && styles.chipTextCompleted
                ]}>
                  Check-in: {isCheckInCompleted ? 'Completed' : 'Pending'}
                </Text>
              </View>
              {hydrationLogged > 0 && (
                <View style={styles.chip}>
                  <Ionicons name="water" size={14} color="rgba(15,76,68,0.5)" />
                  <Text style={styles.chipText}>{hydrationProgressText}</Text>
                </View>
              )}
            </View>

            {/* Primary CTA Button */}
            <TouchableOpacity
              style={styles.heroButton}
              onPress={(e) => {
                e.stopPropagation();
                if (isCheckInCompleted) {
                  handleRecoveryPlanPress();
                } else {
                  handleDailyCheckInPress();
                }
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0F4C44', '#0A3F37']}
                style={styles.heroButtonGradient}
              >
                <Text style={styles.heroButtonText}>
                  {isCheckInCompleted ? "View today's plan" : "Complete daily check-in"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Water Log Widget Card */}
        <View style={styles.waterLogCard}>
          {/* Header */}
          <View style={styles.waterLogHeader}>
            <Ionicons name="water" size={20} color="#FF8C42" />
            <Text style={styles.waterLogTitle}>Hydration today</Text>
          </View>

          {/* Progress */}
          <View style={styles.waterLogProgress}>
            <Text style={styles.waterLogProgressText}>
              Logged: <Text style={styles.waterLogBold}>{hydrationLogged}ml</Text> of {hydrationGoal}ml
            </Text>
            <View style={styles.waterLogProgressBar}>
              <View 
                style={[
                  styles.waterLogProgressFill,
                  { width: `${Math.min(hydrationPercent, 100)}%` }
                ]} 
              />
            </View>
          </View>

          {/* Quick Add Buttons */}
          <View style={styles.waterLogQuickAdd}>
            <TouchableOpacity
              style={styles.waterLogQuickButton}
              onPress={() => handleQuickAddWater(250)}
              activeOpacity={0.7}
            >
              <Text style={styles.waterLogQuickButtonText}>+250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.waterLogQuickButton}
              onPress={() => handleQuickAddWater(500)}
              activeOpacity={0.7}
            >
              <Text style={styles.waterLogQuickButtonText}>+500ml</Text>
            </TouchableOpacity>
          </View>

          {/* Goal Info */}
          <Text style={styles.waterLogGoalText}>
            ~{Math.max(0, hydrationGoal - hydrationLogged)}ml left to reach today's goal
          </Text>

          {/* View Full Log Link */}
          <TouchableOpacity
            onPress={handleWaterLogPress}
            activeOpacity={0.7}
          >
            <Text style={styles.waterLogViewLink}>View full water log</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Widgets Grid - 2x2 */}
        <View style={styles.widgetsGrid}>
          {/* Water Log Widget */}
          <TouchableOpacity
            style={styles.widgetCard}
            onPress={handleWaterLogPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="water-outline" size={24} color="#0F4C44" />
      </View>
            <Text style={styles.widgetTitle}>Water</Text>
            <Text style={styles.widgetSubtitle}>
              {hydrationLogged > 0 ? hydrationProgressText : 'Log water'}
          </Text>
            <View style={styles.widgetArrow}>
              <Ionicons name="chevron-forward" size={16} color="rgba(15,76,68,0.3)" />
            </View>
          </TouchableOpacity>

          {/* Progress Widget */}
          <TouchableOpacity
            style={styles.widgetCard}
            onPress={handleProgressPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="stats-chart-outline" size={24} color="#0F4C44" />
            </View>
            <Text style={styles.widgetTitle}>Progress</Text>
            <Text style={styles.widgetSubtitle}>
              {streak > 0 ? `Streak: ${streak} days` : 'Track progress'}
          </Text>
            <View style={styles.widgetArrow}>
              <Ionicons name="chevron-forward" size={16} color="rgba(15,76,68,0.3)" />
            </View>
          </TouchableOpacity>
          
          {/* Today's Plan Widget */}
          <TouchableOpacity
            style={styles.widgetCard}
            onPress={handleRecoveryPlanPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="sunny-outline" size={24} color="#0F4C44" />
            </View>
            <Text style={styles.widgetTitle}>Today's Plan</Text>
            <Text style={styles.widgetSubtitle}>
              {planStepsLeft !== null ? `${planStepsLeft} steps left` : 'Recovery steps'}
            </Text>
            {planStepsLeft !== null && planStepsLeft > 0 && (
              <Text style={styles.widgetMicroData}>{planStepsLeft} steps left</Text>
            )}
            {planStepsLeft === null && isCheckInCompleted && (
              <Text style={styles.widgetMicroData}>Pending</Text>
            )}
            <View style={styles.widgetArrow}>
              <Ionicons name="chevron-forward" size={16} color="rgba(15,76,68,0.3)" />
            </View>
          </TouchableOpacity>

          {/* Evening Check-In Widget */}
          <TouchableOpacity
            style={styles.widgetCard}
            onPress={handleEveningCheckInPress}
            activeOpacity={0.7}
          >
            <View style={styles.widgetIconContainer}>
              <Ionicons name="moon-outline" size={24} color="#0F4C44" />
            </View>
            <Text style={styles.widgetTitle}>Evening check-in</Text>
            <Text style={styles.widgetSubtitle}>
              {accessInfo.hasFullAccess ? 'Reflect + sleep prep' : 'Reflect + sleep prep'}
              </Text>
            {!accessInfo.hasFullAccess && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
            <View style={styles.widgetArrow}>
              <Ionicons name="chevron-forward" size={16} color="rgba(15,76,68,0.3)" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Dev: Clear Check-In Button (only in development) */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devButton}
            onPress={handleClearTodayCheckIn}
            activeOpacity={0.7}
          >
            <Text style={styles.devButtonText}>🧹 Clear Today's Check-In (Dev)</Text>
          </TouchableOpacity>
        )}

        {/* Premium CTA (only for free users, subtle) */}
        {accessInfo.isFree && (
            <TouchableOpacity
            style={styles.upgradeCard}
            onPress={handleUpgradePress}
            activeOpacity={0.8}
          >
            <View style={styles.upgradeContent}>
              <View style={styles.upgradeIconContainer}>
                <Ionicons name="sparkles-outline" size={20} color="#0F4C44" />
              </View>
              <View style={styles.upgradeTextContainer}>
                <Text style={styles.upgradeTitle}>Unlock Premium</Text>
                <Text style={styles.upgradeSubtitle}>
                  Evening check-ins + insights
              </Text>
                <Text style={styles.upgradeMicroLine}>
                  Takes 30 seconds/night
              </Text>
          </View>
              <View style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </View>
      </View>
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
        onGoToAccount={handleGoToAccount}
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
  premiumHeader: {
    marginBottom: 24,
    paddingTop: 8,
  },
  welcomeText: {
    fontFamily: 'CormorantGaramond_600SemiBold', // Different font family for welcome
    fontSize: 42, // 5% larger than before (was 36px)
    color: '#0F3D3E',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  contextualFeedback: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.85)',
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  progressSignal: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.65)',
    marginTop: 4,
    marginBottom: 4,
  },
  contextualQuestion: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    fontStyle: 'italic',
    marginTop: 8,
  },
  welcomeBannerContainer: {
    marginBottom: 16,
  },

  // Hero Card
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: 'rgba(15,76,68,0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15,76,68,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  heroCardPending: {
    backgroundColor: 'rgba(255,255,255,0.98)',
  },
  heroAccentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(15,76,68,0.12)',
  },
  heroContent: {
    gap: 20,
  },
  heroHeader: {
    gap: 8,
  },
  heroTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold', // Different font family for hero card title
    fontSize: 28, // Smaller than welcomeText for clear hierarchy
    color: '#0F3D3E',
    lineHeight: 38, // Proportional to fontSize
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(15,61,62,0.6)',
    lineHeight: 21,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,76,68,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(15,76,68,0.6)',
  },
  chipTextCompleted: {
    color: '#7AB48B',
  },
  heroButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  heroButtonText: {
    ...typography.button,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Water Log Card
  waterLogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  waterLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  waterLogTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
  },
  waterLogProgress: {
    marginBottom: 16,
  },
  waterLogProgressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#0F3D3E',
    marginBottom: 8,
  },
  waterLogBold: {
    fontFamily: 'Inter_600SemiBold',
  },
  waterLogProgressBar: {
    height: 8,
    backgroundColor: 'rgba(15, 76, 68, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  waterLogProgressFill: {
    height: '100%',
    backgroundColor: '#0F4C44',
    borderRadius: 4,
  },
  waterLogQuickAdd: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  waterLogQuickButton: {
    flex: 1,
    backgroundColor: 'rgba(15, 76, 68, 0.06)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterLogQuickButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0F4C44',
  },
  waterLogGoalText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#0F3D3E',
    marginBottom: 12,
  },
  waterLogViewLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F4C44',
    textDecorationLine: 'underline',
  },
  // Widgets Grid
  widgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  widgetCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,76,68,0.08)',
    shadowColor: 'rgba(15,76,68,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 3,
    position: 'relative',
  },
  widgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15,76,68,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 4,
  },
  widgetSubtitle: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(15,61,62,0.6)',
    lineHeight: 18,
  },
  widgetMicroData: {
    ...typography.bodySmall,
    fontSize: 11,
    color: '#0F4C44',
    marginTop: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  widgetArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15,76,68,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15,76,68,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumBadgeText: {
    ...typography.labelSmall,
    fontSize: 10,
    color: '#0F4C44',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },

  // Upgrade Card
  upgradeCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,76,68,0.12)',
    marginBottom: 8,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(15,76,68,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeTextContainer: {
    flex: 1,
    gap: 2,
  },
  upgradeTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: '#0F3D3E',
  },
  upgradeSubtitle: {
    ...typography.bodySmall,
    fontSize: 12,
    color: 'rgba(15,61,62,0.6)',
    lineHeight: 16,
  },
  upgradeMicroLine: {
    ...typography.caption,
    fontSize: 10,
    color: 'rgba(15,61,62,0.5)',
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
  upgradeButton: {
    backgroundColor: '#0F4C44',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upgradeButtonText: {
    ...typography.button,
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Dev Button
  devButton: {
    backgroundColor: 'rgba(204, 92, 108, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(204, 92, 108, 0.3)',
    alignItems: 'center',
  },
  devButtonText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#CC5C6C',
    fontFamily: 'Inter_500Medium',
  },
});
