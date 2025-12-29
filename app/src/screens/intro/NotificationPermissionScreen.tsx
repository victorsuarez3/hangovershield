/**
 * Notification Permission Screen - Hangover Shield
 * "Stay on track" - Request notification permissions
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HANGOVER_GRADIENT } from '../../theme/gradients';
import { registerForPushNotificationsAsync, scheduleAllNotifications } from '../../services/notificationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NotificationPermissionScreenProps {
  onComplete: () => void;
}

export const NotificationPermissionScreen: React.FC<NotificationPermissionScreenProps> = ({
  onComplete,
}) => {
  const insets = useSafeAreaInsets();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    try {
      // Request push notification permissions and get token
      const token = await registerForPushNotificationsAsync();

      if (token) {
        // Successfully got permission and token, schedule all notifications
        await scheduleAllNotifications();
        console.log('[NotificationPermission] ✅ Notifications enabled and scheduled');
      } else {
        // User denied permissions or device doesn't support push
        console.log('[NotificationPermission] ⚠️ Notifications not enabled');
      }

      // Continue to next screen regardless of permission status
      onComplete();
    } catch (error) {
      console.error('[NotificationPermission] Error requesting notifications:', error);
      // Continue even if there's an error - don't block user flow
      onComplete();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={HANGOVER_GRADIENT}
        locations={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 }]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={48} color="#0F4C44" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Stay on track</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Gentle reminders so you don't have to rely on willpower.
        </Text>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
            <Text style={styles.featureText}>Hydration reminders</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
            <Text style={styles.featureText}>Step-by-step recovery prompts</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0F4C44" />
            <Text style={styles.featureText}>Evening wind-down tips</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleEnableNotifications}
          activeOpacity={0.85}
          disabled={isRequesting}
        >
          <Ionicons name="notifications" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>
            {isRequesting ? 'Requesting...' : 'Enable notifications'}
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 34,
    color: '#0F3D3E',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: 'rgba(15, 61, 62, 0.7)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: SCREEN_WIDTH * 0.85,
    marginBottom: 32,
  },
  featuresList: {
    alignSelf: 'stretch',
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.7)',
  },
  spacer: {
    flex: 1,
  },
  button: {
    backgroundColor: '#0A3F37',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: 'rgba(10, 63, 55, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    shadowOpacity: 1,
    elevation: 8,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: 'rgba(15, 61, 62, 0.5)',
  },
});

export default NotificationPermissionScreen;

