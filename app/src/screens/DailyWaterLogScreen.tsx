/**
 * Daily Water Log Screen - Hangover Shield Premium
 * Full water logging interface with goal customization and entry history
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../providers/AuthProvider';
import { useUserDataStore } from '../stores/useUserDataStore';
import {
  calculateProgress,
  getRemainingMl,
  formatTime,
  createWaterEntry,
} from '../features/water/waterUtils';
import { addWaterEntry, deleteWaterEntry, setHydrationGoal as saveHydrationGoal } from '../services/hydrationService';
import { WaterEntry } from '../features/water/waterTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const DailyWaterLogScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();

  // Zustand store
  const {
    hydrationGoal,
    hydrationLogs,
    todayHydrationTotal,
    setHydrationGoal,
    addHydrationEntry: addToStore,
  } = useUserDataStore();

  // Local state
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [celebrationScale] = useState(new Animated.Value(1));

  const todayId = new Date().toISOString().split('T')[0];
  const todayEntries = hydrationLogs[todayId] || [];

  const progress = useMemo(
    () => calculateProgress(todayHydrationTotal, hydrationGoal),
    [todayHydrationTotal, hydrationGoal]
  );

  const remainingMl = useMemo(
    () => getRemainingMl(todayHydrationTotal, hydrationGoal),
    [todayHydrationTotal, hydrationGoal]
  );

  // Celebration animation when goal is reached
  useEffect(() => {
    if (todayHydrationTotal >= hydrationGoal && todayHydrationTotal > 0) {
      Animated.sequence([
        Animated.spring(celebrationScale, {
          toValue: 1.08,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.spring(celebrationScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }),
      ]).start();
    }
  }, [todayHydrationTotal >= hydrationGoal]);

  const handleAddWater = async (amountMl: number) => {
    console.log(`[DailyWaterLog] Adding ${amountMl}ml`);
    const newEntry = createWaterEntry(amountMl);

    // Add to store
    addToStore(todayId, newEntry);

    // Save to Firebase
    if (user?.uid) {
      try {
        await addWaterEntry(user.uid, newEntry);
      } catch (error) {
        console.error('[DailyWaterLog] Error adding water entry:', error);
      }
    }
  };

  const handleAddCustomAmount = () => {
    const amount = parseInt(customAmount, 10);
    if (!amount || amount <= 0 || amount > 2000) {
      console.warn('[DailyWaterLog] Invalid custom amount:', customAmount);
      return;
    }

    handleAddWater(amount);
    setCustomAmount('');
    setCustomModalVisible(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    console.log(`[DailyWaterLog] Deleting entry ${entryId}`);

    // TODO: Remove from store (need to add action to store)
    // For now, only delete from Firebase
    if (user?.uid) {
      try {
        await deleteWaterEntry(user.uid, todayId, entryId);
      } catch (error) {
        console.error('[DailyWaterLog] Error deleting entry:', error);
      }
    }
  };

  const handleSaveGoal = async (goalMl: number) => {
    console.log(`[DailyWaterLog] Saving goal: ${goalMl}ml`);

    // Update store
    setHydrationGoal(goalMl);

    // Save to Firebase
    if (user?.uid) {
      try {
        await saveHydrationGoal(user.uid, goalMl);
      } catch (error) {
        console.error('[DailyWaterLog] Error saving goal:', error);
      }
    }

    setGoalModalVisible(false);
  };

  const handleSaveCustomGoal = () => {
    const goal = parseInt(customGoal, 10);
    if (!goal || goal < 500 || goal > 5000) {
      console.warn('[DailyWaterLog] Invalid custom goal:', customGoal);
      return;
    }

    handleSaveGoal(goal);
    setCustomGoal('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#DDF1EE', '#DDF1EE']}
        style={StyleSheet.absoluteFillObject}
      />

      <AppHeader
        title="Water Log"
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Today</Text>
          <Text style={styles.title}>Hydration Tracker</Text>
          <Text style={styles.subtitle}>
            Stay hydrated to support your recovery.
          </Text>
        </View>

        {/* Progress Card */}
        <Animated.View
          style={[
            styles.progressCard,
            { transform: [{ scale: celebrationScale }] },
          ]}
        >
          {/* Circular Progress */}
          <View style={styles.circularProgressContainer}>
            <View style={styles.circularProgressOuter}>
              <View style={styles.circularProgressInner}>
                <Text style={styles.totalValue}>{todayHydrationTotal}</Text>
                <Text style={styles.totalUnit}>ml</Text>
              </View>
            </View>
            <View
              style={[
                styles.progressRing,
                {
                  borderColor: progress >= 100 ? '#1A6B5C' : '#0A3D33',
                  borderWidth: 8,
                },
              ]}
            />
          </View>

          {/* Goal info */}
          <View style={styles.goalInfo}>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>Daily goal</Text>
              <View style={styles.goalValueRow}>
                <Text style={styles.goalValue}>{hydrationGoal}ml</Text>
                <TouchableOpacity
                  onPress={() => setGoalModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color="#0A3D33" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>

            {remainingMl > 0 ? (
              <Text style={styles.remainingText}>
                {remainingMl}ml remaining to reach your goal
              </Text>
            ) : (
              <Text style={styles.goalReachedText}>
                Goal reached — excellent work!
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Quick add</Text>
          <View style={styles.quickAddRow}>
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => handleAddWater(250)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#0A3D33" />
              <Text style={styles.quickAddText}>250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => handleAddWater(500)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#0A3D33" />
              <Text style={styles.quickAddText}>500ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => setCustomModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={24} color="#0A3D33" />
              <Text style={styles.quickAddText}>Custom</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Entry History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Today's entries</Text>
          {todayEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="water-outline" size={48} color="rgba(10, 61, 51, 0.2)" />
              <Text style={styles.emptyText}>No entries yet today</Text>
              <Text style={styles.emptySubtext}>
                Add your first water entry above
              </Text>
            </View>
          ) : (
            <View style={styles.entryList}>
              {[...todayEntries].reverse().map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={styles.entryLeft}>
                    <Ionicons name="water" size={20} color="#0A3D33" />
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryAmount}>{entry.amountMl}ml</Text>
                      <Text style={styles.entryTime}>{formatTime(entry.timestamp)}</Text>
                      {entry.note && (
                        <Text style={styles.entryNote}>{entry.note}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteEntry(entry.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color="rgba(10, 61, 51, 0.4)" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add custom amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount (ml)"
              placeholderTextColor="rgba(10, 61, 51, 0.4)"
              keyboardType="number-pad"
              value={customAmount}
              onChangeText={setCustomAmount}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setCustomAmount('');
                  setCustomModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddCustomAmount}
                activeOpacity={0.7}
              >
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal Customization Modal */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set your hydration goal</Text>
            <Text style={styles.modalSubtitle}>Choose a daily target</Text>

            {/* Preset buttons */}
            <View style={styles.presetButtonsContainer}>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleSaveGoal(1500)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetButtonText}>1500ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleSaveGoal(2000)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetButtonText}>2000ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleSaveGoal(2500)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetButtonText}>2500ml</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDivider}>Or enter custom amount</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Custom goal (ml)"
              placeholderTextColor="rgba(10, 61, 51, 0.4)"
              keyboardType="number-pad"
              value={customGoal}
              onChangeText={setCustomGoal}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setCustomGoal('');
                  setGoalModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleSaveCustomGoal}
                activeOpacity={0.7}
                disabled={!customGoal}
              >
                <Text style={styles.modalAddText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDF1EE',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(10, 61, 51, 0.6)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 36,
    color: '#0A3D33',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(10, 61, 51, 0.7)',
    lineHeight: 24,
  },

  // Progress Card
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: 'rgba(10, 61, 51, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 4,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  circularProgressOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(10, 61, 51, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressInner: {
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: '#0A3D33',
    opacity: 0.3,
  },
  totalValue: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 48,
    color: '#0A3D33',
    letterSpacing: -1,
  },
  totalUnit: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(10, 61, 51, 0.6)',
    marginTop: -4,
  },
  goalInfo: {
    gap: 12,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(10, 61, 51, 0.6)',
  },
  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0A3D33',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(10, 61, 51, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0A3D33',
    borderRadius: 5,
  },
  progressPercent: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0A3D33',
    minWidth: 42,
    textAlign: 'right',
  },
  remainingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(10, 61, 51, 0.6)',
    textAlign: 'center',
  },
  goalReachedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A6B5C',
    textAlign: 'center',
  },

  // Section Title
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'rgba(10, 61, 51, 0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Quick Add Section
  quickAddSection: {
    marginBottom: 24,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: 'rgba(10, 61, 51, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  quickAddText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0A3D33',
  },

  // History Section
  historySection: {
    marginBottom: 16,
  },
  entryList: {
    gap: 10,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: 'rgba(10, 61, 51, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  entryInfo: {
    flex: 1,
  },
  entryAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0A3D33',
    marginBottom: 2,
  },
  entryTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(10, 61, 51, 0.5)',
  },
  entryNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(10, 61, 51, 0.6)',
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Empty State
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: 'rgba(10, 61, 51, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  emptyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: 'rgba(10, 61, 51, 0.6)',
    marginTop: 12,
  },
  emptySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(10, 61, 51, 0.4)',
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.2,
    elevation: 8,
  },
  modalTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#0A3D33',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(10, 61, 51, 0.6)',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#0A3D33',
    backgroundColor: 'rgba(10, 61, 51, 0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  presetButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    backgroundColor: 'rgba(10, 61, 51, 0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  presetButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0A3D33',
  },
  modalDivider: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(10, 61, 51, 0.5)',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(10, 61, 51, 0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0A3D33',
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: '#0A3D33',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalAddText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});

export default DailyWaterLogScreen;
