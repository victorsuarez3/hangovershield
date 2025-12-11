/**
 * Legal Modal Component - Premium Reusable Modal
 * Displays Terms of Service or Privacy Policy in a scrollable modal
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  onClose,
  title,
  content,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.overlayBackground,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={onClose}
            accessibilityLabel="Close modal"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={theme.colors.deepTeal} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
              nestedScrollEnabled={true}
            >
              <View style={styles.contentWrapper}>
                {content}
              </View>
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.doneButton}
                accessibilityLabel="Done"
                accessibilityRole="button"
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, bottomInset: number) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlayBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 63, 70, 0.4)',
    },
    modalContainer: {
      width: width - 48,
      maxWidth: 600,
      height: height * 0.85,
      borderRadius: 28,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.7)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      shadowColor: '#0F3F46',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.2,
      shadowRadius: 48,
      elevation: 24,
    },
    blurContainer: {
      height: '100%',
      flexDirection: 'column',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(15, 63, 70, 0.1)',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.deepTeal,
      fontFamily: 'CormorantGaramond_700Bold',
      letterSpacing: -0.5,
      flex: 1,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 63, 70, 0.08)',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      flexGrow: 1,
    },
    contentWrapper: {
      flex: 1,
      minHeight: 100,
    },
    footer: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: Math.max(bottomInset, 24),
      borderTopWidth: 1,
      borderTopColor: 'rgba(15, 63, 70, 0.1)',
    },
    doneButton: {
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(15, 63, 70, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(15, 63, 70, 0.2)',
      alignItems: 'center',
    },
    doneButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.deepTeal,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0.2,
    },
  });

