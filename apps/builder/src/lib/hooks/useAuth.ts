import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  authApi,
  setTokens,
  clearTokens,
  loadStoredAccessToken,
} from "../api";
import { getStoredRefreshToken } from "../api/client";
import type {
  AuthTokens,
  BuilderVerificationStatus,
  LoginResult,
} from "../api";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  companyName?: string;
  verificationStatus?: BuilderVerificationStatus | undefined;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  completeAuth: (data: AuthTokens) => void;
  register: (data: {
    email: string;
    password: string;
    companyName: string;
    cityId: string;
    phone?: string;
  }) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  clearSession: () => void;
  refreshAuth: () => Promise<void>;
}

const AUTH_USER_KEY = "auth_user";

function getStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser | null) {
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

async function silentRefresh(): Promise<AuthTokens | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthTokens>(
      `${import.meta.env.VITE_API_URL ?? "/v1"}/auth/refresh`,
      { refreshToken },
    );
    setTokens(data.accessToken, data.refreshToken);
    return data;
  } catch {
    clearTokens();
    return null;
  }
}

async function fetchProfileUser(): Promise<AuthUser | null> {
  try {
    const profile = await import("../api").then((m) =>
      m.builderProfileApi.getProfile(),
    );
    const user: AuthUser = {
      id: profile.userId,
      email: "",
      role: "BUILDER",
      ...(profile.companyName ? { companyName: profile.companyName } : {}),
    };
    if (profile.verificationStatus) {
      user.verificationStatus = profile.verificationStatus;
    }
    return user;
  } catch {
    return null;
  }
}

export function useAuth(): AuthState {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const stored = getStoredUser();
      const hasAccessToken = !!loadStoredAccessToken();
      const hasRefreshToken = !!getStoredRefreshToken();

      if (!stored && !hasRefreshToken) return null;

      try {
        if (stored && hasAccessToken) {
          const profile = await import("../api").then((m) =>
            m.builderProfileApi.getProfile(),
          );
          const fresh: AuthUser = {
            id: stored.id,
            email: stored.email,
            role: stored.role,
            ...(profile.companyName
              ? { companyName: profile.companyName }
              : {}),
            ...(profile.verificationStatus
              ? { verificationStatus: profile.verificationStatus }
              : {}),
          };
          storeUser(fresh);
          return fresh;
        }

        // Access token missing (e.g. sessionStorage cleared on browser restart)
        // but a refresh cookie exists: silently refresh to recover the session.
        const tokens = await silentRefresh();
        if (!tokens) return null;

        const profile = await fetchProfileUser();
        if (!profile) return null;

        const recovered: AuthUser = {
          id: tokens.user.id,
          email: tokens.user.email,
          role: tokens.user.role,
          ...(profile.companyName ? { companyName: profile.companyName } : {}),
          ...(profile.verificationStatus
            ? { verificationStatus: profile.verificationStatus }
            : {}),
        };
        storeUser(recovered);
        return recovered;
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const clearSession = useCallback(() => {
    clearTokens();
    storeUser(null);
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
  }, [queryClient]);

  const completeAuth = useCallback(
    (data: AuthTokens) => {
      handleAuthTokens(data);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
    [queryClient],
  );

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.loginBuilder(data),
    onSuccess: (data) => {
      // Login is only "complete" when tokens are issued. An unverified email
      // returns a requiresEmailVerification payload instead — the caller is
      // responsible for sending the user to the OTP verification page.
      if ("accessToken" in data) {
        completeAuth(data);
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.registerBuilder,
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      return loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      companyName: string;
      cityId: string;
      phone?: string;
    }) => {
      return registerMutation.mutateAsync(data);
    },
    [registerMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refreshAuth = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }, [queryClient]);

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    completeAuth,
    register,
    logout,
    clearSession,
    refreshAuth,
  };
}
