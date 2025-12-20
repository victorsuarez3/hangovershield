/**
 * Post-Authentication Routing Logic
 * Determines where to route user after successful authentication
 *
 * Priority:
 * 1. Check AsyncStorage (fast local check)
 * 2. Check Firestore user doc (source of truth for cross-device sync)
 * 3. Default to first-login onboarding if neither shows completion
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getFirstLoginOnboardingStatus } from '../services/dailyCheckInStorage';
import { UserDoc } from '../models/firestore';

export type PostAuthDestination =
  | 'FirstLoginOnboarding'  // User needs first-login onboarding (3 screens)
  | 'MainApp';              // User goes straight to main app

export interface PostAuthRouteResult {
  destination: PostAuthDestination;
  reason: string; // For debugging
}

/**
 * Determine where to route user after successful authentication
 * Checks both local storage and Firestore to decide between first-login onboarding or main app
 *
 * @param userId - Firebase user UID
 * @returns PostAuthRouteResult indicating destination and reason
 */
export const resolvePostAuthRoute = async (userId: string): Promise<PostAuthRouteResult> => {
  try {
    // PRIORITY 1: Check AsyncStorage (fast local check)
    const localStatus = await getFirstLoginOnboardingStatus();

    if (localStatus.completed) {
      if (__DEV__) {
        console.log('[postAuthRouting] User completed onboarding (from AsyncStorage)', {
          version: localStatus.version,
        });
      }
      return {
        destination: 'MainApp',
        reason: 'Onboarding completed (AsyncStorage)',
      };
    }

    // PRIORITY 2: Check Firestore user doc (source of truth for cross-device)
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserDoc;

        // Check if onboarding field exists and is completed
        if (userData.onboarding?.firstLoginCompleted) {
          if (__DEV__) {
            console.log('[postAuthRouting] User completed onboarding (from Firestore)', {
              completedAt: userData.onboarding.firstLoginCompletedAt,
              version: userData.onboarding.firstLoginVersion,
            });
          }
          return {
            destination: 'MainApp',
            reason: 'Onboarding completed (Firestore)',
          };
        }
      }
    } catch (firestoreError) {
      console.error('[postAuthRouting] Error checking Firestore user doc:', firestoreError);
      // Continue to default - better to show onboarding than skip it
    }

    // DEFAULT: Show first-login onboarding
    // Neither local storage nor Firestore shows completion
    if (__DEV__) {
      console.log('[postAuthRouting] User needs first-login onboarding', {
        localCompleted: localStatus.completed,
      });
    }
    return {
      destination: 'FirstLoginOnboarding',
      reason: 'First login - onboarding not completed',
    };
  } catch (error) {
    console.error('[postAuthRouting] Error in resolvePostAuthRoute:', error);
    // Safe default: show onboarding rather than skipping it
    return {
      destination: 'FirstLoginOnboarding',
      reason: 'Error occurred - defaulting to onboarding',
    };
  }
};
