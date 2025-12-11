/**
 * Google Sign-In Button Component - Premium Light Style
 * Full-width, neutral background, elegant press feedback
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: disabled ? 0.6 : 1 }}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={disabled}
        accessibilityLabel="Sign in with Google"
        accessibilityRole="button"
        accessibilityHint="Sign in using your Google account"
        accessibilityState={{ disabled }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="logo-google" size={22} color={theme.colors.deepTealDark} />
          </View>
          <Text style={[styles.buttonText, { color: theme.colors.deepTealDark }]}>
            Sign in with Google
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(15, 63, 70, 0.1)',
    shadowColor: '#0F3F46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(214, 245, 234, 0.4)',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: 'Inter_600SemiBold',
  },
});
