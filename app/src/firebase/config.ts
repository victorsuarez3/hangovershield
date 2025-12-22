/**
 * Firebase Configuration - Hangover Shield
 *
 * Uses Expo Constants to access Firebase config from app.config.ts
 * This ensures the config works in both development and production builds
 *
 * Required Firebase services:
 * - Authentication (Email/Password)
 * - Cloud Firestore
 * - Cloud Storage
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Firebase config from app.config.ts via Expo Constants
const extra = Constants.expoConfig?.extra || {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error('Firebase configuration is incomplete. Provide EXPO_PUBLIC_FIREBASE_* env vars.');
}

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const firebaseApp = app;

// Initialize Auth with persistent storage (AsyncStorage) for React Native.
// Use dynamic require to avoid bundler issues if react-native build of firebase/auth is missing.
let authInstance;
try {
  const { getReactNativePersistence } = require('firebase/auth/react-native');
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (err) {
  // If module not available or already initialized, fall back.
  authInstance = getAuth(app);
}

export const auth = authInstance;

// Initialize Firestore with default database (Native Mode)
export const db = getFirestore(app);

// Initialize Firebase Storage for profile photos and media
export const storage = getStorage(app);
