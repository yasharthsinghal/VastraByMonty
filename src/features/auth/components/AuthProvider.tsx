import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '../types/auth.types';
import { authService, shopifyAuthService } from '../services/auth.service';
import { shopifyCustomerService } from '../../../services/adapters/shopify/shopifyCustomerService';
import { env } from '../../../config/env';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const restoreSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (env.apiProvider === 'shopify') {
        const token = shopifyAuthService.getStoredToken();
        if (token) {
          const user = await shopifyCustomerService.getCustomer(token);
          setState({ user, isAuthenticated: true, isLoading: false, token });
          return;
        }
      } else {
        const user = authService.getCurrentUser();
        if (user) {
          setState({ user, isAuthenticated: true, isLoading: false });
          return;
        }
      }
    } catch {
      // Token invalid/expired — fall through to unauthenticated state
    }
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (email: string, password: string, rememberMe?: boolean) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const user = await authService.login(email, password, rememberMe);
        const token =
          env.apiProvider === 'shopify'
            ? (shopifyAuthService.getStoredToken() ?? undefined)
            : undefined;
        setState({ user, isAuthenticated: true, isLoading: false, token });
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw err;
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const user = await authService.register(email, password, firstName, lastName);
        const token =
          env.apiProvider === 'shopify'
            ? (shopifyAuthService.getStoredToken() ?? undefined)
            : undefined;
        setState({ user, isAuthenticated: true, isLoading: false, token });
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw err;
      }
    },
    []
  );

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (env.apiProvider !== 'shopify') return;
    const token = shopifyAuthService.getStoredToken();
    if (!token) return;
    try {
      const user = await shopifyCustomerService.getCustomer(token);
      setState((prev) => ({ ...prev, user }));
    } catch {
      // Silently fail — token may have just expired
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, forgotPassword, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
