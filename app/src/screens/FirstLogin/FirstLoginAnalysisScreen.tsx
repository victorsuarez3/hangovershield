import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppHeader } from '../../components/AppHeader';
import {
  DailyCheckInSeverity,
  SEVERITY_LABELS,
} from '../../services/dailyCheckIn';
import { FirstLoginCheckInData } from './FirstLoginCheckInScreen';

export interface FirstLoginAnalysisParams {
  checkInData: FirstLoginCheckInData;
}

type FirstLoginAnalysisRouteProp = RouteProp<
  { FirstLoginAnalysis: FirstLoginAnalysisParams },
  'FirstLoginAnalysis'
>;

interface InsightContent {
  icon: string;
  title: string;
  subcopy: string;
  message: string;
  color: string;
}

const getInsightContent = (severity: DailyCheckInSeverity, symptomsCount: number): InsightContent => {
  const brandGreen = '#0F4C44';
  const brandGreenLight = '#0A6B5F';
  const brandGreenDark = '#0A3F37';
  
  switch (severity) {
    case 'severe':
      return {
        icon: 'water',
        title: "Let's stabilize first.",
        subcopy: "Nothing alarming. Your body just needs a bit of support today.",
        message: symptomsCount > 0
          ? `${symptomsCount} symptom${symptomsCount > 1 ? 's' : ''} today. We'll start with the smallest steps that bring relief first.`
          : "We'll start with the smallest steps that bring relief first.",
        color: brandGreenDark,
      };
    case 'moderate':
      return {
        icon: 'leaf',
        title: "Your body's working.",
        subcopy: "Nothing alarming. Your body just needs a bit of support today.",
        message: symptomsCount > 0
          ? `${symptomsCount} symptom${symptomsCount > 1 ? 's' : ''} today. We'll reduce stress load and support hydration so you recover faster.`
          : "We'll reduce stress load and support hydration so you recover faster.",
        color: brandGreen,
      };
    case 'mild':
      return {
        icon: 'partly-sunny',
        title: 'Light load today.',
        subcopy: "Nothing alarming. Your body just needs a bit of support today.",
        message: symptomsCount > 0
          ? `${symptomsCount} symptom${symptomsCount > 1 ? 's' : ''} today. We'll focus on hydration and nervous system calm to get you back to 100%.`
          : "We'll focus on hydration and nervous system calm to get you back to 100%.",
        color: brandGreenLight,
      };
    case 'none':
      return {
        icon: 'checkmark-circle',
        title: 'Solid baseline.',
        subcopy: "Nothing alarming. Your body just needs a bit of support today.",
        message: "Quick support today. We'll help you stay balanced and build the habit.",
        color: brandGreen,
      };
    default:
      return {
        icon: 'leaf',
        title: "We'll guide you.",
        subcopy: 'Quick, steady actions only.',
        message: "We'll keep it simple and focused on what moves the needle today.",
        color: brandGreen,
      };
  }
};

export const FirstLoginAnalysisScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<FirstLoginAnalysisRouteProp>();

  const { checkInData } = route.params || {};

  const iconScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const authorityLineOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(authorityLineOpacity, {
      toValue: 1,
      duration: 250,
      delay: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 400,
      delay: 700,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [authorityLineOpacity, buttonOpacity, contentOpacity, iconScale, pulseScale]);

  if (!checkInData) {
    navigation.navigate('FirstLoginCheckIn');
    return null;
  }

  const { severity, symptoms } = checkInData;
  const insight = getInsightContent(severity, symptoms.length);

  const handleContinue = () => {
    navigation.navigate('FirstLoginPlanReady', {
      checkInData,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(15,76,68,0.03)', 'transparent', 'rgba(15,76,68,0.05)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <AppHeader
        title="Your insight"
        subtitle="Based on where you're at"
        showBackButton
        onBackPress={() => navigation.goBack()}
        titleSize={28}
        subtitleSize={16}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: Animated.multiply(iconScale, pulseScale) }],
            },
          ]}
        >
          <View style={[styles.iconGlow, { backgroundColor: `${insight.color}20` }]}>
            <Ionicons name={insight.icon as any} size={64} color={insight.color} />
          </View>
        </Animated.View>

        <Text style={styles.severityLabel}>{SEVERITY_LABELS[severity]}</Text>
        <Text style={styles.insightTitle}>{insight.title}</Text>

        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={styles.insightSubcopy}>{insight.subcopy}</Text>
        </Animated.View>

        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={styles.insightMessage}>{insight.message}</Text>
        </Animated.View>
        
        <Animated.View style={{ opacity: authorityLineOpacity }}>
          <Text style={styles.authorityLine}>
            Most symptoms come from dehydration and nervous system stress — not something wrong with you.
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.fixedCTA,
          { paddingBottom: insets.bottom + 16, opacity: buttonOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0F4C44', '#0A3F37']}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>See your plan →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
  },
  severityLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  insightTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 36,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  insightSubcopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  insightMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: 'rgba(15, 61, 62, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
  },
  authorityLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
    fontStyle: 'italic',
  },
  fixedCTA: {
    backgroundColor: 'rgba(228, 242, 239, 0.95)',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 76, 68, 0.1)',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(15, 76, 68, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    shadowOpacity: 0.7,
    elevation: 4,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  continueButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});


export default FirstLoginAnalysisScreen;
