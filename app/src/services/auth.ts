/**
 * Authentication Service - Hangover Shield
 * Firebase Auth operations for Google, Apple, and email/password authentication
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  deleteUser as firebaseDeleteUser,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { auth, db, storage } from '../firebase/config';
import { UserDoc } from '../models/firestore';

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create Firestore user document
    const userDoc: Omit<UserDoc, 'createdAt'> & { createdAt: any } = {
      displayName: fullName,
      email,
      createdAt: serverTimestamp(),
      // Initialize first-login onboarding state (default: not completed)
      onboarding: {
        firstLoginCompleted: false,
        firstLoginVersion: 1,
      },
    };

    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, userDoc);

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);

    // Create or update Firestore user document
    await createOrUpdateUserDoc(userCredential.user);

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

    // Create Firebase credential
    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: credential.identityToken,
      rawNonce: credential.nonce || undefined,
    });

    const userCredential = await signInWithCredential(auth, firebaseCredential);

    // Create or update Firestore user document
    await createOrUpdateUserDoc(userCredential.user, {
      displayName: credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : undefined,
      email: credential.email || undefined,
    });

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
 * Helper function to create or update user document in Firestore
 */
const createOrUpdateUserDoc = async (
  firebaseUser: FirebaseUser,
  additionalData?: { displayName?: string; email?: string }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document
      const userDoc: Omit<UserDoc, 'createdAt'> & { createdAt: any } = {
        displayName: additionalData?.displayName || firebaseUser.displayName || null,
        email: additionalData?.email || firebaseUser.email || null,
        photoUrl: firebaseUser.photoURL || null,
        createdAt: serverTimestamp(),
        // Initialize first-login onboarding state (default: not completed)
        onboarding: {
          firstLoginCompleted: false,
          firstLoginVersion: 1,
        },
      };
      await setDoc(userRef, userDoc);
    } else {
      // Update existing user document if needed
      const updates: Partial<UserDoc> = {};
      if (additionalData?.displayName && !userSnap.data()?.displayName) {
        updates.displayName = additionalData.displayName;
      }
      if (additionalData?.email && !userSnap.data()?.email) {
        updates.email = additionalData.email;
      }
      if (firebaseUser.photoURL && !userSnap.data()?.photoUrl) {
        updates.photoUrl = firebaseUser.photoURL;
      }
      if (Object.keys(updates).length > 0) {
        await setDoc(userRef, updates, { merge: true });
      }
    }
  } catch (error) {
    console.error('Error creating/updating user document:', error);
    // Don't throw - auth succeeded even if Firestore update fails
  }
};

/**
 * Mark first-login onboarding as completed in Firestore
 * Called after user completes the first-login onboarding flow
 */
export const markFirstLoginOnboardingCompleted = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        onboarding: {
          firstLoginCompleted: true,
          firstLoginCompletedAt: serverTimestamp(),
          firstLoginVersion: 1,
        },
      },
      { merge: true }
    );

    if (__DEV__) {
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
      const userPhotosRef = ref(storage, `profiles/${userId}`);
      const photosList = await listAll(userPhotosRef);

      // Delete all files in the user's profile folder
      const deletePromises = photosList.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);
    } catch (storageError: any) {
      // Continue even if storage deletion fails (folder might not exist)
      if (storageError?.code !== 'storage/object-not-found') {
        console.warn('Could not delete user photos:', storageError?.message);
      }
    }

    // 2. Delete Firestore user document
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);

    // 3. Delete Firebase Auth account (must be last)
    await firebaseDeleteUser(user);

  } catch (error: any) {
    console.error('Error deleting account:', error);
    throw new Error(
      error?.code === 'auth/requires-recent-login'
        ? 'For security reasons, please log out and log back in before deleting your account.'
        : 'Failed to delete account. Please try again or contact support.'
    );
  }
};
