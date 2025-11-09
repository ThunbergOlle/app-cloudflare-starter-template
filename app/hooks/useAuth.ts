import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Sentry from '@sentry/react-native';
import { trpcClient } from '../utils/trpc';

const SESSION_TOKEN_KEY = 'sessionToken';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    sessionToken: null,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);

      if (!token) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          sessionToken: null,
        });
        return;
      }

      try {
        const { user } = await trpcClient.getCurrentUser.query();

        Sentry.getGlobalScope().setUser({
          id: user.id,
          email: user.email,
        });

        // Token is valid
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          sessionToken: token,
        });
      } catch (validationError: any) {
        // Only logout if it's an authentication error (401/UNAUTHORIZED)
        const isAuthError =
          validationError?.data?.code === 'UNAUTHORIZED' ||
          validationError?.message?.includes('UNAUTHORIZED') ||
          validationError?.message?.includes('401');

        if (isAuthError) {
          console.log(
            'Authentication failed, removing stored token:',
            validationError
          );
          await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            sessionToken: null,
          });
        } else {
          // For other errors (network, server errors), keep user logged in
          console.log(
            'Token validation failed with non-auth error, keeping user logged in:',
            validationError
          );
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            sessionToken: token,
          });
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // On any storage error, assume not authenticated
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        sessionToken: null,
      });
    }
  };

  const login = async (token: string) => {
    try {
      await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        sessionToken: token,
      });

      const { user } = await trpcClient.getCurrentUser.query();

      Sentry.getGlobalScope().setUser({
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error('Error storing session token:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        sessionToken: null,
      });
    } catch (error) {
      console.error('Error removing session token:', error);
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthState,
  };
}
