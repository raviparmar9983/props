import { Component, type ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";
import { ErrorIcon } from "./icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FAF9F6",
            px: 3,
          }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 480 }}>
            <ErrorIcon sx={{ fontSize: 64, color: "#C2410C", mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              The builder dashboard encountered an error and couldn&apos;t load.
            </Typography>
            {this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  mb: 3,
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: "#FBE7DD",
                  textAlign: "left",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: "#C2410C",
                  overflow: "auto",
                  maxHeight: 200,
                }}
              >
                {this.state.error.message}
              </Box>
            )}
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload page
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
