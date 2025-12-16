/**
 * useRevenueCat Hook - Hangover Shield
 * Real-time subscription state management with RevenueCat
 * 
 * NOTE: Gracefully handles case where react-native-purchases is not installed
 * 
 * Features:
 * - Reactive subscription status
 * - Package/offering fetching
 * - Purchase and restore handlers
 * - Automatic listener cleanup
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  addCustomerInfoListener,
  REVENUECAT_CONFIG,
  SubscriptionStatus,
  isRevenueCatAvailable,
  isRevenueCatInitialized,
} from '../services/revenuecat';
import { Analytics } from '../utils/analytics';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseRevenueCatReturn {
  // Status
  isPremium: boolean;
  isLoading: boolean;
  isTrialActive: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  isAvailable: boolean;
  
  // Offerings
  packages: any[];
  monthlyPackage: any | null;
  yearlyPackage: any | null;
  
  // Actions
  purchase: (pkg: any, source: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
  
  // Errors
  error: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useRevenueCat(): UseRevenueCatReturn {
  // State
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Safely check if RevenueCat is available
  // Use a try-catch to handle any import/export issues
  let isAvailable = false;
  try {
    if (typeof checkRevenueCatAvailable === 'function') {
      isAvailable = checkRevenueCatAvailable();
    }
  } catch (error) {
    console.warn('[useRevenueCat] Error checking RevenueCat availability:', error);
    isAvailable = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────────────────────────────────────

  const monthlyPackage = packages.find(
    (pkg) => pkg.packageType === 'MONTHLY' || pkg.identifier === '$rc_monthly'
  ) || null;

  const yearlyPackage = packages.find(
    (pkg) => pkg.packageType === 'ANNUAL' || pkg.identifier === '$rc_annual'
  ) || null;

  // ─────────────────────────────────────────────────────────────────────────────
  // Update subscription status from CustomerInfo
  // ─────────────────────────────────────────────────────────────────────────────

  const updateFromCustomerInfo = useCallback((customerInfo: any) => {
    if (!customerInfo) {
      setIsPremium(false);
      setIsTrialActive(false);
      setSubscriptionStatus(null);
      return;
    }

    const entitlement = customerInfo.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    
    const hasPremium = typeof entitlement !== 'undefined';
    setIsPremium(hasPremium);
    
    if (entitlement) {
      setIsTrialActive(entitlement.periodType === 'TRIAL');
      setSubscriptionStatus({
        isPremium: true,
        isTrialActive: entitlement.periodType === 'TRIAL',
        expirationDate: entitlement.expirationDate 
          ? new Date(entitlement.expirationDate) 
          : null,
        willRenew: entitlement.willRenew,
        productIdentifier: entitlement.productIdentifier,
      });
    } else {
      setIsTrialActive(false);
      setSubscriptionStatus({
        isPremium: false,
        isTrialActive: false,
        expirationDate: null,
        willRenew: false,
        productIdentifier: null,
      });
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Load initial state and set up listener
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initialize = async () => {
      // If SDK not available, just set loading to false
      if (!isAvailable) {
        console.log('[useRevenueCat] SDK not available, using free status');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get current customer info
        const customerInfo = await getCustomerInfo();
        updateFromCustomerInfo(customerInfo);

        // Get available offerings
        const offering = await getOfferings();
        if (offering?.availablePackages) {
          setPackages(offering.availablePackages);
        }

        // Set up real-time listener
        cleanup = addCustomerInfoListener((info) => {
          console.log('[useRevenueCat] Customer info updated');
          updateFromCustomerInfo(info);
        });

      } catch (err: any) {
        console.error('[useRevenueCat] Initialization error:', err);
        setError(err.message || 'Failed to load subscription info');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [updateFromCustomerInfo, isAvailable]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Purchase handler
  // ─────────────────────────────────────────────────────────────────────────────

  const purchase = useCallback(async (
    pkg: any, 
    source: string
  ): Promise<boolean> => {
    if (!isAvailable) {
      setError('Subscriptions not available');
      return false;
    }

    try {
      setError(null);
      
      // Log analytics
      Analytics.purchaseInitiated(pkg.identifier, source);

      const result = await purchasePackage(pkg);
      
      if (result.success) {
        Analytics.purchaseCompleted(pkg.identifier, source);
        
        // Update local state immediately
        if (result.customerInfo) {
          updateFromCustomerInfo(result.customerInfo);
        }
        
        return true;
      } else {
        if (result.error !== 'cancelled') {
          setError(result.error || 'Purchase failed');
          Analytics.purchaseFailed(pkg.identifier, source, result.error || 'unknown');
        }
        return false;
      }
    } catch (err: any) {
      console.error('[useRevenueCat] Purchase error:', err);
      setError(err.message || 'Purchase failed');
      Analytics.purchaseFailed(pkg.identifier, source, err.message || 'unknown');
      return false;
    }
  }, [updateFromCustomerInfo, isAvailable]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Restore handler
  // ─────────────────────────────────────────────────────────────────────────────

  const restore = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      setError('Subscriptions not available');
      return false;
    }

    try {
      setError(null);
      setIsLoading(true);

      const result = await restorePurchases();
      
      if (result.success) {
        // Refresh state
        const customerInfo = await getCustomerInfo();
        updateFromCustomerInfo(customerInfo);
        return result.isPremium;
      } else {
        setError(result.error || 'Restore failed');
        return false;
      }
    } catch (err: any) {
      console.error('[useRevenueCat] Restore error:', err);
      setError(err.message || 'Restore failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateFromCustomerInfo, isAvailable]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Manual refresh
  // ─────────────────────────────────────────────────────────────────────────────

  const refresh = useCallback(async (): Promise<void> => {
    if (!isAvailable) {
      return;
    }

    try {
      setIsLoading(true);
      const customerInfo = await getCustomerInfo();
      updateFromCustomerInfo(customerInfo);
    } catch (err: any) {
      console.error('[useRevenueCat] Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updateFromCustomerInfo, isAvailable]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    // Status
    isPremium,
    isLoading,
    isTrialActive,
    subscriptionStatus,
    isAvailable,
    
    // Offerings
    packages,
    monthlyPackage,
    yearlyPackage,
    
    // Actions
    purchase,
    restore,
    refresh,
    
    // Errors
    error,
  };
}
