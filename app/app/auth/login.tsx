import React, { useState } from 'react';
import * as Sentry from '@sentry/react-native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
  Image,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { trpcClient } from '../../utils/trpc';
import { router } from 'expo-router';
import { useAppTranslation } from '@/contexts/I18nContext';
import { AppleSignInButton } from '@/components/AppleSignInButton';
import { useAuthContext } from '@/contexts/AuthContext';

interface LoginForm {
  email: string;
}

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const { t } = useAppTranslation();
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const onContinue = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await trpcClient.checkEmail.query({ email: data.email });

      if (result.exists) {
        // Email exists, navigate to password screen
        router.push(`/auth/password?email=${encodeURIComponent(data.email)}`);
      } else {
        // Email doesn't exist, navigate to signup
        router.push(`/auth/signup?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.login.emailCheckError'));
      console.error('Email check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onGooglePress = () => {
    console.log('Continue with Google');
    // TODO: Implement Google auth
  };

  const handleAppleSignIn = async (appleData: {
    identityToken: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    setIsAppleLoading(true);
    try {
      const result = await trpcClient.signInWithApple.mutate({
        identityToken: appleData.identityToken,
        email: appleData.email,
        firstName: appleData.firstName,
        lastName: appleData.lastName,
      });

      if (result.success && result.sessionToken) {
        await login(result.sessionToken);
        // Navigation will be handled by the auth context
      } else {
        Alert.alert(t('common.error'), t('auth.apple.signInFailed'));
      }
    } catch (error: any) {
      Sentry.captureException(error);
      console.error('Apple Sign-In error:', error);
      const errorMessage = error.message || t('auth.apple.signInFailed');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleAppleSignInError = (error: Error) => {
    Sentry.captureException(error);
    console.error('Apple Sign-In error:', error);
    Alert.alert(t('common.error'), error.message);
    setIsAppleLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('auth.login.title')}</Text>

        {/* Email Input */}
        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: t('auth.login.emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('auth.login.invalidEmail'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={t('auth.login.enterEmail')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                errorText={errors.email?.message}
                helpText={t('auth.login.emailCheckHelp')}
                containerStyle={styles.emailContainer}
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onContinue)}
              />
            )}
          />

          {/* Continue Button */}
          <Button
            title={
              isLoading ? t('auth.login.checking') : t('auth.login.continue')
            }
            variant="primary"
            onPress={handleSubmit(onContinue)}
            style={[
              styles.continueButton,
              isLoading && styles.continueButtonDisabled,
            ]}
            rounded={false}
            disabled={isLoading}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.login.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          {/* <Button */}
          {/*   title={t('auth.login.continueWithGoogle')} */}
          {/*   variant="social" */}
          {/*   onPress={onGooglePress} */}
          {/*   style={styles.socialButton} */}
          {/*   rounded={false} */}
          {/*   iconName="logo-google" */}
          {/* /> */}

          {Platform.OS === 'ios' && (
            <AppleSignInButton
              onSuccess={handleAppleSignIn}
              onError={handleAppleSignInError}
              style={[
                styles.socialButton,
                isAppleLoading && styles.socialButtonDisabled,
              ]}
            />
          )}
          {/* Privacy Policy Link */}
          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              {t('auth.login.byContinuing')}{' '}
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL('https://example.com/privacy-policy')
                }
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  {t('auth.login.privacyPolicy')}
                </Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  emailContainer: {
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  continueButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    color: '#999',
    fontSize: 16,
    marginHorizontal: 20,
  },
  socialButton: {
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  socialButtonDisabled: {
    opacity: 0.7,
  },
  legalContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
