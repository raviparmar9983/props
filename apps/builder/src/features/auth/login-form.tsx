import { Button, TextField, Box } from "@mui/material";
import { Link } from "react-router-dom";
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
      <TextField
        required
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        required
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
        <Link
          to="/forgot-password"
          style={{ color: "#2F5D8A", fontWeight: 500, textDecoration: "none", fontSize: "0.8rem" }}
        >
          Forgot password?
        </Link>
      </Box>
      <Button type="submit" disabled={loading} variant="contained">
        Sign in
      </Button>
      {error && <p style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>}
    </form>
  );
}
