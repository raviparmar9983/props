import { Link, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { AccessTimeIcon, UploadFileIcon } from "../components/icons";
import { useAuthContext } from "../lib/contexts/AuthContext";

export default function PendingVerification() {
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
              backgroundColor: "#FBF0DC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 32, color: "#B5750B" }} />
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Profile under review
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            Your profile is being reviewed by our team. We&apos;ll email you within 1–2 business days with an update.
            In the meantime, you can upload your verification documents to speed things up.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              component={Link}
              to="/settings"
              variant="contained"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              Upload Documents
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
