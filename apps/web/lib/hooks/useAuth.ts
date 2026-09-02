import { useCallback, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  authApi,
  setTokens,
  clearTokens,
  loadStoredAccessToken,
} from "../api";
import type { AuthTokens } from "../../types/public";

interface AuthUser {
  id: string;
  email: string;
  role: string;
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

export function useAuth() {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      clearTokens();
      storeUser(null);
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [queryClient]);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => {
      const stored = getStoredUser();
      if (!stored || !loadStoredAccessToken()) return null;
      return stored;
    },
    staleTime: Infinity,
    retry: false,
    enabled: ready,
  });

  const requestOtpMutation = useMutation({
    mutationFn: (email: string) => authApi.requestOtp(email),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyOtp(email, otp),
    onSuccess: (data) => {
      handleAuthTokens(data);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearTokens();
      storeUser(null);
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  const requestOtp = useCallback(
    async (email: string) => {
      return requestOtpMutation.mutateAsync(email);
    },
    [requestOtpMutation],
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      return verifyOtpMutation.mutateAsync({ email, otp });
    },
    [verifyOtpMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading: isLoadingUser || !ready,
    requestOtp,
    verifyOtp,
    logout,
    requestOtpError: requestOtpMutation.error,
    verifyOtpError: verifyOtpMutation.error,
    isRequestingOtp: requestOtpMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
  };
}
