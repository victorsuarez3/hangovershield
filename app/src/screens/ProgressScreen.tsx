/**
 * Progress Screen - Hangover Shield
 * Shows streak, weekly summary, and recent history
 * Premium retention-boosting view
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import {
  getRecentCheckIns,
  DailyCheckInSummary,
  calculateStreak,
  countCompletedInLastDays,
} from '../services/dailyCheckIn';
import { getTodayId } from '../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// Status Indicator Dot
const StatusDot: React.FC<{ status: DayStatus }> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'completed':
        return '#1A6B5C';
      case 'partial':
        return '#E8A957';
      case 'none':
        return 'rgba(15, 76, 68, 0.15)';
    }
  };

  const isFilled = status === 'completed';
  const isPartial = status === 'partial';

  return (
    <View
      style={[
        styles.statusDot,
        {
          backgroundColor: isFilled ? getColor() : 'transparent',
          borderColor: getColor(),
          borderWidth: isFilled ? 0 : 2,
        },
      ]}
    >
      {isPartial && <View style={[styles.statusDotHalf, { backgroundColor: getColor() }]} />}
      {isFilled && <Ionicons name="checkmark" size={10} color="#FFF" />}
    </View>
  );
};

// Streak Badge
const StreakBadge: React.FC<{ streak: number }> = ({ streak }) => {
  if (streak === 0) {
    return (
      <View style={styles.streakBadgeEmpty}>
        <Ionicons name="flame-outline" size={16} color="rgba(15, 76, 68, 0.4)" />
        <Text style={styles.streakTextEmpty}>No active streak</Text>
      </View>
    );
  }

  return (
    <View style={styles.streakBadge}>
      <Ionicons name="flame" size={16} color="#E8A957" />
      <Text style={styles.streakText}>
        {streak}-day streak
      </Text>
    </View>
  );
};

// Weekly Summary Card
interface WeeklySummaryProps {
  completedDays: number;
  streak: number;
}

const WeeklySummaryCard: React.FC<WeeklySummaryProps> = ({ completedDays, streak }) => {
  const progress = completedDays / 7;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Progress</Text>
        <Text style={styles.summarySubtitle}>Small wins every day add up.</Text>
      </View>

      {/* This Week */}
      <View style={styles.thisWeekSection}>
        <View style={styles.thisWeekHeader}>
          <Text style={styles.thisWeekLabel}>This week</Text>
          <StreakBadge streak={streak} />
        </View>

        <View style={styles.thisWeekStats}>
          <Text style={styles.thisWeekValue}>
            <Text style={styles.thisWeekNumber}>{completedDays}</Text>
            <Text style={styles.thisWeekOf}> of 7 days completed</Text>
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.weekProgressBar}>
          <View style={[styles.weekProgressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Day dots */}
        <View style={styles.dayDotsContainer}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <View key={index} style={styles.dayDotWrapper}>
              <View
                style={[
                  styles.dayDot,
                  index < completedDays && styles.dayDotCompleted,
                ]}
              />
              <Text style={styles.dayDotLabel}>{day}</Text>
            </View>
          ))}
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
      <StatusDot status={status} />
    </View>
  );
};

// Empty State
const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconCircle}>
      <Ionicons name="calendar-outline" size={40} color="rgba(15, 76, 68, 0.3)" />
    </View>
    <Text style={styles.emptyTitle}>Your journey starts today</Text>
    <Text style={styles.emptyText}>
      Complete your first recovery plan to see your progress here.
    </Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const ProgressScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [checkIns, setCheckIns] = useState<DailyCheckInSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayId = useMemo(() => getTodayId(), []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getRecentCheckIns({ uid: user.uid, limit: 14 });
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
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

        {checkIns.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Weekly Summary */}
            <WeeklySummaryCard completedDays={completedLast7Days} streak={streak} />

            {/* Recent History */}
            <View style={styles.historySection}>
              <Text style={styles.historySectionTitle}>RECENT DAYS</Text>
              <View style={styles.historyList}>
                {checkIns.map((summary) => (
                  <HistoryRow key={summary.id} summary={summary} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 6,
  },
  summaryHeader: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#0F3D3E',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.5)',
  },

  // This Week
  thisWeekSection: {},
  thisWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  thisWeekLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'rgba(15, 76, 68, 0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  thisWeekStats: {
    marginBottom: 12,
  },
  thisWeekValue: {},
  thisWeekNumber: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 36,
    color: '#0F4C44',
  },
  thisWeekOf: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.6)',
  },

  // Week Progress Bar
  weekProgressBar: {
    height: 6,
    backgroundColor: 'rgba(15, 76, 68, 0.1)',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  weekProgressFill: {
    height: '100%',
    backgroundColor: '#0F4C44',
    borderRadius: 3,
  },

  // Day Dots
  dayDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayDotWrapper: {
    alignItems: 'center',
  },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    marginBottom: 6,
  },
  dayDotCompleted: {
    backgroundColor: '#0F4C44',
  },
  dayDotLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(15, 61, 62, 0.4)',
  },

  // Streak Badge
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 169, 87, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  streakText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#C4893D',
  },
  streakBadgeEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 68, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  streakTextEmpty: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(15, 76, 68, 0.4)',
  },

  // History Section
  historySection: {
    marginBottom: 16,
  },
  historySectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: 'rgba(15, 76, 68, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  historyList: {
    gap: 10,
  },

  // History Row
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    padding: 16,
    shadowColor: 'rgba(15, 76, 68, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  historyRowLeft: {
    flex: 1,
  },
  historyDate: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0F3D3E',
    marginBottom: 3,
  },
  historyStatus: {
    fontFamily: 'Inter_400Regular',
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
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statusDotHalf: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
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
  },
  emptyTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ProgressScreen;

