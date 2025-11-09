import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { trpc } from '../../utils/trpc';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAppTranslation } from '@/contexts/I18nContext';

interface PasswordForm {
  password: string;
}

export default function PasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { login } = useAuthContext();
  const [loginError, setLoginError] = useState<string | null>(null);
  const { t } = useAppTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<PasswordForm>();

  const loginUserMutation = trpc.loginUser.useMutation({
    onSuccess: async (result) => {
      if (result.success && result.sessionToken) {
        try {
          await login(result.sessionToken);
        } catch (error) {
          console.error('Error storing session token:', error);
          Alert.alert(t('common.error'), t('auth.password.sessionSaveError'));
        }
      } else {
        Alert.alert(t('common.error'), t('auth.password.loginFailed'));
      }
    },
    onError: (error) => {
      const errorMessage = error?.message || t('auth.password.loginError');
      setLoginError(errorMessage);
      console.error('Login error:', error);
    },
  });

  const onSignIn = (data: PasswordForm) => {
    if (!email) {
      setLoginError(t('auth.password.emailRequired'));
      return;
    }

    // Clear any previous login errors
    setLoginError(null);
    clearErrors();

    loginUserMutation.mutate({
      email: email,
      password: data.password,
    });
  };

  const onBackToEmail = () => {
    router.back();
  };

  const requestPasswordResetMutation = trpc.requestPasswordReset.useMutation({
    onSuccess: () => {
      Alert.alert(
        t('auth.password.resetPasswordSuccess'),
        t('auth.password.resetPasswordSuccessMessage'),
        [{ text: t('common.ok') }]
      );
    },
    onError: (error) => {
      const errorMessage =
        error?.message || t('auth.password.resetPasswordError');
      Alert.alert(t('common.error'), errorMessage);
    },
  });

  const onForgotPassword = () => {
    if (!email) {
      Alert.alert(t('common.error'), t('auth.password.emailRequired'));
      return;
    }

    Alert.alert(
      t('auth.password.resetPasswordConfirmTitle'),
      t('auth.password.resetPasswordConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.password.resetPasswordSend'),
          onPress: () => {
            requestPasswordResetMutation.mutate({ email });
          },
        },
      ]
    );
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
            onPress={onBackToEmail}
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
        <Text style={styles.title}>{t('auth.password.title')}</Text>

        {/* Email Display */}
        <View style={styles.emailContainer}>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            rules={{
              required: t('auth.password.passwordRequired'),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={t('auth.password.enterPassword')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoComplete="current-password"
                autoFocus
                errorText={errors.password?.message || loginError || undefined}
                helpText={t('auth.password.passwordHelp')}
                containerStyle={styles.inputContainer}
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onSignIn)}
              />
            )}
          />

          {/* Sign In Button */}
          <Button
            title={
              loginUserMutation.isPending
                ? t('auth.password.signingIn')
                : t('auth.password.signIn')
            }
            variant="primary"
            onPress={handleSubmit(onSignIn)}
            style={[
              styles.signInButton,
              loginUserMutation.isPending && styles.signInButtonDisabled,
            ]}
            rounded={false}
            disabled={loginUserMutation.isPending}
          />

          {/* Forgot Password */}
          <Button
            title={t('auth.password.forgotPassword')}
            variant="ghost"
            onPress={onForgotPassword}
            style={styles.forgotButton}
            rounded={false}
          />
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
    marginBottom: 20,
  },
  emailContainer: {
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  signInButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  signInButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  forgotButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    alignSelf: 'center',
  },
});
