/**
 * AuthProvider - SIMPLIFIED & OPTIMIZED
 *
 * Manages authentication state and user document from Firestore.
 * Uses real-time snapshot listener for instant updates.
 */

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import Constants from 'expo-constants';
import { auth, db } from '../firebase/config';
import { UserDoc, MembershipStatus } from '../models/firestore';
import { logOutRevenueCat } from '../services/revenuecat';

// Conditionally import notification service only in real builds (not Expo Go)
const isExpoGo = Constants.appOwnership === 'expo';
const notificationService = isExpoGo ? null : require('../services/notificationService');

type FirebaseUser = firebase.User;
type Unsubscribe = () => void;

interface AuthContextType {
  user: FirebaseUser | null;
  userDoc: UserDoc | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
  loadUser: (uid: string) => Promise<void>;
  updateUser: (updates: Partial<UserDoc>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  /**
   * Subscribe to user document changes in real-time
   * SIMPLIFIED: Just use onSnapshot, it handles cache automatically
   */
  const subscribeToUserDoc = (uid: string, firebaseUser: FirebaseUser): void => {
    // Unsubscribe from previous listener if exists
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const userRef = db.collection('users').doc(uid);

    // Subscribe to real-time updates with metadata changes
    unsubscribeRef.current = userRef.onSnapshot(
      { includeMetadataChanges: true },
      async (snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data() as UserDoc;
          setUserDoc(data);
          setLoading(false);

          // Setup notifications for authenticated user
          setupNotifications().catch((error) => {
            console.error('[AuthProvider] Error setting up notifications:', error);
          });
        } else {
          // Document doesn't exist - create default and wait for next snapshot
          try {
            await createDefaultUserDoc(firebaseUser);
            // Don't call setLoading(false) here - wait for next snapshot with the new document
            console.log('[AuthProvider] User document created, waiting for snapshot update...');
          } catch (error: any) {
            console.error('[AuthProvider] Error creating user document:', error?.message);
            setLoading(false); // Only set loading false on error
          }
        }
      },
      (error) => {
        console.error('[AuthProvider] Snapshot error:', error?.code, error?.message);
        setLoading(false);
      }
    );
  };

  /**
   * Setup push notifications for authenticated user
   * Called after successful login
   */
  const setupNotifications = async (): Promise<void> => {
    // Skip notifications in Expo Go
    if (isExpoGo || !notificationService) {
      console.log('[AuthProvider] Skipping notifications (Expo Go)');
      return;
    }

    try {
      // Register for push notifications and get token
      const token = await notificationService.registerForPushNotificationsAsync();

      if (token) {
        // Successfully got permission and token, schedule all notifications
        await notificationService.scheduleAllNotifications();
        console.log('[AuthProvider] ✅ Notifications setup complete');
      }
    } catch (error) {
      console.error('[AuthProvider] Failed to setup notifications:', error);
      // Don't throw - notifications are optional
    }
  };

  /**
   * Create default user document if it doesn't exist
   */
  const createDefaultUserDoc = async (firebaseUser: FirebaseUser): Promise<void> => {
    const defaultUserDoc = {
      displayName: firebaseUser.displayName || null,
      email: firebaseUser.email || null,
      photoUrl: firebaseUser.photoURL || null,
      membershipStatus: 'not_applied' as MembershipStatus,
      role: 'member' as const,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      // Initialize first-login onboarding state (default: not completed)
      onboarding: {
        firstLoginCompleted: false,
        firstLoginVersion: 1,
      },
    };

    const userRef = db.collection('users').doc(firebaseUser.uid);

    try {
      await userRef.set(defaultUserDoc);
      await db.waitForPendingWrites();
    } catch (error: any) {
      console.error('Error creating default document:', error?.message);
      throw error;
    }
  };

  /**
   * Load user document from Firestore by UID
   * Not needed with real-time snapshot, but kept for API compatibility
   */
  const loadUser = async (_uid: string): Promise<void> => {
    // Real-time snapshot handles this automatically
  };

  /**
   * Refresh user document from Firestore
   * Not needed with real-time snapshot, but kept for API compatibility
   */
  const refreshUserDoc = async (): Promise<void> => {
    // Real-time snapshot handles this automatically
  };

  /**
   * Update user document in Firestore
   * SIMPLIFIED: Just save to Firestore, snapshot will update state automatically
   */
  const updateUser = async (updates: Partial<UserDoc>): Promise<void> => {
    if (!user) {
      throw new Error('No user authenticated');
    }

    try {
      const userRef = db.collection('users').doc(user.uid);

      // Remove undefined values
      const cleanUpdates: any = {};
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof UserDoc];
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      });

      // Build update data with required fields
      const updateData: any = {
        ...cleanUpdates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Ensure required fields are present
      if (!updateData.email && user.email) {
        updateData.email = user.email;
      }
      if (!updateData.membershipStatus) {
        updateData.membershipStatus = userDoc?.membershipStatus || 'not_applied';
      }
      if (!updateData.role) {
        updateData.role = userDoc?.role || 'member';
      }
      if (!userDoc?.createdAt) {
        updateData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }

      // Write to Firestore
      if (userDoc) {
        await userRef.update(updateData);
      } else {
        await userRef.set(updateData);
      }

      // Wait for sync to server
      await db.waitForPendingWrites();
    } catch (error: any) {
      console.error('Error saving user document:', error?.message);

      if (error?.code === 'permission-denied') {
        throw new Error('Permission denied: Please contact support');
      }
      if (error?.code === 'unavailable') {
        // Offline - write will sync when online
        return;
      }
      throw error;
    }
  };

  /**
   * Handle logout
   */
  const logout = async (): Promise<void> => {
    try {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Logout from RevenueCat
      await logOutRevenueCat();

      // Logout from Firebase
      await auth.signOut();
      setUser(null);
      setUserDoc(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setLoading(true);
        subscribeToUserDoc(firebaseUser.uid, firebaseUser);
      } else {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        setUserDoc(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        logout,
        refreshUserDoc,
        loadUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
