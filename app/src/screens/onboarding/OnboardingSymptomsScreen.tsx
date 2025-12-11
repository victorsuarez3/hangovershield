/**
 * Onboarding Symptoms Screen - Hangover Shield
 * Premium onboarding step 2: "What are you feeling right now?"
 * Multi-select symptom chips for personalized recovery plan
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { typography } from '../../design-system/typography';
import {
  OnboardingStackParamList,
  FeelingOption,
  SymptomKey,
} from '../../navigation/OnboardingNavigator';

interface SymptomData {
  key: SymptomKey;
  label: string;
}

const SYMPTOMS: SymptomData[] = [
  { key: 'headache', label: 'Headache' },
  { key: 'nausea', label: 'Nausea' },
  { key: 'dryMouth', label: 'Dry mouth' },
  { key: 'dizziness', label: 'Dizziness' },
  { key: 'fatigue', label: 'Low energy' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'brainFog', label: 'Brain fog' },
  { key: 'poorSleep', label: 'Poor sleep' },
  { key: 'noSymptoms', label: 'No symptoms, just checking in' },
];

type OnboardingSymptomsRouteProp = RouteProp<
  OnboardingStackParamList,
  'OnboardingSymptoms'
>;

/**
 * Symptom Chip Component
 * Individual selectable chip for each symptom
 * Premium Apple-style with scale-in animation
 */
const SymptomChip: React.FC<{
  data: SymptomData;
  isSelected: boolean;
  onPress: () => void;
}> = ({ data, isSelected, onPress }) => {
  // Scale animation for premium selection effect
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      // Scale-in animation: 110% → 100% in 100ms (very smooth, Apple-style)
      scaleAnim.setValue(1.1); // Start at 110%
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isSelected]);

  const isNoSymptoms = data.key === 'noSymptoms';
  const chipStyle = isNoSymptoms ? styles.chipNoSymptoms : styles.chip;
  const chipSelectedStyle = isNoSymptoms
    ? styles.chipNoSymptomsSelected
    : styles.chipSelected;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        chipStyle,
        isSelected && chipSelectedStyle,
        pressed && styles.chipPressed,
      ]}
    >
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          transform: [{ scale: scaleAnim }],
        }}
      >
        {isSelected && !isNoSymptoms && (
          <Ionicons
            name="checkmark"
            size={16}
            color="#0F3D3E"
            style={styles.chipIcon}
          />
        )}
        <Text
          style={[
            isNoSymptoms ? styles.chipLabelNoSymptoms : styles.chipLabel,
            isSelected && !isNoSymptoms && styles.chipLabelSelected,
          ]}
        >
          {data.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export const OnboardingSymptomsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const route = useRoute<OnboardingSymptomsRouteProp>();
  const feeling: FeelingOption = route.params?.feeling ?? 'none';
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomKey[]>([]);

  const handleSymptomToggle = (symptomKey: SymptomKey) => {
    setSelectedSymptoms((prev) => {
      if (symptomKey === 'noSymptoms') {
        // If noSymptoms is already selected, clear it
        if (prev.includes('noSymptoms')) {
          return [];
        }
        // Otherwise, set only noSymptoms (mutually exclusive)
        return ['noSymptoms'];
      } else {
        // If noSymptoms is selected, remove it first
        let newSelection = prev.filter((key) => key !== 'noSymptoms');

        // Toggle the symptom
        if (newSelection.includes(symptomKey)) {
          newSelection = newSelection.filter((key) => key !== symptomKey);
        } else {
          newSelection = [...newSelection, symptomKey];
        }

        return newSelection;
      }
    });
  };

  const hasSelection = selectedSymptoms.length > 0;

  const handleContinue = () => {
    if (!hasSelection) return;

    // TODO: Persist symptoms + feeling to Firestore or user context
    // Example: await updateUserRecoveryProfile({ feeling, symptoms: selectedSymptoms });
    console.log('Feeling:', feeling);
    console.log('Symptoms:', selectedSymptoms);

    // Navigate to Step 3: Insight screen
    navigation.navigate('OnboardingInsight', {
      feeling,
      symptoms: selectedSymptoms,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header with progress indicator */}
        <View style={styles.header}>
          <Text style={styles.stepText}>Step 2 of 3</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>What are you feeling right now?</Text>
          <Text style={styles.subtitle}>
            Select all the symptoms that apply.
          </Text>
        </View>

        {/* Symptoms Chips */}
        <View style={styles.chipsContainer}>
          {SYMPTOMS.map((symptom) => (
            <SymptomChip
              key={symptom.key}
              data={symptom}
              isSelected={selectedSymptoms.includes(symptom.key)}
              onPress={() => handleSymptomToggle(symptom.key)}
            />
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[
              styles.button,
              !hasSelection && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!hasSelection}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, !hasSelection && styles.buttonTextDisabled]}>
              Continue
            </Text>
          </TouchableOpacity>

          {/* Helper Text */}
          <Text style={styles.helperText}>
            We'll use this to build your recovery plan.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  stepText: {
    ...typography.labelSmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.55)',
    textAlign: 'left',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 32,
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 18,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.85)', // Darker for better readability (matching Step 1)
    textAlign: 'center',
    lineHeight: 24,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)', // Increased from 0.16 for better contrast
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 14, // Increased from 10 for better breathing room
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)', // Increased from 0.5 for better contrast
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)', // Apple-style selected
    borderColor: 'rgba(255, 255, 255, 1)', // Solid white border
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  chipNoSymptoms: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // Ghost button style
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)', // More subtle border
    borderStyle: 'dashed', // Elegant dashed border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  chipNoSymptomsSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderColor: 'rgba(255, 255, 255, 1)',
    borderStyle: 'solid', // Solid when selected
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  chipPressed: {
    opacity: 0.9,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipLabel: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.75)',
  },
  chipLabelNoSymptoms: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.6)', // More tenue for ghost button
  },
  chipLabelSelected: {
    color: '#0F3D3E', // Deep primary tone when selected
  },
  bottom: {
    marginTop: 'auto',
    paddingTop: 0, // Reduced from 24 to bring CTA closer to chips
  },
  button: {
    backgroundColor: '#0F3F46',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F3F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 28,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    ...typography.button,
    fontSize: 17,
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  helperText: {
    ...typography.labelSmall,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

