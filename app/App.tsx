import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreenNative from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SkipAuthProvider } from './src/contexts/SkipAuthContext';
import { AppNavigationProvider } from './src/contexts/AppNavigationContext';

// Keep splash screen visible until fonts are loaded
SplashScreenNative.preventAutoHideAsync();

import { ThemeProvider } from './src/hooks/useTheme';
import { AuthProvider, useAuth } from './src/providers/AuthProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { IntroOnboardingNavigator } from './src/navigation/IntroOnboardingNavigator';
import { DailyCheckInNavigator } from './src/navigation/DailyCheckInNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { AlertManager } from './src/utils/alert';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { getTodayDailyCheckIn } from './src/services/dailyCheckIn';
import { getTodayId } from './src/utils/dateUtils';
import { initializeRevenueCat, identifyUser, logOutRevenueCat } from './src/services/revenuecat';
import Constants from 'expo-constants';

// Debug: Verify RevenueCat exports are available
console.log('RC exports check:', {
  initializeRevenueCat: typeof initializeRevenueCat,
  identifyUser: typeof identifyUser,
  logOutRevenueCat: typeof logOutRevenueCat,
});

// Async storage keys for onboarding state
const INTRO_ONBOARDING_KEY = '@hangovershield_intro_onboarding_completed'; // NEW pre-auth intro
const FEELING_ONBOARDING_KEY = '@hangovershield_feeling_onboarding_completed'; // Daily check-in flow

// Global navigation ref so app-wide actions can navigate across conditional navigators
export const navigationRef = createNavigationContainerRef<any>();

function AppContent() {
  const { user, userDoc, loading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);
  // NEW: Intro onboarding (pre-auth, explains app value)
  const [showIntroOnboarding, setShowIntroOnboarding] = React.useState(false);
  const [introOnboardingCompleted, setIntroOnboardingCompleted] = React.useState<boolean | null>(null);
  // Existing: Daily check-in flow (post-auth)
  const [feelingOnboardingCompleted, setFeelingOnboardingCompleted] = React.useState(false);
  // Temporary: Skip auth mode for testing
  const [skipAuthMode, setSkipAuthMode] = React.useState(false);
  // Daily check-in status for returning users
  const [dailyCheckInStatus, setDailyCheckInStatus] = React.useState<'loading' | 'needs_checkin' | 'completed'>('loading');
  const [checkingDailyStatus, setCheckingDailyStatus] = React.useState(false);
  const [pendingNav, setPendingNav] = React.useState<
    | null
    | { kind: 'tab'; tab: 'Home' | 'SmartPlan' | 'Tools' | 'Progress' | 'Settings' }
    | { kind: 'homeStack'; screen: 'CheckIn' | 'DailyWaterLog' | 'EveningCheckIn' | 'Paywall'; params?: any }
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

  // Check if onboarding has been completed
  React.useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const introCompleted = await AsyncStorage.getItem(INTRO_ONBOARDING_KEY);
        const feelingCompleted = await AsyncStorage.getItem(FEELING_ONBOARDING_KEY);
        
        setIntroOnboardingCompleted(introCompleted === 'true');
        setFeelingOnboardingCompleted(feelingCompleted === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIntroOnboardingCompleted(false);
        setFeelingOnboardingCompleted(false);
      }
    };
    checkOnboarding();
  }, []);

  // Check daily check-in status for authenticated users who completed onboarding
  React.useEffect(() => {
    const checkDailyStatus = async () => {
      if (!user || !feelingOnboardingCompleted) {
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
  }, [user, feelingOnboardingCompleted]);

  const ensureMainAppVisible = React.useCallback(async () => {
    // Only proceed if user is authenticated
    if (!user) {
      console.warn('[AppNavigation] User not authenticated, cannot navigate');
      return false;
    }

    // Mark onboarding as completed if in onboarding flow
    // Save to AsyncStorage FIRST, then update state synchronously
    if (!feelingOnboardingCompleted) {
      try {
        await AsyncStorage.setItem(FEELING_ONBOARDING_KEY, 'true');
        setFeelingOnboardingCompleted(true);
      } catch (error) {
        console.error('Error saving onboarding completion:', error);
        // Still set state even if AsyncStorage fails
        setFeelingOnboardingCompleted(true);
      }
    }
    
    // Ensure we are not stuck behind the daily check-in gate when user explicitly navigates.
    setCheckingDailyStatus(false);
    setDailyCheckInStatus('completed');
    return true;
  }, [user, feelingOnboardingCompleted]);

  // Flush pending navigation once the correct navigator tree is mounted
  React.useEffect(() => {
    if (!pendingNav) return;
    if (!navigationRef.isReady()) return;

    const rootState = navigationRef.getRootState();
    const routeNames = rootState?.routeNames ?? [];

    // Wait until the target routes exist in the current navigation tree
    if (pendingNav.kind === 'tab') {
      if (!routeNames.includes(pendingNav.tab)) return;
      navigationRef.navigate(pendingNav.tab);
      setPendingNav(null);
      return;
    }

    // Home stack destinations require the Tab navigator to be mounted
    if (pendingNav.kind === 'homeStack') {
      if (!routeNames.includes('Home')) return;
      navigationRef.navigate('Home', {
        screen: pendingNav.screen,
        params: pendingNav.params,
      });
      setPendingNav(null);
      return;
    }
  }, [pendingNav]);

  // Navigation handlers for global menu (works from onboarding/daily_checkin/app)
  const handleGoToHome = React.useCallback(async () => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({ kind: 'tab', tab: 'Home' });
  }, [ensureMainAppVisible]);

  const handleGoToToday = React.useCallback(async () => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({ kind: 'tab', tab: 'SmartPlan' });
  }, [ensureMainAppVisible]);

  const handleGoToProgress = React.useCallback(async () => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({ kind: 'tab', tab: 'Progress' });
  }, [ensureMainAppVisible]);

  const handleGoToWaterLog = React.useCallback(async () => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({ kind: 'homeStack', screen: 'DailyWaterLog' });
  }, [ensureMainAppVisible]);

  const handleGoToEveningCheckIn = React.useCallback(async () => {
    const ok = await ensureMainAppVisible();
    if (!ok) return;
    setPendingNav({ kind: 'homeStack', screen: 'EveningCheckIn' });
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
      kind: 'homeStack',
      screen: 'Paywall',
      params: { source: source ?? 'menu_subscription', contextScreen },
    });
  }, [ensureMainAppVisible]);

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
          // Set intro onboarding BEFORE hiding splash to avoid flash
          if (!introOnboardingCompleted && !user) {
            setShowIntroOnboarding(true);
          }
          // Small delay to ensure state update propagates
          setTimeout(() => setShowSplash(false), 50);
        }}
        showContinueButton={!loading && !user && introOnboardingCompleted}
        onContinue={() => {
          setShowSplash(false);
        }}
      />
    );
  }

  // Auth loading gate: Wait for userDoc to load when user exists
  // This prevents UI flicker and ensures useAccessStatus has correct data
  if (loading || (user && !userDoc)) {
    return (
      <SplashScreen
        onFinish={() => {}}
        showContinueButton={false}
        onContinue={() => {}}
      />
    );
  }

  // Show NEW intro onboarding (pre-auth, 3 screens + notifications)
  // This condition runs AFTER showSplash is false
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

  // Temporary: Skip auth mode for testing
  // When skipAuthMode is true, bypass user check and go directly to onboarding/app
  if (skipAuthMode) {
    const hasCompletedFeelingOnboarding = feelingOnboardingCompleted;
    if (!hasCompletedFeelingOnboarding) {
      return (
        <AppNavigationProvider
          currentContext="onboarding"
          goToHome={handleGoToHome}
          goToToday={handleGoToToday}
          goToProgress={handleGoToProgress}
          goToDailyCheckIn={handleGoToDailyCheckIn}
          goToWaterLog={handleGoToWaterLog}
          goToEveningCheckIn={handleGoToEveningCheckIn}
          goToSubscription={handleGoToSubscription}
        >
          <OnboardingNavigator />
        </AppNavigationProvider>
      );
    }
    return (
      <AppNavigationProvider
        currentContext="app"
        goToHome={handleGoToHome}
        goToToday={handleGoToToday}
        goToProgress={handleGoToProgress}
        goToDailyCheckIn={handleGoToDailyCheckIn}
        goToWaterLog={handleGoToWaterLog}
        goToEveningCheckIn={handleGoToEveningCheckIn}
        goToSubscription={handleGoToSubscription}
      >
        <AppNavigator />
      </AppNavigationProvider>
    );
  }

  // Unauthenticated: show auth navigator (login)
  if (!user) {
    return (
      <SkipAuthProvider onSkipAuth={async () => {
        // Reset the feeling onboarding flag so the user goes to OnboardingNavigator
        try {
          await AsyncStorage.removeItem(FEELING_ONBOARDING_KEY);
          setFeelingOnboardingCompleted(false);
        } catch (error) {
          console.error('Error resetting feeling onboarding:', error);
        }
        setSkipAuthMode(true);
      }}>
        <AuthNavigator
          onAuthSuccess={() => {
            // User is now authenticated, component will re-render automatically
          }}
        />
      </SkipAuthProvider>
    );
  }

  // Authenticated: check if feeling onboarding is completed
  // TODO: In the future, read hasCompletedFeelingOnboarding from Firestore user document
  // For now, use AsyncStorage flag
  // Note: This flag is set to false by default, so new users will see onboarding after login
  const hasCompletedFeelingOnboarding = feelingOnboardingCompleted;

  // Show feeling onboarding if user hasn't completed it yet
  if (!hasCompletedFeelingOnboarding) {
    return (
      <AppNavigationProvider
        currentContext="onboarding"
        goToHome={handleGoToHome}
        goToToday={handleGoToToday}
        goToProgress={handleGoToProgress}
        goToDailyCheckIn={handleGoToDailyCheckIn}
        goToWaterLog={handleGoToWaterLog}
        goToEveningCheckIn={handleGoToEveningCheckIn}
        goToSubscription={handleGoToSubscription}
      >
        <OnboardingNavigator />
      </AppNavigationProvider>
    );
  }

  // Show loading while checking daily check-in status
  if (checkingDailyStatus || dailyCheckInStatus === 'loading') {
    return (
      <SplashScreen
        onFinish={() => {}}
        showContinueButton={false}
        onContinue={() => {}}
      />
    );
  }

  // Authenticated + onboarding completed + needs daily check-in
  if (dailyCheckInStatus === 'needs_checkin') {
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

  // Authenticated and onboarding completed and daily check-in done: show main app
  return (
    <AppNavigationProvider
      currentContext="app"
      goToHome={handleGoToHome}
      goToToday={handleGoToToday}
      goToProgress={handleGoToProgress}
      goToDailyCheckIn={handleGoToDailyCheckIn}
      goToWaterLog={handleGoToWaterLog}
      goToEveningCheckIn={handleGoToEveningCheckIn}
      goToSubscription={handleGoToSubscription}
    >
      <AppNavigator />
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
              <NavigationContainer ref={navigationRef}>
                <AppContent />
                <StatusBar style="dark" />
              </NavigationContainer>
              <AlertManager />
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
