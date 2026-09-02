import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, Chip, Grid, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { adminApi } from "../lib/api";
import type { BuilderVerificationStatus } from "../lib/api";

const STATUS_CARDS: Array<{
  label: string;
  status: BuilderVerificationStatus | "";
  color: "warning" | "success" | "error" | "primary";
}> = [
  { label: "Pending review", status: "PENDING", color: "warning" },
  { label: "Verified", status: "VERIFIED", color: "success" },
  { label: "Rejected", status: "REJECTED", color: "error" },
  { label: "Suspended", status: "SUSPENDED", color: "primary" },
];

function useCount(status: BuilderVerificationStatus | "") {
  return useQuery({
    queryKey: ["admin", "count", status],
    queryFn: () =>
      adminApi.listBuilders({
        limit: 1,
        ...(status ? { status } : {}),
      }),
  });
}

export default function Dashboard() {
  const pending = useQuery({
    queryKey: ["admin", "builders", "PENDING"],
    queryFn: () => adminApi.listBuilders({ status: "PENDING", limit: 50 }),
  });

  const reviewQueue = useQuery({
    queryKey: ["admin", "review-queue", "count"],
    queryFn: () => adminApi.listReviewQueue({ reviewStatus: "PENDING_REVIEW", limit: 1 }),
  });

  const recentPending = pending.data?.data ?? [];
  const pendingReviewCount = reviewQueue.data?.meta?.total ?? 0;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Overview of builder verification and project review on the platform
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {STATUS_CARDS.map((c) => {
          const { data } = useCount(c.status);
          return (
            <Grid item xs={12} sm={6} md={3} key={c.label}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.7rem" }}>
                    {c.label}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mt: 0.5 }}>
                    {data?.meta?.total ?? "—"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Review Queue Card */}
      <Paper
        component={Link}
        to="/projects/review-queue"
        sx={{
          p: 3,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textDecoration: "none",
          color: "inherit",
          cursor: "pointer",
          border: "1px solid #E2E5EA",
          "&:hover": { borderColor: "primary.main", boxShadow: 1 },
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Project Review Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pendingReviewCount > 0
              ? `${pendingReviewCount} project${pendingReviewCount === 1 ? "" : "s"} awaiting review`
              : "No projects awaiting review"}
          </Typography>
        </Box>
        <Chip label="Go to Queue" color="primary" />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Awaiting review
          </Typography>
          <Chip
            component={Link}
            to="/builders"
            label="View all"
            color="primary"
            variant="outlined"
            clickable
            sx={{ textDecoration: "none", cursor: "pointer" }}
          />
        </Box>
        {recentPending.length === 0 && (
          <Typography color="text.secondary">No builders awaiting review.</Typography>
        )}
        {recentPending.map((b) => (
          <Box
            key={b.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              borderBottom: "1px solid #E2E5EA",
              "&:last-of-type": { borderBottom: "none" },
            }}
          >
            <Box>
              <Typography fontWeight={600}>{b.companyName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {b.user.email} · {b.city.name}
              </Typography>
            </Box>
            <Chip
              component={Link}
              to="/builders"
              label="Review"
              size="small"
              color="warning"
              clickable
              sx={{ textDecoration: "none", cursor: "pointer" }}
            />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
