import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useAuthContext } from "../lib/contexts/AuthContext";
import apiClient from "../lib/api/client";

export default function Register() {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    cityId: "",
  });
  const [cities, setCities] = useState<Array<{ id: string; name: string; stateName: string }>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ id: string; name: string; stateName: string }[]>("/cities")
      .then((r) => setCities(r.data))
      .catch(() => {});
  }, []);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload: {
        companyName: string;
        email: string;
        password: string;
        cityId: string;
      } = {
        companyName: form.companyName,
        email: form.email,
        password: form.password,
        cityId: form.cityId,
      };
      await register(payload);
      setSuccess(true);
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? "Registration failed. Please try again.");
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
            Join as a verified builder and reach customers who are actively looking for properties.
          </Typography>
          <Box sx={{ mt: 5, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
            {[
              "Free listing of your projects",
              "Reach buyers actively searching for properties",
              "Verified builder badge for trust",
            ].map((item) => (
              <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "rgba(31, 138, 95, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </Box>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel - register form */}
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
          overflow: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile-only logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 3, justifyContent: "center" }}>
            <Box component="img" src="/logo-full.svg" alt="VerifiedProps" sx={{ height: 32 }} />
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ color: "#1F2430", mb: 0.5 }}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your VerifiedProps builder account
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Redirecting to sign in...
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              required
              label="Company Name"
              value={form.companyName}
              onChange={handleChange("companyName")}
              fullWidth
              margin="normal"
              size="small"
            />
            <TextField
              required
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              fullWidth
              margin="normal"
              size="small"
            />
            <TextField
              required
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              fullWidth
              margin="normal"
              size="small"
              inputProps={{ minLength: 6 }}
            />
            <FormControl fullWidth margin="normal" size="small" required>
              <InputLabel>City</InputLabel>
              <Select
                label="City"
                value={form.cityId}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, cityId: e.target.value }));
                  setError("");
                }}
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}, {city.stateName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || success}
              sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Register"
              )}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3, color: "#5B6270" }}>
            Already have an account?{" "}
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
