import apiClient from "./client";
import type { AuthTokens } from "../../types/public";

export interface RequestOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export const authApi = {
  requestOtp: (email: string) =>
    apiClient
      .post<{ message: string; expiresInSeconds: number; resendInSeconds: number }>(
        "/auth/customer/otp/request",
        { email },
      )
      .then((r) => r.data),

  verifyOtp: (email: string, otp: string) =>
    apiClient
      .post<AuthTokens>("/auth/customer/otp/verify", { email, otp })
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
