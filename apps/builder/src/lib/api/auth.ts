import apiClient from "./client";
import type { AuthTokens } from "./schemas";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  companyName: string;
  cityId: string;
}

export interface RequestOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export const authApi = {
  registerBuilder: (data: RegisterPayload) =>
    apiClient
      .post<{
        userId: string;
        builderId: string;
        verificationStatus: string;
        message: string;
      }>("/auth/builder/register", data)
      .then((r) => r.data),

  loginBuilder: (data: LoginPayload) =>
    apiClient.post<AuthTokens>("/auth/builder/login", data).then((r) => r.data),

  requestOtp: (data: RequestOtpPayload) =>
    apiClient
      .post<{ message: string; expiresInSeconds: number }>(
        "/auth/customer/otp/request",
        data,
      )
      .then((r) => r.data),

  verifyOtp: (data: VerifyOtpPayload) =>
    apiClient
      .post<AuthTokens>("/auth/customer/otp/verify", data)
      .then((r) => r.data),

  forgotPassword: (data: ForgotPasswordPayload) =>
    apiClient
      .post<{ message: string; expiresInSeconds: number }>(
        "/auth/builder/forgot-password",
        data,
      )
      .then((r) => r.data),

  resetPassword: (data: ResetPasswordPayload) =>
    apiClient
      .post<{ message: string }>("/auth/builder/reset-password", data)
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
