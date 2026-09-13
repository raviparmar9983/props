import axios from "axios";
import Cookies from "js-cookie";
import { parseApiError } from "./errorHandler";
import { toast } from "../toast";

export const API_BASE_URL: string = (() => {
  const raw = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
  if (!raw) return "/v1";
  return raw.endsWith("/v1") ? raw : `${raw}/v1`;
})();

function rejectWithToast(error: unknown) {
  const apiError = parseApiError(error);
  toast.error(apiError.message, apiError.code ?? "API error");
  return Promise.reject(apiError);
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

function getStoredRefreshToken(): string | null {
  return Cookies.get(REFRESH_TOKEN_KEY) ?? null;
}

function setTokens(access: string, refresh: string) {
  accessToken = access;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, access);
  Cookies.set(REFRESH_TOKEN_KEY, refresh, {
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "strict",
    expires: 7,
  });
}

function clearTokens() {
  accessToken = null;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
}

function loadStoredAccessToken(): string | null {
  if (accessToken) return accessToken;
  const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (stored) {
    accessToken = stored;
    return stored;
  }
  return null;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = loadStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh" &&
      originalRequest.url !== "/auth/logout"
    ) {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        return rejectWithToast(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => rejectWithToast(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        return rejectWithToast(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return rejectWithToast(error);
  },
);

export { setTokens, clearTokens, loadStoredAccessToken, getStoredRefreshToken };
export default apiClient;
