import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider } from "./lib/contexts/AuthContext";
import { RequireAdmin } from "./lib/contexts/RequireAdmin";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "./components/Toaster";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Builders = lazy(() => import("./pages/Builders"));
const Amenities = lazy(() => import("./pages/Amenities"));
const ReviewQueue = lazy(() => import("./pages/ReviewQueue"));
const ReviewDetail = lazy(() => import("./pages/ReviewDetail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function LoadingFallback() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <Layout>{children}</Layout>
    </RequireAdmin>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedLayout>
                        <Dashboard />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/builders"
                    element={
                      <ProtectedLayout>
                        <Builders />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/amenities"
                    element={
                      <ProtectedLayout>
                        <Amenities />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/projects/review-queue"
                    element={
                      <ProtectedLayout>
                        <ReviewQueue />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/projects/:id/review"
                    element={
                      <ProtectedLayout>
                        <ReviewDetail />
                      </ProtectedLayout>
                    }
                  />
                  <Route path="*" element={<Login />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
