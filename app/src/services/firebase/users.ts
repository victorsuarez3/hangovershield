/**
 * Firebase Users Service
 * Typed Firestore operations for users
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { User } from './types';

const USERS_COLLECTION = 'users';

/**
 * Get current user data
 */
export const getCurrentUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/**
 * Create or update user document
 */
export const createOrUpdateUser = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

/**
 * Generate invite code from user ID
 */
export const generateInviteCode = (userId: string): string => {
  // Take first 6-8 characters of userId, uppercase
  return userId.substring(0, 8).toUpperCase();
};

/**
 * Update user invite code
 */
export const updateUserInviteCode = async (userId: string, inviteCode: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      inviteCode,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating invite code:', error);
    throw error;
  }
};

/**
 * Get user by invite code
 */
export const getUserByInviteCode = async (inviteCode: string): Promise<User | null> => {
  try {
    // Note: In a production app, you might want to create an index on inviteCode
    // For now, we'll query all users (not ideal for large datasets)
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as User;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user by invite code:', error);
    return null;
  }
};




