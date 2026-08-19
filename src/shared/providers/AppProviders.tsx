import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../features/auth/components/AuthProvider';
import { ToastProvider } from './ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 1000 * 15, // 15 seconds fresh cache — changes in Shopify reflect promptly
      retry: 1,
    },
  },
});


export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};
