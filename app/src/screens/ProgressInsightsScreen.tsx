/**
 * Progress & Insights Screen - Hangover Shield
 * Premium wellness dashboard - emotional core of the product
 * Makes users feel understood, not analyzed
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  FlatList,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import { AppHeader } from '../components/AppHeader';
import { AppMenuSheet, CurrentScreen } from '../components/AppMenuSheet';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { useAppNavigation } from '../contexts/AppNavigationContext';
import { SoftGateCard } from '../components/SoftGateCard';
import { LockedSection } from '../components/LockedSection';
import { PaywallSource } from '../constants/paywallSources';
import { RecoveryTrendLineChart, RecoveryTrendDataPoint } from '../components/RecoveryTrendLineChart';
import { RhythmLegendModal } from '../components/RhythmLegendModal';
import { getTodayId, formatDateForDisplay } from '../utils/dateUtils';
import { getRecentCheckIns, DailyCheckInSummary } from '../services/dailyCheckIn';
import { typography } from '../design-system/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Rhythm Calendar Color Palette
// ─────────────────────────────────────────────────────────────────────────────

const RHYTHM_COLORS = {
  emptyPast: 'rgba(15, 76, 68, 0.08)',   // visible pero suave
  future:    'rgba(255, 255, 255, 0.55)',   // near-white for future/empty filler
  l1:        'rgba(15, 76, 68, 0.22)',
  l2:        'rgba(15, 76, 68, 0.36)',
  l3:        'rgba(15, 76, 68, 0.52)',
  l4:        'rgba(15, 76, 68, 0.68)',
  l5:        'rgba(15, 76, 68, 0.82)',
};

const TILE_GAP = 6;

type Period = '7d' | '30d' | '90d';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data & Helpers
// ─────────────────────────────────────────────────────────────────────────────

// Generate mock recovery trend data (7 days)
const generateMockTrendData = (): RecoveryTrendDataPoint[] => {
  const today = new Date();
  const days: RecoveryTrendDataPoint[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateId = date.toISOString().split('T')[0];
    
    // Generate realistic recovery scores (trending upward)
    const baseScore = 40 + (6 - i) * 8 + Math.random() * 15;
    const value = Math.min(Math.max(Math.round(baseScore), 20), 95);
    
    days.push({
      day: dayLabel,
      value,
      date: dateId,
    });
  }
  
  return days;
};

// Generate human interpretation from trend
const generateTrendInterpretation = (data: RecoveryTrendDataPoint[]): string => {
  if (data.length < 2) return 'Keep checking in to see your patterns.';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
  
  const slope = secondAvg - firstAvg;
  
  if (slope > 10) {
    return 'Your body responds well to steady habits.';
  } else if (slope > 5) {
    return 'Consistency is starting to pay off.';
  } else if (slope > -5) {
    return 'Small actions are adding up.';
  } else if (slope > -10) {
    return 'Recovery has been uneven — that\'s okay.';
  } else {
    return 'Every day is a chance to reset.';
  }
};

// Rotating insights (never repeat two days in a row)
const INSIGHTS = [
  'Small habits create bigger changes over time.',
  'Recovery isn\'t linear, and that\'s normal.',
  'Your body remembers what helps.',
  'Consistency builds trust with yourself.',
  'Each check-in adds to your understanding.',
  'Progress happens in small moments.',
  'You\'re learning what works for you.',
];

const getTodayInsight = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return INSIGHTS[dayOfYear % INSIGHTS.length];
};

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip Modal (reusable)
// ─────────────────────────────────────────────────────────────────────────────

interface InfoTooltipProps {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}

const InfoTooltipModal: React.FC<InfoTooltipProps> = ({ visible, title, body, onClose }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(20);
    }
  }, [visible, opacity, translateY]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.tooltipBackdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.tooltipCard, { opacity, transform: [{ translateY }] }]}>
          <Text style={styles.tooltipTitle}>{title}</Text>
          <Text style={styles.tooltipBody}>{body}</Text>
          <TouchableOpacity style={styles.tooltipButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.tooltipButtonText}>Got it</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Generate mock calendar data (variable count)
interface CalendarDay {
  date: string;
  hasCheckIn: boolean;
  hasEveningCheckIn: boolean;
  hasAlcohol: boolean;
  recoveryScore: number;
}

const generateMockCalendarData = (count: number): CalendarDay[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const days: CalendarDay[] = [];
  
  // Generate last `count` days of data (past days)
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateId = date.toISOString().split('T')[0];
    
    // More realistic data distribution
    const hasCheckIn = Math.random() > 0.15; // 85% check-in rate
    const hasEveningCheckIn = hasCheckIn && Math.random() > 0.4; // 60% evening rate if check-in exists
    const hasAlcohol = Math.random() > 0.65; // 35% alcohol days
    
    // Recovery score: higher for days with check-in, varies based on alcohol
    let recoveryScore = 0;
    if (hasCheckIn) {
      if (hasAlcohol) {
        recoveryScore = 30 + Math.random() * 30; // 30-60 if alcohol
      } else {
        recoveryScore = 60 + Math.random() * 35; // 60-95 if no alcohol
      }
    }
    
    days.push({
      date: dateId,
      hasCheckIn,
      hasEveningCheckIn,
      hasAlcohol,
      recoveryScore: Math.round(recoveryScore),
    });
  }
  
  return days;
};

// Generate mock reflection memory
const MOCK_REFLECTIONS = [
  { day: 'Tue', text: 'Took a walk instead of drinking tonight. Feeling proud.' },
  { day: 'Mon', text: 'Drank water before bed. Woke up feeling clearer.' },
  { day: 'Sun', text: 'Had a quiet evening reading. Much better than usual.' },
  { day: 'Sat', text: 'Went to bed early. Recovery feels smoother.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// RhythmTile Component
// ─────────────────────────────────────────────────────────────────────────────

type CalendarCell = 
  | { kind: 'day'; day: CalendarDay; key: string }
  | { kind: 'empty'; key: string };

interface RhythmTileProps {
  item: CalendarCell;
  size: number;
  todayId: string;
}

// Helper to determine if tile is light (needs dark icon/badge)
const isLightTile = (bgColor: string): boolean => {
  return (
    bgColor === RHYTHM_COLORS.future ||
    bgColor === RHYTHM_COLORS.emptyPast ||
    bgColor.includes('0.22') ||
    bgColor.includes('0.36')
  );
};

const RhythmTile: React.FC<RhythmTileProps> = ({ item, size, todayId }) => {
  if (item.kind === 'empty') {
    return (
      <View
        style={[
          styles.rhythmTile,
          styles.rhythmTileEmpty,
          { width: size, height: size },
        ]}
      />
    );
  }

  const { day } = item;
  const isFuture = day.date > todayId;
  
  // Calculate color using discrete palette
  let bgColor = RHYTHM_COLORS.future;
  
  if (!isFuture) {
    if (!day.hasCheckIn) {
      bgColor = RHYTHM_COLORS.emptyPast;
    } else {
      const score = day.recoveryScore;
      if (score >= 80) bgColor = RHYTHM_COLORS.l5;
      else if (score >= 65) bgColor = RHYTHM_COLORS.l4;
      else if (score >= 50) bgColor = RHYTHM_COLORS.l3;
      else if (score >= 35) bgColor = RHYTHM_COLORS.l2;
      else bgColor = RHYTHM_COLORS.l1;
    }
  }
  
  // Determine icon styling based on tile brightness
  const isLight = isLightTile(bgColor);
  const iconColor = isLight ? 'rgba(15, 76, 68, 0.55)' : '#FFFFFF';
  const badgeBg = isLight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.10)';

  return (
    <View
      style={[
        styles.rhythmTile,
        styles.rhythmTileFilled,
        { backgroundColor: bgColor, width: size, height: size },
      ]}
    >
      {day.hasEveningCheckIn && !isFuture && (
        <View style={[styles.rhythmTileIconBadge, { backgroundColor: badgeBg }]}>
          <Ionicons
            name="moon"
            size={11}
            color={iconColor}
          />
        </View>
      )}
      {day.hasAlcohol && !isFuture && (
        <View style={[styles.rhythmTileIconBadge, styles.rhythmTileIconBadgeBottom, { backgroundColor: badgeBg }]}>
          <Ionicons
            name="wine"
            size={17}
            color="rgba(196,137,61,0.95)"
          />
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const ProgressInsightsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const accessInfo = useAccessStatus();
  const appNav = useAppNavigation();

  const [checkIns, setCheckIns] = useState<DailyCheckInSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [legendVisible, setLegendVisible] = useState(false);
  const [recoveryTooltipVisible, setRecoveryTooltipVisible] = useState(false);
  const [reflectionTooltipVisible, setReflectionTooltipVisible] = useState(false);
  const [currentScreen] = useState<CurrentScreen>('progress');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');
  const [gridWidth, setGridWidth] = useState<number>(0);

  // Mock data for demo
  const trendData = useMemo(() => generateMockTrendData(), []);
  const trendInterpretation = useMemo(() => generateTrendInterpretation(trendData), [trendData]);
  const todayInsight = useMemo(() => getTodayInsight(), []);
  
  // Generate calendar data based on selected period
  const periodCount = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
  const calendarData = useMemo(() => generateMockCalendarData(periodCount), [selectedPeriod]);
  
  // Build calendar cells (days + empties to fill full weeks)
  const calendarCells = useMemo(() => {
    const items: CalendarCell[] = calendarData.map((d) => ({ 
      kind: 'day' as const, 
      day: d, 
      key: d.date 
    }));
    const remainder = items.length % 7;
    const empties = remainder === 0 ? 0 : 7 - remainder;
    for (let i = 0; i < empties; i++) {
      items.push({ 
        kind: 'empty' as const, 
        key: `empty-${i}-${selectedPeriod}` 
      });
    }
    return items;
  }, [calendarData, selectedPeriod]);

  // Fetch real check-ins
  const fetchData = useCallback(async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getRecentCheckIns({ uid: user.uid, limit: 30 });
      setCheckIns(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Navigation handlers
  const handleGoToHome = useCallback(() => {
    navigation.dispatch(
      require('@react-navigation/native').CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeMain' }],
      })
    );
  }, [navigation]);

  const handleGoToToday = useCallback(() => {
    navigation.navigate('SmartPlan');
  }, [navigation]);

  const handleGoToProgress = useCallback(() => {
    setMenuVisible(false);
  }, []);

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
      navigation.navigate('EveningCheckInLocked');
    }
  }, [navigation, accessInfo.hasFullAccess]);

  const handleGoToEveningCheckInLocked = useCallback(() => {
    navigation.navigate('EveningCheckInLocked');
  }, [navigation]);

  const handleGoToAccount = useCallback(() => {
    navigation.navigate('Account');
  }, [navigation]);

  const handleGoToSubscription = useCallback((source: string) => {
    navigation.navigate('Paywall', { source });
  }, [navigation]);

  const handleUnlockPremium = useCallback(() => {
    navigation.navigate('Paywall', {
      source: PaywallSource.PROGRESS_INSIGHTS_CTA,
      contextScreen: 'ProgressInsights',
    });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#0F4C44" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Premium gradient background */}
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Subtle vignette overlay */}
      <LinearGradient
        colors={['rgba(15,76,68,0.03)', 'transparent', 'rgba(15,76,68,0.05)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* App Header */}
      <AppHeader
        title="Progress & Insights"
        showBackButton
        onBackPress={() => navigation.goBack()}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0F4C44"
          />
        }
      >
        {/* 1. Context Card */}
        <View style={styles.contextCard}>
          <Text style={styles.contextText}>
            Keep checking in to discover your recovery patterns.
          </Text>
        </View>

        {/* 2. Recovery Trend */}
        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>Recovery Trend</Text>
            <TouchableOpacity
              style={styles.infoIconButton}
              onPress={() => setRecoveryTooltipVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="How to read Recovery Trend"
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="rgba(15, 76, 68, 0.5)"
              />
            </TouchableOpacity>
          </View>
          <RecoveryTrendLineChart
            data={trendData}
            interpretation={trendInterpretation}
          />
        </View>

        {/* 3. Small Insight */}
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>A SMALL INSIGHT</Text>
          <Text style={styles.insightText}>{todayInsight}</Text>
        </View>

        {/* 4. Your Rhythm (Premium) */}
        {accessInfo.hasFullAccess ? (
          <View style={styles.rhythmCard}>
            <View style={styles.rhythmHeader}>
              <Text style={styles.rhythmTitle}>Your Rhythm</Text>
              <TouchableOpacity
                style={styles.infoIconButton}
                onPress={() => setLegendVisible(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="How to read Your Rhythm"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="rgba(15, 76, 68, 0.5)"
                />
              </TouchableOpacity>
            </View>

            {/* Time period selectors */}
            <View style={styles.periodSelectors}>
              {(['7d', '30d', '90d'] as Period[]).map((period, index) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    period === selectedPeriod && styles.periodButtonActive,
                    index === 2 && { marginRight: 0 },
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      period === selectedPeriod && styles.periodButtonTextActive,
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Calendar Grid - container-measured, guaranteed 7 columns */}
            <View
              onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
              style={{ width: '100%' }}
            >
              {gridWidth > 0 && (
                <FlatList
                  data={calendarCells}
                  keyExtractor={(item) => item.key}
                  numColumns={7}
                  scrollEnabled={false}
                  columnWrapperStyle={{ gap: TILE_GAP }}
                  contentContainerStyle={{ gap: TILE_GAP }}
                  renderItem={({ item }) => (
                    <RhythmTile 
                      item={item} 
                      size={(gridWidth - TILE_GAP * 6) / 7}
                      todayId={getTodayId()}
                    />
                  )}
                />
              )}
            </View>
          </View>
        ) : (
          <SoftGateCard
            title="Your Rhythm"
            description="See how recovery patterns form over time with a visual 30-day calendar."
            source={PaywallSource.PROGRESS_RHYTHM_SOFT_GATE}
            contextScreen="ProgressInsights"
          />
        )}

        {/* 5. Reflection Memory (Premium) */}
        {accessInfo.hasFullAccess ? (
          <View style={styles.reflectionCard}>
            <View style={styles.reflectionHeader}>
              <Text style={styles.reflectionTitle}>Reflection Memory</Text>
              <TouchableOpacity
                style={styles.infoIconButton}
                onPress={() => setReflectionTooltipVisible(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Why Reflection Memory matters"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="rgba(15, 76, 68, 0.5)"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.reflectionSubtitle}>
              Your reflections help shape how tomorrow feels.
            </Text>
            <View style={styles.reflectionList}>
              {MOCK_REFLECTIONS.map((reflection, index) => (
                <View key={index} style={styles.reflectionItem}>
                  <Text style={styles.reflectionDay}>{reflection.day}</Text>
                  <Text style={styles.reflectionText}>{reflection.text}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <SoftGateCard
            title="Reflection Memory"
            description="Your reflections help shape how tomorrow feels."
            source={PaywallSource.PROGRESS_REFLECTION_SOFT_GATE}
            contextScreen="ProgressInsights"
          />
        )}

        {/* 6. Premium CTA */}
        {!accessInfo.hasFullAccess && (
          <View style={styles.premiumCTACard}>
            <Text style={styles.premiumCTATitle}>
              See what your body is teaching you
            </Text>
            <Text style={styles.premiumCTADescription}>
              Unlock 30 & 90-day trends, reflection patterns, and deeper recovery insights.
            </Text>
            <TouchableOpacity
              style={styles.premiumCTAButton}
              onPress={handleUnlockPremium}
              activeOpacity={0.8}
            >
              <Text style={styles.premiumCTAButtonText}>Unlock Premium</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Rhythm Legend Modal */}
      <RhythmLegendModal
        visible={legendVisible}
        onClose={() => setLegendVisible(false)}
      />

      {/* App Menu Sheet */}
      <AppMenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        currentScreen={currentScreen}
        onGoToHome={handleGoToHome}
        onGoToToday={handleGoToToday}
        onGoToProgress={handleGoToProgress}
        onGoToCheckIn={handleGoToCheckIn}
        onGoToWaterLog={handleGoToWaterLog}
        onGoToEveningCheckIn={handleGoToEveningCheckIn}
        onGoToEveningCheckInLocked={handleGoToEveningCheckInLocked}
        onGoToAccount={handleGoToAccount}
        onGoToSubscription={handleGoToSubscription}
      />

      {/* Tooltips */}
      <InfoTooltipModal
        visible={recoveryTooltipVisible}
        title="How to read this"
        body={"This line reflects your overall recovery based on daily check-ins.\n\nHigher points mean your body is bouncing back more easily.\nDips are normal — patterns matter more than single days."}
        onClose={() => setRecoveryTooltipVisible(false)}
      />
      <InfoTooltipModal
        visible={reflectionTooltipVisible}
        title="Why this matters"
        body={"Short reflections help you notice what actually improves your recovery.\n\nOver time, patterns emerge — not rules, but awareness."}
        onClose={() => setReflectionTooltipVisible(false)}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Context Card
  contextCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(15, 76, 68, 0.2)',
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 3,
  },
  contextText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.7)',
    lineHeight: 22,
  },

  // Recovery Trend Card
  trendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendTitle: {
    ...typography.sectionTitle,
    fontSize: 22,
    color: '#0F3D3E',
    marginBottom: 0,
  },

  // Small Insight Card
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 3,
  },
  insightLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: 'rgba(15, 76, 68, 0.45)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  insightText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.8)',
    lineHeight: 24,
  },

  // Your Rhythm Card
  rhythmCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  rhythmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rhythmTitle: {
    ...typography.sectionTitle,
    fontSize: 22,
    color: '#0F3D3E',
  },
  infoIconButton: {
    padding: 4,
  },
  periodSelectors: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: '#0F4C44',
  },
  periodButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  rhythmTile: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  rhythmTileEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(15, 76, 68, 0.05)',
  },
  rhythmTileFilled: {
    borderColor: 'transparent',
  },
  rhythmTileIconBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    borderRadius: 8,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rhythmTileIconBadgeBottom: {
    top: 'auto',
    right: 'auto',
    bottom: 3,
    left: 3,
  },

  // Reflection Memory Card
  reflectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  reflectionTitle: {
    ...typography.sectionTitle,
    fontSize: 22,
    color: '#0F3D3E',
    marginBottom: 0,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reflectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    marginBottom: 20,
  },
  reflectionList: {
    gap: 16,
  },
  reflectionItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 76, 68, 0.08)',
  },
  reflectionDay: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0F4C44',
    marginBottom: 4,
  },
  reflectionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.7)',
    lineHeight: 22,
  },

  // Premium CTA Card
  premiumCTACard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  premiumCTATitle: {
    ...typography.sectionTitle,
    fontSize: 24,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
  },
  premiumCTADescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  premiumCTAButton: {
    backgroundColor: '#0F4C44',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: 'rgba(15, 76, 68, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    shadowOpacity: 1,
    elevation: 8,
  },
  premiumCTAButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Tooltip modal (aligned with Rhythm modal)
  tooltipBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 61, 62, 0.4)',
    justifyContent: 'flex-end',
  },
  tooltipCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: 'rgba(15, 76, 68, 0.15)',
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 14,
  },
  tooltipTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: '#0F3D3E',
    marginBottom: 10,
  },
  tooltipBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.78)',
    lineHeight: 22,
    marginBottom: 18,
  },
  tooltipButton: {
    alignSelf: 'center',
    backgroundColor: '#0F4C44',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: 'rgba(15,76,68,0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 6,
  },
  tooltipButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});

export default ProgressInsightsScreen;

