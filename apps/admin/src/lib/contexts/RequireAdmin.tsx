import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthContext } from "./AuthContext";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
