import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useAuthContext } from "../lib/contexts/AuthContext";
import { LoginForm } from "../features/auth/login-form";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      {/* Left panel - branding */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "50%",
          background: "linear-gradient(135deg, #1B2A4A 0%, #2F5D8A 100%)",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 6,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative grid pattern */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 400 }}>
          <Box
            component="img"
            src="/logo-full-white.svg"
            alt="VerifiedProps"
            sx={{ height: 56, mx: "auto", mb: 4, display: "block" }}
          />
          <Typography sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: "0.95rem" }}>
            Manage your property listings, publish projects, and grow your builder business — all from one dashboard.
          </Typography>
          <Box sx={{ mt: 5, display: "flex", justifyContent: "center", gap: 4 }}>
            {[
              { label: "Listings", value: "Manage" },
              { label: "Publish", value: "Launch" },
              { label: "Verification", value: "Verified" },
            ].map((item) => (
              <Box key={item.label} sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#B8894F", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {item.value}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", mt: 0.5 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel - login form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FAF9F6",
          px: { xs: 3, md: 6 },
          py: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile-only logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4, justifyContent: "center" }}>
            <Box component="img" src="/logo-full.svg" alt="VerifiedProps" sx={{ height: 32 }} />
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ color: "#1F2430", mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to your VerifiedProps builder dashboard
          </Typography>

          <LoginForm />

          <Typography variant="body2" align="center" sx={{ mt: 2, color: "#5B6270" }}>
            <Link
              to="/forgot-password"
              style={{ color: "#2F5D8A", fontWeight: 600, textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 4, color: "#5B6270" }}>
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              style={{ color: "#2F5D8A", fontWeight: 600, textDecoration: "none" }}
            >
              Register as Builder
            </Link>
          </Typography>

          <Typography variant="caption" align="center" display="block" sx={{ mt: 4, color: "#9199A8" }}>
            &copy; {new Date().getFullYear()} VerifiedProps. All verified builders.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
