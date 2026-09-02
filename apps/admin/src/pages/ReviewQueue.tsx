import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { adminApi } from "../lib/api";
import type { ProjectReviewStatus } from "../lib/api/schemas";

const STATUS_COLORS: Record<string, "warning" | "success" | "error" | "default" | "info"> = {
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "error",
  DRAFT: "default",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DRAFT: "Draft",
};

const FILTER_OPTIONS: Array<{ value: ProjectReviewStatus | undefined; label: string }> = [
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: undefined, label: "All" },
];

function formatPrice(price: number | null) {
  if (!price) return "—";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function ReviewQueue() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ProjectReviewStatus | undefined>("PENDING_REVIEW");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "review-queue", filter, page],
    queryFn: () => adminApi.listReviewQueue({
      ...(filter ? { reviewStatus: filter } : {}),
      page,
      limit: 20,
    }),
  });

  const projects = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
        Review Queue
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review and approve or reject project listings before they go live.
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.label}
            label={opt.label}
            color={opt.value ? STATUS_COLORS[opt.value] ?? "default" : "default"}
            variant={filter === opt.value ? "filled" : "outlined"}
            onClick={() => { setFilter(opt.value); setPage(1); }}
            sx={{ fontWeight: filter === opt.value ? 600 : 400 }}
          />
        ))}
      </Box>

      {isLoading && (
        <Typography color="text.secondary">Loading...</Typography>
      )}

      {!isLoading && projects.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No projects match the selected filter.
          </Typography>
        </Paper>
      )}

      {!isLoading && projects.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Builder</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Units</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Leads</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Published</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/projects/${project.id}/review`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                        {project.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
                        {project.builder.companyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{project.city.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatPrice(project.priceStartingFrom)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{project._count.unitTypes}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{project._count.leads}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABELS[project.reviewStatus] ?? project.reviewStatus}
                        color={STATUS_COLORS[project.reviewStatus] ?? "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {project.publishedAt
                          ? new Date(project.publishedAt).toLocaleDateString("en-IN")
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Review project">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}/review`);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
