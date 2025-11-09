import '@azure/core-asynciterator-polyfill';
import { RNEventSource } from 'rn-eventsource-reborn';
import { ReadableStream, TransformStream } from 'web-streams-polyfill';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { trpc } from './trpc';

globalThis.ReadableStream = globalThis.ReadableStream || ReadableStream;
globalThis.TransformStream = globalThis.TransformStream || TransformStream;

const getBackendUrl = () => {
  return (
    Constants.expoConfig?.extra?.backendUrl || 'http://localhost:8787/trpc'
  );
};

// Global error handler for 401/unauthorized errors
const handleGlobalError = async (error: any) => {
  const isAuthError =
    error?.data?.code === 'UNAUTHORIZED' ||
    error?.message?.includes('UNAUTHORIZED') ||
    error?.message?.includes('401');

  if (isAuthError) {
    console.log('Global TRPC error: Unauthorized, logging out user');
    // Remove the stored token
    await SecureStore.deleteItemAsync('sessionToken');
    // Redirect to login (if not already there)
    if (router.canGoBack()) {
      router.replace('/auth/login');
    }
  }
};

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleGlobalError,
        }),
        mutationCache: new MutationCache({
          onError: handleGlobalError,
        }),
        defaultOptions: {
          queries: {
            retry: 1, // Limit query retries to 1
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 5000),
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: getBackendUrl(),
            EventSource: RNEventSource,
            eventSourceOptions: async () => {
              const token = await SecureStore.getItemAsync('sessionToken');
              const config = {
                url: getBackendUrl(),
                hasToken: !!token,
                tokenLength: token?.length || 0,
              };
              console.log('🔥 SSE CONNECTION CONFIG:', config);
              return {
                headers: {
                  Authorization: token ? `Bearer ${token}` : '',
                },
              };
            },
          }),
          false: httpBatchLink({
            url: getBackendUrl(),
            headers: async () => {
              const token = await SecureStore.getItemAsync('sessionToken');
              return {
                authorization: token ? `Bearer ${token}` : '',
              };
            },
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
