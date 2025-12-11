
/**
 * Auth Navigator - Hangover Shield
 * Handles authentication flow routing with Google and Apple sign-in
 */

import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { showAlert } from '../utils/alert';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { signInWithGoogleCredential, signInWithApple } from '../services/auth';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  onAuthSuccess: () => void;
}

// Login screen component that handles auth
const LoginScreenContainer: React.FC<{
  onAuthSuccess: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  promptAsync: () => void;
}> = ({ onAuthSuccess, loading, setLoading, promptAsync }) => {
  
  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithApple();
      onAuthSuccess();
    } catch (error: any) {
      setLoading(false);
      if (error.message !== 'Apple sign-in was cancelled') {
        const errorMessage = error.message || 'Failed to sign in with Apple. Please try again.';
        showAlert('Sign In Error', errorMessage, 'error');
      }
    }
  };

  return (
    <LoginScreen
      onGoogleSignIn={promptAsync}
      onAppleSignIn={handleAppleSignIn}
      loading={loading}
    />
  );
};

export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const extra = Constants.expoConfig?.extra || {};

  // Google Auth Request hook
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: extra.googleIosClientId,
    androidClientId: extra.googleAndroidClientId,
    webClientId: extra.googleWebClientId,
  });

  // Handle Google Sign-In response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { idToken } = response.params;
      if (idToken) {
        handleGoogleSignIn(idToken);
      }
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setLoading(true);
      await signInWithGoogleCredential(idToken);
      onAuthSuccess();
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.message || 'Failed to sign in with Google. Please try again.';
      showAlert('Sign In Error', errorMessage, 'error');
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login">
        {() => (
          <LoginScreenContainer
            onAuthSuccess={onAuthSuccess}
            loading={loading}
            setLoading={setLoading}
            promptAsync={() => promptAsync()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
