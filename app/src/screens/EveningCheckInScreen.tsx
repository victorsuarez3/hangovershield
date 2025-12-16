/**
 * Evening Check-In Screen - Hangover Shield
 * Premium evening reflection and habit reinforcement
 * Psychology-driven nightly ritual focused on reflection, habit-building, and emotional reward
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../providers/AuthProvider';
import { useAccessStatus } from '../hooks/useAccessStatus';
import { getTodayId } from '../utils/dateUtils';
import { HANGOVER_GRADIENT } from '../theme/gradients';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type EveningMood = 'calm' | 'okay' | 'tired' | 'not_great' | 'better_than_morning';
type AlcoholToday = 'no' | 'a_little' | 'yes' | 'prefer_not_to_say';

interface EveningCheckInData {
  date: string; // "YYYY-MM-DD"
  eveningReflection?: string;
  eveningMood?: EveningMood;
  alcoholToday?: AlcoholToday;
  completedAt: any; // Firestore Timestamp
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const COMPLETION_MESSAGES = [
  "You showed up today.",
  "Every small win counts.",
  "Taking care of yourself matters.",
  "You're building the habit.",
];

const MOOD_OPTIONS: Array<{ value: EveningMood; label: string }> = [
  { value: 'calm', label: 'Calm' },
  { value: 'okay', label: 'Okay' },
  { value: 'tired', label: 'Tired' },
  { value: 'not_great', label: 'Not great' },
  { value: 'better_than_morning', label: 'Better than this morning' },
];

const ALCOHOL_OPTIONS: Array<{ value: AlcoholToday; label: string }> = [
  { value: 'no', label: 'No' },
  { value: 'a_little', label: 'A little' },
  { value: 'yes', label: 'Yes' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'entry' | 'reflection' | 'mood' | 'alcohol' | 'completion';

export const EveningCheckInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const accessInfo = useAccessStatus();

  const [currentStep, setCurrentStep] = useState<Step>('entry');
  const [eveningReflection, setEveningReflection] = useState('');
  const [eveningMood, setEveningMood] = useState<EveningMood | null>(null);
  const [alcoholToday, setAlcoholToday] = useState<AlcoholToday | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [completionMessage] = useState(
    COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)]
  );

  // Dev skip button (bypass premium check)
  const handleSkip = () => {
    if (__DEV__) {
      // Allow access in dev mode
    }
  };

  const handleStart = () => {
    setCurrentStep('reflection');
  };

  const handleReflectionNext = () => {
    setCurrentStep('mood');
  };

  const handleMoodNext = () => {
    setCurrentStep('alcohol');
  };

  const handleAlcoholNext = async () => {
    if (!user?.uid) {
      console.error('[EveningCheckIn] No user ID');
      return;
    }

    setIsSaving(true);

    try {
      const todayId = getTodayId();
      const docRef = doc(db, 'users', user.uid, 'dailyCheckIns', todayId);

      const eveningData: EveningCheckInData = {
        date: todayId,
        eveningReflection: eveningReflection.trim() || undefined,
        eveningMood,
        alcoholToday,
        completedAt: serverTimestamp(),
      };

      // Merge with existing daily check-in data
      await setDoc(docRef, eveningData, { merge: true });

      console.log('[EveningCheckIn] Saved evening check-in');

      // Move to completion screen
      setCurrentStep('completion');
    } catch (error) {
      console.error('[EveningCheckIn] Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render Entry Screen
  // ─────────────────────────────────────────────────────────────────────────────

  if (currentStep === 'entry') {
    return (
      <View style={styles.container}>
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

        <AppHeader
          showBackButton
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.entryContainer}>
            <Text style={styles.entryTitle}>Evening check-in</Text>
            <Text style={styles.entrySubtitle}>
              Take 30 seconds to reflect and reset.
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0F4C44', '#0A3F37']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Start evening check-in →</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Dev skip button */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip (Dev)</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render Reflection Screen
  // ─────────────────────────────────────────────────────────────────────────────

  if (currentStep === 'reflection') {
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
          showBackButton
          onBackPress={() => setCurrentStep('entry')}
        />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                What's one thing you're glad you did today?
              </Text>
              <Text style={styles.stepSubtitle}>Optional</Text>

              <View style={styles.reflectionCard}>
                <TextInput
                  style={styles.reflectionInput}
                  placeholder="Type your reflection here..."
                  placeholderTextColor="rgba(15, 61, 62, 0.4)"
                  value={eveningReflection}
                  onChangeText={setEveningReflection}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {eveningReflection.length}/500
                </Text>
              </View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleReflectionNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#0F4C44', '#0A3F37']}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>Continue →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render Mood Screen
  // ─────────────────────────────────────────────────────────────────────────────

  if (currentStep === 'mood') {
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
          showBackButton
          onBackPress={() => setCurrentStep('reflection')}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How do you feel right now?</Text>
            <Text style={styles.stepSubtitle}>Select one</Text>

            <View style={styles.optionsContainer}>
              {MOOD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.moodChip,
                    eveningMood === option.value && styles.moodChipSelected,
                  ]}
                  onPress={() => setEveningMood(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.moodChipText,
                      eveningMood === option.value && styles.moodChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {eveningMood === option.value && (
                    <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !eveningMood && styles.nextButtonDisabled,
              ]}
              onPress={handleMoodNext}
              disabled={!eveningMood}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={eveningMood ? ['#0F4C44', '#0A3F37'] : ['#CCCCCC', '#AAAAAA']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>Continue →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render Alcohol Screen
  // ─────────────────────────────────────────────────────────────────────────────

  if (currentStep === 'alcohol') {
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
          showBackButton
          onBackPress={() => setCurrentStep('mood')}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Did you have any alcohol today?</Text>
            <Text style={styles.stepSubtitle}>Select one</Text>

            <View style={styles.optionsContainer}>
              {ALCOHOL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.alcoholChip,
                    alcoholToday === option.value && styles.alcoholChipSelected,
                  ]}
                  onPress={() => setAlcoholToday(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.alcoholChipText,
                      alcoholToday === option.value && styles.alcoholChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {alcoholToday === option.value && (
                    <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.noJudgmentText}>
              No judgment. This helps us guide you better tomorrow.
            </Text>

            <TouchableOpacity
              style={[
                styles.nextButton,
                (!alcoholToday || isSaving) && styles.nextButtonDisabled,
              ]}
              onPress={handleAlcoholNext}
              disabled={!alcoholToday || isSaving}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={alcoholToday && !isSaving ? ['#0F4C44', '#0A3F37'] : ['#CCCCCC', '#AAAAAA']}
                style={styles.nextButtonGradient}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.nextButtonText}>Saving...</Text>
                  </>
                ) : (
                  <Text style={styles.nextButtonText}>Complete →</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render Completion Screen
  // ─────────────────────────────────────────────────────────────────────────────

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#0F4C44" />
          </View>

          <Text style={styles.completionTitle}>{completionMessage}</Text>
          <Text style={styles.completionSubtitle}>
            Your recovery doesn't reset at night — it continues.
          </Text>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#0F4C44', '#0A3F37']}
              style={styles.doneButtonGradient}
            >
              <Text style={styles.doneButtonText}>Done for today</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Entry Screen
  entryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
  },
  entryTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
  },
  entrySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 280,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  startButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.5)',
  },

  // Step Screens
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 38,
  },
  stepSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },

  // Reflection Card
  reflectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 4,
  },
  reflectionInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#0F3D3E',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(15, 61, 62, 0.5)',
    textAlign: 'right',
    marginTop: 8,
  },

  // Options Container
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.1)',
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  moodChipSelected: {
    borderColor: '#0F4C44',
    backgroundColor: 'rgba(15, 76, 68, 0.05)',
  },
  moodChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#0F3D3E',
  },
  moodChipTextSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: '#0F4C44',
  },
  alcoholChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.1)',
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  alcoholChipSelected: {
    borderColor: '#0F4C44',
    backgroundColor: 'rgba(15, 76, 68, 0.05)',
  },
  alcoholChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#0F3D3E',
  },
  alcoholChipTextSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: '#0F4C44',
  },
  noJudgmentText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },

  // Buttons
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  nextButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Completion Screen
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
  },
  completionIcon: {
    marginBottom: 24,
  },
  completionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 42,
  },
  completionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 280,
  },
  doneButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  doneButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default EveningCheckInScreen;
