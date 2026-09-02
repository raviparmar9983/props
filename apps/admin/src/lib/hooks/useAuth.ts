import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  setTokens,
  clearTokens,
  loadStoredAccessToken,
} from "../api";
import type { AuthTokens, AdminUser } from "../api";

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

const AUTH_USER_KEY = "auth_user";

function getStoredUser(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AdminUser | null) {
  if (user) {
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(AUTH_USER_KEY);
  }
}

function handleAuthTokens(data: AuthTokens) {
  setTokens(data.accessToken, data.refreshToken);
  storeUser(data.user);
}

export function useAuth(): AuthState {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => {
      const stored = getStoredUser();
      if (!stored || !loadStoredAccessToken()) return null;
      return stored;
    },
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.loginAdmin(data.email, data.password),
    onSuccess: (data) => {
      handleAuthTokens(data);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });

  const clearSession = useCallback(() => {
    clearTokens();
    storeUser(null);
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
  }, [queryClient]);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    clearSession,
  };
}
