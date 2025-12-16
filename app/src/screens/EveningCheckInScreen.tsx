/**
 * Evening Check-In Screen - Hangover Shield
 * Premium evening reflection and habit reinforcement
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../providers/AuthProvider';
import { useAccessStatus } from '../hooks/useAccessStatus';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FeltTonightOption = 'better' | 'same' | 'worse';
type PlanFollowedOption = 'completed' | 'partially' | 'not_today';

const SYMPTOMS_LIST = [
  'Headache',
  'Nausea',
  'Dry mouth',
  'Dizziness',
  'Fatigue',
  'Anxiety',
  'Brain fog',
  'Poor sleep',
  'Dehydration',
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const EveningCheckInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const accessInfo = useAccessStatus();

  // Form state
  const [feltTonight, setFeltTonight] = useState<FeltTonightOption | null>(null);
  const [symptomsNow, setSymptomsNow] = useState<string[]>([]);
  const [planFollowed, setPlanFollowed] = useState<PlanFollowedOption | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect free users to locked screen
  useEffect(() => {
    if (!accessInfo.hasFullAccess) {
      navigation.replace('EveningCheckInLocked');
    }
  }, [accessInfo.hasFullAccess, navigation]);

  const handleSymptomToggle = (symptom: string) => {
    setSymptomsNow(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    // Validation
    if (!feltTonight || !planFollowed) {
      Alert.alert('Please complete required fields', 'How you felt tonight and plan completion are required.');
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Save to Firestore
      console.log('[EveningCheckIn] Saving check-in:', {
        feltTonight,
        symptomsNow,
        planFollowed,
        notes,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success feedback
      Alert.alert(
        'Evening Check-In Saved',
        'Great job closing the day. Keep building that consistency!',
        [{ text: 'Continue', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('[EveningCheckIn] Error saving:', error);
      Alert.alert('Error', 'Failed to save evening check-in. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render for free users (they get redirected)
  if (!accessInfo.hasFullAccess) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E4F2EF', '#D8EBE7', '#CEE5E1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <AppHeader
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Evening Check-In</Text>
            <Text style={styles.subtitle}>Reflect on your recovery progress.</Text>
          </View>

          {/* How did you feel tonight? */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How did you feel tonight?</Text>
            <Text style={styles.cardSubtitle}>Required</Text>

            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  feltTonight === 'better' && styles.segmentButtonSelected,
                ]}
                onPress={() => setFeltTonight('better')}
              >
                <Text style={[
                  styles.segmentText,
                  feltTonight === 'better' && styles.segmentTextSelected,
                ]}>
                  Better
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  feltTonight === 'same' && styles.segmentButtonSelected,
                ]}
                onPress={() => setFeltTonight('same')}
              >
                <Text style={[
                  styles.segmentText,
                  feltTonight === 'same' && styles.segmentTextSelected,
                ]}>
                  Same
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  feltTonight === 'worse' && styles.segmentButtonSelected,
                ]}
                onPress={() => setFeltTonight('worse')}
              >
                <Text style={[
                  styles.segmentText,
                  feltTonight === 'worse' && styles.segmentTextSelected,
                ]}>
                  Worse
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Symptoms now */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Symptoms now</Text>
            <Text style={styles.cardSubtitle}>Optional • Select all that apply</Text>

            <View style={styles.symptomsGrid}>
              {SYMPTOMS_LIST.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.symptomChip,
                    symptomsNow.includes(symptom) && styles.symptomChipSelected,
                  ]}
                  onPress={() => handleSymptomToggle(symptom)}
                >
                  <Text style={[
                    styles.symptomText,
                    symptomsNow.includes(symptom) && styles.symptomTextSelected,
                  ]}>
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Did you follow today's plan? */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Did you follow today's plan?</Text>
            <Text style={styles.cardSubtitle}>Required</Text>

            <View style={styles.planOptions}>
              <TouchableOpacity
                style={[
                  styles.planOption,
                  planFollowed === 'completed' && styles.planOptionSelected,
                ]}
                onPress={() => setPlanFollowed('completed')}
              >
                <View style={styles.planOptionContent}>
                  <Text style={[
                    styles.planOptionText,
                    planFollowed === 'completed' && styles.planOptionTextSelected,
                  ]}>
                    Completed
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={planFollowed === 'completed' ? '#0F4C44' : '#0F3D3E'}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planOption,
                  planFollowed === 'partially' && styles.planOptionSelected,
                ]}
                onPress={() => setPlanFollowed('partially')}
              >
                <View style={styles.planOptionContent}>
                  <Text style={[
                    styles.planOptionText,
                    planFollowed === 'partially' && styles.planOptionTextSelected,
                  ]}>
                    Partially
                  </Text>
                  <Ionicons
                    name="ellipse-outline"
                    size={20}
                    color={planFollowed === 'partially' ? '#0F4C44' : '#0F3D3E'}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planOption,
                  planFollowed === 'not_today' && styles.planOptionSelected,
                ]}
                onPress={() => setPlanFollowed('not_today')}
              >
                <View style={styles.planOptionContent}>
                  <Text style={[
                    styles.planOptionText,
                    planFollowed === 'not_today' && styles.planOptionTextSelected,
                  ]}>
                    Not today
                  </Text>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={planFollowed === 'not_today' ? '#0F4C44' : '#0F3D3E'}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.cardSubtitle}>Optional • Anything you noticed today?</Text>

            <TouchableOpacity style={styles.notesInput}>
              <Text style={[
                styles.notesPlaceholder,
                notes.length > 0 && styles.notesText,
              ]}>
                {notes.length > 0 ? notes : 'Tap to add notes...'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!feltTonight || !planFollowed) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!feltTonight || !planFollowed || isSaving}
          >
            <LinearGradient
              colors={['#0E4C45', '#0F3D3E']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save check-in'}
              </Text>
              {!isSaving && (
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
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
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },

  // Cards
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: 'rgba(15, 76, 68, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#0F3D3E',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(15, 61, 62, 0.6)',
    marginBottom: 16,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 76, 68, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(15, 76, 68, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 1,
    elevation: 1,
  },
  segmentText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
  },
  segmentTextSelected: {
    color: '#0F4C44',
    fontFamily: 'Inter_600SemiBold',
  },

  // Symptoms Grid
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  symptomChipSelected: {
    backgroundColor: '#0F4C44',
    borderColor: '#0F4C44',
  },
  symptomText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F3D3E',
  },
  symptomTextSelected: {
    color: '#FFFFFF',
  },

  // Plan Options
  planOptions: {
    gap: 12,
  },
  planOption: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 68, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  planOptionSelected: {
    borderColor: '#0F4C44',
    backgroundColor: 'rgba(15, 76, 68, 0.05)',
  },
  planOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  planOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#0F3D3E',
  },
  planOptionTextSelected: {
    color: '#0F4C44',
    fontFamily: 'Inter_600SemiBold',
  },

  // Notes Input
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 68, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  notesPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.4)',
  },
  notesText: {
    color: '#0F3D3E',
  },

  // Save Button
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(14, 76, 69, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  saveButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default EveningCheckInScreen;


