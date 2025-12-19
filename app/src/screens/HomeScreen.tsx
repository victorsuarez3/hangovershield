/**
 * Home Screen - Hangover Shield
 * Premium dashboard with hero card and widget grid
 * Consistent with app's calm, premium aesthetic
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppMenuSheet, CurrentScreen } from '../components/AppMenuSheet';
import { AppHeader } from '../components/AppHeader';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { useDailyCheckIn } from '../hooks/useDailyCheckIn';
import { usePlanCompletion } from '../hooks/usePlanCompletion';
import { useAuth } from '../providers/AuthProvider';
import { useUserDataStore } from '../stores/useUserDataStore';
import { useAppNavigation } from '../contexts/AppNavigationContext';
import { WelcomeCountdownBanner } from '../components/WelcomeCountdownBanner';
import { InfoTooltipModal } from '../components/InfoTooltipModal';
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
  DailyCheckInSummary,
} from '../services/dailyCheckIn';
import { getLocalDailyCheckIn, deleteLocalDailyCheckIn } from '../services/dailyCheckInStorage';
import { getTodayId, getDateId } from '../utils/dateUtils';
import { typography } from '../design-system/typography';
import { generatePlan } from '../domain/recovery/planGenerator';

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

  // Hydration tooltip state
  const [hydrationTooltipVisible, setHydrationTooltipVisible] = useState(false);

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
  
  // Plan completion status (single source of truth from Firestore)
  const planCompletion = usePlanCompletion(user?.uid || null);

  // Hydration state - use store as single source of truth
  const { hydrationGoal: storeHydrationGoal, todayHydrationTotal, addHydrationEntry: addToStore, setHydrationLogs } = useUserDataStore();
  const hydrationGoal = storeHydrationGoal;
  const hydrationLogged = todayHydrationTotal;

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

  // Micro-action and recovery score
  const [microAction, setMicroAction] = useState<{ title: string; body: string } | null>(null);
  const [recoveryScore, setRecoveryScore] = useState<number | null>(null);

  // Progress snapshot data (last 7 days)
  const [last7DaysData, setLast7DaysData] = useState<Array<{
    dateId: string;
    dayLabel: string;
    isCompleted: boolean;
    isToday: boolean;
  }>>([]);

  // Load hydration data from service and sync to store (single source of truth)
  useEffect(() => {
    const loadHydrationData = async () => {
      if (!user?.uid) return;

      try {
        // Load from service
        const goal = await getHydrationGoal(user.uid);
        const logs = await getTodayHydrationLog(user.uid);
        
        // Update store (single source of truth)
        const todayId = getTodayId();
        const hydrationLogs: { [key: string]: any[] } = {};
        hydrationLogs[todayId] = logs;
        setHydrationLogs(hydrationLogs);
        
        // Store will automatically calculate todayHydrationTotal
      } catch (error) {
        console.error('[HomeScreen] Error loading hydration data:', error);
      }
    };

    loadHydrationData();
  }, [user?.uid, setHydrationLogs]);

  // Daily check-in status (computed early for use in effects)
  const isCheckInCompleted = dailyCheckIn.status === 'completed_today';
  
  // Plan completion status
  const isPlanCompleted = planCompletion.isPlanCompleted;

  // Refresh both check-in and plan completion status when screen comes into focus
  // This ensures Home shows correct state after completing plan and returning from Congratulations
  // Works with AsyncStorage even when Firestore isn't available
  // Use useRef to store stable references to refresh functions to avoid infinite loops
  const refreshCheckInRef = useRef(dailyCheckIn.refreshCheckInStatus);
  const refreshPlanRef = useRef(planCompletion.refreshPlanStatus);
  
  // Update refs when functions change
  useEffect(() => {
    refreshCheckInRef.current = dailyCheckIn.refreshCheckInStatus;
    refreshPlanRef.current = planCompletion.refreshPlanStatus;
  }, [dailyCheckIn.refreshCheckInStatus, planCompletion.refreshPlanStatus]);
  
  useFocusEffect(
    useCallback(() => {
      // Always refresh - hooks will check AsyncStorage first, then Firestore
      refreshCheckInRef.current();
      refreshPlanRef.current();
      
      // Debug logging (use current values, not from dependencies to avoid loops)
      if (__DEV__) {
        const todayId = getTodayId();
        console.log('[HomeScreen] Refreshed completion states on focus:', {
          todayId,
          hasUserId: !!user?.uid,
          sourceDocPath: user?.uid ? `users/${user.uid}/dailyCheckIns/${todayId}` : 'AsyncStorage only',
        });
      }
    }, [user?.uid]) // Only depend on user?.uid, not the functions
  );

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

        // Build last 7 days tracker data
        const checkInMap = new Map<string, DailyCheckInSummary>();
        checkIns.forEach((ci) => checkInMap.set(ci.date, ci));

        const last7Days: Array<{
          dateId: string;
          dayLabel: string;
          isCompleted: boolean;
          isToday: boolean;
        }> = [];

        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateId = getDateId(date);
          const checkIn = checkInMap.get(dateId);
          const isToday = dateId === todayId;
          
          // Get day label (Mon, Tue, etc.)
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3);

          last7Days.push({
            dateId,
            dayLabel,
            isCompleted: checkIn?.planCompleted === true,
            isToday,
          });
        }

        setLast7DaysData(last7Days);
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

  // Load today's check-in data for contextual feedback (from unified service)
  useEffect(() => {
    const loadTodayCheckIn = async () => {
      try {
        // Read from unified service (single source of truth)
        if (user?.uid) {
          const firestoreCheckIn = await getTodayDailyCheckIn(user.uid);
          if (firestoreCheckIn && firestoreCheckIn.completedAt) {
            // Check-in exists and is completed
            setTodayCheckInData({
              severity: firestoreCheckIn.severity,
              drankLastNight: firestoreCheckIn.drankLastNight,
              drinkingToday: firestoreCheckIn.drinkingToday,
            });
            return;
          }
        }

        // Fallback to local storage
        const localCheckIn = await getLocalDailyCheckIn();
        if (localCheckIn) {
          const todayId = getTodayId();
          if (localCheckIn.id === todayId) {
            setTodayCheckInData({
              severity: localCheckIn.level,
              drankLastNight: localCheckIn.drankLastNight,
              drinkingToday: localCheckIn.drinkingToday,
            });
          }
        }
      } catch (error) {
        console.error('[HomeScreen] Error loading today check-in:', error);
      }
    };

    loadTodayCheckIn();
  }, [user?.uid, isCheckInCompleted]);

  // Load micro-action and recovery score
  useEffect(() => {
    const loadMicroActionAndScore = async () => {
      try {
        // Get today's check-in
        let checkIn = null;
        let plan = null;
        if (user?.uid) {
          checkIn = await getTodayDailyCheckIn(user.uid);
        }
        if (!checkIn) {
          const localCheckIn = await getLocalDailyCheckIn();
          if (localCheckIn) {
            const todayId = getTodayId();
            if (localCheckIn.id === todayId) {
              checkIn = {
                severity: localCheckIn.level,
                symptoms: localCheckIn.symptoms,
                drankLastNight: localCheckIn.drankLastNight,
                drinkingToday: localCheckIn.drinkingToday,
              };
            }
          }
        }

        // Read micro-action from unified service (single source of truth)
        if (checkIn && 'microStep' in checkIn && checkIn.microStep) {
          // Use saved micro-action from unified service
          setMicroAction(checkIn.microStep);
          console.log('[HomeScreen] Loaded micro-action from unified service');
        } else if (checkIn) {
          // Fallback: generate if not saved yet (shouldn't happen in normal flow)
          const feeling = checkIn.severity as 'mild' | 'moderate' | 'severe' | 'none';
          const symptomKeys = checkIn.symptoms.filter((s): s is 'headache' | 'nausea' | 'dryMouth' | 'dizziness' | 'fatigue' | 'anxiety' | 'brainFog' | 'poorSleep' | 'noSymptoms' => {
            return ['headache', 'nausea', 'dryMouth', 'dizziness', 'fatigue', 'anxiety', 'brainFog', 'poorSleep', 'noSymptoms'].includes(s);
          }) as any[];
          
          plan = generatePlan({
            level: feeling,
            symptoms: symptomKeys,
            drankLastNight: checkIn.drankLastNight,
            drinkingToday: checkIn.drinkingToday,
          });
          
          setMicroAction(plan.microAction);
        } else {
          setMicroAction(null);
        }

        // Calculate recovery score
        // This is a BEHAVIOR score, not a medical health score
        // Score should NOT depend on alcohol consumption
        let score = 0; // Start from 0, build up
        
        // 1. Daily check-in completed (30 points)
        if (isCheckInCompleted) {
          score += 30;
        }
        
        // 2. Hydration progress (up to 30 points)
        // Proportional to goal: 0% = 0 pts, 100% = 30 pts
        const hydrationProgress = Math.min(hydrationLogged / hydrationGoal, 1);
        score += Math.round(hydrationProgress * 30);
        
        // 3. Micro-steps completed (up to 30 points)
        // If check-in exists and micro-action is available, user gets points
        // In future, we could track if user actually completed the micro-action
        if (checkIn && plan?.microAction) {
          // For now, if micro-action exists, give full points
          // Later: track actual completion for partial points
          score += 30;
        }
        
        // 4. Bonus consistency (evening check-in) (10 points)
        // Premium feature: evening check-in shows consistency
        if (accessInfo.hasFullAccess && user?.uid) {
          try {
            // Try to fetch evening check-in for today
            // For now, we'll skip this as it requires evening check-in service
            // In future: const eveningCheckIn = await getTodayEveningCheckIn(user.uid);
            // if (eveningCheckIn) score += 10;
          } catch (error) {
            // Evening check-in not available, skip
          }
        }
        
        // Note: Plan steps completion is NOT included in score
        // Score focuses on: check-in, hydration, micro-actions, consistency
        // Plan completion is tracked separately and shown in plan screen
        
        // Ensure score is between 0-100
        score = Math.min(Math.max(score, 0), 100);
        setRecoveryScore(score);
      } catch (error) {
        console.error('[HomeScreen] Error loading micro-action and score:', error);
      }
    };

    loadMicroActionAndScore();
  }, [user?.uid, isCheckInCompleted, hydrationLogged, hydrationGoal, streak]);

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
    // If check-in is completed, navigate to CheckInCompleteScreen (the chosen screen)
    // Pass skipProcessing=true to skip the processing animation when coming from Home
    // Otherwise navigate to CheckInScreen to complete it
    if (isCheckInCompleted) {
      navigation.navigate('CheckInComplete', { skipProcessing: true });
    } else {
      navigation.navigate('CheckIn');
    }
  }, [navigation, isCheckInCompleted]);
  
  const handleGoToCheckInOld = useCallback(() => {
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

  // Quick add water handlers - update store for single source of truth
  const handleQuickAddWater = useCallback(async (amountMl: number) => {
    if (!user?.uid) return;
    
    try {
      const todayId = getTodayId();
      
      // Create water entry using utility function (consistent with DailyWaterLogScreen)
      const newEntry = createWaterEntry(amountMl);
      
      // Update store immediately (single source of truth)
      addToStore(todayId, newEntry);
      
      // Save to Firebase
      await addWaterEntry(user.uid, newEntry);
      
      // Store will automatically update todayHydrationTotal, which will trigger re-render
    } catch (error) {
      console.error('[HomeScreen] Error adding water:', error);
    }
  }, [user?.uid, addToStore]);

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
      // Clear local storage (this also clears plan completion)
      await deleteLocalDailyCheckIn();
      
      // Clear Firestore if logged in
      if (user?.uid) {
        await deleteTodayDailyCheckIn(user.uid);
      }
      
      // Refresh both check-in and plan completion status
      if (dailyCheckIn.refreshCheckInStatus) {
        await dailyCheckIn.refreshCheckInStatus();
      }
      if (planCompletion.refreshPlanStatus) {
        await planCompletion.refreshPlanStatus();
      }
      
      // Reload today's check-in data
      setTodayCheckInData(null);
      
      console.log('✓ Today\'s check-in and plan completion cleared!');
    } catch (error) {
      console.error('Error clearing check-in:', error);
    }
  }, [user?.uid, dailyCheckIn, planCompletion]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────────

  const hydrationProgressText = useMemo(() => {
    const liters = (hydrationLogged / 1000).toFixed(1);
    const goalLiters = (hydrationGoal / 1000).toFixed(1);
    return `${liters}L / ${goalLiters}L`;
  }, [hydrationLogged, hydrationGoal]);

  const hydrationPercent = hydrationGoal > 0 ? (hydrationLogged / hydrationGoal) * 100 : 0;

  // Rotating motivational messages (fixed list, not random)
  const motivationalMessages = [
    "Small actions today lead to a better tomorrow.",
    "Consistency beats intensity.",
    "Taking care of yourself counts.",
    "Every check-in moves you forward.",
    "Progress happens one day at a time.",
    "You're building something meaningful.",
    "Small steps, big impact.",
  ];

  // Select message based on day of week for consistency
  const motivationalMessage = useMemo(() => {
    const dayOfWeek = new Date().getDay();
    return motivationalMessages[dayOfWeek % motivationalMessages.length];
  }, []);

  // Generate contextual daily feedback (deprecated, using rotating messages instead)
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
          <Text style={styles.motivationalMessage}>{motivationalMessage}</Text>
          {progressSignal && (
            <Text style={styles.progressSignal}>{progressSignal}</Text>
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
                  : "This helps us guide you to feel better today."}
          </Text>
            </View>

            {/* Status Chips - Only show if check-in is pending or if hydration is logged */}
            <View style={styles.heroChips}>
              {/* Only show check-in status chip if check-in is NOT completed */}
              {!isCheckInCompleted && (
                <View style={styles.chip}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="rgba(15,76,68,0.5)"
                  />
                  <Text style={styles.chipText}>
                    Check-in: Pending
                  </Text>
                </View>
              )}
              {/* Show check-in completed status (optional - can remove if cleaner) */}
              {isCheckInCompleted && (
                <View style={[styles.chip, styles.chipCompleted]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#7AB48B"
                  />
                  <Text style={[styles.chipText, styles.chipTextCompleted]}>
                    Check-in completed
                  </Text>
                </View>
              )}
              {hydrationLogged > 0 && (
                <View style={styles.chip}>
                  <Ionicons name="water" size={14} color="rgba(15,76,68,0.5)" />
                  <Text style={styles.chipText}>{hydrationProgressText}</Text>
                </View>
              )}
            </View>

            {/* Primary CTA Button */}
            {/* CRITICAL: Home always points to check-in once completed, regardless of plan status */}
            {/* This reinforces identity (check-in) over task completion (plan) */}
          <TouchableOpacity
              style={styles.heroButton}
              onPress={(e) => {
                e.stopPropagation();
                if (isCheckInCompleted) {
                  // Always navigate to check-in details screen (the hub)
                  // This preserves the psychological flow: awareness → action
                  handleGoToCheckIn();
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
                  {isCheckInCompleted 
                    ? "View today's check-in"
                    : "Complete daily check-in"}
              </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </TouchableOpacity>

        {/* Today's Recovery Score Card - Moved up for immediate feedback */}
        {recoveryScore !== null && (
          <View style={styles.recoveryScoreCard}>
            <Text style={styles.recoveryScoreTitle}>Today's Recovery Score</Text>
            <Text style={styles.recoveryScoreSubtitle}>
              Based on how you checked in, hydrated, and completed recovery actions today.
          </Text>
            <View style={styles.recoveryScoreCircle}>
              <Text style={styles.recoveryScoreNumber}>{recoveryScore}</Text>
              <Text style={styles.recoveryScoreMax}>/100</Text>
            </View>
            <View style={styles.recoveryScoreBar}>
              <View 
                style={[
                  styles.recoveryScoreBarFill,
                  { width: `${recoveryScore}%` }
                ]} 
              />
            </View>
            <Text style={styles.recoveryScoreHelper}>
              {isPlanCompleted 
                ? "Great job completing today's plan!"
                : "Complete today's plan to improve your score."}
            </Text>
            {!isPlanCompleted && (
              <TouchableOpacity
                onPress={handleRecoveryPlanPress}
                activeOpacity={0.7}
                style={styles.recoveryScoreCTA}
              >
                <Text style={styles.recoveryScoreCTAText}>View today's full plan →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Today's Micro-step Card */}
        {microAction && (
          <View style={styles.microStepCard}>
            <View style={styles.microStepHeader}>
              <Ionicons name="bulb-outline" size={20} color="#0F4C44" />
              <Text style={styles.microStepTitle}>Today's micro-step</Text>
            </View>
            <Text style={styles.microStepText}>{microAction.title}</Text>
            <Text style={styles.microStepBody}>{microAction.body}</Text>
          </View>
        )}

        {/* Water Log Widget Card */}
        <View style={styles.waterLogCard}>
          {/* Header */}
          <View style={styles.waterLogHeader}>
            <Ionicons name="water" size={20} color="#FF8C42" />
            <Text style={styles.waterLogTitle}>Hydration today</Text>
            <TouchableOpacity
              onPress={() => setHydrationTooltipVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.infoIconButton}
              accessibilityLabel="Show hydration guide"
              accessibilityRole="button"
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="rgba(15, 76, 68, 0.5)"
              />
            </TouchableOpacity>
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

        {/* Progress Snapshot Card */}
        <View style={styles.progressSnapshotCard}>
          <View style={styles.progressSnapshotHeader}>
            <View style={styles.progressSnapshotTitleRow}>
              <Ionicons name="stats-chart-outline" size={20} color="#0F4C44" style={styles.progressIcon} />
              <Text style={styles.progressSnapshotTitle}>Your progress</Text>
        </View>
            {streak > 0 ? (
              <Text style={styles.progressSnapshotSubtitle}>🔥 {streak}-day streak</Text>
            ) : (
              <Text style={styles.progressSnapshotSubtitle}>Start your streak today</Text>
            )}
      </View>

          {/* 7-day tracker */}
          <View style={styles.progressTracker}>
            {last7DaysData.map((day) => (
              <View key={day.dateId} style={styles.progressDay}>
                <View
                  style={[
                    styles.progressDayCircle,
                    day.isCompleted && styles.progressDayCircleCompleted,
                    day.isToday && styles.progressDayCircleToday,
                  ]}
                >
                  {day.isCompleted && (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  )}
                </View>
                <Text
                  style={[
                    styles.progressDayLabel,
                    day.isToday && styles.progressDayLabelToday,
                  ]}
                >
                  {day.dayLabel}
                </Text>
              </View>
            ))}
      </View>

          {/* Motivational copy */}
          <Text style={styles.progressMotivational}>
            Every check-in counts.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleProgressPress}
            activeOpacity={0.7}
            style={styles.progressCTA}
          >
            <Text style={styles.progressCTAText}>See your patterns →</Text>
          </TouchableOpacity>
        </View>

        {/* Evening Check-In Widget - Only remaining widget */}
        <TouchableOpacity
          style={styles.eveningWidgetCard}
          onPress={handleEveningCheckInPress}
          activeOpacity={0.7}
        >
          <View style={styles.eveningWidgetContent}>
            <View style={styles.eveningWidgetLeft}>
              <View style={styles.eveningWidgetIconContainer}>
                <Ionicons name="moon-outline" size={24} color="#0F4C44" />
              </View>
              <View style={styles.eveningWidgetText}>
                <Text style={styles.eveningWidgetTitle}>Evening check-in</Text>
                <Text style={styles.eveningWidgetSubtitle}>
                  {accessInfo.hasFullAccess ? 'Reflect + sleep prep' : 'Reflect + sleep prep'}
                </Text>
              </View>
            </View>
            {!accessInfo.hasFullAccess && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="rgba(15,76,68,0.3)" />
          </View>
        </TouchableOpacity>

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

      {/* Hydration Tooltip Modal */}
      <InfoTooltipModal
        visible={hydrationTooltipVisible}
        onClose={() => setHydrationTooltipVisible(false)}
        title="Hydration guide"
        items={[
          'A typical glass of water is ~200ml',
          '+200ml = one glass • +500ml = a small bottle',
          'Your daily goal is a general guideline to support recovery',
        ]}
        ctaLabel="Got it"
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
  motivationalMessage: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.7)',
    lineHeight: 22,
    marginTop: 8,
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
    marginBottom: 12,
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
  chipCompleted: {
    backgroundColor: 'rgba(122, 180, 139, 0.1)',
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
    marginTop: 12,
    marginBottom: 12,
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
    flex: 1,
  },
  infoIconButton: {
    marginLeft: 'auto',
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
  // Micro-step Card
  microStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  microStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  microStepTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
  },
  microStepText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 4,
    lineHeight: 22,
  },
  microStepBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.7)',
    lineHeight: 20,
  },
  // Progress Snapshot Card
  progressSnapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  progressSnapshotHeader: {
    marginBottom: 16,
  },
  progressSnapshotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressIcon: {
    marginRight: 8,
  },
  progressSnapshotTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
  },
  progressSnapshotSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.7)',
  },
  progressTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  progressDay: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  progressDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDayCircleCompleted: {
    backgroundColor: '#0F4C44',
    borderColor: '#0F4C44',
  },
  progressDayCircleToday: {
    borderWidth: 2,
    borderColor: '#0F4C44',
  },
  progressDayLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(15, 61, 62, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressDayLabelToday: {
    color: '#0F4C44',
    fontFamily: 'Inter_600SemiBold',
  },
  progressMotivational: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.7)',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  progressCTA: {
    alignSelf: 'flex-end',
  },
  progressCTAText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F4C44',
  },
  // Recovery Score Card
  recoveryScoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  recoveryScoreTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
    marginBottom: 8,
  },
  recoveryScoreSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.7)',
    marginBottom: 16,
    textAlign: 'center',
  },
  recoveryScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 76, 68, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recoveryScoreNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 36,
    color: '#0F3D3E',
    lineHeight: 44,
  },
  recoveryScoreMax: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.6)',
    marginTop: -4,
  },
  recoveryScoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(15, 76, 68, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  recoveryScoreBarFill: {
    height: '100%',
    backgroundColor: '#0F4C44',
    borderRadius: 4,
  },
  recoveryScoreHelper: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.7)',
    marginTop: 16,
    textAlign: 'center',
  },
  recoveryScoreCTA: {
    marginTop: 12,
    alignSelf: 'center',
  },
  recoveryScoreCTAText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F4C44',
  },
  // Widgets Grid
  widgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 0,
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

  // Evening Check-In Widget (single card, not in grid)
  eveningWidgetCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15,76,68,0.08)',
    shadowColor: 'rgba(15,76,68,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 3,
  },
  eveningWidgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eveningWidgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eveningWidgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15,76,68,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eveningWidgetText: {
    flex: 1,
  },
  eveningWidgetTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 2,
  },
  eveningWidgetSubtitle: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(15,61,62,0.6)',
    lineHeight: 18,
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
