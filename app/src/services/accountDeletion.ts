/**
 * Account deletion utility
 * - Deletes user-owned Firestore data (known subcollections)
 * - Logs out of RevenueCat
 * - Deletes Firebase Auth user
 * - Clears local AsyncStorage caches
 *
 * NOTE: This is client-side best-effort. If you add more user subcollections,
 * include them below.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUser as firebaseDeleteUser } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { logOutRevenueCat } from './revenuecat';

const USER_SUBCOLLECTIONS = ['dailyCheckIns', 'waterLogs', 'eveningCheckIns', 'meta'] as const;

const deleteSubcollection = async (uid: string, subcollection: string): Promise<void> => {
  const colRef = collection(db, 'users', uid, subcollection);
  const snap = await getDocs(colRef);
  const deletions = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(deletions);
};

const deleteUserData = async (uid: string): Promise<void> => {
  for (const sub of USER_SUBCOLLECTIONS) {
    await deleteSubcollection(uid, sub);
  }
  await deleteDoc(doc(db, 'users', uid));
};

export const deleteAccountAndData = async (): Promise<'deleted' | 'reauth-required'> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user to delete.');
  }

  const uid = currentUser.uid;

  // Best effort: log out of RevenueCat first to avoid stale entitlement sessions
  try {
    await logOutRevenueCat();
  } catch {
    // Non-blocking
  }

  // Remove Firestore data
  await deleteUserData(uid);

  // Delete Firebase Auth user
  try {
    await firebaseDeleteUser(currentUser);
  } catch (error: any) {
    if (error?.code === 'auth/requires-recent-login') {
      await AsyncStorage.clear();
      return 'reauth-required';
    }
    throw error;
  }

  // Clear local caches
  await AsyncStorage.clear();

  return 'deleted';
};

