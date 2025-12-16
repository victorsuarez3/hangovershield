/**
 * useAccessStatus Hook - Hangover Shield
 * Single source of truth for user's access level
 *
 * Priority:
 * 1. RevenueCat premium active => "premium"
 * 2. Firestore welcome unlock active (now < expiresAt) => "welcome"
 * 3. Otherwise => "free"
 * 
 * NOTE: Gracefully handles case where RevenueCat SDK is not installed
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import {
  isWelcomeUnlockActive,
  getWelcomeUnlockTimeRemaining,
  getWelcomeUnlockExpiresAt,
} from '../services/welcomeUnlock';
import {
  getCustomerInfo,
  addCustomerInfoListener,
  REVENUECAT_CONFIG,
  isRevenueCatAvailable,
  isRevenueCatInitialized,
} from '../services/revenuecat';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AccessStatus = 'free' | 'welcome' | 'premium';

export interface AccessInfo {
  status: AccessStatus;
  hasFullAccess: boolean;
  welcomeRemainingMs: number;
  welcomeExpiresAt: number | null;
  isPremium: boolean;
  isWelcome: boolean;
  isFree: boolean;
  isTrialActive: boolean;
  subscriptionExpiresAt: Date | null;
  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to get user's current access status
 * Combines RevenueCat premium status with Firestore welcome unlock
 * Updates in real-time as:
 * - RevenueCat subscription changes
 * - Welcome unlock expires (every 60s countdown)
 */
export function useAccessStatus(): AccessInfo {
  const { userDoc } = useAuth();
  
  // RevenueCat state
  const [isPremiumActive, setIsPremiumActive] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────────
  // Update from RevenueCat CustomerInfo
  // ─────────────────────────────────────────────────────────────────────────────

  const updateFromCustomerInfo = useCallback((customerInfo: any) => {
    if (!customerInfo?.entitlements?.active) {
      setIsPremiumActive(false);
      setIsTrialActive(false);
      setSubscriptionExpiresAt(null);
      return;
    }

    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    
    const hasPremium = typeof entitlement !== 'undefined';
    setIsPremiumActive(hasPremium);
    
    if (entitlement) {
      setIsTrialActive(entitlement.periodType === 'TRIAL');
      setSubscriptionExpiresAt(
        entitlement.expirationDate ? new Date(entitlement.expirationDate) : null
      );
    } else {
      setIsTrialActive(false);
      setSubscriptionExpiresAt(null);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialize RevenueCat listener
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initializeRevenueCat = async () => {
      // If SDK not available, just use free/welcome status from Firestore
      if (!isRevenueCatAvailable()) {
        console.log('[useAccessStatus] RevenueCat not available, using Firestore only');
        setIsLoading(false);
        return;
      }

      try {
        // Get current customer info
        const customerInfo = await getCustomerInfo();
        updateFromCustomerInfo(customerInfo);

        // Set up real-time listener for subscription changes
        cleanup = addCustomerInfoListener((info) => {
          console.log('[useAccessStatus] Customer info updated');
          updateFromCustomerInfo(info);
        });
      } catch (error) {
        console.error('[useAccessStatus] Error fetching customer info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRevenueCat();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [updateFromCustomerInfo]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Compute Welcome Unlock status from Firestore
  // ─────────────────────────────────────────────────────────────────────────────

  const isWelcomeActive = isWelcomeUnlockActive(userDoc);
  const welcomeRemainingMs = getWelcomeUnlockTimeRemaining(userDoc);
  const welcomeExpiresAt = getWelcomeUnlockExpiresAt(userDoc);

  // ─────────────────────────────────────────────────────────────────────────────
  // Determine final access status (PRIORITY ORDER)
  // ─────────────────────────────────────────────────────────────────────────────

  let status: AccessStatus;
  if (isPremiumActive) {
    // Priority 1: RevenueCat premium (paid subscription or trial)
    status = 'premium';
  } else if (isWelcomeActive) {
    // Priority 2: Firestore welcome unlock (24h free access)
    status = 'welcome';
  } else {
    // Default: Free user
    status = 'free';
  }

  const hasFullAccess = status === 'premium' || status === 'welcome';

  // ─────────────────────────────────────────────────────────────────────────────
  // Welcome countdown timer (update every 60s)
  // ─────────────────────────────────────────────────────────────────────────────

  const [, setTick] = useState(0);
  useEffect(() => {
    if (isWelcomeActive && welcomeRemainingMs > 0) {
      const interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 60 * 1000); // Update every 60 seconds

      return () => clearInterval(interval);
    }
  }, [isWelcomeActive, welcomeRemainingMs]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    status,
    hasFullAccess,
    welcomeRemainingMs,
    welcomeExpiresAt,
    isPremium: status === 'premium',
    isWelcome: status === 'welcome',
    isFree: status === 'free',
    isTrialActive,
    subscriptionExpiresAt,
    isLoading,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Helper to determine if a premium feature should be accessible
 */
export function canAccessPremiumFeature(accessInfo: AccessInfo): boolean {
  return accessInfo.hasFullAccess;
}
