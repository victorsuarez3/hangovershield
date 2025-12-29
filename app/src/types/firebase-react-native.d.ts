declare module 'firebase/auth/react-native' {
  export { getReactNativePersistence } from 'firebase/auth';
}

// Internal Firebase Auth React Native module
// Used to load persistence in React Native environments
declare module '@firebase/auth/dist/rn/index.rn' {
  import type { Persistence, Auth, Dependencies } from 'firebase/auth';
  import type { FirebaseApp } from 'firebase/app';

  export function getReactNativePersistence(storage: any): Persistence;
  export function getAuth(app?: FirebaseApp): Auth;
  export function initializeAuth(app: FirebaseApp, deps?: Dependencies): Auth;
  export * from 'firebase/auth';
}

