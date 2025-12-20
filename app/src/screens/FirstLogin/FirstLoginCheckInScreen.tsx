/**
 * First Login Check-In
 * Step 1/3 of first-login onboarding: select severity + symptoms.
 */
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FirstLoginOnboardingStackParamList } from '../../navigation/FirstLoginOnboardingNavigator';
import { AppHeader } from '../../components/AppHeader';

export type FeelingOption = 'mild' | 'moderate' | 'severe' | 'none';

export type SymptomKey =
  | 'headache'
  | 'nausea'
  | 'dryMouth'
  | 'dizziness'
  | 'fatigue'
  | 'anxiety'
  | 'brainFog'
  | 'poorSleep'
  | 'noSymptoms';

export interface FirstLoginCheckInData {
  severity: FeelingOption;
  symptoms: SymptomKey[];
}

type Nav = NativeStackNavigationProp<FirstLoginOnboardingStackParamList, 'FirstLoginCheckIn'>;

const SYMPTOMS: SymptomKey[] = [
  'headache',
  'nausea',
  'dryMouth',
  'dizziness',
  'fatigue',
  'anxiety',
  'brainFog',
  'poorSleep',
  'noSymptoms',
];

const FEELING_OPTIONS: Record<
  FeelingOption,
  { label: string; description: string; iconOutline: string; iconFilled: string; accent: string }
> = {
  mild: {
    label: 'Mild hangover',
    description: 'Slight headache, a bit tired.',
    iconOutline: 'partly-sunny-outline',
    iconFilled: 'partly-sunny-outline', // keep outline when active
    accent: '#0F3F46',
  },
  moderate: {
    label: 'Moderate hangover',
    description: 'Heavy head, low energy, some nausea.',
    iconOutline: 'cloud-outline',
    iconFilled: 'cloud-outline',
    accent: '#0F3F46',
  },
  severe: {
    label: 'Severe hangover',
    description: 'Very rough morning. I want full guidance.',
    iconOutline: 'thunderstorm-outline',
    iconFilled: 'thunderstorm-outline',
    accent: '#0F3F46',
  },
  none: {
    label: 'Not hungover today',
    description: 'Just checking in and building healthier habits.',
    iconOutline: 'sunny-outline',
    iconFilled: 'sunny-outline',
    accent: '#0F3F46',
  },
};

const SYMPTOM_LABELS: Record<SymptomKey, string> = {
  headache: 'Headache',
  nausea: 'Nausea',
  dryMouth: 'Dry mouth',
  dizziness: 'Dizziness',
  fatigue: 'Fatigue',
  anxiety: 'Anxiety',
  brainFog: 'Brain fog',
  poorSleep: 'Poor sleep',
  noSymptoms: 'No symptoms',
};

export const FirstLoginCheckInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [severity, setSeverity] = useState<FeelingOption | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomKey[]>([]);

  const canContinue = useMemo(() => !!severity && symptoms.length > 0, [severity, symptoms.length]);

  const toggleSymptom = useCallback(
    (symptom: SymptomKey) => {
      setSymptoms((prev) => {
        if (symptom === 'noSymptoms') {
          return prev.includes('noSymptoms') ? [] : ['noSymptoms'];
        }
        const withoutNone = prev.filter((s) => s !== 'noSymptoms');
        if (withoutNone.includes(symptom)) {
          return withoutNone.filter((s) => s !== symptom);
        }
        return [...withoutNone, symptom];
      });
    },
    [],
  );

  const handleContinue = useCallback(() => {
    if (!severity || !canContinue) return;
    navigation.navigate('FirstLoginAnalysis', {
      checkInData: {
        severity,
        symptoms,
      },
    });
  }, [severity, symptoms, canContinue, navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <AppHeader
        title="How are you feeling?"
        subtitle="Let's understand where you're at today"
        showBackButton={false}
        titleSize={26}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 12, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Severity options */}
        <Text style={styles.sectionTitle}>Select your current state</Text>
        <View style={styles.cardsContainer}>
          {(['mild', 'moderate', 'severe', 'none'] as FeelingOption[]).map((item) => {
            const option = FEELING_OPTIONS[item];
            const active = severity === item;
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.severityCard,
                  active && [
                    styles.severityCardActive,
                    {
                      borderColor: option.accent,
                      shadowColor: `${option.accent}55`,
                      backgroundColor: `${option.accent}0D`,
                    },
                  ],
                ]}
                onPress={() => setSeverity(item)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconCircle,
                    active && [styles.iconCircleActive, { backgroundColor: option.accent }],
                  ]}
                >
                  <Ionicons
                    name={(active ? option.iconFilled : option.iconOutline) as any}
                    size={28}
                    color={active ? '#FFFFFF' : option.accent}
                  />
                </View>
                <View style={styles.severityTextContainer}>
                  <Text style={[styles.severityLabel, active && styles.severityLabelActive]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.severityDescription, active && styles.severityDescriptionActive]}>
                    {option.description}
                  </Text>
                </View>
                <View style={[styles.checkbox, active && [styles.checkboxActive, { borderColor: option.accent, backgroundColor: `${option.accent}1A` }]]}>
                  {active && <View style={[styles.checkboxInner, { backgroundColor: option.accent }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Symptoms */}
        <Text style={styles.sectionTitle}>What symptoms are you experiencing?</Text>
        <Text style={styles.sectionSubtitle}>Select all that apply</Text>
        <View style={styles.chipGrid}>
          {SYMPTOMS.map((symptom) => {
            const active = symptoms.includes(symptom);
            return (
              <TouchableOpacity
                key={symptom}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleSymptom(symptom)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {SYMPTOM_LABELS[symptom]}
                </Text>
                {active && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.ctaButton, !canContinue && styles.ctaButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Continue →</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>Takes ~15 seconds. This guides your plan.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: '#0F3D3E',
    marginBottom: 14,
    marginTop: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15,61,62,0.6)',
    marginBottom: 12,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 28,
  },
  severityCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(15,76,68,0.12)',
    shadowColor: 'rgba(15,76,68,0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 6,
  },
  severityCardActive: {
    // backgroundColor handled inline per accent (light tint, not solid)
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(15,76,68,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconCircleActive: {
    backgroundColor: '#0F3F46',
  },
  severityTextContainer: {
    flex: 1,
  },
  severityLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#0F3D3E',
    marginBottom: 3,
  },
  severityLabelActive: {
    color: '#0F3D3E',
  },
  severityDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15,61,62,0.65)',
    lineHeight: 19,
  },
  severityDescriptionActive: {
    color: 'rgba(15,61,62,0.75)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(15,76,68,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkboxActive: {
    borderColor: '#0F3F46',
    backgroundColor: 'rgba(15,63,70,0.08)',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0F3F46',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15,76,68,0.15)',
    shadowColor: 'rgba(15,76,68,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 1,
  },
  chipActive: {
    backgroundColor: '#0F4C44',
    borderColor: '#0F4C44',
  },
  chipLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#0F3D3E',
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(228,242,239,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,76,68,0.08)',
  },
  ctaButton: {
    backgroundColor: '#0A3F37',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: 'rgba(10,63,55,0.25)',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  ctaButtonDisabled: {
    backgroundColor: 'rgba(10,63,55,0.4)',
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15,61,62,0.55)',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default FirstLoginCheckInScreen;
