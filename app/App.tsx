import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { StyleSheet } from 'react-native';
import * as SplashScreenNative from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SkipAuthProvider } from './src/contexts/SkipAuthContext';
import { AppNavigationProvider } from './src/contexts/AppNavigationContext';
import { OnboardingCompletionProvider, useOnboardingCompletion } from './src/contexts/OnboardingCompletionContext';

// Keep splash screen visible until fonts are loaded
SplashScreenNative.preventAutoHideAsync();

import { ThemeProvider } from './src/hooks/useTheme';
import { AuthProvider, useAuth } from './src/providers/AuthProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { IntroOnboardingNavigator } from './src/navigation/IntroOnboardingNavigator';
import { FirstLoginOnboardingNavigator } from './src/navigation/FirstLoginOnboardingNavigator';
import { DailyCheckInNavigator } from './src/navigation/DailyCheckInNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { AlertManager } from './src/utils/alert';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { getTodayDailyCheckIn } from './src/services/dailyCheckIn';
import { initializeRevenueCat, identifyUser } from './src/services/revenuecat';
import Constants from 'expo-constants';
import { SHOW_DEV_TOOLS } from './src/config/flags';

// Debug: Verify RevenueCat exports are available
console.log('RC exports check:', {
  initializeRevenueCat: typeof initializeRevenueCat,
  identifyUser: typeof identifyUser,
  logOutRevenueCat: typeof logOutRevenueCat,
});

// Async storage keys for onboarding state
const INTRO_ONBOARDING_KEY = '@hangovershield_intro_onboarding_completed'; // NEW pre-auth intro

// Global navigation ref so app-wide actions can navigate across conditional navigators
export const navigationRef = createNavigationContainerRef<any>();

function AppContent() {
  const { user, userDoc, loading } = useAuth();
  const { onboardingCompleted, isHydrated } = useOnboardingCompletion();
  const [showSplash, setShowSplash] = React.useState(true);
  const [showIntroOnboarding, setShowIntroOnboarding] = React.useState(false);
  const [introOnboardingCompleted, setIntroOnboardingCompleted] = React.useState<boolean | null>(null);
  const [skipAuthMode, setSkipAuthMode] = React.useState(false);
  const [dailyCheckInStatus, setDailyCheckInStatus] = React.useState<'loading' | 'needs_checkin' | 'completed'>('loading');
  const [checkingDailyStatus, setCheckingDailyStatus] = React.useState(false);
  const [pendingNav, setPendingNav] = React.useState<
    | null
    | { kind: 'screen'; screen: 'HomeMain' | 'SmartPlan' | 'Tools' | 'Progress' | 'ProfileMain' | 'CheckIn' | 'DailyWaterLog' | 'EveningCheckIn' | 'Paywall' | 'Settings'; params?: any }
  >(null);

  // Check if we're in a real device environment (not Expo Go / dev overlay)
  const isRealDevice = React.useMemo(() => {
    return Constants.appOwnership !== 'expo' && 
           Constants.executionEnvironment !== 'storeClient';
  }, []);

  // Initialize RevenueCat SDK ONLY when:
  // 1. User is authenticated
  // 2. Running on real device (not Expo Go / dev environment)
  React.useEffect(() => {
    if (!user?.uid) {
      return;
    }

    if (!isRealDevice) {
      console.log('[App] RevenueCat: Skipping init (Expo / Dev environment)');
      return;
    }

    const initRC = async () => {
      try {
        await initializeRevenueCat(user.uid);
        console.log('[App] RevenueCat initialized');
      } catch (error) {
        console.error('[App] RevenueCat init error:', error);
      }
    };
    initRC();
  }, [user?.uid, isRealDevice]);

  // Identify user to RevenueCat when authenticated (after initialization)
  React.useEffect(() => {
    const identifyToRevenueCat = async () => {
      if (user?.uid && isRealDevice) {
        try {
          await identifyUser(user.uid);
          console.log('[AppContent] User identified to RevenueCat:', user.uid);
        } catch (error) {
          console.error('[AppContent] Error identifying user to RevenueCat:', error);
        }
      }
    };
    identifyToRevenueCat();
  }, [user?.uid, isRealDevice]);

  // Check if intro onboarding has been completed
  React.useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const introCompleted = await AsyncStorage.getItem(INTRO_ONBOARDING_KEY);
        setIntroOnboardingCompleted(introCompleted === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIntroOnboardingCompleted(false);
      }
    };
    checkOnboarding();
  }, []);

  // Onboarding status is now managed by OnboardingCompletionContext
  // No need for separate useEffect - context handles AsyncStorage hydration

  // Check daily check-in status for authenticated users who completed onboarding
  React.useEffect(() => {
    const checkDailyStatus = async () => {
      // Skip daily check-in enforcement for guest/skip-auth users
      if (!user) {
        setDailyCheckInStatus('completed');
        setCheckingDailyStatus(false);
        return;
      }

      if (!onboardingCompleted) {
        setDailyCheckInStatus('loading');
        return;
      }

      setCheckingDailyStatus(true);
      try {
        const todayCheckIn = await getTodayDailyCheckIn(user.uid);
        if (todayCheckIn) {
          setDailyCheckInStatus('completed');
        } else {
          setDailyCheckInStatus('needs_checkin');
        }
      } catch (error) {
        console.error('Error checking daily check-in:', error);
        // Default to needs check-in if we cannot verify
        setDailyCheckInStatus('needs_checkin');
      } finally {
        setCheckingDailyStatus(false);
      }
    };

    checkDailyStatus();
  }, [user, onboardingCompleted]);

  // Single root navigation tree - no reloads or hacks.

  const ensureMainAppVisible = React.useCallback(async () => {
    // In guest/test mode (skipAuthMode) or development builds, allow navigation without auth
    if (!user && !skipAuthMode && !SHOW_DEV_TOOLS) {
      console.warn('[AppNavigation] User not authenticated, cannot navigate');
      return false;
    }

    setCheckingDailyStatus(false);
    setDailyCheckInStatus('completed');
    return true;
  }, [user, skipAuthMode]);

  // Flush pending navigation once the correct navigator tree is mounted.
  // IMPORTANT: AppContent conditionally renders different navigators; routeNames change AFTER state updates.
  // We retry a few times until the target routes exist.
  // Also re-run when feelingOnboardingCompleted changes (navigator tree switches from OnboardingNavigator to AppNavigator)
  React.useEffect(() => {
    if (!pendingNav) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 60; // ~3s at 50ms intervals (increased for navigator tree switches)

    const tryFlush = () => {
      if (cancelled) return;
      attempts += 1;

      if (!navigationRef.isReady()) {
        if (attempts < maxAttempts) {
          setTimeout(tryFlush, 50);
        } else {
          if (SHOW_DEV_TOOLS) {
            console.warn('[AppNavigation] Navigation ref not ready after max attempts');
          }
        }
        return;
      }

      const rootState = navigationRef.getRootState();
      const routeNames = rootState?.routeNames ?? [];

      if (SHOW_DEV_TOOLS && attempts === 1) {
        console.log('[AppNavigation] Attempting to flush pendingNav', { pendingNav, routeNames });
      }

      if (pendingNav.kind === 'screen') {
        if (routeNames.includes(pendingNav.screen)) {
          if (SHOW_DEV_TOOLS) {
            console.log('[AppNavigation] Navigating to screen', pendingNav.screen);
          }
          navigationRef.navigate(pendingNav.screen as any, pendingNav.params);
          setPendingNav(null);
          return;
        }
      }

      if (attempts < maxAttempts) {
        setTimeout(tryFlush, 50);
      } else {
        if (SHOW_DEV_TOOLS) {
          console.warn('[AppNavigation] Failed to flush pendingNav after max attempts', { pendingNav, routeNames });
        }
      }
    };

    // Small delay when navigator tree just switched (onboardingCompleted changed)
    // This gives React time to mount the new navigator tree
    const initialDelay = onboardingCompleted ? 100 : 0;
    setTimeout(() => {
      if (!cancelled) {
        tryFlush();
      }
    }, initialDelay);

    return () => {
      cancelled = true;
    };
  }, [pendingNav, onboardingCompleted]);

  // Navigation handlers for global menu (works from onboarding/daily_checkin/app)
  const handleGoToHome = React.useCallback(async () => {
    if (SHOW_DEV_TOOLS) {
      console.log('[AppNavigation] handleGoToHome called', { user: !!user, skipAuthMode });
    }
    const ok = await ensureMainAppVisible();
    if (!ok) {
      if (SHOW_DEV_TOOLS) {
        console.warn('[AppNavigation] handleGoToHome blocked by ensureMainAppVisible');
      }
      return;
    }
    if (SHOW_DEV_TOOLS) {
      console.log('[AppNavigation] handleGoToHome setting pendingNav to HomeMain');
    }
    setPendingNav({ kind: 'screen', screen: 'HomeMain' });
  }, [ensureMainAppVisible, user, skipAuthMode]);

  const handleGoToToday = React.useCallback(async () => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({ kind: 'screen', screen: 'SmartPlan' });
  }, [ensureMainAppVisible]);

  const handleGoToProgress = React.useCallback(async () => {
    if (SHOW_DEV_TOOLS) {
      console.log('[AppNavigation] handleGoToProgress called', { user: !!user, skipAuthMode });
    }
    const ok = await ensureMainAppVisible();
    if (!ok) {
      if (SHOW_DEV_TOOLS) {
        console.warn('[AppNavigation] handleGoToProgress blocked by ensureMainAppVisible');
      }
      return;
    }
    if (SHOW_DEV_TOOLS) {
      console.log('[AppNavigation] handleGoToProgress setting pendingNav to Progress');
    }
    setPendingNav({ kind: 'screen', screen: 'Progress' });
  }, [ensureMainAppVisible, user, skipAuthMode]);

  const handleGoToWaterLog = React.useCallback(async () => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({ kind: 'screen', screen: 'DailyWaterLog' });
  }, [ensureMainAppVisible]);

  const handleGoToEveningCheckIn = React.useCallback(async () => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({ kind: 'screen', screen: 'EveningCheckIn' });
  }, [ensureMainAppVisible]);

  const handleGoToDailyCheckIn = React.useCallback(async () => {
    // This flow is rendered conditionally in AppContent
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav(null);
    setDailyCheckInStatus('needs_checkin');
  }, [ensureMainAppVisible]);

  const handleGoToSubscription = React.useCallback(async (source?: string, contextScreen?: string) => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({
      kind: 'screen',
      screen: 'Paywall',
      params: { source: source ?? 'menu_subscription', contextScreen },
    });
  }, [ensureMainAppVisible]);

  const allowGuestMode = skipAuthMode || !!user;

  // Wait for onboarding status to be loaded
  if (introOnboardingCompleted === null) {
    return (
      <SplashScreen
        onFinish={() => {}}
        showContinueButton={false}
        onContinue={() => {}}
      />
    );
  }

  // Show splash screen during initial animation
  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          if (!introOnboardingCompleted && !user) {
            setShowIntroOnboarding(true);
          }
          setTimeout(() => setShowSplash(false), 50);
        }}
        showContinueButton={!loading && !user && introOnboardingCompleted}
        onContinue={() => setShowSplash(false)}
      />
    );
  }

  // Auth loading gate: Wait for userDoc to load when user exists
  if (loading || (user && !userDoc)) {
    return (
      <SplashScreen
        onFinish={() => {}}
        showContinueButton={false}
        onContinue={() => {}}
      />
    );
  }

  // Intro onboarding (pre-auth)
  if (showIntroOnboarding && !user) {
    return (
      <IntroOnboardingNavigator
        onComplete={async () => {
          await AsyncStorage.setItem(INTRO_ONBOARDING_KEY, 'true');
          setShowIntroOnboarding(false);
          setIntroOnboardingCompleted(true);
        }}
      />
    );
  }

  // Unauthenticated: show auth navigator (login) OR enable guest mode
  if (!user && !skipAuthMode) {
    return (
      <SkipAuthProvider
        onSkipAuth={async () => {
          setSkipAuthMode(true);
        }}
      >
        <AuthNavigator onAuthSuccess={() => {}} />
      </SkipAuthProvider>
    );
  }

  // Wait for onboarding context hydration
  if (!isHydrated) {
    return (
      <SplashScreen
        onFinish={() => {}}
        showContinueButton={false}
        onContinue={() => {}}
      />
    );
  }

  // Onboarding tunnel (no menu until completion) — use the new 3-screen flow
  if (!onboardingCompleted) {
    return (
      <AppNavigationProvider
        key="onboarding-nav"
        currentContext="onboarding"
        goToHome={handleGoToHome}
        goToToday={handleGoToToday}
        goToProgress={handleGoToProgress}
        goToDailyCheckIn={handleGoToDailyCheckIn}
        goToWaterLog={handleGoToWaterLog}
        goToEveningCheckIn={handleGoToEveningCheckIn}
        goToSubscription={handleGoToSubscription}
      >
        <FirstLoginOnboardingNavigator />
      </AppNavigationProvider>
    );
  }

  // Show loading while checking daily check-in status (authenticated only)
  if (user && (checkingDailyStatus || dailyCheckInStatus === 'loading')) {
    return (
      <SplashScreen
        onFinish={() => {}}
        showContinueButton={false}
        onContinue={() => {}}
      />
    );
  }

  // Authenticated + onboarding completed + needs daily check-in
  if (user && dailyCheckInStatus === 'needs_checkin') {
    return (
      <AppNavigationProvider
        currentContext="daily_checkin"
        goToHome={handleGoToHome}
        goToToday={handleGoToToday}
        goToProgress={handleGoToProgress}
        goToDailyCheckIn={handleGoToDailyCheckIn}
        goToWaterLog={handleGoToWaterLog}
        goToEveningCheckIn={handleGoToEveningCheckIn}
        goToSubscription={handleGoToSubscription}
      >
        <DailyCheckInNavigator
          userId={user.uid}
          onComplete={() => {
            setDailyCheckInStatus('completed');
          }}
        />
      </AppNavigationProvider>
    );
  }

  // Main app navigation (menu enabled)
  return (
    <AppNavigationProvider
      key="app-nav"
      currentContext="app"
      goToHome={handleGoToHome}
      goToToday={handleGoToToday}
      goToProgress={handleGoToProgress}
      goToDailyCheckIn={handleGoToDailyCheckIn}
      goToWaterLog={handleGoToWaterLog}
      goToEveningCheckIn={handleGoToEveningCheckIn}
      goToSubscription={handleGoToSubscription}
    >
      <AppNavigator allowGuestMode={allowGuestMode} />
    </AppNavigationProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    // Premium editorial fonts - loaded from local assets
    CormorantGaramond_300Light: require('./assets/fonts/CormorantGaramond_300Light.ttf'),
    CormorantGaramond_400Regular: require('./assets/fonts/CormorantGaramond_400Regular.ttf'),
    CormorantGaramond_600SemiBold: require('./assets/fonts/CormorantGaramond_600SemiBold.ttf'),
    CormorantGaramond_700Bold: require('./assets/fonts/CormorantGaramond_700Bold.ttf'),
    // Body fonts - loaded from local assets
    Inter_300Light: require('./assets/fonts/Inter_300Light.ttf'),
    Inter_400Regular: require('./assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium: require('./assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('./assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('./assets/fonts/Inter_700Bold.ttf'),
  });


  // Hide native splash once fonts are loaded
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreenNative.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#DFF4F1' }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <OnboardingCompletionProvider>
                <NavigationContainer ref={navigationRef}>
                  <AppContent />
                  <StatusBar style="dark" />
                </NavigationContainer>
                <AlertManager />
              </OnboardingCompletionProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
