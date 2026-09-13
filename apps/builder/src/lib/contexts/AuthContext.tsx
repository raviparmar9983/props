import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";
import type { AuthTokens, BuilderVerificationStatus, LoginResult } from "../api";

interface AuthContextValue {
  user: {
    id: string;
    email: string;
    role: string;
    companyName?: string;
    verificationStatus?: BuilderVerificationStatus | undefined;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  completeAuth: (data: AuthTokens) => void;
  register: (data: {
    email: string;
    password: string;
    companyName: string;
    cityId: string;
  }) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  clearSession: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const authRef = useRef(auth);
  authRef.current = auth;

  useEffect(() => {
    let handling = false;
    function handleUnauthorized() {
      if (handling) return;
      handling = true;
      try {
        // Tokens are already cleared by the interceptor at this point; a local
        // session clear avoids an unauthenticated POST /auth/logout round-trip.
        authRef.current.clearSession();
      } finally {
        handling = false;
      }
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
