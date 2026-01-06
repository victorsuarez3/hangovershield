// Mock expo-notifications for Expo Go compatibility
// This prevents "Cannot find native module ExpoPushTokenManager" errors

module.exports = {
  setNotificationHandler: () => {},
  getPermissionsAsync: async () => ({ granted: false }),
  requestPermissionsAsync: async () => ({ granted: false }),
  getExpoPushTokenAsync: async () => null,
  scheduleNotificationAsync: async () => null,
  cancelAllScheduledNotificationsAsync: async () => {},
  cancelScheduledNotificationAsync: async () => {},
  getAllScheduledNotificationsAsync: async () => [],
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
  setNotificationChannelAsync: async () => null,
  AndroidImportance: {
    HIGH: 4,
  },
};
