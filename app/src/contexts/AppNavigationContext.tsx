/**
 * App Navigation Context - Hangover Shield
 * Provides global navigation actions across different navigators
 */

import React, { createContext, useContext, useCallback, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AppNavigationContextType {
  // Navigate to main app and specific tab
  goToProgress: () => void;
  // Trigger daily check-in flow
  goToDailyCheckIn: () => void;
  // Navigate to subscription/paywall
  goToSubscription: () => void;
  // Current context (where the user currently is)
  currentContext: 'onboarding' | 'daily_checkin' | 'app' | 'unknown';
}

const defaultContext: AppNavigationContextType = {
  goToProgress: () => console.warn('[AppNavigation] goToProgress not implemented'),
  goToDailyCheckIn: () => console.warn('[AppNavigation] goToDailyCheckIn not implemented'),
  goToSubscription: () => console.warn('[AppNavigation] goToSubscription not implemented'),
  currentContext: 'unknown',
};

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AppNavigationContext = createContext<AppNavigationContextType>(defaultContext);

// ─────────────────────────────────────────────────────────────────────────────
// Provider Props
// ─────────────────────────────────────────────────────────────────────────────

export interface AppNavigationProviderProps {
  children: ReactNode;
  goToProgress: () => void;
  goToDailyCheckIn: () => void;
  goToSubscription: () => void;
  currentContext: 'onboarding' | 'daily_checkin' | 'app' | 'unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export const AppNavigationProvider: React.FC<AppNavigationProviderProps> = ({
  children,
  goToProgress,
  goToDailyCheckIn,
  goToSubscription,
  currentContext,
}) => {
  return (
    <AppNavigationContext.Provider
      value={{
        goToProgress,
        goToDailyCheckIn,
        goToSubscription,
        currentContext,
      }}
    >
      {children}
    </AppNavigationContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useAppNavigation = (): AppNavigationContextType => {
  const context = useContext(AppNavigationContext);
  return context;
};

export default AppNavigationContext;

