import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { authApi } from "../lib/api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            Don't worry, we'll help you reset your password and get back into your account.
          </Typography>
        </Box>
      </Box>

      {/* Right panel - form */}
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
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4, justifyContent: "center" }}>
            <Box component="img" src="/logo-full.svg" alt="VerifiedProps" sx={{ height: 32 }} />
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ color: "#1F2430", mb: 0.5 }}>
            Forgot password?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter your email and we'll send you a reset code.
          </Typography>

          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Reset code sent! Redirecting to reset page...
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                required
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                autoFocus
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
              >
                {loading ? "Sending code..." : "Send reset code"}
              </Button>
            </form>
          )}

          <Typography variant="body2" align="center" sx={{ mt: 4, color: "#5B6270" }}>
            Remember your password?{" "}
            <Link
              to="/login"
              style={{ color: "#2F5D8A", fontWeight: 600, textDecoration: "none" }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
