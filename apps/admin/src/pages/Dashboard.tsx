import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, Chip, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { adminApi } from "../lib/api";

export default function Dashboard() {
  const reviewQueue = useQuery({
    queryKey: ["admin", "review-queue", "count"],
    queryFn: () => adminApi.listReviewQueue({ reviewStatus: "PENDING_REVIEW", limit: 1 }),
  });

  const pendingReviewCount = reviewQueue.data?.meta?.total ?? 0;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Overview of project review on the platform
      </Typography>

      <Card sx={{ mb: 4, maxWidth: 480 }}>
        <CardContent>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.7rem" }}>
            Projects awaiting review
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ mt: 0.5 }}>
            {pendingReviewCount}
          </Typography>
        </CardContent>
      </Card>

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
    </Box>
  );
}