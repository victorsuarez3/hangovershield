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
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#DFF4F1', // Matches splash background
    },
    package: 'com.hangovershield.app',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-font',
  ],
  extra: {
    // Firebase Configuration
    firebaseApiKey: 'AIzaSyBhx-k9zkZLJfkYBtw7YEhQa3Nm9BYcMqs',
    firebaseAuthDomain: 'xxx-test-f2f64.firebaseapp.com',
    firebaseProjectId: 'xxx-test-f2f64',
    firebaseStorageBucket: 'xxx-test-f2f64.firebasestorage.app',
    firebaseMessagingSenderId: '251175596798',
    firebaseAppId: '1:251175596798:ios:6c21f371ade723e2342baf',
    // Google Sign-In Configuration
    googleIosClientId: '251175596798-i2k3l2od98f1rucpuuvgcple05t4cv13.apps.googleusercontent.com',
    googleAndroidClientId: '251175596798-i2k3l2od98f1rucpuuvgcple05t4cv13.apps.googleusercontent.com',
    googleWebClientId: '251175596798-vg13p7km1oerm0gnqbkihjrt73g8k7sc.apps.googleusercontent.com',
  },
};

export default config;