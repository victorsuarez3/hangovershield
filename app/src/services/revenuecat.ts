/**
 * RevenueCat Service - Hangover Shield
 * Production-ready subscription management with RevenueCat SDK
 * 
 * NOTE: This service gracefully handles the case where react-native-purchases
 * is not properly linked or available.
 * 
 * Entitlement: "Hangover Shield Pro"
 * Plans: Monthly ($4.99) and Yearly ($29.99)
 */

import { Platform } from 'react-native';
import { SHOW_DEV_TOOLS } from '../config/flags';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const REVENUECAT_CONFIG = {
  // API Keys (same for both platforms in your case)
  IOS_API_KEY: 'test_jhvVKNubAfntmhKiCaOISDpoFrJ',
  ANDROID_API_KEY: 'test_jhvVKNubAfntmhKiCaOISDpoFrJ',
  
  // Entitlement identifier (must match RevenueCat dashboard)
  ENTITLEMENT_ID: 'pro',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SubscriptionStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  expirationDate: Date | null;
  willRenew: boolean;
  productIdentifier: string | null;
}

export interface AvailablePackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
    price: number;
    currencyCode: string;
  };
  offeringIdentifier: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

let isInitialized = false;
let sdkAvailable: boolean | null = null;
let isInitializing = false;

/**
 * Check if RevenueCat SDK is available (lazy check)
 * Always returns a boolean, never undefined
 */
export function isRevenueCatAvailable(): boolean {
  if (sdkAvailable === null) {
    try {
      // Try to require the module
      const mod = require('react-native-purchases');
      // Handle both default export and named export cases
      sdkAvailable = !!(mod?.default ?? mod);
    } catch (error) {
      // Module not available or not linked
      console.log('[RevenueCat] SDK not available:', error);
      sdkAvailable = false;
    }
  }
  return sdkAvailable === true;
}

/**
 * Check if RevenueCat is initialized
 */
export function isRevenueCatInitialized(): boolean {
  return isInitialized && isRevenueCatAvailable();
}

/**
 * Get the Purchases SDK (lazy load)
 * Bulletproof: handles both default and named exports
 */
function getPurchases(): any | null {
  if (!isRevenueCatAvailable()) {
    return null;
  }
  try {
    const mod = require('react-native-purchases');
    // Handle both default export and direct export
    return mod?.default ?? mod;
  } catch (error) {
    console.warn('[RevenueCat] Failed to get Purchases:', error);
    return null;
  }
}

/**
 * Get LOG_LEVEL from SDK
 */
function getLogLevel(): any | null {
  if (!isRevenueCatAvailable()) {
    return null;
  }
  try {
    const mod = require('react-native-purchases');
    return mod?.LOG_LEVEL ?? mod?.default?.LOG_LEVEL ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize RevenueCat SDK
 * Call this ONCE at app startup (App.tsx)
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    console.warn('[RevenueCat] SDK not available, skipping initialization');
    return;
  }

  if (isInitialized || isInitializing) {
    if (SHOW_DEV_TOOLS) {
      console.log('[RevenueCat] Already initialized or initializing');
    }
    return;
  }

  const apiKey = Platform.OS === 'ios' 
    ? REVENUECAT_CONFIG.IOS_API_KEY 
    : REVENUECAT_CONFIG.ANDROID_API_KEY;

  // Guard missing keys or missing configure
  if (!apiKey || typeof Purchases.configure !== 'function') {
    console.warn('[RevenueCat] Missing apiKey or configure(), skipping init');
    return;
  }

  try {
    isInitializing = true;
    // Set log level
    const LOG_LEVEL = getLogLevel();
    if (LOG_LEVEL && SHOW_DEV_TOOLS) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure with platform-specific API key
    try {
      await Purchases.configure({ apiKey });
    } catch (cfgError) {
      console.error('[RevenueCat] Configure error:', cfgError);
      isInitializing = false;
      return;
    }

    // If we have a user ID (Firebase UID), identify them
    if (userId) {
      const { customerInfo } = await Purchases.logIn(userId);
      try {
        const info = await Purchases.getCustomerInfo();
        if (SHOW_DEV_TOOLS) {
          console.log('[RevenueCat] Refreshed after login:', info?.entitlements?.active);
        }
      } catch {
        // Swallow in production
      }
      if (SHOW_DEV_TOOLS) {
        console.log('[RevenueCat] Logged in user:', userId, customerInfo?.entitlements?.active);
      }
    }

    isInitialized = true;
    if (SHOW_DEV_TOOLS) {
      console.log('[RevenueCat] Initialized successfully');
    }
  } catch (error) {
    console.error('[RevenueCat] Initialization error:', error);
    // Don't throw - let the app continue without subscriptions
  } finally {
    isInitializing = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Identify user to RevenueCat (call when user logs in)
 */
export async function identifyUser(userId: string): Promise<any> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    console.warn('[RevenueCat] SDK not available');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.logIn(userId);
    try {
      const info = await Purchases.getCustomerInfo();
      if (SHOW_DEV_TOOLS) {
        console.log('[RevenueCat] Refreshed after identify:', info?.entitlements?.active);
      }
    } catch {
      // ignore in prod
    }
    if (SHOW_DEV_TOOLS) {
      console.log('[RevenueCat] User identified:', userId);
    }
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Error identifying user:', error);
    return null;
  }
}

/**
 * Reset user (call when user logs out)
 */
export async function logOutRevenueCat(): Promise<void> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    return;
  }

  try {
    // Ensure SDK is configured before logout; if not, skip to avoid singleton errors
    if (!isInitialized) {
      if (SHOW_DEV_TOOLS) {
        console.warn('[RevenueCat] Skip logout: SDK not initialized');
      }
      return;
    }

    await Purchases.logOut();
    if (SHOW_DEV_TOOLS) {
      console.log('[RevenueCat] User logged out');
    }
  } catch (error) {
    console.error('[RevenueCat] Error logging out:', error);
    // Don't throw - logout should be best-effort
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<any> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    return null;
  }
  if (!isInitialized) {
    return null;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Error getting customer info:', error);
    return null;
  }
}

/**
 * Check if user has active premium entitlement
 */
export async function checkPremiumStatus(): Promise<boolean> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    return false;
  }
  if (!isInitialized) {
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    return typeof entitlement !== 'undefined';
  } catch (error) {
    console.error('[RevenueCat] Error checking premium status:', error);
    return false;
  }
}

/**
 * Get detailed subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const defaultStatus: SubscriptionStatus = {
    isPremium: false,
    isTrialActive: false,
    expirationDate: null,
    willRenew: false,
    productIdentifier: null,
  };

  const Purchases = getPurchases();
  
  if (!Purchases) {
    return defaultStatus;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];

    if (!entitlement) {
      return defaultStatus;
    }

    return {
      isPremium: true,
      isTrialActive: entitlement.periodType === 'TRIAL',
      expirationDate: entitlement.expirationDate 
        ? new Date(entitlement.expirationDate) 
        : null,
      willRenew: entitlement.willRenew,
      productIdentifier: entitlement.productIdentifier,
    };
  } catch (error) {
    console.error('[RevenueCat] Error getting subscription status:', error);
    return defaultStatus;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Offerings & Packages
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get available offerings (subscription packages)
 */
export async function getOfferings(): Promise<any | null> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    
    if (!offerings.current) {
      console.warn('[RevenueCat] No current offering available');
      return null;
    }

    return offerings.current;
  } catch (error) {
    console.error('[RevenueCat] Error getting offerings:', error);
    return null;
  }
}

/**
 * Get available packages formatted for UI
 */
export async function getAvailablePackages(): Promise<AvailablePackage[]> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    return [];
  }

  try {
    const offering = await getOfferings();
    
    if (!offering) {
      return [];
    }

    return offering.availablePackages.map((pkg: any) => ({
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      product: {
        identifier: pkg.product.identifier,
        title: pkg.product.title,
        description: pkg.product.description,
        priceString: pkg.product.priceString,
        price: pkg.product.price,
        currencyCode: pkg.product.currencyCode,
      },
      offeringIdentifier: pkg.offeringIdentifier,
    }));
  } catch (error) {
    console.error('[RevenueCat] Error getting packages:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Purchase Flow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Purchase a package
 */
export async function purchasePackage(
  packageToPurchase: any
): Promise<{ success: boolean; customerInfo?: any; error?: string }> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    return { success: false, error: 'RevenueCat SDK not available' };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // Verify entitlement is now active
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    const success = typeof entitlement !== 'undefined';

    console.log('[RevenueCat] Purchase result:', success ? 'SUCCESS' : 'PENDING');
    
    return { success, customerInfo };
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.userCancelled) {
      console.log('[RevenueCat] Purchase cancelled by user');
      return { success: false, error: 'cancelled' };
    }

    console.error('[RevenueCat] Purchase error:', error);
    return { 
      success: false, 
      error: error.message || 'Purchase failed. Please try again.' 
    };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    return { success: false, isPremium: false, error: 'RevenueCat SDK not available' };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    const isPremium = typeof entitlement !== 'undefined';

    console.log('[RevenueCat] Restore result:', isPremium ? 'PREMIUM_RESTORED' : 'NO_PURCHASES');
    
    return { success: true, isPremium };
  } catch (error: any) {
    console.error('[RevenueCat] Restore error:', error);
    return { 
      success: false, 
      isPremium: false, 
      error: error.message || 'Restore failed. Please try again.' 
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Listener for Real-time Updates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add listener for customer info changes
 * Returns cleanup function
 */
export function addCustomerInfoListener(
  callback: (customerInfo: any) => void
): () => void {
  const Purchases = getPurchases();
  
  if (!Purchases) {
    return () => {}; // No-op cleanup
  }

  try {
    const listener = Purchases.addCustomerInfoUpdateListener(callback);
    // Return cleanup function - handle cases where listener might not have remove()
    return () => {
      try {
        if (listener && typeof listener.remove === 'function') {
          listener.remove();
        } else if (listener && typeof listener === 'function') {
          // Some SDK versions return the cleanup function directly
          listener();
        }
      } catch (cleanupError) {
        // Ignore cleanup errors - non-fatal
        console.warn('[RevenueCat] Error removing listener (non-fatal)');
      }
    };
  } catch (error) {
    console.error('[RevenueCat] Error adding listener:', error);
    return () => {};
  }
}
