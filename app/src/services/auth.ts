/**
 * Authentication Service - Hangover Shield
 * Firebase Auth operations for Google, Apple, and email/password authentication
 * Uses Firebase Compat API for React Native compatibility
 */

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { auth, db, storage } from '../firebase/config';
import { UserDoc } from '../models/firestore';
import { SHOW_DEV_TOOLS } from '../config/flags';

type FirebaseUser = firebase.User;

/**
 * Sign up a new user with email and password
 * Creates Firebase Auth user and Firestore user document
 */
export const signUp = async (
  email: string,
  password: string,
  fullName: string
): Promise<FirebaseUser> => {
  try {
    // Create Firebase Auth user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser) {
      throw new Error('Failed to create user');
    }

    // Create Firestore user document
    const userDoc: Omit<UserDoc, 'createdAt'> & { createdAt: any } = {
      displayName: fullName,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      // Initialize first-login onboarding state (default: not completed)
      onboarding: {
        firstLoginCompleted: false,
        firstLoginVersion: 1,
      },
    };

    const userRef = db.collection('users').doc(firebaseUser.uid);
    await userRef.set(userDoc);

    return firebaseUser;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('Failed to sign in');
    }
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign in with Google using Expo Auth Session
 * Note: This function should be called from a React component that uses useAuthRequest hook
 * For managed flow, we'll use a different approach - see GoogleSignInButton component
 */
export const signInWithGoogleCredential = async (idToken: string): Promise<FirebaseUser> => {
  try {
    // Create Firebase credential
    const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth.signInWithCredential(credential);

    if (!userCredential.user) {
      throw new Error('Failed to sign in with Google');
    }

    // AuthProvider will create the Firestore user document via onSnapshot
    // This avoids race conditions between auth state change and document creation
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign in with Apple using Expo Apple Authentication
 */
export const signInWithApple = async (): Promise<FirebaseUser> => {
  try {
    if (!(await AppleAuthentication.isAvailableAsync())) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    // Request Apple authentication
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    // Create Firebase credential using Compat API
    const provider = new firebase.auth.OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: credential.identityToken,
    });

    const userCredential = await auth.signInWithCredential(firebaseCredential);

    if (!userCredential.user) {
      throw new Error('Failed to sign in with Apple');
    }

    // Update Firebase Auth profile with Apple displayName if available
    // This ensures the displayName is available in AuthProvider.onAuthStateChanged
    if (credential.fullName) {
      const displayName = `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim();
      if (displayName) {
        try {
          await userCredential.user.updateProfile({ displayName });
        } catch (error) {
          console.error('Failed to update Firebase Auth profile:', error);
          // Continue anyway - not critical
        }
      }
    }

    // AuthProvider will create the Firestore user document via onSnapshot
    // This avoids race conditions between auth state change and document creation
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      throw new Error('Apple sign-in was cancelled');
    }
    console.error('Error signing in with Apple:', error);
    throw error;
  }
};

/**
 * Mark first-login onboarding as completed in Firestore
 * Called after user completes the first-login onboarding flow
 */
export const markFirstLoginOnboardingCompleted = async (userId: string): Promise<void> => {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set(
      {
        onboarding: {
          firstLoginCompleted: true,
          firstLoginCompletedAt: firebase.firestore.FieldValue.serverTimestamp(),
          firstLoginVersion: 1,
        },
      },
      { merge: true }
    );

    if (SHOW_DEV_TOOLS) {
      console.log('[auth] First-login onboarding marked as completed in Firestore:', userId);
    }
  } catch (error) {
    console.error('[auth] Error marking first-login onboarding as completed:', error);
    // Don't throw - onboarding completion succeeded even if Firestore update fails
    // AsyncStorage will still have the flag
  }
};

/**
 * Delete user account completely
 * Removes user data from Firestore, Storage, and Firebase Auth
 *
 * @param user - The Firebase user to delete
 * @throws Error if deletion fails
 */
export const deleteAccount = async (user: FirebaseUser): Promise<void> => {
  if (!user) {
    throw new Error('No user provided for deletion');
  }

  try {
    const userId = user.uid;

    // 1. Delete all user photos from Storage
    try {
      const userPhotosRef = storage.ref(`profiles/${userId}`);
      const photosList = await userPhotosRef.listAll();

      // Delete all files in the user's profile folder
      const deletePromises = photosList.items.map(item => item.delete());
      await Promise.all(deletePromises);
    } catch (storageError: any) {
      // Continue even if storage deletion fails (folder might not exist)
      if (storageError?.code !== 'storage/object-not-found') {
        console.warn('Could not delete user photos:', storageError?.message);
      }
    }

    // 2. Delete Firestore user document
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.delete();

    // 3. Delete Firebase Auth account (must be last)
    await user.delete();

  } catch (error: any) {
    console.error('Error deleting account:', error);
    throw new Error(
      error?.code === 'auth/requires-recent-login'
        ? 'For security reasons, please log out and log back in before deleting your account.'
        : 'Failed to delete account. Please try again or contact support.'
    );
  }
};
