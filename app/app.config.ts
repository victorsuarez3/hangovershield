import { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'Hangover Shield',
  slug: 'hangover-shield',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splashscreen.png',
    resizeMode: 'contain',
    backgroundColor: '#DFF4F1', // Matches the start color of HANGOVER_GRADIENT
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.hangovershield.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icadaptive-icon.png',
      backgroundColor: '#DFF4F1', // Matches splash background
    },
    package: 'com.hangovershield.app',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-font',
    '@react-native-community/datetimepicker',
  ],
  extra: {
    // Firebase & Auth (must be provided via env at build time)
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    // Google Sign-In Configuration
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
};

export default config;