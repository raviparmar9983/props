import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthContext } from "./AuthContext";

interface RequireVerifiedBuilderProps {
  children: ReactNode;
}

export function RequireVerifiedBuilder({
  children,
}: RequireVerifiedBuilderProps) {
  const { user, isLoading } = useAuthContext();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "BUILDER") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}