/**
 * Evening Check-In Screen - Hangover Shield
 * Single-screen evening reflection flow
 * Premium feature focused on closure, not tracking
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
import { SuccessCircle } from '../components/SuccessCircle';
import { useAuth } from '../providers/AuthProvider';
import { getTodayId } from '../utils/dateUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type EveningMood = 'calm' | 'okay' | 'tired' | 'not_great';
type AlcoholToday = 'no' | 'a_little' | 'yes';

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

const MOOD_OPTIONS: Array<{ value: EveningMood; label: string }> = [
  { value: 'calm', label: 'Calm' },
  { value: 'okay', label: 'Okay' },
  { value: 'tired', label: 'Tired' },
  { value: 'not_great', label: 'Not great' },
];

const ALCOHOL_OPTIONS: Array<{ value: AlcoholToday; label: string }> = [
  { value: 'no', label: 'No' },
  { value: 'a_little', label: 'A little' },
  { value: 'yes', label: 'Yes' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const EveningCheckInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [eveningReflection, setEveningReflection] = useState('');
  const [eveningMood, setEveningMood] = useState<EveningMood | null>(null);
  const [alcoholToday, setAlcoholToday] = useState<AlcoholToday | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if at least one field has been interacted with
  const hasInteraction = eveningReflection.trim().length > 0 || eveningMood !== null || alcoholToday !== null;
  const canComplete = hasInteraction;

  const handleComplete = async () => {
    console.log('[EveningCheckIn] handleComplete called', {
      canComplete,
      hasInteraction,
      user: user?.uid,
      eveningReflection: eveningReflection.length,
      eveningMood,
      alcoholToday,
    });

    if (!canComplete) {
      console.log('[EveningCheckIn] Cannot complete - no interaction');
      return;
    }

    setIsSaving(true);

    try {
      const todayId = getTodayId();
      
      // For dev mode, allow saving even without user
      if (!user?.uid) {
        console.log('[EveningCheckIn] No user ID - showing completion anyway (dev mode)');
        setIsCompleted(true);
        setTimeout(() => {
          navigation.navigate('EveningCheckInComplete' as any);
        }, 1200);
        return;
      }

      const docRef = doc(db, 'users', user.uid, 'dailyCheckIns', todayId);

      const eveningData: EveningCheckInData = {
        date: todayId,
        eveningReflection: eveningReflection.trim() || undefined,
        eveningMood: eveningMood || undefined,
        alcoholToday: alcoholToday || undefined,
        completedAt: serverTimestamp(),
      };

      console.log('[EveningCheckIn] Saving data:', eveningData);

      // Merge with existing daily check-in data
      await setDoc(docRef, eveningData, { merge: true });

      console.log('[EveningCheckIn] Saved evening check-in successfully');

      // Show completion feedback in the same screen
      setIsCompleted(true);

      // Navigate to closure screen after brief delay to show success feedback
      setTimeout(() => {
        navigation.navigate('EveningCheckInComplete' as any);
      }, 1200);
    } catch (error) {
      console.error('[EveningCheckIn] Error saving:', error);
      // Still show completion even if save fails (for dev/testing)
      setIsCompleted(true);
      setTimeout(() => {
        // Navigate to closure screen instead of HomeMain
        navigation.navigate('EveningCheckInComplete' as any);
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

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
        title="Evening check-in"
        subtitle="Take 30 seconds to reflect and reset."
        showBackButton
        onBackPress={() => navigation.goBack()}
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
          {/* Main Reflection Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              What's one thing you did today that counts?
            </Text>
            <Text style={styles.sectionSubtitle}>Optional</Text>

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
            <Text style={styles.reflectionHelper}>
              Big or small. It all counts.
            </Text>
          </View>

          {/* Emotional State Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How do you feel right now?</Text>
            <Text style={styles.sectionSubtitle}>Select one</Text>

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
          </View>

          {/* Alcohol Question */}
          <View style={styles.section}>
            <Text style={styles.alcoholTitle}>Did you drink today?</Text>

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

            <Text style={styles.helperText}>
              No judgment. This helps us guide tomorrow.
            </Text>
          </View>
        </ScrollView>

        {/* Success Feedback Circle */}
        <SuccessCircle visible={isCompleted} />

        {/* Fixed CTA Button */}
        <View style={[styles.fixedCTA, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              (!canComplete || isSaving) && styles.completeButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={!canComplete || isSaving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canComplete && !isSaving ? ['#0F4C44', '#0A3F37'] : ['#CCCCCC', '#AAAAAA']}
              style={styles.completeButtonGradient}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.completeButtonText}>Saving...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.completeButtonText}>Complete & rest →</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#0F3D3E',
    marginBottom: 6,
    lineHeight: 32,
  },
  alcoholTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: 'rgba(15, 61, 62, 0.8)',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    marginBottom: 16,
  },

  // Reflection Card
  reflectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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
    minHeight: 100,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minWidth: 100,
    flex: 1,
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
    fontSize: 15,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 80,
    flex: 1,
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
    fontSize: 15,
    color: '#0F3D3E',
  },
  alcoholChipTextSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: '#0F4C44',
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(15, 61, 62, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },

  // Fixed CTA
  fixedCTA: {
    backgroundColor: 'rgba(228, 242, 239, 0.95)',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 76, 68, 0.1)',
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  completeButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default EveningCheckInScreen;
