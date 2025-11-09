import '@azure/core-asynciterator-polyfill';
import { RNEventSource } from 'rn-eventsource-reborn';
import { ReadableStream, TransformStream } from 'web-streams-polyfill';

globalThis.ReadableStream = globalThis.ReadableStream || ReadableStream;
globalThis.TransformStream = globalThis.TransformStream || TransformStream;

import { createTRPCReact } from '@trpc/react-query';
import {
  createTRPCClient,
  httpBatchLink,
  splitLink,
  httpSubscriptionLink,
} from '@trpc/client';
import type { AppRouter } from '../../backend/src/index';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

export const getBackendUrl = () => {
  if (!Constants.expoConfig?.extra?.backendUrl)
    throw new Error('Backend URL is not defined in expo config extra');
  console.log('Using backend URL:', Constants.expoConfig.extra.backendUrl);

  return Constants.expoConfig?.extra?.backendUrl;
};

export const trpc = createTRPCReact<AppRouter>();

// Vanilla client for use in non-React contexts
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({
        url: getBackendUrl(),
        EventSource: RNEventSource,
        eventSourceOptions: async () => {
          const token = await SecureStore.getItemAsync('sessionToken');
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
});
