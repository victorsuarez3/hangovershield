/**
 * Button component with variants and premium animations
 */

import React from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, variant, size, fullWidth);
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
          damping: 15,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.background : theme.colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <Animated.View style={[styles.button, disabled && styles.buttonDisabled, animatedStyle, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {buttonContent}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.button, disabled && styles.buttonDisabled, animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={styles.buttonInner}
      >
        {buttonContent}
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (
  theme: any,
  variant: 'primary' | 'secondary' | 'outline',
  size: 'small' | 'medium' | 'large',
  fullWidth: boolean
) => {
  const sizeStyles = {
    small: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      ...theme.typography.bodySmall,
    },
    medium: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      ...theme.typography.button,
    },
    large: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      ...theme.typography.h4,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary, // Original Champagne Gold
    },
    secondary: {
      backgroundColor: theme.colors.surface,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
  };

  return StyleSheet.create({
    button: {
      ...sizeStyles[size],
      ...variantStyles[variant],
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      width: fullWidth ? '100%' : 'auto',
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    buttonInner: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gradient: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    text: {
      fontFamily: 'Inter_600SemiBold',
      color:
        variant === 'primary'
          ? theme.colors.background
          : variant === 'outline'
          ? theme.colors.primary
          : theme.colors.text,
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 24,
    },
  });
};
