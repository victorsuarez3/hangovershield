/**
 * Progress Screen - Hangover Shield
 * Premium wellness dashboard with progress tracking
 * Consistent with HomeScreen design system
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import { AppHeader } from '../components/AppHeader';
import { AppMenuSheet, CurrentScreen } from '../components/AppMenuSheet';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { useAppNavigation } from '../contexts/AppNavigationContext';
import { SoftGateCard } from '../components/SoftGateCard';
import { LockedSection } from '../components/LockedSection';
import { PaywallSource } from '../constants/paywallSources';
import {
  getRecentCheckIns,
  DailyCheckInSummary,
  calculateStreak,
  countCompletedInLastDays,
} from '../services/dailyCheckIn';
import { getTodayId } from '../utils/dateUtils';
import { typography } from '../design-system/typography';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type DayStatus = 'completed' | 'partial' | 'none';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDateForDisplay = (dateId: string): string => {
  const [year, month, day] = dateId.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if today
  if (dateId === getTodayId()) {
    return 'Today';
  }

  // Check if yesterday
  const yesterdayId = yesterday.toISOString().split('T')[0];
  if (dateId === yesterdayId) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getDayStatus = (summary: DailyCheckInSummary): DayStatus => {
  if (summary.planCompleted) {
    return 'completed';
  }
  if (summary.stepsCompleted > 0 && summary.totalSteps > 0) {
    return 'partial';
  }
  return 'none';
};

const getStatusText = (summary: DailyCheckInSummary): string => {
  const status = getDayStatus(summary);
  switch (status) {
    case 'completed':
      return 'Plan completed';
    case 'partial':
      return `Partially completed (${summary.stepsCompleted}/${summary.totalSteps})`;
    case 'none':
      return 'No plan completed';
  }
};

// Get last 7 days date IDs (including today)
const getLast7DaysIds = (todayId: string): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(todayId + 'T00:00:00');
  
  for (let i = 0; i < 7; i++) {
    const dateId = currentDate.toISOString().split('T')[0];
    dates.push(dateId);
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return dates;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// Empty State with CTA
interface EmptyStateProps {
  onStartCheckIn: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onStartCheckIn }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconCircle}>
      <Ionicons name="calendar-outline" size={40} color="rgba(15, 76, 68, 0.3)" />
    </View>
    <Text style={styles.emptyTitle}>Your journey starts today</Text>
    <Text style={styles.emptyText}>
      Complete your first recovery plan to see your progress here.
    </Text>
    <TouchableOpacity
      style={styles.emptyCTA}
      onPress={onStartCheckIn}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#0F4C44', '#0A3F37']}
        style={styles.emptyCTAGradient}
      >
        <Text style={styles.emptyCTAText}>Complete your first check-in</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

// Progress Snapshot Card (First Progress State)
interface ProgressSnapshotProps {
  daysCompleted: number;
  streak: number;
  totalCheckIns: number;
}

const ProgressSnapshot: React.FC<ProgressSnapshotProps> = ({
  daysCompleted,
  streak,
  totalCheckIns,
}) => {
  // Never show misleading zeroes - only show if > 0
  const showStreak = streak > 0;
  const showDaysCompleted = daysCompleted > 0;
  const showTotalCheckIns = totalCheckIns > 0;

  return (
    <View style={styles.snapshotCard}>
      <Text style={styles.snapshotTitle}>Progress Snapshot</Text>
      <Text style={styles.snapshotSubtitle}>Your recovery journey so far</Text>
      
      <View style={styles.snapshotStats}>
        {showDaysCompleted && (
          <View style={styles.snapshotStat}>
            <Text style={styles.snapshotStatValue}>{daysCompleted}</Text>
            <Text style={styles.snapshotStatLabel}>Days completed</Text>
          </View>
        )}
        {showStreak && (
          <View style={styles.snapshotStat}>
            <View style={styles.streakIconContainer}>
              <Ionicons name="flame" size={20} color="#E8A957" />
            </View>
            <Text style={styles.snapshotStatValue}>{streak}</Text>
            <Text style={styles.snapshotStatLabel}>Current streak</Text>
          </View>
        )}
        {showTotalCheckIns && (
          <View style={styles.snapshotStat}>
            <Text style={styles.snapshotStatValue}>{totalCheckIns}</Text>
            <Text style={styles.snapshotStatLabel}>Total check-ins</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// 7-Day Timeline
interface TimelineProps {
  checkIns: DailyCheckInSummary[];
  todayId: string;
}

const Timeline: React.FC<TimelineProps> = ({ checkIns, todayId }) => {
  const last7Days = getLast7DaysIds(todayId);
  const checkInMap = new Map<string, DailyCheckInSummary>();
  checkIns.forEach((ci) => checkInMap.set(ci.date, ci));

  const getDayStatusForDate = (dateId: string): DayStatus => {
    const checkIn = checkInMap.get(dateId);
    if (!checkIn) return 'none';
    return getDayStatus(checkIn);
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.timelineCard}>
      <Text style={styles.timelineTitle}>Last 7 days</Text>
      <View style={styles.timelineContainer}>
        {last7Days.map((dateId, index) => {
          const status = getDayStatusForDate(dateId);
          const isCompleted = status === 'completed';
          const isPartial = status === 'partial';
          const isToday = dateId === todayId;

          return (
            <View key={dateId} style={styles.timelineDay}>
              <View
                style={[
                  styles.timelineDot,
                  isCompleted && styles.timelineDotCompleted,
                  isPartial && styles.timelineDotPartial,
                  isToday && styles.timelineDotToday,
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.timelineLabel}>{dayLabels[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Trends Section (Premium)
interface TrendsSectionProps {
  checkIns: DailyCheckInSummary[];
  todayId: string;
}

const TrendsSection: React.FC<TrendsSectionProps> = ({ checkIns, todayId }) => {
  const completedLast7Days = countCompletedInLastDays(checkIns, todayId, 7);
  const completedLast30Days = countCompletedInLastDays(checkIns, todayId, 30);
  const streak = calculateStreak(checkIns, todayId);

  return (
    <View style={styles.trendsCard}>
      <Text style={styles.trendsTitle}>Trends</Text>
      <View style={styles.trendsGrid}>
        <View style={styles.trendItem}>
          <Text style={styles.trendValue}>{completedLast7Days}</Text>
          <Text style={styles.trendLabel}>Completed this week</Text>
        </View>
        <View style={styles.trendItem}>
          <Text style={styles.trendValue}>{completedLast30Days}</Text>
          <Text style={styles.trendLabel}>Completed this month</Text>
        </View>
        <View style={styles.trendItem}>
          <View style={styles.streakIconContainer}>
            <Ionicons name="flame" size={18} color="#E8A957" />
          </View>
          <Text style={styles.trendValue}>{streak}</Text>
          <Text style={styles.trendLabel}>Day streak</Text>
        </View>
      </View>
    </View>
  );
};

// History Row
interface HistoryRowProps {
  summary: DailyCheckInSummary;
}

const HistoryRow: React.FC<HistoryRowProps> = ({ summary }) => {
  const status = getDayStatus(summary);
  const statusText = getStatusText(summary);

  return (
    <View style={styles.historyRow}>
      <View style={styles.historyRowLeft}>
        <Text style={styles.historyDate}>{formatDateForDisplay(summary.date)}</Text>
        <Text
          style={[
            styles.historyStatus,
            status === 'completed' && styles.historyStatusCompleted,
            status === 'partial' && styles.historyStatusPartial,
          ]}
        >
          {statusText}
        </Text>
      </View>
      <View style={[
        styles.statusDot,
        status === 'completed' && styles.statusDotCompleted,
        status === 'partial' && styles.statusDotPartial,
      ]}>
        {status === 'completed' && (
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const ProgressScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const accessInfo = useAccessStatus();
  const appNav = useAppNavigation();

  const [checkIns, setCheckIns] = useState<DailyCheckInSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentScreen] = useState<CurrentScreen>('progress');

  const todayId = useMemo(() => getTodayId(), []);

  // Fetch data
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

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Computed values
  const streak = useMemo(() => calculateStreak(checkIns, todayId), [checkIns, todayId]);
  const completedLast7Days = useMemo(
    () => countCompletedInLastDays(checkIns, todayId, 7),
    [checkIns, todayId]
  );
  const totalCheckIns = checkIns.filter((ci) => ci.planCompleted).length;

  // Navigation handlers
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
    setMenuVisible(false);
  }, []);

  const handleGoToCheckIn = useCallback(() => {
    // Navigate directly to CheckIn screen within AppNavigator
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

  // Loading state
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

  const hasCheckIns = checkIns.length > 0;
  const hasCompletedCheckIns = totalCheckIns > 0;

  return (
    <View style={styles.container}>
      {/* Premium gradient background with vignette */}
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

      {/* App Header with Back Button and Menu */}
      <AppHeader
        title="Progress"
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSubtitle}>Track your recovery journey</Text>
        </View>

        {!hasCheckIns ? (
          // Empty State
          <EmptyState onStartCheckIn={handleGoToCheckIn} />
        ) : (
          <>
            {/* Progress Snapshot (First Progress State) */}
            {hasCompletedCheckIns && (
              <ProgressSnapshot
                daysCompleted={completedLast7Days}
                streak={streak}
                totalCheckIns={totalCheckIns}
              />
            )}

            {/* Timeline Section */}
            <Timeline checkIns={checkIns} todayId={todayId} />

            {/* Trends Section */}
            {accessInfo.hasFullAccess ? (
              <TrendsSection checkIns={checkIns} todayId={todayId} />
            ) : (
              <>
                <SoftGateCard
                  title="Unlock 30 & 90-day trends"
                  description="See your recovery patterns over time with advanced insights."
                  source={PaywallSource.PROGRESS_TRENDS_SOFT_GATE}
                  contextScreen="Progress"
                />
                <LockedSection
                  feature="progress_trends"
                  contextScreen="Progress"
                >
                  <TrendsSection checkIns={checkIns} todayId={todayId} />
                </LockedSection>
              </>
            )}

            {/* History Section */}
            <View style={styles.historySection}>
              <Text style={styles.historySectionTitle}>RECENT DAYS</Text>
              
              {!accessInfo.hasFullAccess ? (
                <>
                  {/* Free: Show first 3 days */}
                  <View style={styles.historyList}>
                    {checkIns.slice(0, 3).map((summary) => (
                      <HistoryRow key={summary.id} summary={summary} />
                    ))}
                  </View>
                  
                  {/* Soft Gate for Full History */}
                  <SoftGateCard
                    title="Unlock full history"
                    description="See all your past recovery days and build a complete picture."
                    source={PaywallSource.PROGRESS_HISTORY_SOFT_GATE}
                    contextScreen="Progress"
                  />
                  
                  {/* Locked remaining history */}
                  {checkIns.length > 3 && (
                    <LockedSection
                      feature="progress_history"
                      contextScreen="Progress"
                    >
                      <View style={styles.historyList}>
                        {checkIns.slice(3).map((summary) => (
                          <HistoryRow key={summary.id} summary={summary} />
                        ))}
                      </View>
                    </LockedSection>
                  )}
                </>
              ) : (
                // Premium: Show full history
                <View style={styles.historyList}>
                  {checkIns.map((summary) => (
                    <HistoryRow key={summary.id} summary={summary} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

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

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    ...typography.sectionTitle,
    fontSize: 32,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 3,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    fontSize: 22,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    ...typography.body,
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.5)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyCTA: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyCTAText: {
    ...typography.button,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Progress Snapshot
  snapshotCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  snapshotTitle: {
    ...typography.sectionTitle,
    fontSize: 24,
    color: '#0F3D3E',
    marginBottom: 4,
  },
  snapshotSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.5)',
    marginBottom: 20,
  },
  snapshotStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  snapshotStat: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  snapshotStatValue: {
    ...typography.sectionTitle,
    fontSize: 32,
    color: '#0F4C44',
    marginBottom: 4,
  },
  snapshotStatLabel: {
    ...typography.bodySmall,
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
  },
  streakIconContainer: {
    marginBottom: 4,
  },

  // Timeline
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  timelineTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 16,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineDay: {
    alignItems: 'center',
    gap: 8,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.15)',
  },
  timelineDotCompleted: {
    backgroundColor: '#0F4C44',
    borderColor: '#0F4C44',
  },
  timelineDotPartial: {
    backgroundColor: 'rgba(232, 169, 87, 0.3)',
    borderColor: '#E8A957',
  },
  timelineDotToday: {
    borderWidth: 3,
    borderColor: '#0F4C44',
  },
  timelineLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: 'rgba(15, 61, 62, 0.5)',
  },

  // Trends
  trendsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  trendsTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 16,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  trendItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  trendValue: {
    ...typography.sectionTitle,
    fontSize: 28,
    color: '#0F4C44',
    marginBottom: 4,
  },
  trendLabel: {
    ...typography.bodySmall,
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
  },

  // History Section
  historySection: {
    marginBottom: 16,
  },
  historySectionTitle: {
    ...typography.labelSmall,
    fontSize: 11,
    color: 'rgba(15, 76, 68, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  historyList: {
    gap: 10,
    marginBottom: 12,
  },

  // History Row
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: 'rgba(15, 76, 68, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.08)',
  },
  historyRowLeft: {
    flex: 1,
  },
  historyDate: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: '#0F3D3E',
    marginBottom: 3,
  },
  historyStatus: {
    ...typography.bodySmall,
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.5)',
  },
  historyStatusCompleted: {
    color: '#1A6B5C',
  },
  historyStatusPartial: {
    color: '#C4893D',
  },

  // Status Dot
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.15)',
  },
  statusDotCompleted: {
    backgroundColor: '#0F4C44',
    borderColor: '#0F4C44',
  },
  statusDotPartial: {
    backgroundColor: 'rgba(232, 169, 87, 0.3)',
    borderColor: '#E8A957',
  },
});

export default ProgressScreen;
