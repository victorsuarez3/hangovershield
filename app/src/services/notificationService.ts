/**
 * Notification Service - Hangover Shield
 *
 * Professional-grade notification system with:
 * - Push notification permissions
 * - Device token management
 * - Firestore integration
 * - Smart scheduling with timezone awareness
 * - Notification categories (hydration, recovery, evening)
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { auth, db } from '../firebase/config';
import { DEBUG_PERSISTENCE } from '../config/flags';

// ─────────────────────────────────────────────────────────────────────────────
// Notification Handler Configuration
// ─────────────────────────────────────────────────────────────────────────────

// Set default behavior for notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType = 'hydration' | 'recovery_step' | 'evening_checkin';

export interface NotificationSettings {
  hydrationEnabled: boolean;
  recoveryStepsEnabled: boolean;
  eveningCheckInEnabled: boolean;
  quietHoursStart: number; // Hour 0-23 (default: 22 = 10pm)
  quietHoursEnd: number; // Hour 0-23 (default: 8 = 8am)
}

export interface DeviceTokenData {
  deviceId: string;
  pushToken: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: Date;
  lastUsed: Date;
  notificationSettings: NotificationSettings;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  hydrationEnabled: true,
  recoveryStepsEnabled: true,
  eveningCheckInEnabled: true,
  quietHoursStart: 22, // 10 PM
  quietHoursEnd: 8, // 8 AM
};

// Notification identifiers for managing scheduled notifications
export const NOTIFICATION_IDS = {
  HYDRATION_PREFIX: 'hydration-reminder-',
  RECOVERY_STEP_PREFIX: 'recovery-step-',
  EVENING_CHECKIN: 'evening-checkin',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Permission & Token Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Request notification permissions and get push token
 * This is the main entry point for enabling notifications
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Check if device supports push notifications
    if (!Device.isDevice) {
      console.warn('[notificationService] Must use physical device for Push Notifications');
      return null;
    }

    // Get existing permissions
    const existingPermissions = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.granted;

    // Request permissions if not already granted
    if (!existingPermissions.granted) {
      const permissions = await Notifications.requestPermissionsAsync();
      finalStatus = permissions.granted;
    }

    if (!finalStatus) {
      console.warn('[notificationService] Permission not granted for push notifications');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '76f792a4-fbf7-4106-88c3-7581d6b8adc8',
    });

    if (DEBUG_PERSISTENCE) {
      console.log('[notificationService] ✅ Push token obtained:', tokenData.data);
    }

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    // Save token to Firestore
    await saveDeviceToken(tokenData.data);

    return tokenData.data;
  } catch (error) {
    console.error('[notificationService] Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Setup Android notification channels
 */
async function setupAndroidChannels(): Promise<void> {
  // Hydration reminders channel
  await Notifications.setNotificationChannelAsync('hydration', {
    name: 'Hydration Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });

  // Recovery steps channel
  await Notifications.setNotificationChannelAsync('recovery', {
    name: 'Recovery Steps',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });

  // Evening check-in channel
  await Notifications.setNotificationChannelAsync('evening', {
    name: 'Evening Check-in',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

/**
 * Save device token to Firestore
 */
async function saveDeviceToken(pushToken: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('[notificationService] No authenticated user to save token');
      return;
    }

    const deviceId = await getDeviceId();
    const platform = Platform.OS as 'ios' | 'android' | 'web';

    const tokenData: DeviceTokenData = {
      deviceId,
      pushToken,
      platform,
      createdAt: new Date(),
      lastUsed: new Date(),
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
    };

    // Save to Firestore: users/{userId}/devices/{deviceId}
    await db
      .collection('users')
      .doc(user.uid)
      .collection('devices')
      .doc(deviceId)
      .set(tokenData);

    if (DEBUG_PERSISTENCE) {
      console.log('[notificationService] ✅ Device token saved to Firestore');
    }
  } catch (error) {
    console.error('[notificationService] Error saving device token:', error);
  }
}

/**
 * Get unique device identifier
 */
async function getDeviceId(): Promise<string> {
  // Use a combination of platform-specific identifiers
  const deviceName = Device.deviceName || 'unknown';
  const osName = Device.osName || 'unknown';
  const osVersion = Device.osVersion || 'unknown';

  // Create a simple hash-like identifier
  const identifier = `${Platform.OS}-${deviceName}-${osName}-${osVersion}`;
  return identifier.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Scheduling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schedule hydration reminders throughout the day
 * Sends notifications every 2-3 hours during waking hours
 */
export async function scheduleHydrationReminders(): Promise<void> {
  try {
    // Cancel any existing hydration reminders
    await cancelNotificationsByType('hydration');

    const settings = await getNotificationSettings();
    if (!settings.hydrationEnabled) {
      if (DEBUG_PERSISTENCE) {
        console.log('[notificationService] Hydration reminders disabled');
      }
      return;
    }

    // Schedule reminders at: 9am, 12pm, 3pm, 6pm, 9pm
    const reminderHours = [9, 12, 15, 18, 21];

    for (const hour of reminderHours) {
      // Skip if within quiet hours
      if (isWithinQuietHours(hour, settings)) {
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        identifier: `${NOTIFICATION_IDS.HYDRATION_PREFIX}${hour}`,
        content: {
          title: '💧 Time to hydrate',
          body: "Remember to drink water. You're doing great!",
          data: { type: 'hydration', hour },
          sound: 'default',
          categoryIdentifier: 'hydration',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute: 0,
          repeats: true,
        },
      });
    }

    if (DEBUG_PERSISTENCE) {
      console.log('[notificationService] ✅ Hydration reminders scheduled');
    }
  } catch (error) {
    console.error('[notificationService] Error scheduling hydration reminders:', error);
  }
}

/**
 * Schedule a recovery step notification
 * Used to remind user to complete next step in their daily plan
 */
export async function scheduleRecoveryStepReminder(
  stepTitle: string,
  scheduledTime: Date
): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.recoveryStepsEnabled) {
      return;
    }

    const hour = scheduledTime.getHours();
    if (isWithinQuietHours(hour, settings)) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: `${NOTIFICATION_IDS.RECOVERY_STEP_PREFIX}${scheduledTime.getTime()}`,
      content: {
        title: '🎯 Next recovery step',
        body: stepTitle,
        data: { type: 'recovery_step', stepTitle, scheduledTime: scheduledTime.toISOString() },
        sound: 'default',
        categoryIdentifier: 'recovery',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledTime,
      },
    });

    if (DEBUG_PERSISTENCE) {
      console.log('[notificationService] ✅ Recovery step reminder scheduled:', stepTitle);
    }
  } catch (error) {
    console.error('[notificationService] Error scheduling recovery step reminder:', error);
  }
}

/**
 * Schedule evening check-in notification
 * Reminds user to complete their evening reflection at 8 PM
 */
export async function scheduleEveningCheckInReminder(): Promise<void> {
  try {
    // Cancel existing evening reminder
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.EVENING_CHECKIN);

    const settings = await getNotificationSettings();
    if (!settings.eveningCheckInEnabled) {
      return;
    }

    const eveningHour = 20; // 8 PM
    if (isWithinQuietHours(eveningHour, settings)) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.EVENING_CHECKIN,
      content: {
        title: '🌙 Time to wind down',
        body: 'How did your day go? Complete your evening check-in',
        data: { type: 'evening_checkin' },
        sound: 'default',
        categoryIdentifier: 'evening',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: eveningHour,
        minute: 0,
        repeats: true,
      },
    });

    if (DEBUG_PERSISTENCE) {
      console.log('[notificationService] ✅ Evening check-in reminder scheduled');
    }
  } catch (error) {
    console.error('[notificationService] Error scheduling evening check-in:', error);
  }
}

/**
 * Schedule all daily notifications
 * Call this when user enables notifications or updates settings
 */
export async function scheduleAllNotifications(): Promise<void> {
  await scheduleHydrationReminders();
  await scheduleEveningCheckInReminder();

  if (DEBUG_PERSISTENCE) {
    console.log('[notificationService] ✅ All notifications scheduled');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (DEBUG_PERSISTENCE) {
      console.log('[notificationService] All notifications cancelled');
    }
  } catch (error) {
    console.error('[notificationService] Error cancelling notifications:', error);
  }
}

/**
 * Cancel notifications by type
 */
async function cancelNotificationsByType(type: 'hydration' | 'recovery' | 'evening'): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    let prefix = '';
    if (type === 'hydration') prefix = NOTIFICATION_IDS.HYDRATION_PREFIX;
    else if (type === 'recovery') prefix = NOTIFICATION_IDS.RECOVERY_STEP_PREFIX;
    else if (type === 'evening') {
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.EVENING_CHECKIN);
      return;
    }

    for (const notification of scheduled) {
      if (notification.identifier.startsWith(prefix)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error(`[notificationService] Error cancelling ${type} notifications:`, error);
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[notificationService] Error getting scheduled notifications:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get notification settings from Firestore
 */
async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }

    const deviceId = await getDeviceId();
    const doc = await db
      .collection('users')
      .doc(user.uid)
      .collection('devices')
      .doc(deviceId)
      .get();

    if (doc.exists) {
      const data = doc.data() as DeviceTokenData;
      return data.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;
    }

    return DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('[notificationService] Error getting notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('[notificationService] No authenticated user');
      return;
    }

    const deviceId = await getDeviceId();
    const currentSettings = await getNotificationSettings();
    const updatedSettings = { ...currentSettings, ...settings };

    await db
      .collection('users')
      .doc(user.uid)
      .collection('devices')
      .doc(deviceId)
      .update({
        notificationSettings: updatedSettings,
        lastUsed: new Date(),
      });

    // Reschedule notifications based on new settings
    await scheduleAllNotifications();

    if (DEBUG_PERSISTENCE) {
      console.log('[notificationService] ✅ Notification settings updated');
    }
  } catch (error) {
    console.error('[notificationService] Error updating notification settings:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a given hour is within quiet hours
 */
function isWithinQuietHours(hour: number, settings: NotificationSettings): boolean {
  const { quietHoursStart, quietHoursEnd } = settings;

  // Handle case where quiet hours span midnight (e.g., 22:00 - 08:00)
  if (quietHoursStart > quietHoursEnd) {
    return hour >= quietHoursStart || hour < quietHoursEnd;
  }

  // Normal case (e.g., 01:00 - 06:00)
  return hour >= quietHoursStart && hour < quietHoursEnd;
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return permissions.granted === true;
  } catch (error) {
    console.error('[notificationService] Error checking notification status:', error);
    return false;
  }
}
