import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { authApi } from "../lib/api/auth";
import { useAuthContext } from "../lib/contexts/AuthContext";
import { VerifiedIcon } from "../components/icons";
import { parseApiError } from "../lib/api/errorHandler";

const DEFAULT_COOLDOWN_SECONDS = 30;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { completeAuth, isAuthenticated, isLoading } = useAuthContext();
  const [searchParams] = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim();
  const initialResend = Math.max(
    0,
    Number(searchParams.get("resendIn")) || DEFAULT_COOLDOWN_SECONDS,
  );

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // Was clamped to DEFAULT_COOLDOWN_SECONDS, silently ignoring a longer
  // cooldown the server actually asked for (OTP_RESEND_COOLDOWN_SECONDS) —
  // "Resend" would unlock in the UI before the backend would accept it,
  // producing a confusing 429 on click.
  const [resendIn, setResendIn] = useState(initialResend);

  // Already signed in (e.g. verified from another tab) — let the guard route.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const id = setInterval(() => {
      setResendIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Missing email. Please start from the sign up or sign in page.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await authApi.verifyEmailOtp({ email, otp });
      completeAuth(result);
      navigate("/", { replace: true });
    } catch (err) {
      setError(parseApiError(err).message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendIn > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const result = await authApi.requestEmailVerification({ email });
      setResendIn(result.resendInSeconds ?? DEFAULT_COOLDOWN_SECONDS);
    } catch (err) {
      setError(parseApiError(err).message ?? "Could not resend the code. Please try again.");
    } finally {
      setResending(false);
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
            Verify your email address to activate your builder account and start publishing projects.
          </Typography>
          <Box sx={{ mt: 5, display: "flex", justifyContent: "center", gap: 4 }}>
            {[
              { label: "Email", value: "Verify" },
              { label: "Profile", value: "Review" },
              { label: "Publish", value: "Launch" },
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

      {/* Right panel - OTP form */}
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
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile-only logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4, justifyContent: "center" }}>
            <Box component="img" src="/logo-full.svg" alt="VerifiedProps" sx={{ height: 32 }} />
          </Box>

          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              backgroundColor: "#E1F3EA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <VerifiedIcon sx={{ fontSize: 32, color: "#1F8A5F" }} />
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ color: "#1F2430", mb: 0.5 }}>
            Verify your email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We&apos;ve sent a 6-digit code to <strong>{email || "your email"}</strong>. Enter it below to
            activate your account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!email ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              We couldn&apos;t determine which email to verify.{" "}
              <Link to="/register" style={{ color: "#2F5D8A", fontWeight: 600 }}>
                Register
              </Link>{" "}
              or{" "}
              <Link to="/login" style={{ color: "#2F5D8A", fontWeight: 600 }}>
                sign in
              </Link>{" "}
              to continue.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                required
                label="Verification code"
                value={otp}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(digits);
                }}
                fullWidth
                margin="normal"
                size="small"
                autoFocus
                inputProps={{ inputMode: "numeric", maxLength: 6 }}
                placeholder="Enter the 6-digit code"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || otp.length < 6}
                sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Verify email"
                )}
              </Button>
            </Box>
          )}

          <Typography variant="body2" align="center" sx={{ mt: 3, color: "#5B6270" }}>
            <Button
              onClick={handleResend}
              disabled={!email || resendIn > 0 || resending}
              size="small"
              sx={{
                color: "#2F5D8A",
                fontWeight: 600,
                textTransform: "none",
                minWidth: 0,
              }}
            >
              {resending
                ? "Sending..."
                : resendIn > 0
                  ? `Resend code in ${resendIn}s`
                  : "Resend code"}
            </Button>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 2, color: "#5B6270" }}>
            <Link
              to="/login"
              style={{ color: "#2F5D8A", fontWeight: 600, textDecoration: "none" }}
            >
              Back to sign in
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