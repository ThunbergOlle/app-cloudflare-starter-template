import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { router, useSegments } from 'expo-router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const [authGuardLoading, setAuthGuardLoading] = useState(true);
  const segments = useSegments();

  const isLoading = authLoading || onboardingLoading || authGuardLoading;

  useEffect(() => {
    if (onboardingLoading || authLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';

    // If user hasn't seen onboarding and not already viewing it
    if (!hasSeenOnboarding && !inOnboardingGroup) {
      router.replace('/onboarding');
      setAuthGuardLoading(false);
      return;
    }

    // If user has seen onboarding but is not authenticated
    if (hasSeenOnboarding && !isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
      setAuthGuardLoading(false);
      return;
    }

    // If user is authenticated but in auth flow, redirect to main app
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
      setAuthGuardLoading(false);
      return;
    }

    setAuthGuardLoading(false);
  }, [
    isAuthenticated,
    hasSeenOnboarding,
    onboardingLoading,
    authLoading,
    segments,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
