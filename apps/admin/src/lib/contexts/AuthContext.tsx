import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";
import type { AuthState } from "../hooks/useAuth";

const AuthContext = createContext<AuthState | null>(null);

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
