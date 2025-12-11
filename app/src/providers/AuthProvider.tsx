/**
 * AuthProvider - SIMPLIFIED & OPTIMIZED
 *
 * Manages authentication state and user document from Firestore.
 * Uses real-time snapshot listener for instant updates.
 */

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot, Unsubscribe, waitForPendingWrites } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserDoc, MembershipStatus } from '../models/firestore';

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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // Safety timeout: if loading takes more than 10 seconds, show default state
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('Loading timeout - creating fallback user document');
      if (loading) {
        setUserDoc({
          fullName: '',
          email: firebaseUser.email || '',
          membershipStatus: 'not_applied' as MembershipStatus,
          role: 'member' as const,
          createdAt: new Date(),
        } as UserDoc);
        setLoading(false);
      }
    }, 10000);

    const userRef = doc(db, 'users', uid);

    // Subscribe to real-time updates with metadata changes
    unsubscribeRef.current = onSnapshot(
      userRef,
      { includeMetadataChanges: true },
      (snapshot) => {
        // Clear timeout on successful load
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        if (snapshot.exists()) {
          const data = snapshot.data() as UserDoc;
          setUserDoc(data);
          setLoading(false);
        } else {
          // Document doesn't exist - create default
          createDefaultUserDoc(firebaseUser).catch((error: any) => {
            console.error('Error creating user document:', error?.message);
            // Set temporary default to unblock UI
            setUserDoc({
              fullName: '',
              email: firebaseUser.email || '',
              membershipStatus: 'not_applied' as MembershipStatus,
              role: 'member' as const,
              createdAt: new Date(),
            } as UserDoc);
            setLoading(false);
          });
        }
      },
      (error) => {
        // Clear timeout on error
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        console.error('Snapshot error:', error?.code, error?.message);
        // Set temporary default to unblock UI
        setUserDoc({
          fullName: '',
          email: firebaseUser.email || '',
          membershipStatus: 'not_applied' as MembershipStatus,
          role: 'member' as const,
          createdAt: new Date(),
        } as UserDoc);
        setLoading(false);
      }
    );
  };

  /**
   * Create default user document if it doesn't exist
   */
  const createDefaultUserDoc = async (firebaseUser: FirebaseUser): Promise<void> => {
    const defaultUserDoc = {
      fullName: '',
      email: firebaseUser.email || '',
      membershipStatus: 'not_applied' as MembershipStatus,
      role: 'member' as const,
      createdAt: serverTimestamp(),
    };

    const userRef = doc(db, 'users', firebaseUser.uid);
    
    try {
      await setDoc(userRef, defaultUserDoc);
      await waitForPendingWrites(db);
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
      const userRef = doc(db, 'users', user.uid);

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
        updatedAt: serverTimestamp(),
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
        updateData.createdAt = serverTimestamp();
      }

      // Write to Firestore
      if (userDoc) {
        await updateDoc(userRef, updateData);
      } else {
        await setDoc(userRef, updateData);
      }

      // Wait for sync to server
      await waitForPendingWrites(db);
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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      await firebaseSignOut(auth);
      setUser(null);
      setUserDoc(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        subscribeToUserDoc(firebaseUser.uid, firebaseUser);
      } else {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
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
