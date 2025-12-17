/**
 * SuccessCircle - Reusable success feedback component
 * Premium glass effect circle with checkmark icon
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SuccessCircleProps {
  /** Whether to show the success circle */
  visible: boolean;
  /** Top position offset (default: 120) */
  top?: number;
  /** Size of the circle (default: 80) */
  size?: number;
  /** Icon size (default: 48) */
  iconSize?: number;
  /** Custom color for the icon (default: #0F4C44) */
  iconColor?: string;
}

export const SuccessCircle: React.FC<SuccessCircleProps> = ({
  visible,
  top = 120,
  size = 80,
  iconSize = 48,
  iconColor = '#0F4C44',
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.circle, { top, width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="checkmark-circle" size={iconSize} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(228, 242, 239, 0.85)', // Seafoam glass
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15, 76, 68, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 76, 68, 0.15)',
    // Glass blur effect (iOS)
    ...(Platform.OS === 'ios' && {
      backdropFilter: 'blur(10px)',
    }),
  },
});

