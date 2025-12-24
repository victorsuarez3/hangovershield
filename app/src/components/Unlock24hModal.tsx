/**
 * 24-Hour Unlock Modal - Hangover Shield
 * Offers free 24-hour premium access after first daily check-in
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HANGOVER_GRADIENT } from '../theme/gradients';

const { width } = Dimensions.get('window');

interface Unlock24hModalProps {
  visible: boolean;
  onUnlock: () => void;
  onDismiss: () => void;
}

export const Unlock24hModal: React.FC<Unlock24hModalProps> = ({
  visible,
  onUnlock,
  onDismiss,
}) => {
  // Animations
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      backdropOpacity.setValue(0);
      modalScale.setValue(0.8);
      modalOpacity.setValue(0);
    }
  }, [visible]);

  const handleUnlock = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onUnlock();
    });
  };

  const handleDismiss = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={handleDismiss}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal */}
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <LinearGradient
            colors={HANGOVER_GRADIENT}
            locations={[0, 1]}
            style={styles.gradientBackground}
          />

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color="#0F3D3E" />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="lock-open-outline" size={48} color="#0F4C44" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Unlock today's full recovery plan</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Free for 24 hours — no card required.
            </Text>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
                <Text style={styles.featureText}>Complete recovery timeline</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
                <Text style={styles.featureText}>Personalized action steps</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
                <Text style={styles.featureText}>Smart hydration tracking</Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Not now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUnlock}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Unlock now</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: width - 48,
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(15, 76, 68, 0.3)',
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 40,
    shadowOpacity: 1,
    elevation: 20,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  features: {
    width: '100%',
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#0F3D3E',
    marginLeft: 12,
  },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0F4C44',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#0A3F37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(10, 63, 55, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default Unlock24hModal;







