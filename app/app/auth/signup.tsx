import React from 'react';
import * as Sentry from '@sentry/react-native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  TextInput as RNTextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { trpc } from '../../utils/trpc';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAppTranslation } from '@/contexts/I18nContext';

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { login } = useAuthContext();
  const { t } = useAppTranslation();
  const [signupError, setSignupError] = React.useState<string | null>(null);
  const passwordRef = React.useRef<RNTextInput>(null);
  const confirmPasswordRef = React.useRef<RNTextInput>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
  } = useForm<SignupForm>({
    defaultValues: {
      email: emailParam || '',
    },
  });
  const password = watch('password');

  const registerUserMutation = trpc.registerUser.useMutation({
    onSuccess: async (result) => {
      if (result.success && result.sessionToken) {
        try {
          await login(result.sessionToken);
        } catch (error) {
          console.error('Error storing session token:', error);
          setSignupError(t('auth.signup.sessionSaveError'));
        }
      } else {
        setSignupError(t('auth.signup.accountCreatedNoSession'));
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.message || t('auth.signup.createAccountError');
      setSignupError(errorMessage);
      console.error('Signup error:', error);
    },
  });

  const onSignup = async (data: SignupForm) => {
    // Clear any previous signup errors
    setSignupError(null);
    clearErrors();

    try {
      const { user } = await registerUserMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      Sentry.getGlobalScope().setUser({
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Signup error caught in onSignup:', error);
    }
  };

  const onBackToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Button
            title={t('common.back')}
            variant="ghost"
            onPress={onBackToLogin}
            style={styles.backButton}
            rounded={false}
          />
        </View>

        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('auth.signup.title')}</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            rules={{
              required: t('auth.signup.emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('auth.signup.invalidEmail'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={t('auth.signup.enterEmail')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                errorText={errors.email?.message}
                containerStyle={styles.inputContainer}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            rules={{
              required: t('auth.signup.passwordRequired'),
              minLength: {
                value: 8,
                message: t('auth.signup.passwordMinLength'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={passwordRef}
                placeholder={t('auth.signup.createPassword')}
                value={value}
                autoFocus
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoComplete="new-password"
                errorText={errors.password?.message || signupError || undefined}
                helpText={t('auth.signup.passwordHelp')}
                containerStyle={styles.inputContainer}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
            )}
          />

          {/* Confirm Password Input */}
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: t('auth.signup.passwordConfirmRequired'),
              validate: (value) =>
                value === password || t('auth.signup.passwordsNoMatch'),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={confirmPasswordRef}
                placeholder={t('auth.signup.confirmPassword')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoComplete="new-password"
                errorText={errors.confirmPassword?.message}
                helpText={t('auth.signup.confirmPasswordHelp')}
                containerStyle={styles.inputContainer}
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onSignup)}
              />
            )}
          />

          {/* Create Account Button */}
          <Button
            title={
              registerUserMutation.isPending
                ? t('auth.signup.creatingAccount')
                : t('auth.signup.createAccount')
            }
            variant="primary"
            onPress={handleSubmit(onSignup)}
            style={[
              styles.signupButton,
              registerUserMutation.isPending && styles.signupButtonDisabled,
            ]}
            rounded={false}
            disabled={registerUserMutation.isPending}
          />

          {/* Terms */}
          <Text style={styles.termsText}>{t('auth.signup.terms')}</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
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
  inputContainer: {
    marginBottom: 16,
  },
  signupButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  signupButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
