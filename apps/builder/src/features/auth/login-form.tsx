import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../lib/contexts/AuthContext";
import { parseApiError } from "../../lib/api/errorHandler";

export function LoginForm() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
          const result = await login(email, password);
          if ("requiresEmailVerification" in result) {
            navigate(
              `/verify-email?email=${encodeURIComponent(result.email)}&resendIn=${result.resendInSeconds}`,
            );
          }
        } catch (err) {
          // Was a hardcoded "Invalid email or password" regardless of cause
          // — a suspended account or a throttled login got a toast with the
          // real reason (see client.ts's rejectWithToast) immediately
          // contradicted by this permanent, wrong inline message.
          setError(parseApiError(err).message);
        } finally {
          setLoading(false);
        }
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        required
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        autoFocus
      />
      <TextField
        required
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        size="small"
      />
      <Button
        type="submit"
        disabled={loading}
        variant="contained"
        fullWidth
        sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
      </Button>
    </form>
  );
}
