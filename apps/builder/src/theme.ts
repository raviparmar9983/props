import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1B2A4A", contrastText: "#FFFFFF" },
    secondary: { main: "#2F5D8A", contrastText: "#FFFFFF" },
    success: { main: "#1F8A5F", light: "#E1F3EA" },
    warning: { main: "#B5750B", light: "#FBF0DC" },
    error: { main: "#C2410C", light: "#FBE7DD" },
    info: { main: "#2F5D8A", light: "#E4EDF5" },
    background: { default: "#FAF9F6", paper: "#FFFFFF" },
    text: { primary: "#1F2430", secondary: "#5B6270" },
    divider: "#E2E5EA",
    action: {
      hover: "rgba(27, 42, 74, 0.04)",
      selected: "rgba(27, 42, 74, 0.08)",
      disabledBackground: "rgba(27, 42, 74, 0.12)",
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "2rem" },
    h2: { fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.5rem" },
    h3: { fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "1.25rem" },
    h4: { fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.375rem" },
    h5: { fontFamily: "'Inter', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Inter', sans-serif", fontWeight: 600 },
    body1: { fontFamily: "'Inter', sans-serif" },
    body2: { fontFamily: "'Inter', sans-serif" },
    caption: { fontFamily: "'Inter', sans-serif" },
    button: {
      fontFamily: "'Inter', sans-serif",
      textTransform: "none" as const,
      fontWeight: 600,
    },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": { boxSizing: "border-box" },
        "*:focus-visible": {
          outline: "2px solid #2F5D8A",
          outlineOffset: "2px",
        },
        "input[type=number]::-webkit-inner-spin-button": {
          fontFamily: "'IBM Plex Mono', monospace",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 20px",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        containedPrimary: {
          "&:hover": { backgroundColor: "#162340" },
        },
        outlinedPrimary: {
          "&:hover": { borderColor: "#1B2A4A", backgroundColor: "rgba(27, 42, 74, 0.04)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "0 1px 2px rgba(27, 42, 74, 0.06)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9199A8",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2F5D8A",
              borderWidth: 1,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#2F5D8A",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.9rem",
          minHeight: 48,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#5B6270",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: "1px solid #E2E5EA",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          borderColor: "#E2E5EA",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #E2E5EA",
        },
      },
    },
  },
});
