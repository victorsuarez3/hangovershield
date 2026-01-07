import { ExpoConfig } from "@expo/config";

const config: ExpoConfig = {
  name: "Hangover Shield",
  slug: "hangover-shield",
  version: "1.0.18",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splashscreen.png",
    resizeMode: "contain",
    backgroundColor: "#DFF4F1", // Matches the start color of HANGOVER_GRADIENT
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false, // iPhone-only to avoid iPad review requirements
    bundleIdentifier: "com.versaluna.hangovershield",
    infoPlist: {
      UIDeviceFamily: [1], // iPhone only
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icadaptive-icon.png",
      backgroundColor: "#DFF4F1", // Matches splash background
    },
    package: "com.versaluna.hangovershield",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-font",
    "@react-native-community/datetimepicker",
    "expo-web-browser",
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#0F4C44",
        sounds: [],
      },
    ],
  ],
  extra: {
    // Firebase & Auth (must be provided via env at build time)
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    // Google Sign-In Configuration
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    eas: {
      projectId: "76f792a4-fbf7-4106-88c3-7581d6b8adc8",
    },
  },
};

export default config;
