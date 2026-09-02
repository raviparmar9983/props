import apiClient from "./client";
import type { AuthTokens } from "./schemas";

export const authApi = {
  loginAdmin: (email: string, password: string) =>
    apiClient
      .post<AuthTokens>("/auth/admin/login", { email, password })
      .then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient
      .post<{ accessToken: string; refreshToken: string }>(
        "/auth/refresh",
        { refreshToken },
      )
      .then((r) => r.data),

  logout: () => apiClient.post("/auth/logout").then((r) => r.data),
};
