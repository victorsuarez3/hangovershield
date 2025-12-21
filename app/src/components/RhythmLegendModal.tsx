/**
 * Rhythm Legend Modal - Hangover Shield
 * Modal explaining how to read the "Your Rhythm" calendar
 * User-invoked clarity, not forced education
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RhythmLegendModalProps {
  visible: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const RhythmLegendModal: React.FC<RhythmLegendModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>How Your Recovery Builds</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="rgba(15, 76, 68, 0.5)" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 96 },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.itemsContainer}>
              {/* Subtitle */}
              <Text style={styles.subtitle}>
                Your body responds to patterns, not single days.
              </Text>

              {/* Section 1 - Heatmap */}
              <View style={styles.section}>
                <Text style={styles.legendText}>
                  Darker squares mean your body recovered better.
                </Text>
                <Text style={styles.legendTextSecondary}>
                  Notice what you did on those days — that's what's working.
                </Text>
              </View>

              {/* Section 2 - Icons */}
              <View style={styles.section}>
                <View style={styles.legendRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="moon" size={20} color="#0F4C44" />
                  </View>
                  <View style={styles.iconTextContainer}>
                    <Text style={styles.legendText}>
                      Evening check-in completed
                    </Text>
                    <Text style={styles.legendTextSecondary}>
                      Consistency here often leads to steadier recovery.
                    </Text>
                  </View>
                </View>

                <View style={styles.legendRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="wine" size={20} color="#C4893D" />
                  </View>
                  <View style={styles.iconTextContainer}>
                    <Text style={styles.legendText}>
                      Alcohol logged
                    </Text>
                    <Text style={styles.legendTextSecondary}>
                      These days may slow recovery — awareness is the first step.
                    </Text>
                  </View>
                </View>

              <View style={styles.legendRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="water" size={20} color="#0F4C44" />
                </View>
                <View style={styles.iconTextContainer}>
                  <Text style={styles.legendText}>
                    Hydration goal reached
                  </Text>
                  <Text style={styles.legendTextSecondary}>
                    Staying hydrated supports steady recovery.
                  </Text>
                </View>
              </View>
              </View>

              {/* Section 3 - Behavior */}
              <View style={styles.section}>
                <Text style={styles.legendText}>
                  Tap any day to reflect and adjust tomorrow.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Button */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityLabel="Got it"
              accessibilityRole="button"
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 61, 62, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    maxHeight: '70%',
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#0F3D3E',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
  },
  scrollContent: {
    paddingBottom: 8,
  },
  itemsContainer: {
    paddingBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(15, 61, 62, 0.7)',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 76, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  iconTextContainer: {
    flex: 1,
  },
  legendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(15, 61, 62, 0.7)',
    marginBottom: 4,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  legendTextSecondary: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(15, 61, 62, 0.6)',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 76, 68, 0.08)',
  },
  modalButton: {
    backgroundColor: '#0F4C44',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  modalButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default RhythmLegendModal;

