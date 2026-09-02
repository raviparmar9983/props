import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider } from "./lib/contexts/AuthContext";
import { RequireVerifiedBuilder } from "./lib/contexts/RequireVerifiedBuilder";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "./components/Toaster";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PendingVerification = lazy(() => import("./pages/PendingVerification"));
const Rejected = lazy(() => import("./pages/Rejected"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProjectsList = lazy(() => import("./pages/ProjectsList"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Settings = lazy(() => import("./pages/Settings"));

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
    <RequireVerifiedBuilder>
      <Layout>{children}</Layout>
    </RequireVerifiedBuilder>
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
              <Suspense fallback={<LoadingFallback />}>                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/pending-verification" element={<PendingVerification />} />
                  <Route path="/rejected" element={<Rejected />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedLayout>
                        <Dashboard />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/projects"
                    element={
                      <ProtectedLayout>
                        <ProjectsList />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/projects/new"
                    element={
                      <ProtectedLayout>
                        <CreateProject />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/projects/:id"
                    element={
                      <ProtectedLayout>
                        <ProjectDetail />
                      </ProtectedLayout>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedLayout>
                        <Settings />
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
