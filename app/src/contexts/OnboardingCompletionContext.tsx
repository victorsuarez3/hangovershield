/**
 * Onboarding Completion Context
 *
 * Global single source of truth for first-login onboarding completion state.
 * This context ensures the entire app tree can react to onboarding completion
 * without requiring app reloads.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for onboarding completion (single source of truth)
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';
const LEGACY_ONBOARDING_KEY = '@hangovershield_first_login_onboarding_completed';

interface OnboardingCompletionContextValue {
  /** Whether first-login onboarding has been completed */
  onboardingCompleted: boolean;
  /** Mark onboarding as completed (updates both state and AsyncStorage) */
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  /** Manually trigger hydration from AsyncStorage (useful for app start) */
  hydrateOnboardingCompleted: () => Promise<void>;
  /** Whether the initial hydration from AsyncStorage is complete */
  isHydrated: boolean;
  /** DEV ONLY: Reset onboarding to test the flow again */
  resetOnboarding: () => Promise<void>;
}

const OnboardingCompletionContext = createContext<OnboardingCompletionContextValue | undefined>(
  undefined
);

interface OnboardingCompletionProviderProps {
  children: ReactNode;
}

export const OnboardingCompletionProvider: React.FC<OnboardingCompletionProviderProps> = ({
  children,
}) => {
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate onboarding completion state from AsyncStorage on mount
  const hydrateOnboardingCompleted = useCallback(async () => {
    try {
      // Prefer new key; fall back to legacy key once
      const stored = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      const legacy = stored == null ? await AsyncStorage.getItem(LEGACY_ONBOARDING_KEY) : null;
      const completed = stored === 'true' || legacy === 'true';

      if (legacy !== null && stored == null) {
        // Migrate legacy key forward to single key
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, legacy);
        await AsyncStorage.removeItem(LEGACY_ONBOARDING_KEY);
      }

      if (__DEV__) {
        console.log('[OnboardingCompletionContext] Hydrated onboarding status:', completed);
      }

      setOnboardingCompletedState(completed);
    } catch (error) {
      console.error('[OnboardingCompletionContext] Error hydrating onboarding status:', error);
      setOnboardingCompletedState(false);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    hydrateOnboardingCompleted();
  }, [hydrateOnboardingCompleted]);

  // Mark onboarding as completed or reset
  const setOnboardingCompleted = async (completed: boolean) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, completed ? 'true' : 'false');
      setOnboardingCompletedState(completed);

      if (__DEV__) {
        console.log('[OnboardingCompletionContext] State updated -> onboardingCompleted:', completed);
      }
    } catch (error) {
      console.error('[OnboardingCompletionContext] Error updating onboarding completion:', error);
      throw error;
    }
  };

  // DEV ONLY: Reset onboarding for testing
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      await AsyncStorage.removeItem(LEGACY_ONBOARDING_KEY);
      setOnboardingCompletedState(false);
      if (__DEV__) {
        console.log('[OnboardingCompletionContext] ✅ Onboarding reset - reload app to test flow again');
      }
    } catch (error) {
      console.error('[OnboardingCompletionContext] Error resetting onboarding:', error);
    }
  };

  // Log state changes
  React.useEffect(() => {
    if (__DEV__) {
      console.log('[OnboardingCompletionContext] State changed - onboardingCompleted:', onboardingCompleted);
    }
  }, [onboardingCompleted]);

  const value: OnboardingCompletionContextValue = {
    onboardingCompleted,
    setOnboardingCompleted,
    hydrateOnboardingCompleted,
    isHydrated,
    resetOnboarding,
  };

  return (
    <OnboardingCompletionContext.Provider value={value}>
      {children}
    </OnboardingCompletionContext.Provider>
  );
};

/**
 * Hook to access onboarding completion state
 */
export const useOnboardingCompletion = (): OnboardingCompletionContextValue => {
  const context = useContext(OnboardingCompletionContext);
  if (context === undefined) {
    throw new Error(
      'useOnboardingCompletion must be used within an OnboardingCompletionProvider'
    );
  }
  return context;
};
