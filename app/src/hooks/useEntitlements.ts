/**
 * useEntitlements Hook - Hangover Shield
 * React hook for managing premium entitlements state
 */

import { useState, useEffect, useCallback } from 'react';
import {
  EntitlementState,
  loadEntitlementState,
  grant24hUnlock,
  grantPremiumAccess,
  purchasePremium,
  restorePurchases,
  shouldOffer24hUnlock,
  clearAllEntitlements,
} from '../services/entitlements';

export const useEntitlements = () => {
  const [entitlementState, setEntitlementState] = useState<EntitlementState | null>(null);
  const [loading, setLoading] = useState(true);

  // Load entitlements on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const state = await loadEntitlementState();
        setEntitlementState(state);
      } catch (error) {
        console.error('Error loading entitlements:', error);
        // Set default state on error
        setEntitlementState({
          hasPremiumAccess: false,
          has24hUnlock: false,
          unlockExpiresAt: null,
          premiumEntitlementSource: 'none',
          canAccessPremium: false,
          accessStatus: 'free',
          isFree: true,
          isTrial: false,
          isPremium: false,
          hasFullAccess: false,
        });
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, []);

  // Grant 24h unlock
  const unlock24h = useCallback(async () => {
    try {
      const newState = await grant24hUnlock();
      setEntitlementState(newState);
      return { success: true };
    } catch (error) {
      console.error('Error granting 24h unlock:', error);
      return { success: false, error: 'Failed to unlock premium features' };
    }
  }, []);

  // Purchase premium
  const purchase = useCallback(async (planId: string) => {
    try {
      const result = await purchasePremium(planId);
      if (result.success) {
        // Reload state after successful purchase
        const newState = await loadEntitlementState();
        setEntitlementState(newState);
      }
      return result;
    } catch (error) {
      console.error('Error purchasing premium:', error);
      return { success: false, error: 'Purchase failed' };
    }
  }, []);

  // Restore purchases
  const restore = useCallback(async () => {
    try {
      const result = await restorePurchases();
      if (result.success && result.restored) {
        // Reload state after successful restore
        const newState = await loadEntitlementState();
        setEntitlementState(newState);
      }
      return result;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { success: false, error: 'Restore failed' };
    }
  }, []);

  // Check if should offer 24h unlock
  const checkShouldOffer24hUnlock = useCallback(async () => {
    try {
      return await shouldOffer24hUnlock();
    } catch (error) {
      console.error('Error checking 24h unlock offer:', error);
      return false;
    }
  }, []);

  // Clear entitlements (for testing)
  const clearEntitlements = useCallback(async () => {
    try {
      await clearAllEntitlements();
      const newState = await loadEntitlementState();
      setEntitlementState(newState);
    } catch (error) {
      console.error('Error clearing entitlements:', error);
    }
  }, []);

  return {
    // State
    entitlements: entitlementState,
    loading,

    // Computed values
    canAccessPremium: entitlementState?.canAccessPremium ?? false,
    hasPremiumAccess: entitlementState?.hasPremiumAccess ?? false,
    has24hUnlock: entitlementState?.has24hUnlock ?? false,
    premiumSource: entitlementState?.premiumEntitlementSource ?? 'none',
    accessStatus: entitlementState?.accessStatus ?? 'free',
    isFree: entitlementState?.isFree ?? true,
    isTrial: entitlementState?.isTrial ?? false,
    isPremium: entitlementState?.isPremium ?? false,
    hasFullAccess: entitlementState?.hasFullAccess ?? false,

    // Actions
    unlock24h,
    purchase,
    restore,
    checkShouldOffer24hUnlock,
    clearEntitlements,
  };
};

export default useEntitlements;
