/**
 * Apple Sign-In Button Component - Premium Black Style
 * High-contrast primary action, bold visual weight
 */

import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithApple } from '../services/auth';

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const [isAvailable, setIsAvailable] = React.useState(false);

  React.useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setIsAvailable);
  }, []);

  const handlePress = async () => {
    try {
      await signInWithApple();
      onSuccess?.();
    } catch (error: any) {
      if (error.message !== 'Apple sign-in was cancelled') {
        onError?.(error);
      }
    }
  };

  // Only show on iOS
  if (Platform.OS !== 'ios' || !isAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={16}
        style={styles.button}
        onPress={handlePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    width: '100%',
    height: 56,
  },
});
