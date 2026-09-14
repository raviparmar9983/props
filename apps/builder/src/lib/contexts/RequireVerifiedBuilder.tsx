import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Alert, Typography, Button } from "@mui/material";
import { useAuthContext } from "./AuthContext";

interface RequireVerifiedBuilderProps {
  children: ReactNode;
}

// This component's own name promised a verification check it never
// performed — `user.verificationStatus` is fetched and typed all the way
// through (AuthTokensSchema -> AuthContext), but nothing read it, so a
// REJECTED or SUSPENDED builder profile could sign in and use the full
// dashboard with no indication anything was wrong.
export function RequireVerifiedBuilder({
  children,
}: RequireVerifiedBuilderProps) {
  const { user, isLoading, logout } = useAuthContext();

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

  if (user.verificationStatus === "REJECTED" || user.verificationStatus === "SUSPENDED") {
    const rejected = user.verificationStatus === "REJECTED";
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          px: 3,
          textAlign: "center",
          backgroundColor: "#FAF9F6",
        }}
      >
        <Alert severity={rejected ? "error" : "warning"} sx={{ maxWidth: 480, mb: 3 }}>
          {rejected
            ? "Your builder application was not approved."
            : "Your builder account has been suspended."}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mb: 3 }}>
          {rejected
            ? "You don't have access to the builder dashboard. If you believe this is a mistake, contact support for details."
            : "Access to the builder dashboard is currently disabled. Contact support to resolve this."}
        </Typography>
        <Button variant="outlined" onClick={() => logout()}>
          Sign out
        </Button>
      </Box>
    );
  }

  return (
    <>
      {user.verificationStatus === "PENDING" && (
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          Your builder account is pending verification. You can prepare your projects now, but
          they won't be visible to buyers until your account is verified.
        </Alert>
      )}
      {children}
    </>
  );
}