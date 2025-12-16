/**
 * useAccessStatus Hook - Hangover Shield
 * Single source of truth for user's access level
 *
 * Priority:
 * 1. RevenueCat premium active => "premium"
 * 2. Firestore welcome unlock active (now < expiresAt) => "welcome"
 * 3. Otherwise => "free"
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import {
  isWelcomeUnlockActive,
  getWelcomeUnlockTimeRemaining,
  getWelcomeUnlockExpiresAt,
} from '../services/welcomeUnlock';

export type AccessStatus = 'free' | 'welcome' | 'premium';

export interface AccessInfo {
  status: AccessStatus;
  hasFullAccess: boolean;
  welcomeRemainingMs: number;
  welcomeExpiresAt: number | null;
  isPremium: boolean;
  isWelcome: boolean;
  isFree: boolean;
}

/**
 * Hook to get user's current access status
 * Updates in real-time as welcome unlock expires
 */
export function useAccessStatus(): AccessInfo {
  const { userDoc } = useAuth();

  // TODO: Replace with actual RevenueCat integration
  const isPremiumActive = false;

  // Compute welcome unlock status
  const isWelcomeActive = isWelcomeUnlockActive(userDoc);
  const welcomeRemainingMs = getWelcomeUnlockTimeRemaining(userDoc);
  const welcomeExpiresAt = getWelcomeUnlockExpiresAt(userDoc);

  // Determine access status (priority order)
  let status: AccessStatus;
  if (isPremiumActive) {
    status = 'premium';
  } else if (isWelcomeActive) {
    status = 'welcome';
  } else {
    status = 'free';
  }

  const hasFullAccess = status === 'premium' || status === 'welcome';

  // Force re-render every 60s if welcome is active (for countdown)
  const [, setTick] = useState(0);
  useEffect(() => {
    if (isWelcomeActive && welcomeRemainingMs > 0) {
      const interval = setInterval(() => {
        setTick(t => t + 1);
      }, 60 * 1000); // Update every 60 seconds

      return () => clearInterval(interval);
    }
  }, [isWelcomeActive, welcomeRemainingMs]);

  return {
    status,
    hasFullAccess,
    welcomeRemainingMs,
    welcomeExpiresAt,
    isPremium: status === 'premium',
    isWelcome: status === 'welcome',
    isFree: status === 'free',
  };
}

/**
 * Helper to determine if a premium feature should be accessible
 */
export function canAccessPremiumFeature(accessInfo: AccessInfo): boolean {
  return accessInfo.hasFullAccess;
}
