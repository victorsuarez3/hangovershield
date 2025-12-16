/**
 * Daily Reward Screen - Hangover Shield
 * Psychological reward after completing daily check-in
 * Provides insight, habit tracking, and micro-step suggestion
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { DailyCheckIn, HabitStats, DailyInsight } from '../types/checkins';
import { getHabitStats } from '../services/dailyCheckIns';
import { useAuth } from '../providers/AuthProvider';
import { AppHeader } from '../components/AppHeader';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DailyRewardScreenProps {
  navigation: any;
  route: {
    params: {
      checkIn: DailyCheckIn;
      onComplete?: () => void;
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Insight Generation Logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate personalized insight based on severity and symptoms
 * Maps user's current state to appropriate body insight and micro-step
 */
const generateDailyInsight = (checkIn: DailyCheckIn): DailyInsight => {
  const { severity, symptoms } = checkIn;

  // Severity-based heading
  const headings = {
    none: "You're doing great today",
    mild: 'A gentle day ahead',
    moderate: 'Recovery is a journey',
    severe: 'Take it one step at a time',
  };

  // Subheadings
  const subheadings = {
    none: 'Celebrate feeling well',
    mild: 'Your body is recovering',
    moderate: 'Listen to what you need',
    severe: 'Be patient with yourself',
  };

  // Severity summary
  const severitySummaries = {
    none: 'Feeling well',
    mild: 'Mild symptoms',
    moderate: 'Moderate discomfort',
    severe: 'Significant symptoms',
  };

  // Symptoms summary
  const symptomsSummary =
    symptoms.length === 0
      ? 'No symptoms reported'
      : symptoms.length === 1
      ? symptoms[0]
      : symptoms.length === 2
      ? `${symptoms[0]} & ${symptoms[1]}`
      : `${symptoms[0]}, ${symptoms[1]} & ${symptoms.length - 2} more`;

  // Body insight - personalized based on severity + symptom patterns
  let bodyInsight = '';

  if (severity === 'none') {
    bodyInsight =
      'Your body has recovered well. This is a great time to reflect on what helped you feel better and maintain healthy habits.';
  } else if (severity === 'mild') {
    if (symptoms.includes('Headache') || symptoms.includes('Fatigue')) {
      bodyInsight =
        'Your body is working through dehydration and inflammation. Gentle movement and consistent hydration will help you feel better soon.';
    } else if (symptoms.includes('Nausea') || symptoms.includes('Stomach pain')) {
      bodyInsight =
        'Your digestive system is recovering. Bland, easy-to-digest foods and staying hydrated will support your body natural healing.';
    } else {
      bodyInsight =
        'Your body is in the early stages of recovery. Rest, hydration, and gentle self-care will help you bounce back.';
    }
  } else if (severity === 'moderate') {
    if (symptoms.includes('Anxiety') || symptoms.includes('Mood swings')) {
      bodyInsight =
        'Alcohol affects neurotransmitters like serotonin and dopamine. These feelings are temporary - your brain chemistry is rebalancing.';
    } else if (symptoms.includes('Headache') || symptoms.includes('Light sensitivity')) {
      bodyInsight =
        'Your brain is responding to dehydration and inflammation. Electrolytes, dim lighting, and rest will ease the discomfort.';
    } else {
      bodyInsight =
        'Your body is actively recovering. This discomfort is temporary, and each hour brings you closer to feeling like yourself again.';
    }
  } else {
    // severe
    bodyInsight =
      'Severe symptoms are your body signal to prioritize rest and hydration. Be gentle with yourself - recovery takes time, and you deserve care.';
  }

  // Micro-step - actionable, achievable suggestion
  let microStep = '';

  if (severity === 'none') {
    microStep = 'Reflect on one habit that helped you feel well today.';
  } else if (severity === 'mild') {
    if (symptoms.includes('Headache') || symptoms.includes('Fatigue')) {
      microStep = 'Drink 500ml of water with electrolytes in the next hour.';
    } else if (symptoms.includes('Nausea')) {
      microStep = 'Try ginger tea or a small snack like crackers or toast.';
    } else {
      microStep = 'Take 5 deep breaths and rest for 15 minutes.';
    }
  } else if (severity === 'moderate') {
    if (symptoms.includes('Anxiety') || symptoms.includes('Mood swings')) {
      microStep = 'Try a 3-minute breathing exercise or gentle stretching.';
    } else if (symptoms.includes('Headache')) {
      microStep = 'Rest in a dark, quiet room with a cool compress for 20 minutes.';
    } else {
      microStep = 'Prioritize hydration and avoid screen time for the next hour.';
    }
  } else {
    // severe
    microStep = 'Rest is your only job right now. Hydrate slowly and seek support if needed.';
  }

  return {
    heading: headings[severity],
    subheading: subheadings[severity],
    severitySummary: severitySummaries[severity],
    symptomsSummary,
    bodyInsight,
    microStep,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const DailyRewardScreen: React.FC<DailyRewardScreenProps> = ({ navigation, route }) => {
  const { checkIn } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [habitStats, setHabitStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrationLogged, setHydrationLogged] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  // Generate insight from check-in data
  const insight = generateDailyInsight(checkIn);

  // Fetch habit stats
  useEffect(() => {
    const fetchStats = async () => {
      // If no user exists (skip-auth mode), use mock data for testing
      if (!user?.uid) {
        console.log('[DailyReward] No user found, using mock habit stats for testing');
        const mockStats: HabitStats = {
          userId: 'test-user-skip-auth',
          currentStreak: 1,
          longestStreak: 1,
          monthlyCheckIns: 1,
          updatedAt: Date.now(),
        };
        setHabitStats(mockStats);
        setLoading(false);
        return;
      }

      // Real user - fetch from Firestore
      try {
        const stats = await getHabitStats(user.uid);
        setHabitStats(stats);
      } catch (error) {
        console.error('[DailyReward] Error fetching habit stats, using fallback:', error);
        // Use fallback stats on error
        const fallbackStats: HabitStats = {
          userId: user.uid,
          currentStreak: 1,
          longestStreak: 1,
          monthlyCheckIns: 1,
          updatedAt: Date.now(),
        };
        setHabitStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user?.uid]);

  const handleHydrationLog = (amount: number) => {
    setHydrationLogged(true);
    // TODO: Implement hydration logging to Firestore
    console.log('[DailyReward] Logged hydration:', amount, 'ml');
  };

  const handleDone = () => {
    // After completing today's check-in, send user back to Home (Today) screen
    // so they see the "Today's check-in is complete" state.
    const onComplete = route.params.onComplete;
    if (onComplete) {
      console.log('[DailyReward] Daily check-in complete, calling onComplete callback');
      onComplete();
    } else {
      // Fallback: This shouldn't happen in normal flow, but navigate to Home just in case
      console.log('[DailyReward] No onComplete callback, navigating back to app');
      navigation.navigate('Home');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0E4C45" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader showBackButton={false} transparent />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header Insight */}
          <View style={styles.headerSection}>
            <Text style={styles.heading}>{insight.heading}</Text>
            <Text style={styles.subheading}>{insight.subheading}</Text>
          </View>

          {/* Today's Snapshot Card */}
          <View style={styles.snapshotCard}>
            <View style={styles.snapshotHeader}>
              <Ionicons name="today-outline" size={20} color="#0E4C45" />
              <Text style={styles.snapshotTitle}>Today's check-in</Text>
            </View>

            <View style={styles.snapshotRow}>
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>How you feel</Text>
                <Text style={styles.snapshotValue}>{insight.severitySummary}</Text>
              </View>
              <View style={styles.snapshotDivider} />
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Symptoms</Text>
                <Text style={styles.snapshotValue}>{insight.symptomsSummary}</Text>
              </View>
            </View>

            {/* Body Insight */}
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>{insight.bodyInsight}</Text>
            </View>
          </View>

          {/* Habit Tracker Block */}
          {habitStats && (
            <View style={styles.habitCard}>
              <View style={styles.habitHeader}>
                <Ionicons name="flame-outline" size={20} color="#E8774D" />
                <Text style={styles.habitTitle}>Your habit tracker</Text>
              </View>

              <View style={styles.habitStats}>
                <View style={styles.habitStatItem}>
                  <Text style={styles.habitStatValue}>{habitStats.currentStreak}</Text>
                  <Text style={styles.habitStatLabel}>
                    {habitStats.currentStreak === 1 ? 'day' : 'days'} streak
                  </Text>
                </View>
                <View style={styles.habitStatDivider} />
                <View style={styles.habitStatItem}>
                  <Text style={styles.habitStatValue}>{habitStats.longestStreak}</Text>
                  <Text style={styles.habitStatLabel}>longest streak</Text>
                </View>
                <View style={styles.habitStatDivider} />
                <View style={styles.habitStatItem}>
                  <Text style={styles.habitStatValue}>{habitStats.monthlyCheckIns}</Text>
                  <Text style={styles.habitStatLabel}>this month</Text>
                </View>
              </View>

              {habitStats.currentStreak >= 3 && (
                <View style={styles.streakEncouragement}>
                  <Ionicons name="star" size={16} color="#E8A957" />
                  <Text style={styles.streakEncouragementText}>
                    {habitStats.currentStreak === habitStats.longestStreak
                      ? 'New record! Keep it going.'
                      : `${habitStats.currentStreak} days strong. You're building a habit.`}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Today's Micro-Step Card */}
          <View style={styles.microStepCard}>
            <View style={styles.microStepHeader}>
              <Ionicons name="footsteps-outline" size={20} color="#0E4C45" />
              <Text style={styles.microStepTitle}>Today's micro-step</Text>
            </View>
            <Text style={styles.microStepText}>{insight.microStep}</Text>
          </View>

          {/* Quick Hydration Log (Optional) */}
          {checkIn.severity !== 'none' && (
            <View style={styles.hydrationCard}>
              <Text style={styles.hydrationTitle}>Quick hydration log</Text>
              <Text style={styles.hydrationSubtitle}>Track water intake (optional)</Text>

              {!hydrationLogged ? (
                <View style={styles.hydrationButtons}>
                  <TouchableOpacity
                    style={styles.hydrationButton}
                    onPress={() => handleHydrationLog(250)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="water-outline" size={20} color="#0E4C45" />
                    <Text style={styles.hydrationButtonText}>+250ml</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.hydrationButton}
                    onPress={() => handleHydrationLog(500)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="water" size={20} color="#0E4C45" />
                    <Text style={styles.hydrationButtonText}>+500ml</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.hydrationLogged}>
                  <Ionicons name="checkmark-circle" size={20} color="#0E4C45" />
                  <Text style={styles.hydrationLoggedText}>Logged! Keep drinking water today.</Text>
                </View>
              )}
            </View>
          )}

          {/* Done CTA */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#0E4C45', '#0F3D3E']}
              style={styles.doneButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.doneButtonText}>Done for today</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: '#D8EDE8',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#D8EDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  content: {
    paddingTop: 8,
  },

  // Header Insight
  headerSection: {
    marginBottom: 24,
  },
  heading: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subheading: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.6)',
    letterSpacing: 0.2,
  },

  // Today's Snapshot Card
  snapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 4,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  snapshotTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0E4C45',
    marginLeft: 8,
  },
  snapshotRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  snapshotItem: {
    flex: 1,
  },
  snapshotLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.5)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  snapshotValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F3D3E',
  },
  snapshotDivider: {
    width: 1,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    marginHorizontal: 16,
  },
  insightBox: {
    backgroundColor: 'rgba(216, 237, 232, 0.4)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#0E4C45',
  },
  insightText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#0F3D3E',
    lineHeight: 22,
  },

  // Habit Tracker Card
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: 'rgba(232, 135, 77, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 4,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#E8774D',
    marginLeft: 8,
  },
  habitStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  habitStatValue: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
    marginBottom: 4,
  },
  habitStatLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.5)',
    textAlign: 'center',
  },
  habitStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
  },
  streakEncouragement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 76, 68, 0.06)',
  },
  streakEncouragementText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#C4893D',
    marginLeft: 8,
  },

  // Micro-Step Card
  microStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 4,
  },
  microStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  microStepTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0E4C45',
    marginLeft: 8,
  },
  microStepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#0F3D3E',
    lineHeight: 24,
  },

  // Hydration Card
  hydrationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.1)',
  },
  hydrationTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0E4C45',
    marginBottom: 4,
  },
  hydrationSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.5)',
    marginBottom: 14,
  },
  hydrationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  hydrationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(14, 76, 69, 0.2)',
  },
  hydrationButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0E4C45',
  },
  hydrationLogged: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 76, 69, 0.06)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  hydrationLoggedText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0E4C45',
    marginLeft: 8,
  },

  // Done Button
  doneButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(14, 76, 69, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  doneButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  doneButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default DailyRewardScreen;
