/**
 * Premium Alert Component
 * Custom alert dialog matching Casa Latina's premium design system
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface PremiumAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'info';
  confirmText?: string;
  onConfirm?: () => void;
}

export const PremiumAlert: React.FC<PremiumAlertProps> = ({
  visible,
  title,
  message,
  onClose,
  type = 'error',
  confirmText = 'OK',
  onConfirm,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, type);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'close-circle';
      case 'success':
        return 'checkmark-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'alert-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.errorRed;
      case 'success':
        return theme.colors.successGreen || '#7AB48B';
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
        
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(15, 15, 15, 0.98)', 'rgba(11, 11, 11, 0.98)']}
            style={styles.content}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name={getIcon()} size={48} color={getIconColor()} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>{confirmText}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, type: 'error' | 'success' | 'info') =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    container: {
      width: width - 80,
      maxWidth: 400,
      borderRadius: 24,
      overflow: 'hidden',
      ...theme.shadows.lg,
    },
    content: {
      paddingVertical: 32,
      paddingHorizontal: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    iconContainer: {
      marginBottom: 16,
    },
    title: {
      ...theme.typography.sectionTitle,
      fontSize: 24,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
      fontFamily: 'CormorantGaramond_600SemiBold',
    },
    message: {
      ...theme.typography.body,
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
      fontFamily: 'Inter_400Regular',
    },
    buttonContainer: {
      width: '100%',
      marginTop: 8,
    },
    button: {
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    buttonGradient: {
      paddingVertical: theme.spacing.md + 2,
      paddingHorizontal: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      ...theme.typography.button,
      color: theme.colors.background,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
  });



