/**
 * App Navigation Context - Hangover Shield
 * Provides global navigation actions across different navigators
 */

import React, { createContext, useContext, useCallback, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AppNavigationContextType {
  // Navigate to main app and specific destinations (works from onboarding, daily check-in, or app)
  goToHome: () => void;
  goToToday: () => void;
  goToProgress: () => void;
  goToDailyCheckIn: () => void;
  goToWaterLog: () => void;
  goToEveningCheckIn: () => void;
  goToSubscription: (source?: string, contextScreen?: string) => void;
  // Current context (where the user currently is)
  currentContext: 'onboarding' | 'daily_checkin' | 'app' | 'unknown';
}

const defaultContext: AppNavigationContextType = {
  goToHome: () => console.warn('[AppNavigation] goToHome not implemented'),
  goToToday: () => console.warn('[AppNavigation] goToToday not implemented'),
  goToProgress: () => console.warn('[AppNavigation] goToProgress not implemented'),
  goToDailyCheckIn: () => console.warn('[AppNavigation] goToDailyCheckIn not implemented'),
  goToWaterLog: () => console.warn('[AppNavigation] goToWaterLog not implemented'),
  goToEveningCheckIn: () => console.warn('[AppNavigation] goToEveningCheckIn not implemented'),
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
  goToHome: () => void;
  goToToday: () => void;
  goToProgress: () => void;
  goToDailyCheckIn: () => void;
  goToWaterLog: () => void;
  goToEveningCheckIn: () => void;
  goToSubscription: (source?: string, contextScreen?: string) => void;
  currentContext: 'onboarding' | 'daily_checkin' | 'app' | 'unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export const AppNavigationProvider: React.FC<AppNavigationProviderProps> = ({
  children,
  goToHome,
  goToToday,
  goToProgress,
  goToDailyCheckIn,
  goToWaterLog,
  goToEveningCheckIn,
  goToSubscription,
  currentContext,
}) => {
  return (
    <AppNavigationContext.Provider
      value={{
        goToHome,
        goToToday,
        goToProgress,
        goToDailyCheckIn,
        goToWaterLog,
        goToEveningCheckIn,
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

