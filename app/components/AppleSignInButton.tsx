import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { Platform, StyleSheet, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppTranslation } from '@/contexts/I18nContext';

interface AppleSignInButtonProps {
  onSuccess: (result: {
    identityToken: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => void;
  onError?: (error: Error) => void;
  style?: any;
}

export function AppleSignInButton({
  onSuccess,
  onError,
  style,
}: AppleSignInButtonProps) {
  const { t } = useAppTranslation();
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        setIsAvailable(available);
      } catch (error) {
        console.error(
          'Error checking Apple Authentication availability:',
          error
        );
        setIsAvailable(false);
      }
    };

    if (Platform.OS === 'ios') {
      checkAvailability();
    }
  }, []);

  if (Platform.OS !== 'ios' || !isAvailable) {
    return null;
  }

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Validate that we received an identity token
      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Extract the data we need
      const result = {
        identityToken: credential.identityToken,
        email: credential.email || undefined,
        firstName: credential.fullName?.givenName || undefined,
        lastName: credential.fullName?.familyName || undefined,
      };

      onSuccess(result);
    } catch (error: any) {
      Sentry.captureException(error);
      // Handle different types of Apple authentication errors
      if (error.code === 'ERR_CANCELED') {
        // User canceled - don't show error
        return;
      }

      const errorMessage =
        error.code === 'ERR_INVALID_RESPONSE'
          ? t('auth.apple.invalidResponse')
          : t('auth.apple.signInFailed');

      if (onError) {
        onError(error);
      } else {
        Alert.alert(t('common.error'), errorMessage);
      }
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={[styles.button, style]}
      onPress={handleAppleSignIn}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
  },
});
