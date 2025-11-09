import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../backend/src/index";

/**
 * Creates a tRPC client that communicates with the backend via service binding
 * @param apiService - The API_SERVICE binding from environment
 */
export function createApiClient(apiService: Fetcher) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://api/trpc",
        // Use the service binding's fetch method
        fetch: (url, options) => {
          return apiService.fetch(url, options);
        },
      }),
    ],
  });
}
