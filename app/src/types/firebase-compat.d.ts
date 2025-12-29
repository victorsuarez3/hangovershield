/**
 * Firebase Compat API Type Augmentations
 *
 * This allows us to use Firebase compat API (v8 style) with TypeScript
 * The compat API works reliably in both Expo Go and development builds
 */

// Re-export compat types for easier usage
declare module '@/firebase/config' {
  import type firebase from 'firebase/compat/app';

  export const firebaseApp: firebase.app.App;
  export const auth: firebase.auth.Auth;
  export const db: firebase.firestore.Firestore;
  export const storage: firebase.storage.Storage;
}
