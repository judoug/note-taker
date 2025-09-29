'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Create a performance-optimized query client
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Performance: Cache data for 10 minutes to reduce API calls
        staleTime: 10 * 60 * 1000, // 10 minutes
        // Keep data in cache for 30 minutes even when not in use
        gcTime: 30 * 60 * 1000, // 30 minutes (replaces cacheTime in v5)
        // Retry configuration for better reliability
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors (client errors)
          const apiError = error as { status?: number };
          if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        // Use exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Performance: Don't refetch on window focus for better performance
        refetchOnWindowFocus: false,
        // Reliability: Refetch on reconnect to ensure data freshness
        refetchOnReconnect: true,
        // Performance: Only refetch if data is stale
        refetchOnMount: 'always',
        // Network: Disable refetch interval by default
        refetchInterval: false,
      },
      mutations: {
        // Don't retry mutations by default to prevent duplicate operations
        retry: false,
        // Keep failed mutations in cache for debugging
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
