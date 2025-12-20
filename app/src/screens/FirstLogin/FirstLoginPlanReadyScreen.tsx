/**
 * First Login Plan Ready
 * Step 3/3: confirm plan is ready, save check-in, mark onboarding done, and go to Today Plan.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../../providers/AuthProvider';
import { setFirstLoginOnboardingCompleted } from '../../services/dailyCheckInStorage';
import { markFirstLoginOnboardingCompleted } from '../../services/auth';
import { FirstLoginCheckInData } from './FirstLoginCheckInScreen';
import { getLocalDayId, saveLocalDailyCheckIn, LocalDailyCheckIn } from '../../services/dailyCheckInStorage';
import { saveTodayDailyCheckIn, SEVERITY_LABELS } from '../../services/dailyCheckIn';

export interface FirstLoginPlanReadyParams {
  checkInData: FirstLoginCheckInData;
}

type Route = RouteProp<{ FirstLoginPlanReady: FirstLoginPlanReadyParams }, 'FirstLoginPlanReady'>;

interface ChecklistItem {
  id: string;
  label: string;
  delay: number;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: '1', label: 'Mapped your symptoms', delay: 0 },
  { id: '2', label: 'Built your step-by-step plan', delay: 1800 },
  { id: '3', label: 'Ready to guide you today', delay: 3600 },
];

const ChecklistItemView: React.FC<{ label: string; delay: number; isLast?: boolean }> = ({
  label,
  delay,
  isLast,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [isProcessing, setIsProcessing] = React.useState(true);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const spinner = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }).start();
    spinner.current = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1400, useNativeDriver: true })
    );
    spinner.current.start();
    const t = setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      spinner.current?.stop();
      Animated.spring(checkScale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }).start();
    }, delay + 1700);
    return () => {
      clearTimeout(t);
      spinner.current?.stop();
    };
  }, [delay, checkScale, spin, opacity]);

  return (
    <Animated.View style={[styles.checkItem, isLast && styles.checkItemLast, { opacity }]}>
      <View style={styles.checkIconContainer}>
        {isCompleted ? (
          <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: checkScale }] }]}>
            <View style={styles.checkmarkBackground}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          </Animated.View>
        ) : isProcessing ? (
          <Animated.View
            style={[
              styles.spinnerContainer,
              {
                transform: [
                  {
                    rotate: spin.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.spinnerCircle} />
          </Animated.View>
        ) : (
          <View style={styles.pendingCircle} />
        )}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Animated.View>
  );
};

export const FirstLoginPlanReadyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { user } = useAuth();
  const { checkInData } = route.params || {};
  const [isCompleting, setIsCompleting] = React.useState(false);
  // Halo breathing opacity (subtle, starts soft)
  const haloOpacity = useRef(new Animated.Value(0.22)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloOpacity, {
          toValue: 0.38,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(haloOpacity, {
          toValue: 0.22,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [haloOpacity]);

  useEffect(() => {
    if (!checkInData) {
      navigation.replace('FirstLoginCheckIn');
    }
  }, [checkInData, navigation]);

  const handleComplete = async () => {
    if (!checkInData || isCompleting) return;
    setIsCompleting(true);
    try {
      const todayId = getLocalDayId();
      const localCheckIn: Omit<LocalDailyCheckIn, 'createdAt' | 'version'> = {
        id: todayId,
        level: checkInData.severity,
        symptoms: checkInData.symptoms,
        source: 'daily_checkin',
      };
      await saveLocalDailyCheckIn(localCheckIn);

      if (user?.uid) {
        try {
          await saveTodayDailyCheckIn(user.uid, {
            severity: checkInData.severity,
            severityLabel: SEVERITY_LABELS[checkInData.severity],
            symptoms: checkInData.symptoms,
          });
        } catch (err) {
          console.error('[FirstLoginPlanReady] Firestore save error:', err);
        }
      }

      await setFirstLoginOnboardingCompleted();
      if (user?.uid) {
        await markFirstLoginOnboardingCompleted(user.uid);
      }

      navigation.replace('TodayRecoveryPlan');
    } catch (error) {
      console.error('[FirstLoginPlanReady] Error completing onboarding:', error);
      navigation.replace('TodayRecoveryPlan');
    }
  };

  if (!checkInData) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <AppHeader
        title="Your plan is ready"
        subtitle="We built this just for you"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View style={[styles.content, { paddingTop: 16, paddingBottom: 0, justifyContent: 'flex-start' }]}>
        <Text style={styles.secondaryTitle}>Everything's set.</Text>
        <Text style={styles.secondarySubtitle}>
          Your personalized recovery plan is ready. Let's get you feeling better.
        </Text>

        {/* ✅ CHANGED: View -> Animated.View + breathing opacity */}
        <Animated.View style={[styles.halo, { opacity: haloOpacity }]} pointerEvents="none" />

        <View style={styles.card}>
          {CHECKLIST_ITEMS.map((item, idx) => (
            <ChecklistItemView
              key={item.id}
              label={item.label}
              delay={item.delay}
              isLast={idx === CHECKLIST_ITEMS.length - 1}
            />
          ))}
        </View>
        <Text style={styles.midNote}>Small steps today make a big difference tomorrow.</Text>
      </View>

      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleComplete}
          activeOpacity={0.8}
          disabled={isCompleting}
        >
          <LinearGradient colors={['#0F4C44', '#0A3F37']} style={styles.ctaGradient}>
            {isCompleting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.ctaText}>Loading plan...</Text>
              </>
            ) : (
              <Text style={styles.ctaText}>Start my plan →</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.reassuranceCta}>Your plan adapts automatically if tomorrow feels different.</Text>
        <Text style={styles.helperText}>You can update this anytime in Daily Check-In.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
    justifyContent: 'flex-start',
  },
  secondaryTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: '#0F3D3E',
    marginTop: 4,
    marginBottom: 8,
    letterSpacing: -0.2,
    textAlign: 'left',
  },
  secondarySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15,61,62,0.8)',
    marginBottom: 20,
    lineHeight: 23,
    textAlign: 'left',
  },

  halo: {
    position: 'absolute',
    top: 162,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 18,
    padding: 24,
    marginTop: 90,
    marginBottom: 28,
    shadowColor: 'rgba(15,76,68,0.14)',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 5,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkItemLast: { marginBottom: 0 },
  checkIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkmarkContainer: { alignItems: 'center', justifyContent: 'center' },
  checkmarkBackground: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0F4C44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: 'rgba(15, 76, 68, 0.25)',
    borderTopColor: '#0F4C44',
  },
  pendingCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.3)',
  },
  checkLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#0F3D3E',
    flex: 1,
    lineHeight: 22,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(228,242,239,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,76,68,0.08)',
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: 'rgba(10,63,55,0.25)',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  midNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15,61,62,0.55)',
    textAlign: 'center',
    marginTop: 0-5,
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15,61,62,0.55)',
    textAlign: 'center',
    marginTop: 8,
  },
  reassuranceCta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15,61,62,0.7)',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default FirstLoginPlanReadyScreen;
