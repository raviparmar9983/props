import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useAuthContext } from "../../lib/contexts/AuthContext";

export function LoginForm() {
  const { login } = useAuthContext();
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
          await login(email, password);
        } catch {
          setError("Invalid email or password.");
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
