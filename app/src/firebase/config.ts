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

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import Constants from 'expo-constants';
import { DEBUG_PERSISTENCE } from '../config/flags';

// Get Firebase config from app.config.ts via Expo Constants
const extra = Constants.expoConfig?.extra || {};

if (__DEV__ || DEBUG_PERSISTENCE) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const firebaseVersion = require('firebase/package.json').version;
  console.log(`[firebase/config] firebase version ${firebaseVersion}`);
}

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

// Initialize Firebase with compat API (works in Expo Go)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  if (__DEV__ || DEBUG_PERSISTENCE) {
    console.log('[firebase/config] ✅ Firebase initialized (compat API)');
    console.log('[firebase/config] This works in Expo Go AND development builds');
  }
}

export const firebaseApp = firebase.app();
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Firebase Auth persistence in React Native
// IMPORTANT: In React Native, Firebase Compat API handles persistence AUTOMATICALLY
// via the native Firebase SDK (iOS/Android). Unlike web, there is NO setPersistence() method.
// Auth state persists across app restarts by default - no configuration needed.
// Reference: https://rnfirebase.io/auth/usage#persisting-authentication-state
if (__DEV__ || DEBUG_PERSISTENCE) {
  console.log('[firebase/config] ✅ Firebase auth persistence: AUTOMATIC (React Native)');
  console.log('[firebase/config] Auth state persists via native SDK - no manual config needed');
}
