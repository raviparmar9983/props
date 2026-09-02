import { create } from "zustand";
import { setTokens, clearTokens, loadStoredAccessToken } from "../lib/api";

interface AuthState {
  token: string | null;
  setToken: (accessToken: string, refreshToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: loadStoredAccessToken(),
  setToken: (accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    set({ token: accessToken });
  },
  clear: () => {
    clearTokens();
    set({ token: null });
  },
}));
