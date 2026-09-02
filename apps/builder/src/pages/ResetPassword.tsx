import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { authApi } from "../lib/api/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
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
            Create a new strong password to secure your builder account.
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
            Reset password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter the code sent to your email and choose a new password.
          </Typography>

          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset successful! Redirecting to sign in...
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
              <TextField
                required
                label="Reset code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Enter the code from your email"
              />
              <TextField
                required
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                helperText="At least 8 characters"
              />
              <TextField
                required
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
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
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          )}

          <Typography variant="body2" align="center" sx={{ mt: 4, color: "#5B6270" }}>
            <Link
              to="/forgot-password"
              style={{ color: "#2F5D8A", fontWeight: 600, textDecoration: "none" }}
            >
              Didn't receive a code? Resend
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 2, color: "#5B6270" }}>
            <Link
              to="/login"
              style={{ color: "#2F5D8A", fontWeight: 600, textDecoration: "none" }}
            >
              Back to sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
