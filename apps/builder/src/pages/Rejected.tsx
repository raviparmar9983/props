import { Link, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuthContext } from "../lib/contexts/AuthContext";

export default function Rejected() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 480 }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              backgroundColor: "#FBE7DD",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <ErrorIcon sx={{ fontSize: 32, color: "#C2410C" }} />
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Verification not approved
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }}>
            Your builder profile was not approved during verification. This may be due to
            incomplete documentation or information that doesn&apos;t meet our verification requirements.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            You can update your profile and re-upload your documents to apply again.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              component={Link}
              to="/settings"
              variant="contained"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              Update Profile &amp; Re-apply
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                logout().then(() => navigate("/login"));
              }}
            >
              Sign out
            </Button>
          </Box>

          {user?.email && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: "block" }}>
              Signed in as {user.email}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
