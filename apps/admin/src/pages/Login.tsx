import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useAuthContext } from "../lib/contexts/AuthContext";
import { parseApiError } from "../lib/api";

export default function Login() {
  const { isAuthenticated, isLoading, login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
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
          <Typography
            variant="h3"
            sx={{ color: "white", fontWeight: 700, mb: 2 }}
          >
            Admin Console
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: "0.95rem" }}>
            Review builder verifications, moderate listings, and keep the
            platform safe for every verified builder and homebuyer.
          </Typography>
        </Box>
      </Box>

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
          <Typography variant="h4" fontWeight={700} sx={{ color: "#1F2430", mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to the admin console
          </Typography>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setError("");
              try {
                await login(email, password);
              } catch (err) {
                const apiError = parseApiError(err);
                setError(
                  apiError.code === "UNAUTHORIZED"
                    ? "Invalid credentials or account suspended."
                    : "Could not sign in. Please try again.",
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <TextField
              required
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              autoComplete="username"
            />
            <TextField
              required
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              autoComplete="current-password"
            />
            {error && (
              <Typography variant="body2" sx={{ mt: 1.5, color: "#C2410C" }}>
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" disabled={submitting} fullWidth sx={{ mt: 3 }}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <Typography variant="caption" align="center" display="block" sx={{ mt: 4, color: "#9199A8" }}>
            &copy; {new Date().getFullYear()} VerifiedProps. Admin access only.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
