import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthContext } from "./AuthContext";

interface RequireVerifiedBuilderProps {
  children: ReactNode;
}

export function RequireVerifiedBuilder({
  children,
}: RequireVerifiedBuilderProps) {
  const { user, isLoading } = useAuthContext();
  const location = useLocation();

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

  // PENDING and REJECTED builders may still open /settings to update their
  // profile and re-upload documents; every other page requires VERIFIED.
  const isSettings = location.pathname === "/settings";

  if (user.verificationStatus === "PENDING" && !isSettings) {
    return <Navigate to="/pending-verification" replace />;
  }

  if (user.verificationStatus === "REJECTED" && !isSettings) {
    return <Navigate to="/rejected" replace />;
  }

  return <>{children}</>;
}
