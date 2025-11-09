import React from 'react';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppContextProvider } from '@/contexts/AppContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import { AuthGuard } from '../components/AuthGuard';
import { Button } from '../components/Button';
import { AuthProvider } from '../contexts/AuthContext';
import { I18nProvider, useAppTranslation } from '../contexts/I18nContext';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { PermissionsOnboardingProvider } from '../contexts/PermissionsOnboardingContext';
import { TrpcProvider } from '../utils/trpcProvider';

Sentry.init({
  dsn: '',
  enabled: !__DEV__, // Disable Sentry in development

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  // enableLogs: false,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

Sentry.getGlobalScope().setTag('expo-update-id', Updates.updateId || 'none');

// Configure Reanimated logger to disable strict mode
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Custom Back Button Component
const CustomBackButton = ({ onPress }: { onPress?: () => void }) => {
  const { t } = useAppTranslation();
  return (
    <Button
      title={t('common.back')}
      variant="ghost"
      onPress={onPress || (() => router.back())}
      style={styles.backButton}
      rounded={false}
    />
  );
};

// Navigation component that has access to translations
function AppNavigator() {
  const { t } = useAppTranslation();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton />,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="terms-of-service"
        options={{
          title: t('profile.termsOfService'),
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton />,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default Sentry.wrap(function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <AppContextProvider>
          <TrpcProvider>
            <OnboardingProvider>
              <PermissionsOnboardingProvider>
                <AuthProvider>
                  <ThemeProvider value={DefaultTheme}>
                    <GestureHandlerRootView>
                      <BottomSheetModalProvider>
                        <AuthGuard>
                          <AppNavigator />
                        </AuthGuard>
                      </BottomSheetModalProvider>
                    </GestureHandlerRootView>
                    <StatusBar style="auto" />
                  </ThemeProvider>
                </AuthProvider>
              </PermissionsOnboardingProvider>
            </OnboardingProvider>
          </TrpcProvider>
        </AppContextProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
});
